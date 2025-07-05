import os
import shutil

# from config import CLEANED_DIR, UPLOAD_DIR


def save_file(file_path, user_id, doc_id):
    file_uploads = os.path.join("uploads", user_id, doc_id, "cleaned")
    print(f'[FILE UPLOADS] save_file function', file_uploads)
    os.makedirs(file_uploads, exist_ok=True)
    dest_path = os.path.join(file_uploads, os.path.basename(file_path))
    shutil.copy2(os.path.join("uploads", user_id, doc_id, os.path.basename(file_path)), dest_path)
    print(f"[STORAGE] File saved to: {dest_path}")
    return dest_path
