import re, json
rows = []
for pg in (10, 11):
    t = open(f"tools/ocr_out/gs_p{pg}_right.txt", encoding="utf-8").read().splitlines()
    i = 0
    while i < len(t):
        m = re.match(r'^(\d{3})([PR])$', t[i].strip())
        if m:
            j = i+1
            vals = []
            while j < len(t) and j < i+8 and re.match(r'^[\d.]+$', t[j].strip()):
                vals.append(float(t[j].strip())); j += 1
            if len(vals) >= 2:
                rows.append((m.group(1), m.group(2), vals))
        i += 1
print("rows found:", len(rows))
for r in rows[:12]: print(r)
js = "// MHI GART catalogue table (OCR-verified: RT -> kW -> COP; source gs_p10/11_right.txt)\nexport const GART_MODELS = [\n"
for rt, dr, v in rows:
    kw = v[0]; cop = round((kw/(float(rt)*3.51685)), 2) if kw > 0 else 0
    js += f"  {{ model: 'GART-{rt}{dr}', rt: {rt}, kw: {kw}, cop: {cop} }},\n"
js += "];\n"
open("app/js/data/chiller_mhi.js", "w", encoding="utf-8").write(js)
print("written chiller_mhi.js")
