from pipeline.pipeline_manager import run_pdf_pipeline, run_word_pipeline
from .base_handler import BaseHandler


class DOCHandler(BaseHandler):
    def process(self):
        return run_word_pipeline(self.file_path, self.user_id, self.doc_id)

