from pipeline.pipeline_manager import run_powerpoint_pipeline
from .base_handler import BaseHandler


class PPTHandler(BaseHandler):
    def process(self):
        return run_powerpoint_pipeline(self.file_path, self.user_id, self.doc_id)


