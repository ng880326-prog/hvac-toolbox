from PIL import Image
out = "tools/ocr_out"
for pg in (10, 11):
    im = Image.open(f"{out}/gart_p{pg}.png").convert('L')
    w, h = im.size
    im.crop((0, 0, int(w*0.16), h)).save(f"{out}/gs_p{pg}_left.png")
    im.crop((int(w*0.16), 0, w, h)).save(f"{out}/gs_p{pg}_right.png")
    print("crop", pg, im.size)
