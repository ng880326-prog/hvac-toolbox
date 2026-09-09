import pypdf, glob, os, re
base = r"G:\我的雲端硬碟\catalogue\Ventilation Fan"
keys = ("Designation", "Fan Code", "Volume", "Static Pressure", "Diameter", "Motor Power", "Type:")
for f in sorted(glob.glob(base + r"\EAF-*.pdf")):
    try:
        r = pypdf.PdfReader(f)
        out = {}
        for i in range(len(r.pages)):
            t = r.pages[i].extract_text() or ""
            for l in t.splitlines():
                ls = l.strip()
                if any(k in ls for k in keys) and not ls.startswith("Selection"):
                    for k in keys:
                        if k in ls and k not in out:
                            out[k] = ls.replace(k, "").strip()
        if out:
            print(os.path.basename(f).replace(".pdf",""), "|", out.get("Designation","?"), "|", out.get("Fan Code","?"),
                  "|", out.get("Volume","?"), "|", out.get("Static Pressure","?"), "|", out.get("Diameter","?"), "|", out.get("Motor Power","?"))
    except Exception as e:
        print(os.path.basename(f), "ERR", e)
