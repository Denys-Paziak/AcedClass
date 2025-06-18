import logging
import os
from config import LOG_FILE

def setup_logger():
    os.makedirs(os.path.dirname(LOG_FILE), exist_ok=True)
    logger = logging.getLogger("DocumentProcessor")
    logger.setLevel(logging.INFO)

    fh = logging.FileHandler(LOG_FILE, encoding='utf-8')
    formatter = logging.Formatter("%(asctime)s — %(levelname)s — %(message)s")
    fh.setFormatter(formatter)

    logger.addHandler(fh)
    return logger