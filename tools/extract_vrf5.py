import pypdf, glob, os
base = r"G:\我的雲端硬碟\catalogue"
r = pypdf.PdfReader(base + r"\Mitsubishi heavy industries\20250417\Water-cooled Chiller\Centrifugal Chiller.pdf")
for i in [2, 3, 4]:
    t = r.pages[i].extract_text() or ""
    lines = [l.strip() for l in t.splitlines() if l.strip()]
    print(f"--- p{i+1} ({len(lines)} lines) ---")
    print("\n".join(lines[:35]))
print("### ETI-Z candidates ###")
for f in glob.glob(base + r"\Mitsubishi heavy industries\**\*ETI*.pdf", recursive=True):
    print(os.path.basename(f), os.path.getsize(f))
