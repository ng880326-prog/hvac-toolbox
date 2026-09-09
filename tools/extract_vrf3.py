import pypdf, os, glob
base = r"G:\我的雲端硬碟\catalogue"
print("--- MHI chiller files ---")
for f in sorted(glob.glob(base + r"\Mitsubishi heavy industries\20250417\Water-cooled Chiller\*.pdf")):
    print(os.path.basename(f))
print("--- MXZ correction pages 2-3 ---")
r = pypdf.PdfReader(base + r"\Mitsubishi\SH_MXZ-2C30_2C40_2C52_3C54_3C68_4C71_4C80_5C100_6C120VA-E1 Correction factor.pdf")
for i in [1, 2]:
    t = r.pages[i].extract_text() or ""
    lines = [l.strip() for l in t.splitlines() if l.strip()]
    print(f"--- p{i+1} ---")
    print("\n".join(lines[:45]))
