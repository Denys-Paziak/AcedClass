import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")
CLEANED_DIR = os.path.join(BASE_DIR, "cleaned")
LOG_FILE = os.path.join(BASE_DIR, "logs", "processing.log")

ENABLE_OCR = True
ENABLE_WATERMARK_DETECTION = True

WATERMARK_PATTERNS = [
    # General
    r"Downloaded by .+",
    r"CourseHero",
    r"Scanned by",
    r"Uploaded by .+",
    r"This document is confidential",
    r"Do not (redistribute|distribute|share|copy)",
    r"For internal use only",
    r"\[User ID\]",
    r"Watermark",
    r"Confidential",
    r"Do Not Copy",
    r"Not for publication",
    r"Unauthorized reproduction",
    r"Copyright violation",
    r"Property of .+",
    r"Downloaded from .+",
    r"This study (resource|source) was (downloaded|shared) .*",
    r"Answers only",
    r"Leaked",
    r"Plagiarized",

    # PII
    r"Social Security Number",
    r"SSN:?",
    r"Date of Birth",
    r"Student ID",
    r"Phone Number",
    r"Email Address",
    r"Address:",
    r"Driver.?s License",
    r"\d{3}-\d{2}-\d{4}",  # SSN format

    # CourseHero
    r"https:\/\/www\.coursehero\.com\/file\/\d+\/",
    r"Downloaded by .* from CourseHero\.com on .+",
    r"This study resource was shared via CourseHero\.com",

    # Studocu
    r"Studocu",
    r"Downloaded from Studocu",
    r"This document was uploaded by a user",
    r"Studocu watermark",

    # Chegg
    r"Chegg",
    r"Chegg Study",
    r"Chegg Tutors",
    r"Chegg watermark",

    # Docsity
    r"Docsity",
    r"Downloaded from Docsity",
    r"This document was uploaded by a user on Docsity",
    r"Docsity watermark",

    # Old
    r"CH-\d+",
    r"User ID: \#?\d+",
]

