import pypdf, re, glob, os
base = r"G:\我的雲端硬碟\catalogue\Mitsubishi heavy industries\20250417\Water-cooled Chiller"
f = glob.glob(base + r"\**\*R_P Model.pdf", recursive=True)[0]
print("FILE:", f.replace(base, "..."))
r = pypdf.PdfReader(f)
for i in range(4, 14):
    t = r.pages[i].extract_text() or ""
    lines = [l.strip() for l in t.splitlines() if l.strip()]
    num = [l for l in lines if re.search(r'\b\d{2,}\b', l)]
    print(f"== p{i+1}: {len(lines)} lines, {len(num)} numeric")
    if len(num) >= 8:
        print("\n".join(lines[:38]))
        break
