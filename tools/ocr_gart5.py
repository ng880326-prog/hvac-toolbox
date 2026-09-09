import pypdf, os, glob
base = r"G:\我的雲端硬碟\catalogue\Mitsubishi heavy industries\20250417\Water-cooled Chiller"
f = glob.glob(base + r"\**\GART Chiller.pdf", recursive=True)[0]
r = pypdf.PdfReader(f)
os.makedirs(r"tools\ocr_out", exist_ok=True)
for i in range(5, 12):
    try:
        imgs = r.pages[i].images
        big = [im for im in imgs if im.image and im.image.size[0] > 800]
        print(f"p{i+1}: {len(imgs)} imgs, big={[im.image.size for im in big]}")
        if big:
            big[0].image.convert('RGB').save(rf"tools\ocr_out\gart_p{i+1}.png")
            print(f"   saved gart_p{i+1}.png")
    except Exception as e:
        print(i, "err", str(e)[:60])
