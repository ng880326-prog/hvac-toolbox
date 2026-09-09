import re
out = []
for pg in (10, 11):
    t = open(f"tools/ocr_out/gs_p{pg}_right.txt", encoding="utf-8").read().splitlines()
    i = 0
    while i < len(t)-1:
        m = re.match(r'^(\d{3,4})$', t[i].strip())
        if m:
            j = i+1; vals = []
            while j < len(t) and j < i+6 and re.match(r'^[\d.]+$', t[j].strip()):
                vals.append(float(t[j].strip())); j += 1
            if vals and vals[0] > 400:
                rt = int(m.group(1))
                kw = vals[0]
                if abs(kw - rt*3.51685) / (rt*3.51685) < 0.04:
                    cop = round(vals[1]/ (kw/rt) if vals[1] and abs(vals[1]/(kw/rt)-1) < 5 else 0, 2) or round(sum(vals)/len(vals)/(kw/rt), 2)
                    out.append((rt, kw, round(kw / (rt*3.51685), 2)))
        i += 1
seen = {}
for rt, kw, cop in out:
    if rt not in seen: seen[rt] = (kw, cop)
js = "// MHI GART catalogue (OCR-verified: kW = RT x 3.5169; source gs_p10/p11_right.txt)\nexport const GART_MODELS = [\n"
for rt in sorted(seen):
    kw, cop = seen[rt]
    js += f"  {{ rt: {rt}, kw: {kw}, cop: {cop} }},\n"
js += "];\n"
open("app/js/data/chiller_mhi.js", "w", encoding="utf-8").write(js)
print(js)
