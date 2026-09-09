import io
root = r"C:\Users\Kyle Ng\OneDrive\Desktop\HVAC_Toolbox_Pro_App\HVAC Tool"
p = root + r"\app\js\modules\coil.js"
c = io.open(p, encoding="utf-8").read()
old = "box.append(h('div', { class: 'note' }, T('fallback')));"
new = "box.append(h('div', { class: 'note' }, T('fallback'), ' · ', h('a', { href: '#m/pipes', 'data-nav': '' }, L({ en: 'Chilled-water pipe sizing ->', zh: '冷媒水選徑 ➜ 🚿' }))));"
if old in c:
    c = c.replace(old, new, 1)
    io.open(p, "w", encoding="utf-8").write(c)
    print("coil cross-link added")
else:
    print("coil anchor missing")
