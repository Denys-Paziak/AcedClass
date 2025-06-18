import os
import shutil

from config import CLEANED_DIR


def save_file(file_path):
    os.makedirs(CLEANED_DIR, exist_ok=True)
    dest_path = os.path.join(CLEANED_DIR, os.path.basename(file_path))
    shutil.copy2(file_path, dest_path)
    print(f"[STORAGE] File saved to: {dest_path}")
    return dest_path
