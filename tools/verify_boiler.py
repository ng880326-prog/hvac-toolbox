"""Verification of the rebuilt Boiler page against the workbook's technical tables.

Workbook reference ('Boiler' sheet, cached values in the technical tables):
  steam  AD32:AR37   1 / 1.5 / 2 / 3 / 4 / 6 Ton/hr with chimney, diesel, gas, safety valve, bleed off,
                     water in, steam out, power, weight and L/W/H
  hot    AD43:AR51   0.6977 … 3.4884 MW, same fields
  rules  N16 feed pump = ton/hr × 1.13 × 1.1 · N22 deaerator pump = 1.2–1.5 × feed pump
  S21    'Flow Rate per boiler = kW / 4.185 / ΔT'

Usage: python tools/verify_boiler.py
"""
import re
import sys

from playwright.sync_api import sync_playwright

URL = 'http://localhost:8080/#m/boiler'


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
        page = browser.new_page(viewport={'width': 1440, 'height': 1000})
        errors = []
        page.on('pageerror', lambda e: errors.append(str(e)))
        page.on('console', lambda m: errors.append(m.text) if m.type == 'error' else None)
        page.goto(URL, wait_until='networkidle')
        page.wait_for_selector('.boiler-table', timeout=15000)

        def tiles():
            return page.evaluate("""() => {
              const out = [];
              for (const c of document.querySelectorAll('#moduleBody .panel-col')) {
                out.push([...c.querySelectorAll('.res')].map(e => [e.querySelector('.lbl').textContent.trim(),
                                                                   e.querySelector('.val').textContent.trim()]));
              }
              return out;
            }""")

        def pick(col, sub, nth=0):
            hits = [v for k, v in tiles()[col] if sub in k]
            return hits[nth] if len(hits) > nth else '(missing)'

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

        # --- steam plant, workbook row 2 Ton/hr (AD34:AR34) ---
        page.fill('#sb-ton', '2')
        page.dispatch_event('#sb-ton', 'input')
        page.wait_for_timeout(250)
        check('steam chimney 400 mm (AD34)', num(pick(0, '煙囪')), 400, 1e-6)
        check('steam diesel each 150 kg/hr (AF34)', num(pick(0, '輕油 · 單機')), 150, 1e-6)
        check('steam gas each 180 Nm³/hr (AH34)', num(pick(0, '天然氣 · 單機')), 180, 1e-6)
        check('steam safety valve 80 (AI34)', num(pick(0, '安全閥')), 80, 1e-6)
        check('steam bleed off 40 (AJ34)', num(pick(0, '排污')), 40, 1e-6)
        check('steam water in 32 (AL34)', num(pick(0, '進水')), 32, 1e-6)
        check('steam out 100 (AM34: the 2 Ton/hr unit)', num(pick(0, '出汽')), 100, 1e-6)
        check('steam power 7.5 kW (AN34)', num(pick(0, '電功率 · 單機')), 7.5, 1e-6)
        check('steam weight 14771 kg (AO34)', num(pick(0, '單機重量')), 14771, 1e-6)
        check('steam dims 4076 × 2826 × 3096 (AP34:AR34)',
              pick(0, '長 × 闊 × 高').startswith('4076 × 2826 × 3096'), True)
        check('total plant 2 × 2 = 4 Ton/hr', num(pick(0, '全廠總容量')), 4, 1e-6)
        check('total diesel 300 kg/hr', num(pick(0, '輕油 · 全廠總容量')), 300, 1e-6)

        # --- hot water plant, workbook row 1.744 MW (AD47:AR47) ---
        check('hot chimney 400 mm (AE47)', num(pick(1, '煙囪')), 400, 1e-6)
        check('hot diesel each 150 kg/hr (AF47)', num(pick(1, '輕油 · 單機')), 150, 1e-6)
        check('hot gas each 188 Nm³/hr (AH47)', num(pick(1, '天然氣 · 單機')), 188, 1e-6)
        check('hot power 5.5 kW (AL47)', num(pick(1, '電功率 · 單機')), 5.5, 1e-6)
        check('hot safety valve 50 (AM47)', num(pick(1, '安全閥')), 50, 1e-6)
        check('hot water in 100 (AJ47)', num(pick(1, '進水')), 100, 1e-6)
        check('hot water out 100 (AK47)', num(pick(1, '出水')), 100, 1e-6)
        check('hot weight 10630 kg (AO47)', num(pick(1, '單機重量')), 10630, 1e-6)
        check('hot dims 5545 × 2000 × 2100', pick(1, '長 × 闊 × 高').startswith('5545 × 2000 × 2100'), True)
        check('ΔT = 90 − 70 = 20 °C', num(pick(1, '溫差 ΔT')), 20, 1e-6)
        check('pump flow = MW·1000/4.186789/ΔT (S21)', num(pick(1, '單機鍋爐泵流量')), 20.8296, 0.02)

        # --- auxiliaries (M5:P25) ---
        aux = card_tiles('輔助設備')
        check('feed pump for 2 × 2 Ton/hr = 4.972 m³/hr (N16)', num(aux[0][1]), 4.972, 5e-3)
        check('feed pump in L/s', num(aux[1][1]), 1.381, 5e-3)
        check('deaerator pump min 1.2 × feed', num(aux[2][1]), 4.972 * 1.2, 0.01)
        check('deaerator pump max 1.5 × feed', num(aux[3][1]), 4.972 * 1.5, 0.01)

        # --- combined chimney ---
        page.click('.preset-actions .btn:first-child')
        page.click('.preset-actions .btn:first-child')
        page.wait_for_timeout(200)
        comb = card_tiles('併合煙囪')
        check('two 400 mm stacks → √(400²+400²) = 566 mm', num(comb[2][1]), 565.685, 1.0)
        check('stack count', num(comb[0][1]), 2, 1e-6)

        # --- technical table contents ---
        rows = page.eval_on_selector_all('.boiler-table tbody tr',
                                         "rows => rows.map(r => [...r.querySelectorAll('td')].map(td => td.textContent.trim()))")
        check('steam table rows', len(rows), 6)
        check('steam table first row = 1 Ton/hr / 300 / 75 / 90', rows[0][:4], ['1', '300', '75', '90'])
        check('steam table last row = 6 Ton/hr / 600 / 420 / 500', rows[5][:4], ['6', '600', '420', '500'])
        page.click('.card .seg button:nth-child(2)')
        page.wait_for_timeout(250)
        rows = page.eval_on_selector_all('.boiler-table tbody tr',
                                         "rows => rows.map(r => [...r.querySelectorAll('td')].map(td => td.textContent.trim()))")
        check('hot-water table rows', len(rows), 9)
        check('hot-water first row = 0.698 MW / 350 / 58.9 / 74.2', rows[0][:4], ['0.698', '350', '58.9', '74.2'])
        check('hot-water last row = 3.488 MW / 550 / 298 / 375', rows[8][:4], ['3.488', '550', '298', '375'])

        # --- unit conversion (B8:F16) ---
        conv = card_tiles('單位換算')
        check('1 Ton/hr → 1000 kg/hr', num(conv[1][1]), 1000, 1e-6)
        check('1 Ton/hr → 627 kW', num(conv[2][1]), 627, 1e-6)
        check('1 Ton/hr → 627 kW → 539,484 kcal/h', num(conv[3][1]), 627 * 860.421, 200)

        page.screenshot(path='docs/verification/boiler_desktop.png', full_page=True)
        page.set_viewport_size({'width': 390, 'height': 844})
        page.wait_for_timeout(300)
        page.screenshot(path='docs/verification/boiler_mobile.png', full_page=True)

        print('\n  console/page errors: %d %s' % (len(errors), errors[:3]))
        if errors:
            fail += 1
        browser.close()

    print('\nRESULT: %d ok / %d fail' % (ok, fail))
    return 1 if fail else 0


if __name__ == '__main__':
    sys.exit(main())
