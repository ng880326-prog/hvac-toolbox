"""Deep static integrity check for HVAC Toolbox Pro."""
import io, os, re, json, glob, sys

ROOT = r"C:\Users\Kyle Ng\OneDrive\Desktop\HVAC_Toolbox_Pro_App\HVAC Tool"
APP = os.path.join(ROOT, "app")
issues, notes = [], []

def rel(p): return os.path.relpath(p, ROOT)

def read(p):
    return io.open(p, encoding="utf-8", errors="replace").read()

# 1) every import path in app/js resolves
imports = []
for f in glob.glob(os.path.join(APP, "js", "**", "*.js"), recursive=True):
    src = read(f)
    for m in re.finditer(r"""(?:import|export)[^'"]*from\s*['"]([^'"]+)['"]""", src):
        spec = m.group(1)
        if spec.startswith("."):
            target = os.path.normpath(os.path.join(os.path.dirname(f), spec))
            imports.append((rel(f), spec, os.path.exists(target)))
bad_imports = [i for i in imports if not i[2]]
notes.append(f"import graph: {len(imports)} module imports, {len(bad_imports)} broken")
if bad_imports:
    for b in bad_imports: issues.append(f"BROKEN IMPORT  {b[0]} -> {b[1]}")

# 2) index.html referenced assets exist
html = read(os.path.join(APP, "index.html"))
refs = set(re.findall(r'(?:src|href)="([^"#][^"]*)"', html))
missing_refs = []
for r in refs:
    if r.startswith(("http", "data:", "mailto:")): continue
    p = os.path.normpath(os.path.join(APP, r.split("?")[0]))
    if not os.path.exists(p): missing_refs.append(r)
notes.append(f"index.html refs: {len(refs)} checked, {len(missing_refs)} missing")
for m in missing_refs: issues.append(f"MISSING ASSET  index.html -> {m}")

# 3) service worker precache coverage
sw = read(os.path.join(APP, "sw.js"))
sw_assets = re.findall(r"'(\./[^']+)'", sw)
sw_missing = [a for a in sw_assets if not os.path.exists(os.path.normpath(os.path.join(APP, a)))]
notes.append(f"SW precache: {len(sw_assets)} entries, {len(sw_missing)} point to missing files")
for m in sw_missing: issues.append(f"SW MISSING  {m}")
app_files = {"./" + os.path.relpath(p, APP).replace("\\", "/") for p in glob.glob(os.path.join(APP, "**", "*"), recursive=True) if os.path.isfile(p)}
unlisted = sorted(f for f in app_files - set(sw_assets) if not f.endswith(("manifest.webmanifest",)))
notes.append(f"files not precached: {len(unlisted)} (expected: manifest + none)")

# 4) manifest validation
man = json.loads(read(os.path.join(APP, "manifest.webmanifest")))
for k in ("name", "short_name", "start_url", "id", "scope", "display", "icons", "theme_color", "background_color", "lang"):
    if k not in man: issues.append(f"MANIFEST missing '{k}'")
icon_sizes = {i.get("sizes"): i.get("src") for i in man.get("icons", [])}
for need in ("192x192", "512x512"):
    if need not in icon_sizes: issues.append(f"MANIFEST missing icon {need}")
    elif not os.path.exists(os.path.join(APP, icon_sizes[need])): issues.append(f"MANIFEST icon file absent: {icon_sizes[need]}")
maskable = [i for i in man.get("icons", []) if "maskable" in str(i.get("purpose", ""))]
notes.append(f"manifest: id={man.get('id')} display={man.get('display')} icons={len(man.get('icons', []))} maskable={len(maskable)}")

# 5) data modules export expected symbols
DATA_EXPECT = {
    "pipes.js": ["STEEL_PIPES", "PIPE_DEFAULTS"], "fans.js": ["FANS"], "ahu_models.js": ["AHU_MODELS"],
    "suppliers.js": ["SUPPLIERS"], "hk_catalogs.js": ["CARRIER_42CN", "MITSUBISHI_SINGLE", "MITSUBISHI_MULTI", "FUJITSU_AOHG18"],
    "vrf_data.js": ["FUJ_COMBOS", "FUJ_COOL_MATRIX", "FUJ_HEAT_MATRIX", "fujCorrection"], "vectors.js": ["vectors"],
    "chiller_mhi.js": ["GART_MODELS"],
}
for f, syms in DATA_EXPECT.items():
    p = os.path.join(APP, "js", "data", f)
    if not os.path.exists(p): issues.append(f"DATA FILE MISSING  {f}"); continue
    src = read(p)
    for s in syms:
        if f"export const {s}" not in src and f"export function {s}" not in src:
            issues.append(f"DATA EXPORT MISSING  {f} -> {s}")
notes.append(f"data modules checked: {len(DATA_EXPECT)}")

# 6) Android integrity
bg = read(os.path.join(ROOT, "android", "app", "build.gradle"))
for pat, label in ((r'applicationId\s+"([^"]+)"', "applicationId"), (r'versionName\s+"([^"]+)"', "versionName"), (r'versionCode\s+(\d+)', "versionCode")):
    m = re.search(pat, bg)
    notes.append(f"android {label}: {m.group(1) if m else 'NOT FOUND'}")
    if not m: issues.append(f"ANDROID missing {label}")
apk_assets = glob.glob(os.path.join(ROOT, "android", "app", "src", "main", "assets", "public", "**", "*"), recursive=True)
apk_files = [p for p in apk_assets if os.path.isfile(p)]
app_count = len([p for p in app_files])
notes.append(f"android web assets: {len(apk_files)} files vs app/ {app_count} files")
if len(apk_files) < app_count - 2:
    issues.append(f"ANDROID assets out of sync ({len(apk_files)} vs {app_count}) - run npx cap sync")

# 7) HTML sanity
ids = re.findall(r'\sid="([^"]+)"', html)
dups = {i for i in ids if ids.count(i) > 1}
if dups: issues.append(f"DUPLICATE IDS in index.html: {sorted(dups)}")
imgs = re.findall(r'<img[^>]*>', html)
no_alt = [t for t in imgs if 'alt=' not in t]
if no_alt: issues.append(f"IMG without alt: {len(no_alt)}")
notes.append(f"index.html ids: {len(ids)} ({len(dups)} dup), imgs: {len(imgs)} ({len(no_alt)} no-alt)")

# 8) docs presence
req_docs = ["docs/verification/README.md", "docs/publishing/store_roadmap.md", "docs/publishing/microsoft_store_guide.md",
            "docs/publishing/capacitor_packaging.md", "docs/publishing/release_checklist.md", "docs/audit/page_mapping.md",
            "README.md", "app/privacy.html"]
for d in req_docs:
    if not os.path.exists(os.path.join(ROOT, d)): issues.append(f"DOC MISSING  {d}")
notes.append(f"required docs: {sum(1 for d in req_docs if os.path.exists(os.path.join(ROOT, d)))}/{len(req_docs)} present")

print("=== NOTES ===")
for n in notes: print(" ", n)
print("=== ISSUES:", len(issues), "===")
for i in issues: print("  -", i)
print("RESULT:", "CLEAN" if not issues else f"{len(issues)} ISSUE(S)")
