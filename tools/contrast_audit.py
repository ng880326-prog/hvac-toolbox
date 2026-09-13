"""Contrast audit (WCAG 2.1 AA/AAA) for the app's real rendered text, in light and dark themes.

For every text-bearing element inside the module body it walks up the tree to the first ancestor with a
non-transparent background, computes the WCAG contrast ratio and reports anything below AA:
4.5:1 for normal text, 3:1 for large text (>=18.66px bold or >=24px).

Usage: python tools/contrast_audit.py [--pages 6]
"""
import sys

from playwright.sync_api import sync_playwright

URL = 'http://localhost:8080/index.html'
PAGES = int(sys.argv[sys.argv.index('--pages') + 1]) if '--pages' in sys.argv else 8

JS = """() => {
  const parse = c => {
    const m = c.match(/rgba?\\(([^)]+)\\)/);
    if (!m) return null;
    const p = m[1].split(',').map(x => parseFloat(x));
    return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
  };
  const lum = ({ r, g, b }) => {
    const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  };
  const mix = (fg, bg) => ({ r: fg.r * fg.a + bg.r * (1 - fg.a),
                             g: fg.g * fg.a + bg.g * (1 - fg.a),
                             b: fg.b * fg.a + bg.b * (1 - fg.a), a: 1 });
  const bgOf = el => {
    // Nearest ancestor that actually paints a background. When it paints a gradient the rendered
    // colour varies across the element, so the LIGHTEST stop is used: that is the worst case for the
    // light text the app puts on its brand gradient, and it is what the flags below are about.
    let n = el;
    while (n && n !== document.documentElement) {
      const cs = getComputedStyle(n);
      const img = cs.backgroundImage || '';
      const stops = img.includes('gradient')
        ? [...img.matchAll(/rgba?\\([^)]+\\)|#[0-9a-f]{3,8}/gi)].map(m => parse(m[0])).filter(Boolean)
        : [];
      const bg = parse(cs.backgroundColor);
      const opaque = bg && bg.a > 0.95;
      if (stops.length) {
        const solid = stops.filter(s => s.a > 0.95);
        if (solid.length) return solid.reduce((a, b) => (lum(a) > lum(b) ? a : b));
      }
      if (opaque) return bg;
      n = n.parentElement;
    }
    const body = parse(getComputedStyle(document.body).backgroundColor);
    return body && body.a > 0.95 ? body : null;   // null = cannot resolve -> skipped, not a failure
  };
  const out = [];
  document.querySelectorAll('#moduleBody *, .topbar *, .sidebar *').forEach(el => {
    if (el.children.length) return;
    const txt = (el.textContent || '').trim();
    if (!txt || txt.length > 80) return;
    const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || cs.display === 'none' || parseFloat(cs.opacity) < 0.5) return;
    const fg = parse(cs.color);
    if (!fg) return;
    const bg = bgOf(el);
    if (!bg) { out.push({ text: txt.slice(0, 34), cls: (el.className || '').toString().slice(0, 28),
                          size: +parseFloat(cs.fontSize).toFixed(1), ratio: null, need: 0 }); return; }
    const fgSolid = fg.a < 1 ? mix(fg, bg) : fg;
    const L1 = lum(fgSolid), L2 = lum(bg);
    const ratio = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
    const size = parseFloat(cs.fontSize);
    const bold = parseInt(cs.fontWeight, 10) >= 700;
    const large = size >= 24 || (size >= 18.66 && bold);
    const need = large ? 3 : 4.5;
    if (ratio < need) {
      out.push({ text: txt.slice(0, 34), cls: (el.className || '').toString().slice(0, 28),
                 size: +size.toFixed(1), ratio: +ratio.toFixed(2), need });
    }
  });
  const seen = new Set();
  return out.filter(x => { const k = x.cls + x.size + x.ratio; if (seen.has(k)) return false; seen.add(k); return true; });
}"""


def main():
    ids = []
    hits = []
    with sync_playwright() as pw:
        browser = pw.chromium.launch()
        page = browser.new_page(viewport={'width': 390, 'height': 844})
        page.goto(URL, wait_until='networkidle')
        ids = page.eval_on_selector_all('a.nav-item[href^="#m/"]',
                                        "els => els.map(e => e.getAttribute('href').slice(3))")[:PAGES]
        for theme in ('light', 'dark'):
            if theme == 'dark':
                page.click('#themeToggle')
                page.wait_for_timeout(200)
            for mid in ids:
                page.goto('%s#m/%s' % (URL, mid), wait_until='networkidle')
                page.wait_for_timeout(150)
                for h in page.evaluate(JS):
                    hits.append({**h, 'theme': theme, 'page': mid})
            page.goto(URL, wait_until='networkidle')
            page.wait_for_timeout(150)
            for h in page.evaluate(JS):
                hits.append({**h, 'theme': theme, 'page': 'home'})
        browser.close()

    # collapse to unique (theme, class, size, ratio) offenders
    seen, uniq, unknown = set(), [], []
    for h in hits:
        key = (h['theme'], h['cls'], h['size'], h['ratio'])
        if key in seen:
            continue
        seen.add(key)
        (unknown if h['ratio'] is None else uniq).append(h)
    print('pages checked: %d (+home) x 2 themes' % len(ids))
    if unknown:
        print('\n%d text elements whose background could not be resolved (not counted as failures):'
              % len(unknown))
        for h in unknown[:6]:
            print('  %-5s %-28s %r' % (h['theme'], h['cls'] or '(none)', h['text']))
    if not uniq:
        print('\nRESULT: all sampled text meets WCAG AA')
        return 0
    print('\n%d distinct contrast failures:\n' % len(uniq))
    for h in sorted(uniq, key=lambda x: x['ratio']):
        print('  %-5s %-28s size %-5s ratio %-5s need %s  %r'
              % (h['theme'], h['cls'] or '(none)', h['size'], h['ratio'], h['need'], h['text']))
    return 1


if __name__ == '__main__':
    sys.exit(main())
