import re
seen = {}
for pg in (10, 11):
    t = open(f"tools/ocr_out/gs_p{pg}_right.txt", encoding="utf-8").read().splitlines()
    i = 0
    while i < len(t)-2:
        m = re.match(r'^(\d{3,4})\s*[PR]?$', t[i].strip())
        if m and re.search(r'[PR]$', t[i].strip()):
            j = i+1; vals = []
            while j < len(t) and j < i+7 and re.match(r'^[\d.]+$', t[j].strip()):
                vals.append(float(t[j].strip())); j += 1
            if len(vals) >= 3:
                rt, kw, inp = vals[0], vals[1], vals[2]
                if abs(kw - rt*3.51685)/(rt*3.51685) < 0.02 and 3.5 < kw/inp < 8.5:
                    seen[int(rt)] = (kw, inp, round(kw/inp, 2))
        i += 1
js = "// MHI GART catalogue (OCR-verified: RT->kW->input->COP; source gs_p10/p11_right.txt)\nexport const GART_MODELS = [\n"
for rt in sorted(seen):
    kw, inp, cop = seen[rt]
    js += f"  {{ rt: {rt}, kw: {kw}, input: {inp}, cop: {cop} }},\n"
js += "];\n"
open("app/js/data/chiller_mhi.js", "w", encoding="utf-8").write(js)
print("VALIDATED ROWS:", len(seen))
print(js)
