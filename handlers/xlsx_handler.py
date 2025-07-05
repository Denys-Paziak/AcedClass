from pipeline.pipeline_manager import run_excel_pipeline
from .base_handler import BaseHandler


class XLSHandler(BaseHandler):
    def process(self):
        return run_excel_pipeline(self.file_path, self.user_id, self.doc_id)
