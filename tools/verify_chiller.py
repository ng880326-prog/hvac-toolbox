"""Verification of the rebuilt Chiller page against the workbook's cached values.

Workbook reference ('Chiller' sheet):
  Overall density rows: 2180 RT / 39500 m² = 194 W/m² (Y6), 2100 RT / 52763 m² = 139.98 (Y11),
                        1244 RT / 32969 m² = 132.70 (Y12)
  Design index table: 32 rows, e.g. 潔淨手術室 300~500 W/m² (L22/N22)
  Unit conversion: kW ↔ RT (3.516), HP, Btu/h, kcal/h (B8:F15)
  IPLV schedule: load 1/0.75/0.5/0.25 with weights 0.01/0.42/0.45/0.12 and condensing water
                 29.4/23.9/18.3/18.3 °C (AA14:AE17); COP = 3.516/(ikW/RT)
  Electrical heat: transformers 50/30/25/20/15 W/kVA (AG5:AG9)
"""
import re
import sys

from playwright.sync_api import sync_playwright

URL = 'http://localhost:8080/#m/chiller'


def num(text):
    m = re.search(r'-?\d[\d,]*(?:\.\d+)?', text or '')
    return float(m.group(0).replace(',', '')) if m else float('nan')


def main():
    ok = fail = 0

    def check(name, got, want, tol=None):
        nonlocal ok, fail
        good = (abs(got - want) <= tol) if tol is not None else got == want
        ok, fail = (ok + 1, fail) if good else (ok, fail + 1)
        print('  %-50s got %-22s want %-22s %s' % (name, str(got)[:22], str(want)[:22], 'OK' if good else 'FAIL'))

    with sync_playwright() as pw:
        browser = pw.chromium.launch()
        page = browser.new_page(viewport={'width': 1440, 'height': 1000})
        errors = []
        page.on('pageerror', lambda e: errors.append(str(e)))
        page.on('console', lambda m: errors.append(m.text) if m.type == 'error' else None)
        page.goto(URL, wait_until='networkidle')
        page.wait_for_selector('.ref-index', timeout=15000)

        def card_tiles(needle):
            return page.evaluate("""(needle) => {
              const cards = [...document.querySelectorAll('#moduleBody .card')];
              const c = cards.find(x => (x.querySelector('h3')?.textContent || '').includes(needle));
              if (!c) return [];
              return [...c.querySelectorAll('.res')].map(e => [e.querySelector('.lbl').textContent.trim(),
                                                              e.querySelector('.val').textContent.trim()]);
            }""", needle)

        def pick(tiles, sub, nth=0):
            hits = [v for k, v in tiles if sub in k]
            return hits[nth] if len(hits) > nth else '(missing)'

        # --- load density × area (workbook overall-density cross-check) ---
        dens = card_tiles('冷負荷密度')
        check('194 W/m² × 39500 m² → 7663 kW', num(pick(dens, '冷負荷', 0)), 7663.0, 0.5)
        check('... → 2178.6 RT', num(pick(dens, '冷負荷', 1)), 2178.6, 0.5)
        check('... → Btu/h with thousands separators', pick(dens, '冷負荷', 3), '26,147,229Btu/h')

        # --- design index table drives the density ---
        rows = page.eval_on_selector_all('.ref-index tbody tr',
                                         "rows => rows.map(r => [...r.querySelectorAll('td')].map(td => td.textContent.trim()))")
        check('index table has 32 rows (Chiller L5:N36)', len(rows), 32)
        check('潔淨手術室 range 300~500 (Chiller N22)',
              next((r[2] for r in rows if '潔淨手術室' in r[1]), None), '300~500')
        page.click('.ref-index tbody tr:nth-child(18) button')   # 潔淨手術室 is index 18 -> mid 400
        page.wait_for_timeout(200)
        check('row pick fills the density (mid 400)', page.input_value('#dens-density'), '400')

        page.fill('#dens-density', '194')
        page.dispatch_event('#dens-density', 'input')
        page.wait_for_timeout(150)

        # --- unit conversion card ---
        page.fill('#cv-capKw', '1000')
        page.dispatch_event('#cv-capKw', 'input')
        page.wait_for_timeout(200)
        cv = card_tiles('單位換算')
        check('1000 kW → 284.35 RT', num(pick(cv, '冷量', 1)), 284.35, 0.05)
        check('1000 kW → 1341.0 HP', num(pick(cv, '冷量', 2)), 1341.0, 0.5)
        check('1000 kW → 3412140 Btu/h', num(pick(cv, '冷量', 3)), 3412140, 100)
        check('1000 kW → 860421 kcal/h', num(pick(cv, '冷量', 4)), 860421, 100)

        # --- efficiency + IPLV ---
        eff = card_tiles('效率與 IPLV')
        check('COP 1000/210 = 4.76', num(pick(eff, 'COP', 0)), 4.76, 0.01)
        check('IPLV with defaults 0.55/0.60/0.65/0.70 → 0.634', num(pick(eff, 'IPLV')), 0.634, 1e-3)
        check('IPLV COP = 3.516/0.634 = 5.55', num(pick(eff, 'IPLV COP')), 5.546, 0.01)
        pts = page.eval_on_selector_all('.eff-points tbody tr',
                                        "rows => rows.map(r => [...r.querySelectorAll('td')].map(td => td.textContent.trim()))")
        check('IPLV table lists 4 load points', len(pts), 4)
        check('weights 0.01/0.42/0.45/0.12 (Chiller AB14:AB17)', [p[1] for p in pts], ['0.01', '0.42', '0.45', '0.12'])
        check('condensing water 29.4/23.9/18.3/18.3 °C (Chiller AE14:AE17)',
              [p[2].replace(' °C', '') for p in pts], ['29.4', '23.9', '18.3', '18.3'])

        # --- plant references: computed overall density must match the workbook ---
        plants = page.eval_on_selector_all('.plants tbody tr',
                                           "rows => rows.map(r => [...r.querySelectorAll('td')].map(td => td.textContent.trim()))")
        check('eight reference rows (Chiller P6:Y13)', len(plants), 8)
        check('project names anonymised', [p[0] for p in plants], list('ABCDEFGH'))
        def computed(pid):
            for p in plants:
                if p[0] == pid:
                    return num(p[10])
            return float('nan')
        check('A computed density (workbook 194)', computed('A'), 194.1, 0.1)
        check('F computed density (workbook 139.98)', computed('F'), 139.98, 0.05)
        check('G computed density (workbook 132.70)', computed('G'), 132.70, 0.05)
        flags = page.eval_on_selector_all('#moduleBody .flag', 'els => els.map(e => e.innerText.trim())')
        check('no workbook-value mismatch flagged', [f for f in flags if '不符' in f], [])

        # --- electrical heat dissipation reference (workbook AG) ---
        page.eval_on_selector_all('details.folded', 'els => els.forEach(d => { d.open = true; })')
        page.wait_for_timeout(200)
        elec = card_tiles('電氣設備發熱量')
        texts = page.evaluate("""() => {
          const cards = [...document.querySelectorAll('#moduleBody .card')];
          const c = cards.find(x => (x.querySelector('h3')?.textContent || '').includes('電氣設備發熱量'));
          return c ? c.innerText : '';
        }""")
        check('transformer rule 50 W/kVA present', '50 W/kVA' in texts, True)
        check('transformer rule 15 W/kVA present', '15 W/kVA' in texts, True)
        check('VFD 2–6 % of kVA note present', '2–6' in texts, True)
        void = elec

        page.screenshot(path='docs/verification/chiller_desktop.png', full_page=True)
        page.set_viewport_size({'width': 390, 'height': 844})
        page.wait_for_timeout(300)
        page.screenshot(path='docs/verification/chiller_mobile.png', full_page=True)

        print('\n  console/page errors: %d %s' % (len(errors), errors[:3]))
        if errors:
            fail += 1
        browser.close()

    print('\nRESULT: %d ok / %d fail' % (ok, fail))
    return 1 if fail else 0


if __name__ == '__main__':
    sys.exit(main())
