import hashlib
from datetime import datetime

import fitz  # PyMuPDF


def add_visible_and_hidden_watermark(file_path, user_id):
    print(f"[WATERMARK] Adding AcedClass watermark to: {file_path}")
    doc = fitz.open(file_path)

    timestamp = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
    doc_id = hashlib.sha256((user_id + timestamp).encode()).hexdigest()[:10]
    reveal_id = '123'
    full_hash = hashlib.sha256((user_id + timestamp).encode()).hexdigest()

    visible_text = f"This document was revealed via © AcedClass.com on {timestamp} UTC\nDocument ID: DOC-{doc_id}\nReveal ID: R-{reveal_id}"
    invisible_text = full_hash

    for page in doc:
        # Add visible text at bottom-left
        page.insert_text((50, page.rect.height - 50), visible_text, fontsize=8, color=(0, 0, 0))

        # Add hidden text off-screen (not rendered)
        page.insert_text((9999, 9999), invisible_text, fontsize=1, color=(1, 1, 1), render_mode=3)

    output_path = file_path.replace(".pdf", "_watermarked.pdf")
    doc.save(output_path)
    doc.close()

    return output_path
