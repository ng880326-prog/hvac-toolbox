import pypdf, re
r = pypdf.PdfReader(r"G:\我的雲端硬碟\catalogue\Mitsubishi heavy industries\20250417\Water-cooled Chiller\Centrifugal Chiller.pdf")
for i in [8, 9, 10, 11]:
    t = r.pages[i].extract_text() or ""
    lines = [l.strip() for l in t.splitlines() if l.strip()]
    nums = [l for l in lines if re.search(r'\d+', l)]
    print(f"===== p{i+1} ({len(lines)} lines, {len(nums)} numeric) =====")
    print("\n".join(lines[:14]))
