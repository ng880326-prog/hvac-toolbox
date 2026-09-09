import io
root = r"C:\Users\Kyle Ng\OneDrive\Desktop\HVAC_Toolbox_Pro_App\HVAC Tool"

# 1) CSS: reduced-motion, color-scheme dark, touch-action, text-wrap, overscroll, long-table perf
p = root + r"\app\css\app.css"
c = io.open(p, encoding="utf-8").read()
add = '''
/* WIG compliance additions */
[data-theme="dark"] { color-scheme: dark; }
:root { color-scheme: light; }
button, a, input, select, summary { touch-action: manipulation; }
h1, h2, h3 { text-wrap: balance; }
.sidebar { overscroll-behavior: contain; }
.pipes-table { content-visibility: auto; contain-intrinsic-size: 420px; }
.skip { position: absolute; left: -9999px; top: 0; background: var(--brand); color: #fff; padding: 10px 16px; z-index: 99; border-radius: 0 0 10px 0; }
.skip:focus { left: 0; }
@media (prefers-reduced-motion: reduce) {
  * { animation: none !important; transition: none !important; scroll-behavior: auto !important; }
}
'''
if "color-scheme: dark" not in c:
    c = c.rstrip() + "\n" + add
    io.open(p, "w", encoding="utf-8").write(c)
print("css patched")

# 2) index.html: skip link
p = root + r"\app\index.html"
c = io.open(p, encoding="utf-8").read()
old = '<header class="topbar">'
new = '<a class="skip" href="#content">Skip to content / 跳到主內容</a>\n  <header class="topbar">'
if 'class="skip"' not in c:
    c = c.replace(old, new, 1)
    io.open(p, "w", encoding="utf-8").write(c)
print("skip link added")

# 3) ui.js: input name/autocomplete + results aria-live
p = root + r"\app\js\ui.js"
c = io.open(p, encoding="utf-8").read()
c = c.replace("input = h('input', {\n      id, type:", "input = h('input', {\n      id, name: 'f-' + spec.key, autocomplete: 'off', type:")
c = c.replace("const grid = h('div', { class: 'results' });", "const grid = h('div', { class: 'results', 'aria-live': 'polite' });")
io.open(p, "w", encoding="utf-8").write(c)
print("inputs + aria-live patched")
