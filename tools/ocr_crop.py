from PIL import Image
out = r"tools\ocr_out"
for pg in (10, 11):
    im = Image.open(f"{out}\gart_p{pg}.png").convert('L')
    w, h = im.size
    # left model column ~0-16%, values 16-100%
    im.crop((0, 0, int(w*0.16), h)).save(f"{out}\gs_p{pg}_left.png")
    im.crop((int(w*0.16), 0, w, h)).save(f"{out}\gs_p{pg}_right.png")
    print(pg, im.size)
