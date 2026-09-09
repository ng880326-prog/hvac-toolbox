import pypdf
base = r"G:\我的雲端硬碟\catalogue"
def probe(label, path, pages=2, maxlines=50):
    print(f"########## {label} ##########")
    try:
        r = pypdf.PdfReader(path)
        print(f"pages={len(r.pages)}")
        for i in range(min(pages, len(r.pages))):
            t = r.pages[i].extract_text() or ""
            lines = [l.strip() for l in t.splitlines() if l.strip()]
            print(f"--- p{i+1} ---")
            print("\n".join(lines[:maxlines]))
    except Exception as e:
        print("ERR", e)
probe("MXZ correction tables",
      base + r"\Mitsubishi\SH_MXZ-2C30_2C40_2C52_3C54_3C68_4C71_4C80_5C100_6C120VA-E1 Correction factor.pdf", 1, 55)
probe("MHI ETI-Z chiller",
      base + r"\Mitsubishi heavy industries\20250417\Water-cooled Chiller\Low GWP Refrigerant VSD ETI-Z.pdf", 1, 50)
