import shutil
import subprocess
import os
import shutil


def remove_pdf_metadata(file_path):
    print(f"[METADATA] Removing metadata using exiftool: {file_path}")
    temp_out = file_path.replace(".pdf", "_tmp_nometa.pdf")

    try:
        subprocess.run([
            "exiftool", "-all=", "-o", temp_out, file_path
        ], check=True)
    except FileNotFoundError:
        raise RuntimeError("❌ exiftool is not installed or not in PATH")
    except subprocess.CalledProcessError as e:
        raise RuntimeError(f"❌ exiftool failed: {e}")

    # Перезаписуємо оригінальний файл очищеним
    shutil.move(temp_out, file_path)

    # Видаляємо залишкові .pdf_original (створюються exiftool’ом без overwrite)
    orig_backup = file_path + "_original"
    if os.path.exists(orig_backup):
        os.remove(orig_backup)

    return file_path