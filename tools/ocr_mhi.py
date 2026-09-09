import pypdf, os
r = pypdf.PdfReader(r"G:\我的雲端硬碟\catalogue\Mitsubishi heavy industries\20250417\Water-cooled Chiller\Centrifugal Chiller.pdf")
os.makedirs(r"tools\ocr_out", exist_ok=True)
for i in range(4, 9):
    try:
        imgs = r.pages[i].images
        for j, im in enumerate(imgs):
            im.image.save(rf"tools\ocr_out\mhi_p{i+1}_{j+1}.png")
            print(f"saved p{i+1} img{j+1}", im.image.size)
    except Exception as e:
        print(i, "err", e)
