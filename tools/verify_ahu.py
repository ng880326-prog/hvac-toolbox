"""Verification of the rebuilt AHU page against the workbook's rules and catalogue tables.

Workbook reference ('AHU' sheet):
  E24 sensible load = density × area × SHR / 1000      (B19:F27)
  E27 supply flow   = E24 / 1.23 / (t_room − t_supply) × 1000
  E37 fresh air     = area × L/s/m² + population × L/s/p (B30:F40)
  L7:U28  Trane CLCP (model 003 → 2070 CMH = 575 L/s AHU / 1863 CMH = 517.5 L/s PAU)
  W7:AF28 Savier A1 (first row A1-690H-1050W → 2556 CMH = 710 L/s AHU / 2300 CMH = 638.9 L/s PAU)
  L29/W29 150 mm frame allowance

Usage: python tools/verify_ahu.py
"""
import re
import sys

from playwright.sync_api import sync_playwright

URL = 'http://localhost:8080/#m/ahu'


def num(text):
    m = re.search(r'-?\d[\d,]*(?:\.\d+)?', text or '')
    return float(m.group(0).replace(',', '')) if m else float('nan')


def main():
    ok = fail = 0

    def check(name, got, want, tol=None):
        nonlocal ok, fail
        good = (abs(got - want) <= tol) if tol is not None else got == want
        ok, fail = (ok + 1, fail) if good else (ok, fail + 1)
        print('  %-54s got %-22s want %-22s %s' % (name, str(got)[:22], str(want)[:22], 'OK' if good else 'FAIL'))

    with sync_playwright() as pw:
        browser = pw.chromium.launch()
        page = browser.new_page(viewport={'width': 1440, 'height': 1000})
        errors = []
        page.on('pageerror', lambda e: errors.append(str(e)))
        page.on('console', lambda m: errors.append(m.text) if m.type == 'error' else None)
        page.goto(URL, wait_until='networkidle')
        page.wait_for_selector('#est-area', timeout=15000)

        def card_tiles(needle):
            return page.evaluate("""(needle) => {
              const cards = [...document.querySelectorAll('#moduleBody .card')];
              const c = cards.find(x => (x.querySelector('h3')?.textContent || '').includes(needle));
              if (!c) return [];
              return [...c.querySelectorAll('.res')].map(e => [e.querySelector('.lbl').textContent.trim(),
                                                              e.querySelector('.val').textContent.trim()]);
            }""", needle)

        def cpick(needle, sub, nth=0):
            hits = [v for k, v in card_tiles(needle) if sub in k]
            return hits[nth] if len(hits) > nth else '(missing)'

        # --- supply flow estimation: 100 m² × 120 W/m² = 12 kW, SHR 0.75 → 9 kW, ΔT 12 K ---
        est = card_tiles('送風量估算')
        check('cooling load 12 kW (E24 chain)', num(cpick('送風量估算', '冷負荷', 0)), 12.0, 0.05)
        check('sensible load 9 kW (E24 = density·area·SHR)', num(cpick('送風量估算', '顯熱冷負荷')), 9.0, 0.05)
        check('supply flow 609.8 L/s (E27, ρcp 1.23)', num(cpick('送風量估算', '送風量', 0)), 609.8, 0.2)
        check('supply flow 2195 CMH', num(cpick('送風量估算', '送風量', 1)), 2195, 2)
        check('engine ρcp 1.213 gives 618.2 L/s', num(cpick('送風量估算', '引擎')), 618.2, 0.3)
        void = est

        # --- fresh air: 100 m², 5 m²/person → 20 people, 10 L/s·p + 0.3 L/s·m² ---
        check('population 20 people', num(cpick('新風量估算', '人數')), 20, 1e-6)
        check('workbook total = 20·10 + 100·0.3 = 230 L/s', num(cpick('新風量估算', '原檔')), 230, 0.05)
        check('ASHRAE 62.1 larger of the two = 200 L/s', num(cpick('新風量估算', 'ASHRAE')), 200, 0.05)
        check('total fresh air in CMH = 828', num(card_tiles('新風量估算')[5][1]), 828, 0.5)

        # --- quick selection, Trane default at 575 L/s ---
        check('Trane model 003 (575 L/s)', cpick('快速選型', '型號').startswith('003'), True)
        check('catalogue flow 2070 CMH', num(cpick('快速選型', '目錄風量', 0)), 2070, 1e-6)
        check('catalogue flow 575 L/s', num(cpick('快速選型', '目錄風量', 1)), 575, 1e-6)
        check('casing 150 × 700 × 850 mm', cpick('快速選型', '機殼').startswith('150 × 700 × 850'), True)
        # mix 310 + c8 620 + hc 310 + fan 775 + frame 150 (comps index 7 is the heating coil)
        check('section length 150 + 310 + 620 + 310 + 775 = 2165 mm', num(cpick('快速選型', '功能段總長')), 2165, 1e-6)

        # --- switch to the Savier series and select a bigger unit ---
        page.click('.card .seg button:has-text("Savier A1")')
        page.wait_for_timeout(250)
        page.fill('#sel-flow', '710')
        page.dispatch_event('#sel-flow', 'input')
        page.wait_for_timeout(250)
        check('Savier picks A1-690H-1050W at 710 L/s', cpick('快速選型', '型號').startswith('A1-690H-1050W'), True)
        check('Savier catalogue flow 2556 CMH', num(cpick('快速選型', '目錄風量', 0)), 2556, 1e-6)
        check('Savier casing 150 × 985 × 680 mm', cpick('快速選型', '機殼').startswith('150 × 985 × 680'), True)
        check('model with no section lengths shows the frame note',
              page.locator('#moduleBody .flag').count() >= 1, True)

        # --- "use the estimated flow" copies card 1 into the selection ---
        page.click('#moduleBody button:has-text("採用估算風量")')
        page.wait_for_timeout(250)
        check('flow field takes the estimated 609.8 L/s', page.input_value('#sel-flow'), '609.8')
        check('selection then lands on the first Savier unit', cpick('快速選型', '型號').startswith('A1-690H-1050W'), True)

        # --- catalogue tables ---
        rows = page.eval_on_selector_all('.folded .pipes-table tbody tr', 'r => r.length')
        check('both catalogue tables render (22 Trane + 22 Savier)', rows, 44)
        first = page.eval_on_selector_all('.folded .pipes-table tbody tr:first-child td',
                                          "t => t.map(e => e.textContent.trim())")
        check('first Trane row = 003 / 2070 / 575 / 1863 / 517.5', first[:5], ['003', '2070', '575', '1863', '517.5'])

        # --- data sanity: catalogue L/s must equal CMH/3.6 in both series ---
        bad = page.evaluate("""() => {
          const out = [];
          document.querySelectorAll('.folded .pipes-table tbody tr').forEach(tr => {
            const c = [...tr.querySelectorAll('td')].map(td => parseFloat(td.textContent));
            if (c.length >= 5 && Math.abs(c[1] / 3.6 - c[2]) > 0.02) out.push(c[0]);
            if (c.length >= 5 && Math.abs(c[3] / 3.6 - c[4]) > 0.05) out.push(c[0]);
          });
          return out;
        }""")
        check('every catalogue row satisfies L/s = CMH/3.6', bad, [])

        page.screenshot(path='docs/verification/ahu_desktop.png', full_page=True)
        page.set_viewport_size({'width': 390, 'height': 844})
        page.wait_for_timeout(300)
        page.screenshot(path='docs/verification/ahu_mobile.png', full_page=True)

        print('\n  console/page errors: %d %s' % (len(errors), errors[:3]))
        if errors:
            fail += 1
        browser.close()

    print('\nRESULT: %d ok / %d fail' % (ok, fail))
    return 1 if fail else 0


if __name__ == '__main__':
    sys.exit(main())
