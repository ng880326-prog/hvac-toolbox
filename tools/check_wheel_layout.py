"""Measure the rebuilt Wheel page layout: are the summer/winter columns really side by side?"""
import sys

from playwright.sync_api import sync_playwright

URL = 'http://localhost:8080/#m/wheel'


def run(width, height, tag):
    with sync_playwright() as pw:
        b = pw.chromium.launch()
        page = b.new_page(viewport={'width': width, 'height': height})
        errs = []
        page.on('pageerror', lambda e: errs.append(str(e)))
        page.goto(URL, wait_until='networkidle')
        page.wait_for_selector('.wheel-col', timeout=15000)
        data = page.evaluate("""() => {
          const box = el => { const r = el.getBoundingClientRect();
            return {x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height)}; };
          const cols = [...document.querySelectorAll('.wheel-col')].map(box);
          const tbl = document.querySelector('.table-scroll');
          const svg = [...document.querySelectorAll('.wheel-sch')].map(box);
          return {
            cols, svg,
            tableScrollW: tbl ? Math.round(tbl.getBoundingClientRect().width) : null,
            tableContentW: tbl ? Math.round(tbl.scrollWidth) : null,
            tilesPerRow: (() => {
              const g = document.querySelector('.wheel-col .results');
              if (!g) return null;
              const kids = [...g.children].map(k => Math.round(k.getBoundingClientRect().x));
              return new Set(kids).size;
            })(),
            docScrollW: document.documentElement.scrollWidth,
            winW: window.innerWidth,
          };
        }""")
        side_by_side = (len(data['cols']) == 2 and abs(data['cols'][0]['y'] - data['cols'][1]['y']) < 12
                        and data['cols'][0]['x'] != data['cols'][1]['x'])
        print('[%s %dx%d]' % (tag, width, height))
        print('  columns: %s' % data['cols'])
        print('  side by side: %s | distinct tile columns per column: %s' % (side_by_side, data['tilesPerRow']))
        print('  table scroll box %s px vs content %s px (horizontal scroll needed: %s)' % (
            data['tableScrollW'], data['tableContentW'], data['tableContentW'] > data['tableScrollW']))
        print('  schematics: %s' % data['svg'])
        print('  page width %s vs viewport %s — horizontal overflow: %s' % (
            data['docScrollW'], data['winW'], data['docScrollW'] > data['winW'] + 1))
        print('  page errors: %s' % (errs or 'none'))
        page.screenshot(path='docs/verification/wheel_%s.png' % tag, full_page=(width < 800))
        # close-up of the design-conditions card so the wide table can be judged on phones
        card = page.query_selector('.wheel-dc')
        if card:
            card.screenshot(path='docs/verification/wheel_%s_table.png' % tag)
        # the media query hides one schematic variant (0x0), so pick the visible one
        sch = next((el for el in page.query_selector_all('.wheel-sch')
                    if el.bounding_box() and el.bounding_box()['width'] > 1), None)
        if sch:
            sch.screenshot(path='docs/verification/wheel_%s_schematic.png' % tag)
        b.close()
        return side_by_side


ok = run(1440, 1000, 'desktop')
run(390, 844, 'mobile')
run(820, 1180, 'tablet')
sys.exit(0 if ok else 1)
