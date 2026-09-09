import pypdf
r = pypdf.PdfReader(r"G:\我的雲端硬碟\catalogue\Mitsubishi heavy industries\20250417\Water-cooled Chiller\Centrifugal Chiller.pdf")
for i in [5, 6, 7]:
    t = r.pages[i].extract_text() or ""
    lines = [l.strip() for l in t.splitlines() if l.strip()]
    print(f"===== p{i+1} ({len(lines)} lines) =====")
    print("\n".join(lines[:30]))
