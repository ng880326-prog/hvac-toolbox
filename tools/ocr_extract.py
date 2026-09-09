import pypdf, os
os.makedirs(r"tools\ocr_out", exist_ok=True)
r = pypdf.PdfReader(r"G:\我的雲端硬碟\catalogue\Insulation\K-flex\Job Ref(K-Flex).pdf")
for i, pg in enumerate(r.pages):
    try:
        imgs = pg.images
        for j, im in enumerate(imgs):
            im.image.save(rf"tools\ocr_out\kflex_p{i+1}_{j+1}.png")
            print(f"saved p{i+1} img{j+1}", im.image.size)
    except Exception as e:
        print(i, "err", e)
