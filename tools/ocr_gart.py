import pypdf, re, glob, os
base = r"G:\我的雲端硬碟\catalogue\Mitsubishi heavy industries\20250417\Water-cooled Chiller"
targets = [f for f in glob.glob(base + r"\**\*.pdf", recursive=True) if "ETI" in os.path.basename(f) or "GART" in os.path.basename(f)]
for f in sorted(targets):
    print("####", os.path.basename(f), os.path.getsize(f)//1024//1024, "MB")
    try:
        r = pypdf.PdfReader(f)
        print("pages:", len(r.pages))
        hits = 0
        for i in range(len(r.pages)):
            t = r.pages[i].extract_text() or ""
            if re.search(r'COP|kW/RT', t, re.I):
                lines = [l.strip() for l in t.splitlines() if l.strip()]
                print(f"--- text-table p{i+1} ({len(lines)} lines) ---")
                print("\n".join(lines[:26]))
                hits += 1
                if hits >= 1: break
        if hits == 0:
            # check image pages
            for i in range(min(6, len(r.pages))):
                try:
                    n = len(r.pages[i].images)
                    if n > 2: print(f"p{i+1}: {n} images (scan page candidate)")
                except: pass
    except Exception as e:
        print("ERR", e)
