"""Verification of the rebuilt Pipe Sizing page against the workbook's cached values.

Workbook reference ('Pipe Sizing' sheet, cached values):
  Design case 4080 kW, CHW 10/18 (ΔT 8)  -> 121.8638 L/s -> DN250 -> 2.3166 m/s, 163 Pa/m  (E21/E23/E25/E26)
  Hot water 4080 kW, 60/50 (ΔT 10)       -> 97.4910 L/s                                    (E27)
  Pipe table flowrate column = capacity at the binding limit (I7:N30)
  Condensate drain DN100 -> 1512 kW (X13/Y13); condensate pipe DN100 -> 28200 kg/hr (CA20/CB20)

Also exercises what the rebuild adds: the '(Overridding)' pipe-size cell, the ► markers, and the
company-standard temperatures (CHW 7/12.5) that the presets supply.

Reads are scoped to a card or to one of the two side-by-side columns, because the page reuses the
same tile labels in several blocks.
"""
import re
import sys

from playwright.sync_api import sync_playwright

URL = 'http://localhost:8080/#m/pipes'
KEY = 'hvac-toolbox-presets-v1'


def num(text):
    m = re.search(r'-?\d[\d,]*(?:\.\d+)?', text or '')
    return float(m.group(0).replace(',', '')) if m else float('nan')


