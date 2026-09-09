import pypdf, re, glob
base = r"G:\我的雲端硬碟\catalogue\Mitsubishi heavy industries\20250417\Water-cooled Chiller"
f = glob.glob(base + r"\**\*R_P Model.pdf", recursive=True)[0]
r = pypdf.PdfReader(f)
best = None; bestlines = None
for i in range(5, 20):
    t = r.pages[i].extract_text() or ""
    lines = [l.strip() for l in t.splitlines() if l.strip()]
    num = [l for l in lines if re.search(r'^(RT|COOLING|COP|\d)', l) and re.search(r'\d', l)]
    if len(num) > (bestlines or 0):
        best = i; bestlines = len(num)
print("best page:", best+1 if best is not None else None, "numeric:", bestlines)
if best is not None:
    t = r.pages[best].extract_text() or ""
    lines = [l.strip() for l in t.splitlines() if l.strip()]
    print("\n".join(lines[:45]))
