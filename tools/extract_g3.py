import pypdf
base = r"G:\我的雲端硬碟"
r = pypdf.PdfReader(base + r"\catalogue\Fan coil\Carrier\FCU capacity at 10_18 oC.pdf")
t = r.pages[0].extract_text() or ""
print("=== Carrier FCU full page 1 ===")
print("\n".join([l.strip() for l in t.splitlines() if l.strip()]))
print("=== Fujitsu AOHG18LAC2 ===")
r2 = pypdf.PdfReader(base + r"\catalogue\GENERAL\AOHG18LAC2 Cooling Capacity Table.pdf")
t2 = r2.pages[0].extract_text() or ""
print("\n".join([l.strip() for l in t2.splitlines() if l.strip()]))
