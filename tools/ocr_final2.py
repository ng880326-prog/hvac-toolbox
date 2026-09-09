import re
raw = []
for pg in (10, 11):
    raw += open(f"tools/ocr_out/gs_p{pg}_right.txt", encoding="utf-8").read().splitlines()
nums = [x.strip() for x in raw if re.match(r'^\d[\d.,]*$', x.strip())]
rows = {}
i = 0
while i < len(nums)-2:
    rt = int(nums[i])
    if 200 <= rt <= 2300:
        for k in range(1, min(8, len(nums)-i)):
            try: kw = float(nums[i+k].replace(',', ''))
            except: continue
            idea = rt * 3.51685
            if abs(kw - idea)/idea < 0.005:
                for m in range(k+1, min(k+6, len(nums)-i)):
                    try: inp = float(nums[i+m].replace(',', ''))
                    except: continue
                    if 3.0 < kw/inp < 8.0:
                        rows.setdefault(rt, (kw, inp, round(kw/inp, 2)))
                        break
                break
    i += 1
js = "// MHI GART (OCR, exact identity: kW=RT x 3.51685 +-0.5%; source gs_p10/p11_right.txt)\nexport const GART_MODELS = [\n"
for rt in sorted(rows):
    kw, inp, cop = rows[rt]
    js += f"  {{ rt: {rt}, kw: {kw}, input: {inp}, cop: {cop} }},\n"
js += "];\n"
open("app/js/data/chiller_mhi.js", "w", encoding="utf-8").write(js)
print("EXACT-ID ROWS:", len(rows), "->", sorted(rows))
