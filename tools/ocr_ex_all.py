import pypdf, os, glob
base = r"G:\鎴戠殑闆茬纭\catalogue\Mitsubishi heavy industries\20250417\Water-cooled Chiller"
out = r"C:\Users\Kyle Ng\OneDrive\Desktop\HVAC_Toolbox_Pro_App\HVAC Tool\tools\ocr_out"
jobs = [(glob.glob(base + r"\**\GART Chiller.pdf", recursive=True)[0], 13, 21, "gart"),
        (glob.glob(base + r"\**\Low GWP Refrigerant VSD ETI-Z.pdf", recursive=True)[0], 2, 13, "etiz")]
for f, a, b, tag in jobs:
    r = pypdf.PdfReader(f)
    for i in range(a, min(b, len(r.pages))):
        try:
            imgs = r.pages[i].images
            big = [im for im in imgs if im.image and im.image.size[0] > 800]
            if big:
                big[0].image.convert('RGB').save(os.path.join(out, f"{tag}_p{i+1}.png"))
                print("saved", f"{tag}_p{i+1}.png", big[0].image.size)
        except Exception as e:
            print(i, "err", str(e)[:50])