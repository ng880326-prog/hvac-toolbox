import pypdf
base = r"G:\我的雲端硬碟\catalogue"
def probe(label, path, pages=2, maxlines=60):
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
probe("Fujitsu AOHG18 correction coeff",
      base + r"\GENERAL\AOHG18LAC2 Multi Split Outdoor Unit Cooling Capacity Compensation Coefficient on Pipe Lenght & Height Difference.pdf", 1, 55)
probe("MHI Centrifugal Chiller spec",
      base + r"\Mitsubishi heavy industries\20250417\Water-cooled Chiller\Centrifugal Chiller.pdf", 2, 40)
