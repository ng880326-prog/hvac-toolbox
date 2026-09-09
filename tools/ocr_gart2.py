import pypdf, re
f = r"G:\我的雲端硬碟\catalogue\Mitsubishi heavy industries\20250417\Water-cooled Chiller\CONSTANT & VSD GART & GART-I R_P Model.pdf"
r = pypdf.PdfReader(f)
for i in range(4, 14):
    t = r.pages[i].extract_text() or ""
    lines = [l.strip() for l in t.splitlines() if l.strip()]
    num = [l for l in lines if re.search(r'\b\d{2,}\b', l)]
    print(f"== p{i+1}: {len(lines)} lines, {len(num)} numeric")
    if len(num) >= 8:
        print("\n".join(lines[:34]))
        break
