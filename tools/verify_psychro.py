"""Cell-by-cell verification of the rebuilt Psychrometric page against the workbook's cached values.

Workbook reference ('Psychrometric Chart' sheet, cached values):
  Air 1  DB 24.6 / WB 19.2  -> Tdp 16.49738 (grid-interpolated in Excel), RH 60.566 %, v 0.859561,
                               rho(row) 1.163385 = 1/v, W 0.0117213, h 54.5832
  Air 2  DB 10   / WB 9.6   -> Tdp 9.30359, RH 40 % echoed by the sheet (the pair is really ~95.2 %),
                               v 0.811661, rho(row) 1.232041 = 1/v, W 0.00726245, h 28.3545
Also checks the two behaviours this page adds: the conflict warning for Air 2's impossible RH, and
altitude driving the atmospheric pressure.
"""
import re
import sys

from playwright.sync_api import sync_playwright

URL = 'http://localhost:8080/#m/psychro'


def main():
    ok = fail = 0

    def check(name, got, want, tol=0.0):
        nonlocal ok, fail
        good = (abs(got - want) <= tol) if isinstance(want, (int, float)) and isinstance(got, (int, float)) else got == want
        ok, fail = (ok + 1, fail) if good else (ok, fail + 1)
        print('  %-44s got %-22s want %-22s %s' % (name, str(got)[:22], str(want)[:22], 'OK' if good else 'FAIL'))

    with sync_playwright() as pw:
        browser = pw.chromium.launch()
        page = browser.new_page(viewport={'width': 1440, 'height': 1000})
        errors = []
        page.on('pageerror', lambda e: errors.append(str(e)))
        page.on('console', lambda m: errors.append(m.text) if m.type == 'error' else None)
        page.goto(URL, wait_until='networkidle')
        page.wait_for_selector('.psy-air', timeout=15000)

        def table():
            """rows -> {label: [air1, air2]} as text"""
            return page.evaluate("""() => {
              const out = {};
              for (const tr of document.querySelectorAll('.psy-air tbody tr, .psy-air tr')) {
                const th = tr.querySelector('th');
                if (!th) continue;
                const label = th.textContent.trim();
                const tds = [...tr.querySelectorAll('td')];
                if (!tds.length) continue;
                out[label] = tds.map(td => {
                  const i = td.querySelector('input');
                  return i ? i.value : td.textContent.trim();
                });
              }
              return out;
            }""")

        def row(*label_parts):
            """First table row whose label contains any of the given (bilingual) fragments."""
            tbl = table()
            for part in label_parts:
                for k, v in tbl.items():
                    if part in k:
                        return v
            return ['(missing)', '(missing)']

        t = table()
        print('table rows: %d' % len(t))

        def num(x):
            m = re.search(r'-?\d[\d,]*(?:\.\d+)?', x or '')
            return float(m.group(0).replace(',', '')) if m else float('nan')

        for col, idx in (('Air 1', 0), ('Air 2', 1)):
            pass
        # Labels render in the app's language (Chinese by default), so each row is looked up by both
        # its Chinese and English wording.
        LABELS = {
            'Dry Bulb': ('乾球溫度', 'Dry Bulb'),
            'Wet Bulb': ('濕球溫度', 'Wet Bulb'),
            'Dew Point': ('露點溫度', 'Dew Point'),
            'Relative Humidity': ('相對濕度', 'Relative Humidity'),
            'Specific Volume': ('比容', 'Specific Volume'),
            'Air Density': ('空氣密度', 'Air Density'),
            'Moisture Content': ('含濕量', 'Moisture Content'),
            'Specific Enthalpy': ('比焓', 'Specific Enthalpy'),
        }
        ref = {
            'Air 1': {'Dry Bulb': 24.6, 'Wet Bulb': 19.2, 'Dew Point': 16.4974, 'Relative Humidity': 60.566,
                      'Specific Volume': 0.859561, 'Moisture Content': 0.011721, 'Specific Enthalpy': 54.583},
            'Air 2': {'Dry Bulb': 10.0, 'Wet Bulb': 9.6, 'Dew Point': 9.30359, 'Relative Humidity': 95.23,
                      'Specific Volume': 0.811661, 'Moisture Content': 0.0072624, 'Specific Enthalpy': 28.3545},
        }
        # Tolerances match the displayed precision of each row (the engine's exact values are already
        # locked by the vector suite); dew point and RH get extra slack because Excel interpolated its
        # dew point on a 0.05 °C grid.
        DISPLAY_TOL = {
            'Dry Bulb': 0.006, 'Wet Bulb': 0.006, 'Dew Point': 0.06,
            'Relative Humidity': 0.06, 'Specific Volume': 6e-5, 'Air Density': 6e-4,
            'Moisture Content': 6e-6, 'Specific Enthalpy': 0.006,
        }
        for col, idx in (('Air 1', 0), ('Air 2', 1)):
            print('  --- %s ---' % col)
            for key, want in ref[col].items():
                got = num(row(*LABELS[key])[idx])
                check('%s %s' % (col, key), got, want, DISPLAY_TOL[key])

        # density: the page reports moist-air density, the workbook prints 1/v
        rho1 = num(row(*LABELS['Air Density'])[0])
        check('Air 1 density (moist (1+W)/v)', rho1, 1.1770, 2e-3)
        v1 = num(row(*LABELS['Specific Volume'])[0])
        check('Air 1 workbook parity 1/v', 1 / v1, 1.163385, 2e-4)

        # conflict warning for the workbook's impossible Air 2 RH entry
        flags = page.eval_on_selector_all('#moduleBody .flag', 'els => els.map(e => e.innerText.trim())')
        print('flags: %s' % flags)
        joined = ' | '.join(flags)
        check('Air 2 conflict flagged', ('Air 2' in joined and '矛盾' in joined), True)
        check('conflict names both values', ('40' in joined and '95' in joined), True)

        # the input cells keep what the user typed (workbook behaviour, kept for comparability)
        check('Air 2 RH input preserved', page.eval_on_selector_all('.psy-air input', 'els => els.map(e => e.value)')[7], '40')

        # chart with two points
        pts = page.eval_on_selector_all('.chart-box svg circle', 'els => els.length')
        check('chart plots two states', pts >= 2, True)

        # altitude drives pressure (ISA) — the workbook's altitude cell does nothing
        alt = page.query_selector('#f-alt')
        alt.fill('1000')
        alt.dispatch_event('input')
        page.wait_for_timeout(250)
        check('altitude 1000 m -> pressure', page.input_value('#f-p'), '89.875')

        page.reload(wait_until='networkidle')
        page.wait_for_selector('.psy-air', timeout=15000)
        page.screenshot(path='docs/verification/psychro_desktop.png', full_page=True)
        page.set_viewport_size({'width': 390, 'height': 844})
        page.wait_for_timeout(300)
        page.screenshot(path='docs/verification/psychro_mobile.png', full_page=True)
        card = page.query_selector('.psy-air')
        if card:
            card.screenshot(path='docs/verification/psychro_mobile_table.png')

        print('\n  console/page errors: %d %s' % (len(errors), errors[:3]))
        if errors:
            fail += 1
        browser.close()

    print('\nRESULT: %d ok / %d fail' % (ok, fail))
    return 1 if fail else 0


if __name__ == '__main__':
    sys.exit(main())
