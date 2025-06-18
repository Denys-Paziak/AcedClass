import hashlib
import os

ALLOWED_EXTENSIONS = ('.pdf', '.docx', '.doc', '.pptx', '.ppt', '.xlsx', '.xls')


def validate_file_type(file_path):
    ext = os.path.splitext(file_path)[1].lower()
    print("[EXT] FILE TYPE:", ext)
    if ext not in ALLOWED_EXTENSIONS:
        raise ValueError(f"Unsupported file type: {ext}")


def generate_hash(file_path):
    sha256_hash = hashlib.sha256()
    with open(file_path, "rb") as f:
        for byte_block in iter(lambda: f.read(4096), b""):
            sha256_hash.update(byte_block)
    return sha256_hash.hexdigest()
