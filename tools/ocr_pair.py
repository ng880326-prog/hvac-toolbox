import re
left = open("tools/ocr_out/gs_p10_left.txt", encoding="utf-8").read().splitlines()
right = open("tools/ocr_out/gs_p10_right.txt", encoding="utf-8").read().splitlines()
models = [l for l in left if re.search(r'GART|^\d{3,4}$', l.strip())]
print("LEFT model-ish:", models[:18])
print("RIGHT #-rows:", [l for l in right if len(re.findall(r'\d',l))>=3][:10])
