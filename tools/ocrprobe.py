import importlib.util as u
print("pillow:", bool(u.find_spec("PIL")))
import pypdf
base = r"G:\我的雲端硬碟\catalogue"
r = pypdf.PdfReader(base + r"\Insulation\K-flex\Job Ref(K-Flex).pdf")
print("K-flex pages:", len(r.pages))
try:
    imgs = r.pages[0].images
    print("page1 images:", len(imgs))
except Exception as e:
    print("img err:", e)
try:
    t = r.pages[0].extract_text() or ""
    print("page1 text len:", len(t))
    t2 = r.pages[1].extract_text() or ""
    print("page2 text len:", len(t2))
except Exception as e:
    print(e)
