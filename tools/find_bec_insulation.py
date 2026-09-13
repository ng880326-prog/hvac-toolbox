"""Locate and print the insulation-thickness tables in the EMSD BEC Technical Guidelines PDF.

Usage: python tools/find_bec_insulation.py <pdf> [needle ...]
Prints the page number and text of every page containing all needles (default: 6.11 insulation).
"""
import sys

from pypdf import PdfReader


def main() -> None:
    pdf = sys.argv[1]
    needles = sys.argv[2:] or ["6.11"]
    reader = PdfReader(pdf)
    for i, page in enumerate(reader.pages, start=1):
        try:
            text = page.extract_text() or ""
        except Exception as exc:  # noqa: BLE001
            print(f"page {i}: extract failed: {exc}")
            continue
        low = text.lower()
        if all(n.lower() in low for n in needles):
            print(f"\n===== page {i} =====")
            print(text)


if __name__ == "__main__":
    main()