def main():
    ok = fail = 0

    def check(name, got, want, tol=None):
        nonlocal ok, fail
        good = (abs(got - want) <= tol) if tol is not None else got == want
        ok, fail = (ok + 1, fail) if good else (ok, fail + 1)
        print('  %-48s got %-22s want %-22s %s' % (name, str(got)[:22], str(want)[:22], 'OK' if good else 'FAIL'))

    with sync_playwright() as pw:
        browser = pw.chromium.launch()
        page = browser.new_page(viewport={'width': 1440, 'height': 1000})
        errors = []
        page.on('pageerror', lambda e: errors.append(str(e)))
        page.on('console', lambda m: errors.append(m.text) if m.type == 'error' else None)
        page.goto(URL, wait_until='networkidle')
        page.wait_for_selector('.pipes-table', timeout=15000)

        def card_tiles(needle, box='#moduleBody'):
            """Tiles of the first card whose heading contains `needle`."""
            return page.evaluate("""([needle, box]) => {
              const cards = [...document.querySelectorAll(box + ' .card')];
              const c = cards.find(x => (x.querySelector('h3')?.textContent || '').includes(needle));
              if (!c) return [];
              return [...c.querySelectorAll('.res')].map(e => [e.querySelector('.lbl').textContent.trim(),
                                                              e.querySelector('.val').textContent.trim()]);
            }""", [needle, box])

        def col_tiles(i):
            return page.evaluate("""(i) => {
              const c = [...document.querySelectorAll('.panel-col')][i];
              if (!c) return [];
              return [...c.querySelectorAll('.res')].map(e => [e.querySelector('.lbl').textContent.trim(),
                                                              e.querySelector('.val').textContent.trim()]);
            }""", i)

        def pick(tiles, sub, nth=0):
            hits = [v for k, v in tiles if sub in k]
            return hits[nth] if len(hits) > nth else '(missing)'

        crit = card_tiles('設計條件')
        check('CHW ΔT from company preset (7/12.5)', num(pick(crit, '冷媒水 溫差')), 5.5, 1e-6)
        check('HWS ΔT from company preset (60/50)', num(pick(crit, '熱媒水 溫差')), 10.0, 1e-6)
        check('CHW flow at 4080 kW / ΔT 5.5', num(pick(crit, '冷媒水 流量')), 4080 / (4.186789 * 5.5), 0.05)

        sizing = card_tiles('容量選管徑')
        check('capacity echoed (kW)', num(pick(sizing, '容量')), 4080, 1e-6)

        # --- reproduce the workbook's design case: chilled pair 10/18 (ΔT 8) ---
        for field, value in (('#crit-chws', '10'), ('#crit-chwr', '18')):
            page.fill(field, value)
            page.dispatch_event(field, 'input')
            page.wait_for_timeout(200)
        chw = col_tiles(0)
        check('4080 kW, ΔT 8 -> flow (Excel E21)', num(pick(chw, '流量')), 121.864, 0.06)
        check('auto pipe size DN250 (Excel E23)', pick(chw, '管徑', 0), 'DN250')
        check('velocity (Excel E25)', num(pick(chw, '流速')), 2.3166, 3e-3)
        check('pressure drop (Excel E26)', num(pick(chw, '比摩阻')), 163, 1.0)

        hws = col_tiles(1)
        check('hot water flow, ΔT 10 (Excel E27)', num(pick(hws, '流量')), 4080 / (4.185 * 10), 0.06)

        # --- override cell: force DN150 and confirm the consequences are reported ---
        page.select_option('#ovr-chw', '150')
        page.wait_for_timeout(250)
        chw = col_tiles(0)
        check('override forces DN150', pick(chw, '管徑', 0).startswith('DN150'), True)
        check('override velocity recomputed (>2.5)', num(pick(chw, '流速')) > 2.5, True)
        flags = page.eval_on_selector_all('#moduleBody .flag', 'els => els.map(e => e.innerText.trim())')
        check('override flags the limit breach', any('超出限值' in f for f in flags), True)
        page.select_option('#ovr-chw', '0')
        page.wait_for_timeout(200)
        check('back to auto -> DN250 again', pick(col_tiles(0), '管徑', 0), 'DN250')

        # --- ► markers and the pipe table against the workbook's flowrate column ---
        marker_info = page.evaluate("""() => {
          const t = document.querySelector('.pipe-full');
          return {
            markCells: t.querySelectorAll('td.mark').length,
            arrows: (t.textContent.match(/►/g) || []).length,
            sel: t.querySelectorAll('tbody tr.sel').length,
            selDn: [...t.querySelectorAll('tbody tr.sel')].map(r => r.children[0].textContent.trim()),
          };
        }""")
        print('  markers: %s' % marker_info)
        check('marker cells for both systems (24 rows x 2)', marker_info['markCells'], 48)
        check('chosen sizes show ► (2 markers + 2 header cells)', marker_info['arrows'], 4)
        # The workbook's own design case selects DN250 for chilled water (E23) and for hot water (E29),
        # so both ► land on the same row.
        check('both systems select DN250 (Excel E23/E29)', marker_info['selDn'], ['250'])

        tbl = page.eval_on_selector_all('.pipe-full tbody tr',
                                        "rows => rows.map(r => [...r.querySelectorAll('td')].map(td => td.textContent.trim()))")

        def row_for(dn):
            return next((r for r in tbl if r and r[0] == str(dn)), [])

        r15, r100, r250, r800 = row_for(15), row_for(100), row_for(250), row_for(800)
        check('DN15 governing flow (Excel M7)', num(r15[6] if r15 else ''), 0.1354, 2e-3)
        check('DN15 governed by ΔP', 'ΔP' in (r15[6] if r15 else ''), True)
        check('DN100 governing flow (Excel M15)', num(r100[6] if r100 else ''), 18.510, 2e-3)
        check('DN250 governing flow (Excel M19)', num(r250[6] if r250 else ''), 131.510, 5e-3)
        check('DN250 governed by velocity', 'v' in (r250[6] if r250 else ''), True)
        check('DN800 governing flow (Excel M30)', num(r800[6] if r800 else ''), 1234.742, 0.05)
        check('pipe table covers DN15…DN800 (24 rows)', len(tbl), 24)

        # --- folded blocks: open them, then condensate drain and steam schedules ---
        page.eval_on_selector_all('details.folded', 'els => els.forEach(d => { d.open = true; })')
        page.wait_for_timeout(200)
        page.fill('#cond-kw', '1512')
        page.dispatch_event('#cond-kw', 'input')
        page.wait_for_timeout(250)
        cond = card_tiles('冷凝水管')
        check('condensate DN100 at 1512 kW (Excel X13)', pick(cond, '管徑'), 'DN100mm')
        page.fill('#cond-kw', '2600')
        page.dispatch_event('#cond-kw', 'input')
        page.wait_for_timeout(200)
        # DN125 tops out at 2462 kW, so 2600 kW needs DN150
        check('condensate DN150 above 2462 kW', pick(card_tiles('冷凝水管'), '管徑'), 'DN150mm')

        page.fill('#st-cond', '28200')
        page.dispatch_event('#st-cond', 'input')
        page.wait_for_timeout(250)
        steam = card_tiles('蒸汽／冷凝水／集管')
        check('condensate pipe DN100 at 28200 kg/hr (Excel CB20)', pick(steam, '冷凝水管'), 'DN100mm')
        check('header size computed at 10 m/s', 'Ø' in pick(steam, '集管尺寸'), True)

        page.evaluate("k => localStorage.removeItem(k)", KEY)
        page.reload(wait_until='networkidle')
        page.wait_for_selector('.pipes-table', timeout=15000)
        page.screenshot(path='docs/verification/pipes_desktop.png', full_page=True)
        page.set_viewport_size({'width': 390, 'height': 844})
        page.wait_for_timeout(300)
        page.screenshot(path='docs/verification/pipes_mobile.png', full_page=True)

        print('\n  console/page errors: %d %s' % (len(errors), errors[:3]))
        if errors:
            fail += 1
        browser.close()

    print('\nRESULT: %d ok / %d fail' % (ok, fail))
    return 1 if fail else 0


if __name__ == '__main__':
    sys.exit(main())
