import pypdf
base = r"G:\我的雲端硬碟"
def dump(path, pages=2, maxlines=40, label=""):
    print(f"=== {label} ===")
    try:
        r = pypdf.PdfReader(path)
        print(f"pages: {len(r.pages)}")
        for i in range(min(pages, len(r.pages))):
            t = r.pages[i].extract_text() or ""
            lines = [l.strip() for l in t.splitlines() if l.strip()]
            print(f"--- page {i+1} ---")
            print("\n".join(lines[:maxlines]))
    except Exception as e:
        print("ERR", e)
dump(base + r"\catalogue\GENERAL\AOHG18LAC2 Cooling Capacity Table.pdf", 1, 30, "Fujitsu AOHG18LAC2 capacity")
dump(base + r"\chapt21b.pdf", 1, 8, "chapt21b.pdf (identity check)")
dump(base + r"\TG-BEC_2015.pdf", 1, 6, "TG-BEC_2015.pdf (identity check)")
dump(base + r"\catalogue\Fan coil\Carrier\FCU capacity at 10_18 oC.pdf", 1, 25, "Carrier FCU capacity 10/18C")
