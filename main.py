from handlers.dispatcher import dispatch_handler
from utils.file_utils import validate_file_type, generate_hash
from utils.logger import setup_logger
from pipeline.pipeline_manager import analyze_file_with_google

logger = setup_logger()


def handle_upload(file_path, user_id):
    logger.info(f"Received file: {file_path}")
    validate_file_type(file_path)

    original_hash = generate_hash(file_path)
    logger.info(f"Original SHA-256: {original_hash}")

    handler = dispatch_handler(file_path, user_id)

    processed_file, processed_hash, watermark_flag = handler.process()

    results = analyze_file_with_google(processed_file)

    for r in results:
        print(f"\n=== Block {r['block_index']} ===")
        for c in r['result']:
            print(f"Category: {c.name} | Confidence: {c.confidence:.2f}")
        print(f"Text snippet: {r['text_snippet']}")

    logger.info(f"Processed SHA-256: {processed_hash}")
    logger.info(f"Watermark detected: {watermark_flag}")

    logger.info(f"Processed file saved: {processed_file}")


if __name__ == "__main__":
    handle_upload("uploads/BUSN100_Quiz_1.pdf", "user_001")
