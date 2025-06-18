from pipeline.pipeline_manager import run_pdf_pipeline
from .base_handler import BaseHandler


class PDFHandler(BaseHandler):
    def process(self):
        return run_pdf_pipeline(self.file_path, self.user_id)
