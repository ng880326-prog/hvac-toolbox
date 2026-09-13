"""Verification of the motor page against the workbook 'Motor' sheet.

Workbook reference:
  X6:AC26  rating schedule — 3 kW → 5.3624 A 3Ø DOL 32.1743 A MCB 20; 5.5 kW → 9.8310 A Υ/Δ 24.5776 A MCB 20
  AE4:AE23 isolator list 16 … 3150 A
  AG21     fan power 1 m³/s × 1000 Pa / 0.7 / 0.7 × 1.2 = 2.44898 kW
  AL       pump power = V̇ · H · 9.8 / η · SF
  N9/N13/N15  300 Pa/m, terminal coil 30000 Pa, evaporator/HX coil 80000 Pa
  AW9      ER = 0.002342 · H / (Δt · η)

Usage: python tools/verify_motor.py
"""
import math
import re
import sys

from playwright.sync_api import sync_playwright

URL = 'http://localhost:8080/#m/motor'


def num(text):
    m = re.search(r'-?\d[\d,]*(?:\.\d+)?', text or '')
    return float(m.group(0).replace(',', '')) if m else float('nan')


def main():
    ok = fail = 0

    def check(name, got, want, tol=None):
        nonlocal ok, fail
        good = (abs(got - want) <= tol) if tol is not None else got == want
        ok, fail = (ok + 1, fail) if good else (ok, fail + 1)
        print('  %-56s got %-20s want %-20s %s' % (name, str(got)[:20], str(want)[:20], 'OK' if good else 'FAIL'))

    with sync_playwright() as pw:
        browser = pw.chromium.launch()
        page = browser.new_page(viewport={'width': 1280, 'height': 1000})
        errors = []
        page.on('pageerror', lambda e: errors.append(str(e)))
        page.on('console', lambda m: errors.append(m.text) if m.type == 'error' else None)
        page.goto(URL, wait_until='networkidle')
        page.wait_for_selector('#mr-kW', timeout=15000)
        page.wait_for_timeout(200)

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

        # --- rating schedule: 3 kW ---
        page.fill('#mr-kW', '3')
        page.dispatch_event('#mr-kW', 'input')
        page.wait_for_timeout(250)
        check('3 kW rating (Excel X14)', num(cpick('馬達選型表', '功率')), 3, 1e-6)
        check('3 kW running current 5.3624 A (Y14)', num(cpick('馬達選型表', '運行電流')), 5.3624, 6e-3)
        check('3 kW recomputed at pf 0.85 matches', num(cpick('馬達選型表', 'pf 0.85')), 5.3624, 5e-3)
        check('3 kW phase 3Ø', cpick('馬達選型表', '相數'), '3Ø')
        check('3 kW starting method DOL (AA14)', cpick('馬達選型表', '起動方式'), 'DOL')
        check('3 kW starting current 32.174 A (AB14)', num(cpick('馬達選型表', '起動電流')), 32.1743, 5e-3)
        check('3 kW MCB 20 A (AC14)', num(cpick('馬達選型表', 'MCB')), 20, 1e-6)
        check('3 kW isolator 250 A (AE14)', num(cpick('馬達選型表', '隔離開關')), 250, 1e-6)

        # --- 5.5 kW row ---
        page.fill('#mr-kW', '5.5')
        page.dispatch_event('#mr-kW', 'input')
        page.wait_for_timeout(250)
        check('5.5 kW running current 9.8310 A (Y17)', num(cpick('馬達選型表', '運行電流')), 9.8310, 6e-3)
        check('5.5 kW starting Υ/Δ (AA17)', cpick('馬達選型表', '起動方式'), 'Υ/Δ')
        check('5.5 kW starting current 24.578 A (AB17)', num(cpick('馬達選型表', '起動電流')), 24.5776, 5e-3)
        check('5.5 kW isolator 630 A (AE17)', num(cpick('馬達選型表', '隔離開關')), 630, 1e-6)

        # --- fan / pump motor power ---
        page.fill('#sz-fanV', '1')
        page.dispatch_event('#sz-fanV', 'input')
        page.fill('#sz-fanPd', '1000')
        page.dispatch_event('#sz-fanPd', 'input')
        page.wait_for_timeout(250)
        check('fan power 2.44898 kW (Excel AG21)', num(cpick('風機／水泵馬達功率', '風機功率')), 2.44898, 5e-4)
        check('fan current at pf 0.85', num(cpick('風機／水泵馬達功率', '風機運行電流')), 2.44898 * 1000 / (math.sqrt(3) * 380 * 0.85), 0.02)
        check('pump power 5.5125 kW (0.01·30·9.8/0.8·1.5)', num(cpick('風機／水泵馬達功率', '水泵功率')), 5.5125, 1e-3)
        check('pressure 100 kPa → 1 bar', num(cpick('風機／水泵馬達功率', 'bar')), 1, 1e-6)
        check('pressure 100 kPa → 0.1 MPa', num(cpick('風機／水泵馬達功率', 'MPa')), 0.1, 1e-6)

        # --- static / pump head ---
        check('friction 40 m × 300 Pa/m = 12000 Pa', num(cpick('靜壓與水泵揚程', '摩擦損失')), 12000, 1e-6)
        check('external static (400+12000)×1.2 = 14880 Pa', num(cpick('靜壓與水泵揚程', '外部靜壓損失')), 14880, 1e-6)
        check('total static loss = 14880 Pa', num(cpick('靜壓與水泵揚程', '總靜壓損失', 0)), 14880, 1e-6)
        check('pump loss = 14400+30000+80000 = 124400 Pa', num(cpick('靜壓與水泵揚程', '水泵總壓損失')), 124400, 1e-6)
        check('pump head closed loop = 12.68 m', num(cpick('靜壓與水泵揚程', '閉式')), 124400 / 9810, 0.02)

        # --- ER ---
        check('ER = 0.002342·30/(10·0.7) = 0.010037', num(cpick('輸送能效比', 'ER')), 0.010037, 1e-5)
        check('ER above the default limit is flagged', page.locator('#moduleBody .flag').count() >= 1, True)

        print('\n  console/page errors: %d %s' % (len(errors), errors[:3]))
        if errors:
            fail += 1
        browser.close()

    print('\nRESULT: %d ok / %d fail' % (ok, fail))
    return 1 if fail else 0


if __name__ == '__main__':
    sys.exit(main())
