import re
raw = []
for pg in (10, 11):
    raw += open(f"tools/ocr_out/gs_p{pg}_right.txt", encoding="utf-8").read().splitlines()
nums = []
for x in raw:
    x = x.strip().replace(',', '')
    if re.match(r'^\d{2,5}(\.\d+)?$', x) and '.' not in x:
        nums.append(x)
rows = {}
i = 0
while i < len(nums)-2:
    try: rt = int(nums[i])
    except: i += 1; continue
    if 200 <= rt <= 2300:
        for k in range(1, min(8, len(nums)-i)):
            kw = float(nums[i+k]) if nums[i+k].isdigit() else 0
            idea = rt * 3.51685
            if kw and abs(kw - idea)/idea < 0.005:
                for m in range(k+1, min(k+6, len(nums)-i)):
                    inp = float(nums[i+m]) if nums[i+m].isdigit() else 0
                    if inp and 3.0 < kw/inp < 8.0:
                        rows.setdefault(rt, (kw, inp, round(kw/inp, 2)))
                        break
                break
    i += 1
js = "// MHI GART (OCR, exact identity kW=RT x 3.51685 +-0.5%; source gs_p10/p11_right.txt)\nexport const GART_MODELS = [\n"
for rt in sorted(rows):
    kw, inp, cop = rows[rt]
    js += f"  {{ rt: {rt}, kw: {kw}, input: {inp}, cop: {cop} }},\n"
js += "];\n"
open("app/js/data/chiller_mhi.js", "w", encoding="utf-8").write(js)
print("EXACT ROWS:", len(rows), sorted(rows))
