"""Verification of page 8 — FCU, Fan and SAC — against the workbook sheets.

FCU (sheet 'FCU', F4:R19 and B9:B15): model 4 → 400 cfm = 188.8 L/s, sensible 1.7004, total 2.312,
      heating 4.6294, CHW = total/(4.2·5), HWS = heating/(4.2·10), 983×543×248, duct 600x150 / 600x300;
      the system selector switches the '*3-row cooling coil' note.
Fan (sheet 'Fan', B11:R16): reference brand and speed, external-static matrix 300/600/800/1000 Pa with
      model / Ø × length / weight / motor per row.
SAC (sheet 'SAC', B7:R33): capacity conversions and the single-split record fields.

Usage: python tools/verify_page8.py
"""
import re
import sys

from playwright.sync_api import sync_playwright

BASE = 'http://localhost:8080/index.html#m/'


def num(text):
    m = re.search(r'-?\d[\d,]*(?:\.\d+)?', text or '')
    return float(m.group(0).replace(',', '')) if m else float('nan')


def main():
    ok = fail = 0

    def check(name, got, want, tol=None):
        nonlocal ok, fail
        good = (abs(got - want) <= tol) if tol is not None else got == want
        ok, fail = (ok + 1, fail) if good else (ok, fail + 1)
        print('  %-52s got %-22s want %-22s %s' % (name, str(got)[:22], str(want)[:22], 'OK' if good else 'FAIL'))

    with sync_playwright() as pw:
        browser = pw.chromium.launch()
        page = browser.new_page(viewport={'width': 1280, 'height': 1000})
        errors = []
        page.on('pageerror', lambda e: errors.append(str(e)))
        page.on('console', lambda m: errors.append(m.text) if m.type == 'error' else None)

        # ---------- FCU ----------
        page.goto(BASE + 'fcu', wait_until='networkidle')
        page.wait_for_selector('#fcuSel', timeout=15000)
        page.wait_for_timeout(200)

        def tiles():
            return page.evaluate("""() => [...document.querySelectorAll('#moduleBody .res')]
                .map(e => [e.querySelector('.lbl').textContent.trim(), e.querySelector('.val').textContent.trim()])""")

        def pick(sub, nth=0):
            hits = [v for k, v in tiles() if sub in k]
            return hits[nth] if len(hits) > nth else '(missing)'

        page.select_option('#fcum-m', '4')
        page.wait_for_timeout(200)
        check('FCU model 4 air flow 400 CFM', num(pick('風量', 0)), 400, 1e-6)
        check('FCU model 4 air flow 188.8 L/s (cfm × 0.472)', num(pick('風量', 1)), 188.8, 0.05)
        check('FCU sensible 1.70 kW (Excel I6)', num(pick('顯熱盤管')), 1.7004, 5e-3)
        check('FCU total 2.312 kW (Excel J6)', num(pick('全熱盤管')), 2.312, 5e-3)
        check('FCU heating 4.629 kW (Excel K6)', num(pick('加熱盤管')), 4.6294, 5e-3)
        check('FCU CHW flow = J/(4.2×5) = 0.1101 (Excel L6)', num(pick('冷水量')), 0.1101, 5e-4)
        check('FCU dimensions 983 × 543 × 248 (Excel N6:P6)', pick('尺寸').startswith('983 × 543 × 248'), True)
        check('FCU ducts 600x150 / 600x300 (Excel Q6:R6)', pick('風管'), '600x150 / 600x300')
        check('FCU fan static default 50 Pa (Excel C13)', num(pick('風機靜壓')), 50, 1e-6)
        check('2-pipe note shown', page.locator('text=3 排冷卻盤管').count() >= 1, True)
        page.click('#moduleBody .seg button:has-text("4 管")')
        page.wait_for_timeout(250)
        check('4-pipe note mentions the heating coil', page.locator('text=1 排加熱盤管').count() >= 1, True)
        check('HWS flow = K/(4.2×10) = 0.1102 (Excel M6)', num(pick('熱水量')), 0.1102, 5e-4)
        page.click('#moduleBody .seg button:has-text("2 管")')
        page.wait_for_timeout(200)

        # ---------- Fan ----------
        page.goto(BASE + 'fan', wait_until='networkidle')
        page.wait_for_selector('#moduleBody .card', timeout=15000)
        page.wait_for_timeout(300)
        fan = page.evaluate("""() => {
          const cards = [...document.querySelectorAll('#moduleBody .card')];
          const c = cards[0];
          const segs = [...c.querySelectorAll('.seg')].map(s => [...s.querySelectorAll('button')].map(b => b.textContent.trim()));
          // Tables built with DOM APIs keep their rows directly under <table>: the implicit tbody only
          // appears when the browser parses HTML, so match any <tr> here.
          const rows = [...document.querySelectorAll('#moduleBody .pipes-table tr')].length;
          const tiles = [...c.querySelectorAll('.res')].map(e => e.querySelector('.val').textContent.trim());
          return { segs, rows, tiles };
        }""")
        check('Fan brand selector (Kruger/National/Östberg)', len(fan['segs'][0] if fan['segs'] else []), 3)
        check('Fan speed selector (≤1450 / ≤2900)', len(fan['segs'][1] if len(fan['segs']) > 1 else []), 2)
        check('Fan static selector (300/600/800/1000 Pa)', len(fan['segs'][2] if len(fan['segs']) > 2 else []), 4)
        check('Fan catalogue rows render', fan['rows'] > 0, True)
        check('Fan selection tiles render', len(fan['tiles']) >= 3, True)

        # ---------- SAC ----------
        page.goto(BASE + 'sac', wait_until='networkidle')
        page.wait_for_selector('#spec-spl', timeout=15000)
        page.wait_for_timeout(200)
        check('SAC 12 kW → 3.41 RT (÷3.516)', num(pick('RT')), 12 / 3.516, 0.02)
        check('SAC 12 kW → 4.62 匹 (÷2.6)', num(pick('匹')), 12 / 2.6, 0.02)
        check('SAC 12 kW → 40,944 Btu/h', num(pick('Btu/h')), 12 * 3412, 5)
        check('SAC 12 kW → 10,320 kcal/h', num(pick('kcal/h')), 12 * 860, 5)
        check('SAC spec record row = 5 kW rated', num(pick('額定冷量')), 5.0, 1e-6)
        check('SAC spec 5 kW → 1.42 RT', num(pick('RT', 1)), 5 / 3.516, 0.02)
        check('SAC spec ratio 27/24 °C = 1.000', num(pick('冷量比')), 1.0, 1e-6)
        page.select_option('#pref-model', 'MSZ-GE71VA / MUZ-GE71VA')
        page.wait_for_timeout(250)
        check('prefill sets the indoor model', page.input_value('#spec-inModel'), 'MSZ-GE71VA')
        check('prefill sets the outdoor model', page.input_value('#spec-outModel'), 'MUZ-GE71VA')
        check('prefill sets 7.1 kW', num(pick('額定冷量')), 7.1, 1e-6)

        print('\n  console/page errors: %d %s' % (len(errors), errors[:3]))
        if errors:
            fail += 1
        browser.close()

    print('\nRESULT: %d ok / %d fail' % (ok, fail))
    return 1 if fail else 0


if __name__ == '__main__':
    sys.exit(main())
