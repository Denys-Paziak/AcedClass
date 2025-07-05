import os

from .docx_handler import DOCHandler
from .pdf_handler import PDFHandler
from .pptx_handler import PPTHandler
from .xlsx_handler import XLSHandler


def dispatch_handler(file_path, user_id, doc_id):
    ext = os.path.splitext(file_path)[1].lower()

    if ext == '.pdf':
        return PDFHandler(file_path, user_id, doc_id)
    elif ext in ['.doc', '.docx']:
        return DOCHandler(file_path, user_id, doc_id)
    elif ext in ['.xls', '.xlsx']:
        return XLSHandler(file_path, user_id, doc_id)
    elif ext in ['.ppt', '.pptx']:
        return PPTHandler(file_path, user_id, doc_id)
    else:
        raise ValueError(f"Unsupported file extension: {ext}")
