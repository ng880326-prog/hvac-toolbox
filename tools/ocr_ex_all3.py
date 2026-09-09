import pypdf, os, glob
base = r"G:\我的雲端硬碟\catalogue\Mitsubishi heavy industries\20250417\Water-cooled Chiller"
out = r"C:\Users\Kyle Ng\OneDrive\Desktop\HVAC_Toolbox_Pro_App\HVAC Tool\tools\ocr_out"
gart = [f for f in glob.glob(base + r"\**\*GART Chiller*.pdf", recursive=True)]
etiz = [f for f in glob.glob(base + r"\**\*ETI-Z*.pdf", recursive=True)]
print("gart match:", [os.path.basename(x) for x in gart])
print("etiz match:", [os.path.basename(x) for x in etiz])
for f, a, b, tag in [(gart[0], 13, 21, "gart"), (etiz[0], 2, 13, "etiz")]:
    r = pypdf.PdfReader(f)
    for i in range(a, min(b, len(r.pages))):
        try:
            imgs = r.pages[i].images
            big = [im for im in imgs if im.image and im.image.size[0] > 800]
            if big:
                big[0].image.convert('RGB').save(os.path.join(out, f"{tag}_p{i+1}.png"))
                print("saved", f"{tag}_p{i+1}.png")
        except Exception as e:
            print(i, "err", str(e)[:40])
