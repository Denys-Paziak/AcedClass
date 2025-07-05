import os
import re
import shutil
import subprocess
import tempfile

import cv2
import easyocr
import fitz
import img2pdf
import numpy as np
import pytesseract
import pythoncom
from pdf2image import convert_from_path
from win32com.client import Dispatch

from config import WATERMARK_PATTERNS


def detect_watermarks(file_path):
    print(f"[OCR] Detecting watermarks in: {file_path}")
    detected_phrases = set()

    try:
        images = convert_from_path(file_path, dpi=300)
    except Exception as e:
        print(f"[OCR] PDF to image conversion failed: {e}")
        return False, []

    for page_index, img in enumerate(images[:5]):
        text = pytesseract.image_to_string(img).lower()

        for pattern in WATERMARK_PATTERNS:
            try:
                if re.search(re.escape(pattern), text, re.IGNORECASE):
                    print(f"[OCR] Match found: {pattern} on page {page_index + 1}")
                    detected_phrases.add(pattern)
            except re.error as e:
                print(f"[REGEX ERROR] Skipping invalid pattern '{pattern}': {e}")

    found = bool(detected_phrases)
    return found, list(detected_phrases)


def detect_watermarks_heuristic(file_path, output_txt_path=None):
    print(f"[OCR] Heuristic watermark scan (EasyOCR): {file_path}")
    detected = set()
    all_text_lines = []
    reader = easyocr.Reader(['en'], gpu=False)

    try:
        images = convert_from_path(file_path, dpi=300)
    except Exception as e:
        print(f"[OCR] Heuristic conversion failed: {e}")
        return False, []

    for page_index, img in enumerate(images[:5]):
        img_np = np.array(img)
        h_img, w_img = img_np.shape[:2]
        print(f"[PAGE {page_index + 1}] Image size: {w_img}x{h_img}")

        results = reader.readtext(img_np)
        for (bbox, text, conf) in results:
            text = text.strip()
            if not text or len(text) < 4:
                continue

            all_text_lines.append(text)

            # Отримати центр прямокутника
            (x0, y0), (x1, y1), (_, _), (_, _) = bbox
            cx = (x0 + x1) / 2
            cy = (y0 + y1) / 2

            is_large = abs(y1 - y0) > 20
            is_positioned_like_watermark = (
                    cy < 0.4 * h_img or cy > 0.6 * h_img or
                    cx < 0.2 * w_img or cx > 0.8 * w_img
            )

            print(
                f"  ↪ '{text}' at ({cx:.0f}, {cy:.0f}), size={abs(y1 - y0):.0f}, pos=wm?{is_positioned_like_watermark}")

            if is_large and is_positioned_like_watermark:
                print(f"[HEURISTIC] Watermark candidate: '{text}' on page {page_index + 1}")
                detected.add(text.lower())

    if output_txt_path:
        try:
            with open(output_txt_path, "w", encoding="utf-8") as f:
                f.write("\n".join(all_text_lines))
            print(f"[TXT] Saved all recognized text to: {output_txt_path}")
        except Exception as e:
            print(f"[TXT] Failed to save text: {e}")

    found = bool(detected)
    return found, list(detected)


def flatten_pdf(file_path):
    print(f"[SANITIZE] Flattening PDF: {file_path}")
    out_path = file_path.replace(".pdf", "_flattened.pdf")

    cmd = [
        "mutool", "clean", "-gg", "-d",  # deep clean: forms, annotations, JS, layers
        file_path,
        out_path
    ]

    try:
        subprocess.run(cmd, check=True)
    except FileNotFoundError:
        raise RuntimeError("❌ mutool not found")
    except subprocess.CalledProcessError as e:
        raise RuntimeError(f"❌ mutool failed: {e}")

    return out_path


def normalize_text(text):
    # Прибрати спецсимволи і пробіли
    return re.sub(r'[\W_]+', '', text).lower()


def remove_text_watermarks(pdf_path, watermark_phrases):
    print(f"[REMOVE] Removing watermarks from: {pdf_path}")
    doc = fitz.open(pdf_path)
    total_matches = 0

    normalized_phrases = [normalize_text(p) for p in watermark_phrases]

    for page_index, page in enumerate(doc):
        print(f"\n[PAGE {page_index + 1}] Processing...")
        text_instances = page.get_text("dict")["blocks"]

        full_page_text = ""
        block_count = 0
        span_count = 0
        page_matches = 0

        for block in text_instances:
            block_count += 1
            if "lines" not in block:
                continue

            for line in block["lines"]:
                for span in line["spans"]:
                    span_count += 1
                    span_text = span["text"].strip()
                    full_page_text += span_text + " "
                    norm_span_text = normalize_text(span_text)
                    bbox = span["bbox"]
                    for norm_phrase, raw_phrase in zip(normalized_phrases, watermark_phrases):
                        if norm_phrase in norm_span_text:
                            print(f"  ↪ Match '{raw_phrase}' in span: '{span_text}'")
                            print(f"    → BBox: {bbox}")
                            print(f"    → Redacting on page {page_index + 1}")
                            rect = fitz.Rect(bbox)
                            page.add_redact_annot(rect, fill=(1, 1, 1))
                            page_matches += 1
                            total_matches += 1
                            break

        print(f"[PAGE {page_index + 1}] Text content:\n{'-' * 40}\n{full_page_text.strip()}\n{'-' * 40}")
        print(f"[PAGE {page_index + 1}] Done. Blocks: {block_count}, Spans: {span_count}, Matches: {page_matches}")
        if page_matches > 0:
            print(f"  ↪ Applying redactions for page {page_index + 1}")
            page.apply_redactions()

    if total_matches == 0:
        print("[REMOVE] No matches found. Document unchanged.")
    else:
        print(f"[REMOVE] Total matches removed: {total_matches}")

    cleaned_path = pdf_path.replace(".pdf", "_cleaned.pdf")
    doc.save(cleaned_path)
    doc.close()
    print(f"[REMOVE] Saved cleaned PDF to: {cleaned_path}")
    return cleaned_path


