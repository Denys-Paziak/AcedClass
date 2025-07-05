import json
import mimetypes
import os
import shutil
import uuid
from urllib.parse import urlparse
from config import TMP_DIR
from dotenv import load_dotenv

import boto3
import requests
from botocore.exceptions import BotoCoreError, ClientError
from fastapi import FastAPI, UploadFile, File, Form, Depends
from fastapi import HTTPException, BackgroundTasks
from fastapi.responses import JSONResponse, FileResponse

from utils.file_utils import validate_file_type, generate_hash
from utils.logger import setup_logger

from handlers.dispatcher import dispatch_handler
from pipeline.pipeline_manager import analyze_file_with_google, generate_crop_file, generate_blurred_preview_images, \
    generate_thumbnail_webp
from pipeline.steps.watermark import add_visible_and_hidden_watermark

app = FastAPI()
logger = setup_logger()
load_dotenv()

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

bucket_name = os.getenv('AWS_BUCKET')
region_name = os.getenv('AWS_REGION')
url_to_s3 = 'https://' + bucket_name + '.s3.' + region_name + '.amazonaws.com/'

s3 = boto3.client(
    's3',
    aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
    aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
    region_name=region_name
)


# class RawBodyLoggerMiddleware(BaseHTTPMiddleware):
#     async def dispatch(self, request: Request, call_next):
#         body = await request.body()
#         print("\n--- RAW REQUEST START ---")
#         print(body.decode("utf-8", errors="replace"))
#         print("--- RAW REQUEST END ---\n")
#         return await call_next(request)
#
#
# app.add_middleware(RawBodyLoggerMiddleware)


@app.post("/webhook/")
async def webhook_receiver(
        content_file_url: UploadFile = File(...),
        status: str = Form(...),
        reason: str = Form(...),
        file_url: str = Form(...),
        short_file_url: str = Form(...),
        preview_file_url: str = Form(...),
        blured_pages_urls: str = Form(...),
        document_id: str = Form(...)
):
    # Прочитати файл (опційно)
    file_content = await content_file_url.read()

    print(f"\n✅ Parsed form values:")
    print(f"- status: {status}")
    print(f"- reason: {reason}")
    print(f"- file_url: {file_url}")
    print(f"- short_file_url: {short_file_url}")
    print(f"- preview_file_url: {preview_file_url}")
    print(f"- document_id: {document_id}")

    try:
        print(f"- blured_pages_urls: {json.loads(blured_pages_urls)}")
    except json.JSONDecodeError:
        print(f"- blured_pages_urls (raw): {blured_pages_urls}")

    print(f"\n📄 Received file: {content_file_url.filename} ({len(file_content)} bytes)")

    return {"received": True}


def send_webhook_with_file(webhook_url, status, doc_id, file_path=None, file_url=None,
                           preview_file_url=None,
                           blured_pages_urls=None,
                           short_file_url=None,
                           reason=None):
    # Визначення MIME-типу
    if status == 'success' or status == 'flagged':
        mime_type, _ = mimetypes.guess_type(file_path)
        if mime_type is None:
            mime_type = 'application/octet-stream'  # fallback

        if file_url:
            file_url = url_to_s3 + file_url
        if short_file_url:
            short_file_url = url_to_s3 + short_file_url
        if preview_file_url:
            preview_file_url = url_to_s3 + preview_file_url

        with open(file_path, 'rb') as f:
            files = {
                'content_file_url': (os.path.basename(file_path), f, mime_type)
            }
            data = {
                'status': status,
                'reason': 'ok',
                'file_url': file_url,
                'short_file_url': short_file_url,
                'preview_file_url': preview_file_url,
                'blured_pages_urls': blured_pages_urls,
                'document_id': doc_id
            }

            response = requests.post(webhook_url, files=files, data=data)

        return response.status_code, response.text

    elif status == 'failed':
        data = {
            'status': status,
            'reason': reason,
            'document_id': doc_id
        }

        response = requests.post(webhook_url, data=data)

        return response.status_code, response.text


