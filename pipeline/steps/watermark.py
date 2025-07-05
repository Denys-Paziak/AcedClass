from datetime import datetime

import fitz  # PyMuPDF


def add_visible_and_hidden_watermark(file_path, uploader_user_id, downloader_user_id, doc_id, reveal_id):
    print(f"[WATERMARK] Adding AcedClass watermark to: {file_path}")
    doc = fitz.open(file_path)

    timestamp = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")

    visible_text = (
        f"This document was revealed via © AcedClass.com on {timestamp} UTC\n"
        f"Document ID: DOC-{doc_id}\nReveal ID: R-{reveal_id}"
    )
    invisible_text = uploader_user_id
    text_for_keywords = f"Downloader: {downloader_user_id}, Uploader: {uploader_user_id}, CHDL-UGC-Meta"

    for page in doc:
        # Add visible text at bottom-left
        page.insert_text(
            (50, page.rect.height - 50),
            visible_text,
            fontsize=8,
            color=(0, 0, 0)
        )

        # Add hidden text off-screen (not rendered)
        page.insert_text(
            (9999, 9999),
            invisible_text,
            fontsize=1,
            color=(1, 1, 1),
            render_mode=3
        )

    # Зберігаємо попередні метадані, якщо вони є
    metadata = doc.metadata
    metadata["keywords"] = text_for_keywords

    doc.set_metadata(metadata)

    output_path = file_path.replace(".pdf", "_watermarked.pdf")
    doc.save(output_path)
    doc.close()

    return output_path
