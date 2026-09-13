"""Print pages of a PDF that contain every given needle (case-insensitive).

Usage: python tools/pdf_pages.py <pdf> <first-page> <last-page> [needle ...]
Page numbers are 1-based and inclusive. Text goes to stdout, UTF-8.
"""
import sys

from pypdf import PdfReader


def main() -> None:
    pdf = sys.argv[1]
    first = int(sys.argv[2])
    last = int(sys.argv[3])
    needles = [n.lower() for n in sys.argv[4:]]
    reader = PdfReader(pdf)
    for page_no in range(first, last + 1):
        text = reader.pages[page_no - 1].extract_text() or ""
        if needles and not all(n in text.lower() for n in needles):
            continue
        print(f"===== page {page_no} =====")
        print(text)


if __name__ == "__main__":
    main()
