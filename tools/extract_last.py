import pypdf
base = r"G:\我的雲端硬碟\catalogue"
def probe(label, path, maxlines=30):
    print(f"###### {label} ######")
    try:
        r = pypdf.PdfReader(path)
        lines = []
        for i in range(min(3, len(r.pages))):
            t = r.pages[i].extract_text() or ""
            lines += [l.strip() for l in t.splitlines() if l.strip()]
        print("\n".join(lines[:maxlines]))
    except Exception as e:
        print("ERR", e)
probe("EAF-8F-01", base + r"\Ventilation Fan\EAF-8F-01.pdf")
probe("EAF-GF-01", base + r"\Ventilation Fan\EAF-GF-01.pdf")
probe("K-Flex Job Ref", base + r"\Insulation\K-flex\Job Ref(K-Flex).pdf", 40)
