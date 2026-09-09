import io
root = r"C:\Users\Kyle Ng\OneDrive\Desktop\HVAC_Toolbox_Pro_App\HVAC Tool"
p = root + r"\app\js\app.js"
c = io.open(p, encoding="utf-8").read()

# 1) mobile auto-TOC after module render
anchor = "  window.scrollTo({ top: 0 });\n}"
toc = '''  // ---- mobile quick-nav (auto TOC from cards) ----
  const toc = document.getElementById('moduleToc');
  toc.innerHTML = '';
  const cards = [...body.querySelectorAll('.card')];
  if (cards.length > 1) {
    cards.forEach((cardEl, i) => {
      cardEl.id = 'card-' + i;
      const t = cardEl.querySelector('h3') || cardEl.querySelector('h2');
      const b = h('button', { class: 'toc-btn', onclick: () => { cardEl.scrollIntoView({ behavior: 'smooth', block: 'start' }); } }, t ? t.textContent : ('#' + (i + 1)));
      toc.append(b);
    });
  }
  window.scrollTo({ top: 0 });
}'''
assert anchor in c
c = c.replace(anchor, toc, 1)

# 2) home: add verify entry in about card
home_anchor = "  document.getElementById('netWarn').textContent = L({"
home_add = '''  const about = document.getElementById('about');
  if (about && !about.querySelector('.verify-link')) {
    const a = h('a', { class: 'tile verify-link', href: '#m/verify', 'data-nav': '' },
      h('span', { class: 'ico' }, '🔍'),
      h('b', {}, L({ en: 'Run Data Self-Check', zh: '🔍 數據真確性自檢' })),
      h('span', {}, L({ en: 'Re-validate all 69 formulas in-app', zh: '在 App 內重新驗證全部 69 條公式' })));
    about.append(a);
  }
  document.getElementById('netWarn').textContent = L({'''
assert home_anchor in c
c = c.replace(home_anchor, home_add, 1)
io.open(p, "w", encoding="utf-8").write(c)
print("app.js patched:", c.count("moduleToc"), c.count("verify-link"))