def process_file(file_location: str, user_id: str, doc_id: str):
    try:
        logger.info(f"Start processing: {file_location}")
        validate_file_type(file_location)

        original_hash = generate_hash(file_location)
        logger.info(f"Original SHA-256: {original_hash}")

        handler = dispatch_handler(file_location, user_id, doc_id)
        processed_file, processed_hash, watermark_flag = handler.process()
        print('[PROCESS] ENDING')

        print('[ANALYZE CONTENT] START ANALYZING')
        results = analyze_file_with_google(processed_file, user_id, doc_id)
        for r in results:
            print(f"\n=== Block {r['block_index']} ===")
            for c in r['result']:
                print(f"Category: {c.name} | Confidence: {c.confidence:.2f}")
            print(f"Text snippet: {r['text_snippet']}")

        print('[S3 STORAGE] START UPLOADING')

        processed_uuid = uuid.uuid4()
        processed_key_file = f'uploads/{user_id}/{doc_id}/{processed_uuid}.pdf'

        crop_file = generate_crop_file(processed_file)
        upload_list = []
        crop_key_file = None
        if crop_file:
            crop_uuid = uuid.uuid4()
            crop_key_file = f'uploads/{user_id}/{doc_id}/{crop_uuid}.pdf'
            upload_list.append([crop_file, crop_key_file])

        upload_list.append([processed_file, processed_key_file])  # filepath, path in s3 with filename

        blurred_file_list = generate_blurred_preview_images(processed_file, user_id, doc_id)
        blured_pages_urls = None
        if blurred_file_list:
            blured_pages_urls = []
            for filename, filepath in blurred_file_list:
                upload_list.append([filepath, f'uploads/{user_id}/{doc_id}/blurred/{filename}'])
                blured_pages_urls.append(url_to_s3 + f'uploads/{user_id}/{doc_id}/blurred/{filename}')

        png_preview = generate_thumbnail_webp(processed_file, f'uploads/{user_id}/{doc_id}/cleaned/preview.webp')

        png_preview_key = f'uploads/{user_id}/{doc_id}/preview.webp'

        upload_list.append([png_preview, png_preview_key])

        print(upload_list)

        for filename, key in upload_list:
            s3.upload_file(
                Filename=filename,
                Bucket=bucket_name,
                Key=key
            )

        text_file_path = os.path.join("uploads", user_id, doc_id, "cleaned/content.txt")

        send_webhook_with_file('http://127.0.0.1:8000/webhook/', 'success',
                               doc_id, text_file_path, processed_key_file,
                               png_preview_key, blured_pages_urls, crop_key_file)

        print('[S3 STORAGE] END UPLOADING')
        logger.info(f"Processed SHA-256: {processed_hash}")
        logger.info(f"Watermark detected: {watermark_flag}")
        logger.info(f"Processed file saved: {processed_file}")
    except Exception as e:
        send_webhook_with_file('http://127.0.0.1:8000/webhook/', 'failed',
                               doc_id, reason=e)
        logger.error(f"Background processing error: {e}")


@app.post("/process-file/")
async def process_file(
        background_tasks: BackgroundTasks,
        file: UploadFile = File(...),
        user_id: str = Form(...),
        doc_id: str = Form(...)
):
    try:
        # Зберегти файл
        os.makedirs(os.path.join(UPLOAD_DIR, user_id, doc_id), exist_ok=True)
        file_location = os.path.join(UPLOAD_DIR, user_id, doc_id, file.filename)
        with open(file_location, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        logger.info(f"Received file: {file_location}")

        # Запуск обробки у фоні
        background_tasks.add_task(process_file, file_location, user_id, doc_id)

        return JSONResponse(content={
            "status": "processing_started",
            "filename": file.filename,
            "message": "Файл отримано та обробка запущена"
        })

    except Exception as e:
        logger.error(f"Upload error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


def extract_s3_key_from_url(file_url: str) -> str:
    """
    Виділяє S3 key з повного URL, наприклад:
    https://backet.s3.region.amazonaws.com/uploads/user-id/doc-id/cleaned/file.pdf
    =>
    uploads/user-id/doc-id/cleaned/file.pdf
    """
    parsed_url = urlparse(file_url)
    return parsed_url.path.lstrip("/")


def generate_reveal_id():
    return uuid.uuid4().hex[:10]


@app.post("/add-watermark/")
async def add_watermark_to_file(
        file_url: str = Form(...),
        uploader_user_id: str = Form(...),
        downloader_user_id: str = Form(...),
        doc_id: str = Form(...),
        reveal_id: str = Depends(generate_reveal_id)
):
    try:
        key = extract_s3_key_from_url(file_url)
        filename = os.path.basename(key)
        download_path = os.path.join(TMP_DIR, filename)
        print(download_path)
        try:
            s3.download_file(Bucket=bucket_name, Key=key, Filename=download_path)
            logger.info(f"Завантажено файл з S3: {download_path}")
        except (BotoCoreError, ClientError) as e:
            logger.error(f"Помилка при завантаженні з S3: {e}")
            raise HTTPException(status_code=500, detail="Помилка при завантаженні файлу з S3")

        # Вставка водяного знаку
        try:
            result_file_path = add_visible_and_hidden_watermark(
                file_path=download_path,
                uploader_user_id=uploader_user_id,
                downloader_user_id=downloader_user_id,
                doc_id=doc_id,
                reveal_id=reveal_id
            )
        except Exception as e:
            logger.error(f"Помилка у функції водяного знаку: {e}")
            raise HTTPException(status_code=500, detail="Помилка під час обробки водяного знаку")

        # Повернення файлу у відповіді
        return FileResponse(
            path=result_file_path,
            filename=os.path.basename(result_file_path),
            media_type="application/octet-stream"
        )

    except Exception as e:
        logger.error(f"Глобальна помилка у /add-watermark/: {e}")
        raise HTTPException(status_code=500, detail="Внутрішня помилка сервера")
