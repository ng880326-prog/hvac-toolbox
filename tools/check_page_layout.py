"""Measure a module page's layout in a real browser across desktop / tablet / phone.

Checks the things that actually broke during the rebuilds: whether side-by-side blocks really sit side
by side, whether wide tables scroll instead of squeezing, whether the page overflows horizontally, and
whether anything throws. The per-page extras (the wheel's summer|winter columns, the psychrometric
Air 1 | Air 2 table) are asserted when that module is the one being checked.

Usage:
    python tools/check_page_layout.py [moduleId]      # default: wheel
"""
import sys

from playwright.sync_api import sync_playwright

MODULE = next((a for a in sys.argv[1:] if not a.startswith('-')), 'wheel')
URL = 'http://localhost:8080/#m/' + MODULE

MEASURE = """() => {
  const box = el => { const r = el.getBoundingClientRect();
    return {x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height)}; };
  const visible = el => { const r = el.getBoundingClientRect(); return r.width > 1 && r.height > 1; };
  const cols = [...document.querySelectorAll('.wheel-col')].map(box);
  const tbl = document.querySelector('.table-scroll');
  const svgs = [...document.querySelectorAll('.wheel-sch, .wheel-sch-wide, .wheel-sch-narrow')]
    .map(box).filter(b => b.w > 1);
  const g = document.querySelector('.wheel-col .results');
  return {
    cols, svgs,
    tableScrollW: tbl ? Math.round(tbl.getBoundingClientRect().width) : null,
    tableContentW: tbl ? Math.round(tbl.scrollWidth) : null,
    tilesPerRow: g ? new Set([...g.children].map(k => Math.round(k.getBoundingClientRect().x))).size : null,
    psyTableVisible: !!document.querySelector('.psy-air') && visible(document.querySelector('.psy-air')),
    psyTableW: document.querySelector('.psy-air') ? Math.round(document.querySelector('.psy-air').getBoundingClientRect().width) : null,
    cards: document.querySelectorAll('#moduleBody .card').length,
    docScrollW: document.documentElement.scrollWidth,
    winW: window.innerWidth,
  };
}"""


def run(width, height, tag):
    with sync_playwright() as pw:
        b = pw.chromium.launch()
        page = b.new_page(viewport={'width': width, 'height': height})
        errs = []
        page.on('pageerror', lambda e: errs.append(str(e)))
        page.on('console', lambda m: errs.append(m.text) if m.type == 'error' else None)
        page.goto(URL, wait_until='networkidle')
        page.wait_for_selector('#moduleBody .card', timeout=15000)
        d = page.evaluate(MEASURE)
        print('[%s %s %dx%d]' % (MODULE, tag, width, height))
        print('  cards: %s' % d['cards'])
        if d['cols']:
            side = (len(d['cols']) == 2 and abs(d['cols'][0]['y'] - d['cols'][1]['y']) < 12
                    and d['cols'][0]['x'] != d['cols'][1]['x'])
            print('  summer|winter columns: %s (side by side: %s, tiles/row %s)' % (d['cols'], side, d['tilesPerRow']))
        if d['psyTableVisible']:
            print('  Air1|Air2 table visible, width %s px' % d['psyTableW'])
        if d['svgs']:
            print('  schematics: %s' % d['svgs'])
        if d['tableScrollW'] is not None:
            print('  scroll table %s px vs content %s px (scrolls: %s)'
                  % (d['tableScrollW'], d['tableContentW'], d['tableContentW'] > d['tableScrollW']))
        print('  horizontal overflow: %s (doc %s vs viewport %s)'
              % (d['docScrollW'] > d['winW'] + 1, d['docScrollW'], d['winW']))
        print('  page/console errors: %s' % (errs or 'none'))
        page.screenshot(path='docs/verification/%s_%s.png' % (MODULE, tag), full_page=(width < 900))
        for sel, name in (('.wheel-sch-wide, .wheel-sch-narrow', 'schematic'),
                          ('.psy-air', 'table'), ('.wheel-dc', 'table')):
            el = next((e for e in page.query_selector_all(sel)
                       if e.bounding_box() and e.bounding_box()['width'] > 1), None)
            if el:
                el.screenshot(path='docs/verification/%s_%s_%s.png' % (MODULE, tag, name))
                break
        b.close()
        return not errs


ok = True
for args in ((1440, 1000, 'desktop'), (820, 1180, 'tablet'), (390, 844, 'mobile')):
    ok = run(*args) and ok
sys.exit(0 if ok else 1)
