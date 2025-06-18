from abc import ABC, abstractmethod

class BaseHandler(ABC):
    def __init__(self, file_path, user_id):
        self.file_path = file_path
        self.user_id = user_id

    @abstractmethod
    def process(self):
        """
        Обробляє вхідний файл.
        Має повертати: (cleaned_file_path: str, hash: str, watermark_detected: bool)
        """
        pass