def raster_clean_pdf(file_path, patterns):
    print(f"[RASTER] Raster-cleaning PDF: {file_path}")

    with tempfile.TemporaryDirectory() as temp_dir:
        # Конвертація PDF у зображення
        images = convert_from_path(file_path, dpi=300)
        cleaned_paths = []

        for i, image in enumerate(images):
            img = np.array(image)
            img = cv2.cvtColor(img, cv2.COLOR_RGB2BGR)

            # Очистка водяних знаків
            cleaned = remove_watermarks_with_easyocr(img, patterns)

            # Збереження обробленої сторінки
            output_img_path = os.path.join(temp_dir, f"page_{i}.png")
            cv2.imwrite(output_img_path, cleaned)
            cleaned_paths.append(output_img_path)

        # Збирання нового PDF з коректним масштабом (300 dpi)
        raster_pdf = os.path.join(temp_dir, "raster_only.pdf")
        with open(raster_pdf, "wb") as f:
            f.write(img2pdf.convert(
                cleaned_paths,
                dpi=300,
                layout_fun=img2pdf.get_fixed_dpi_layout_fun((300, 300))
            ))

        # OCR для створення searchable PDF
        output_pdf = file_path.replace(".pdf", "_cleaned.pdf")
        try:
            subprocess.run([
                "ocrmypdf", "--force-ocr", "--deskew", "--clean",
                raster_pdf, output_pdf
            ], check=True)
        except FileNotFoundError:
            raise RuntimeError("❌ ocrmypdf не встановлено або не в PATH")
        except subprocess.CalledProcessError as e:
            raise RuntimeError(f"❌ ocrmypdf завершився з помилкою: {e}")

    return output_pdf


# def remove_watermarks(image, patterns):
#     data = image_to_data(image, output_type=Output.DICT, config='--psm 6')
#     n_boxes = len(data['level'])
#
#     for i in range(n_boxes):
#         text = data['text'][i].strip()
#         if not text:
#             continue
#
#         (x, y, w, h) = (data['left'][i], data['top'][i], data['width'][i], data['height'][i])
#         debug_info = f"'{text}' at ({x},{y}) size=({w}x{h})"
#
#         if any(re.search(p, text, re.IGNORECASE) for p in patterns):
#             print(f"[REMOVE] {debug_info} → matched pattern")
#             cv2.rectangle(image, (x, y), (x + w, y + h), (255, 255, 255), -1)
#         else:
#             print(f"[KEEP] {debug_info}")
#
#     return image


def remove_watermarks_with_easyocr(image, patterns):
    reader = easyocr.Reader(['en'], gpu=False)
    h_img, w_img = image.shape[:2]

    results = reader.readtext(image)
    for (bbox, text, conf) in results:
        text_clean = text.strip().lower()
        if not text_clean:
            continue

        if any(re.search(p, text_clean, re.IGNORECASE) for p in patterns):
            print(f"[REMOVE] '{text_clean}' with confidence {conf:.2f}")

            # Обчислюємо bounding box
            x_coords = [point[0] for point in bbox]
            y_coords = [point[1] for point in bbox]
            x_min, x_max = int(min(x_coords)), int(max(x_coords))
            y_min, y_max = int(min(y_coords)), int(max(y_coords))

            cv2.rectangle(image, (x_min, y_min), (x_max, y_max), (255, 255, 255), -1)

    return image


def run_word_sanitize(docx_path):
    print(f"[WORD] Sanitizing Word file: {docx_path}")
    # Працюємо у тимчасовій копії
    temp_dir = tempfile.mkdtemp()
    temp_path = os.path.join(temp_dir, os.path.basename(docx_path))
    shutil.copyfile(docx_path, temp_path)

    pythoncom.CoInitialize()
    word = Dispatch("Word.Application")
    word.Visible = False

    try:
        doc = word.Documents.Open(temp_path)

        # Вимикаємо tracked changes
        doc.TrackRevisions = False
        doc.AcceptAllRevisionsShown()
        try:
            for comment in doc.Comments:
                comment.Delete()
        except Exception as e:
            print(f"[WORD] Skipped comment deletion: {e}")
        doc.Revisions.AcceptAll()

        # Видаляємо персональні властивості
        props = doc.BuiltInDocumentProperties
        for field in ["Author", "Last Author", "Comments", "Title", "Subject", "Keywords"]:
            try:
                props(field).Value = ""
            except Exception:
                pass

        # Зберігаємо зміни
        doc.Save()
        doc.Close(False)
    finally:
        word.Quit()
        pythoncom.CoUninitialize()

    return temp_path
