import io
root = r"C:\Users\Kyle Ng\OneDrive\Desktop\HVAC_Toolbox_Pro_App\HVAC Tool"
# index.html: add moduleToc container inside module screen
p = root + r"\app\index.html"
c = io.open(p, encoding="utf-8").read()
old = '<div id="moduleHead"></div>'
new = '<div id="moduleToc"></div>\n        <div id="moduleHead"></div>'
assert old in c
c = c.replace(old, new, 1)
# css
pc = root + r"\app\css\app.css"
css = io.open(pc, encoding="utf-8").read()
if ".toc-btn" not in css:
    css += '''
/* module quick-nav chips (auto TOC) */
#moduleToc { display: none; }
.toc-btn { border: 1px solid var(--line); background: var(--card); color: var(--ink-soft); padding: 6px 12px; border-radius: 999px; font-size: 12.5px; cursor: pointer; }
.toc-btn:hover { color: var(--brand); border-color: var(--brand-2); }
@media (max-width: 520px) {
  #moduleToc { display: flex; flex-wrap: wrap; gap: 6px; position: sticky; top: var(--topbar-h); z-index: 40; background: var(--bg); padding: 8px 0; margin: -8px 0 10px; }
}
'''
io.open(pc, "w", encoding="utf-8").write(css)
io.open(p, "w", encoding="utf-8").write(c)
print("html toc div + css ok")
