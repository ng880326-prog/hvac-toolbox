"""Verification of the heat-exchanger page against the workbook '24_Hx' sheet.

Workbook reference:
  C5/D5    duty + unit selector (kW | RT);  C6 =IF(D5=M6,C5*3.516,C5/3.516);  M7 =IF(D5=M5,C5,C6)
  C13/C17  side ΔT =IF(C11*C12*C5>0,ABS(C11-C12),"-")
  O6/O7/O8 LMTD terminals =ABS(C16-C11), =ABS(C15-C12); LMTD = (O6-O7)/LN(O6/O7) (mean when equal)
  P32/Q32  water flow kg/s = M7/4.185/ΔT ;  P33/Q33 = ×3.6 m³/h
  C23      U = 5000 W/m²·K (plate HX, workbook label row)
  C27      area = M7/C23/O8*1000   (the sheet labels it "A = U∆T / Q", which is inverted)

Usage: python tools/verify_hx.py
"""
import math
import re

from playwright.sync_api import sync_playwright

URL = 'http://localhost:8080/#m/hx'


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
        page.wait_for_selector('#hx-q', timeout=15000)
        page.wait_for_timeout(300)

        def tiles():
            return page.evaluate("""() => {
              const c = [...document.querySelectorAll('#moduleBody .card')][0];
              return {
                tiles: [...c.querySelectorAll('.res')].map(e => [e.querySelector('.lbl').textContent.trim(),
                                                                 e.querySelector('.val').textContent.trim()]),
                flags: [...c.querySelectorAll('.flag')].map(e => e.textContent.trim()),
                svg: !!c.querySelector('.hx-sch svg'),
                arms: c.querySelectorAll('.hx-sch svg path').length,
              };
            }""")

        def tile(sub, nth=0):
            hits = [v for k, v in tiles()['tiles'] if sub in k]
            return hits[nth] if len(hits) > nth else '(missing)'

        def setv(sel, v):
            page.fill(sel, str(v))
            page.dispatch_event(sel, 'input')
            page.wait_for_timeout(160)

        # ---- default: 100 kW, hot 12.5 → 7, cold 4 → 9, U 5000 (a chiller evaporator duty) ----
        dt1, dt2 = 12.5 - 9, 7 - 4
        L = (dt1 - dt2) / math.log(dt1 / dt2)
        A = 100 * 1000 / (5000 * L)
        check('ΔT1 (hot-in end, workbook O6)', num(tile('ΔT1')), round(dt1, 2), 0.01)
        check('ΔT2 (hot-out end, workbook O7)', num(tile('ΔT2')), round(dt2, 2), 0.01)
        check('LMTD (workbook O8)', num(tile('均溫差')), round(L, 2), 0.01)
        check('area A = Q/(U·LMTD) (workbook C27)', num(tile('面積')), round(A, 2), 0.02)
        check('Q in the other unit = 100/3.51685 RT', num(tile('另一單位')), round(100 / 3.51685, 2), 0.01)
        check('hot side ΔT = 5.5 °C (workbook C13)', num(tile('熱側溫差')), 5.5, 0.01)
        check('cold side ΔT = 5 °C (workbook C17)', num(tile('冷側溫差')), 5.0, 0.01)
        check('hot flow = 100/4.185/5.5 kg/s (workbook P32)', num(tile('熱側水流量')), round(100 / 4.185 / 5.5, 3), 0.002)
        check('cold flow = 100/4.185/5 kg/s (workbook Q32)', num(tile('冷側水流量')), round(100 / 4.185 / 5, 3), 0.002)
        check('hot flow m³/h = kg/s × 3.6 (workbook P33)', num(tile('熱側水流量 ×3.6')),
              round(100 / 4.185 / 5.5 * 3.6, 2), 0.02)
        check('cold flow m³/h = kg/s × 3.6 (workbook Q33)', num(tile('冷側水流量 ×3.6')),
              round(100 / 4.185 / 5 * 3.6, 2), 0.02)
        t = tiles()
        check('no temperature cross flagged', any('No temperature cross' in f or '無溫度交叉' in f for f in t['flags']), True)
        check('HX schematic drawn (workbook G25:H36)', t['svg'], True)

        # ---- RT unit selector (workbook D5 = M6 branch: C6 = C5 × 3.516) ----
        page.evaluate("""() => {
          const f = [...document.querySelectorAll('#moduleBody .field')]
            .find(x => (x.querySelector('label')?.textContent || '').includes('換熱量單位'));
          [...f.querySelectorAll('.seg button')].find(b => b.textContent.trim() === 'RT').click();
        }""")
        page.wait_for_timeout(250)
        setv('#hx-q', 100)
        check('100 RT → 351.685 kW duty in kW', num(tile('另一單位')), round(100 * 3.51685, 2), 0.02)
        check('100 RT duty: area scales with Q', num(tile('面積')), round(100 * 3.51685 * 1000 / (5000 * L), 1), 0.2)
        page.evaluate("""() => {
          const f = [...document.querySelectorAll('#moduleBody .field')]
            .find(x => (x.querySelector('label')?.textContent || '').includes('換熱量單位'));
          [...f.querySelectorAll('.seg button')].find(b => b.textContent.trim() === 'kW').click();
        }""")
        page.wait_for_timeout(200)

        # ---- equal terminals → arithmetic mean (workbook IF(O6-O7=0,(C17+C13)/2, ...)) ----
        setv('#hx-hi', 12)
        setv('#hx-ho', 8)
        setv('#hx-ci', 5)
        setv('#hx-co', 9)   # ΔT1 = 12 − 9 = 3 and ΔT2 = 8 − 5 = 3, both positive
        check('equal terminals → ΔT = arithmetic mean 3 °C', num(tile('兩端相等')), 3.0, 1e-6)
        check('equal terminals → A = 100·1000/(5000·3)', num(tile('面積')), round(100 * 1000 / (5000 * 3), 2), 0.02)

        # ---- temperature cross is refused, not silently averaged ----
        setv('#hx-hi', 10)
        setv('#hx-ho', 8)
        setv('#hx-ci', 4)
        setv('#hx-co', 12)   # cold out above hot in
        t = tiles()
        check('temperature cross flagged', any('cross' in f.lower() or '交叉' in f for f in t['flags']), True)
        check('cross keeps the tile grid (>= 4 tiles)', len(t['tiles']) >= 4, True)
        check('cross area tile shows a dash, not NaN', tile('面積'), '—m²')

        # ---- U preset: workbook plate value 5000 ----
        setv('#hx-hi', 12.5)
        setv('#hx-ho', 7)
        setv('#hx-ci', 4)
        setv('#hx-co', 9)
        page.evaluate("""() => {
          const f = [...document.querySelectorAll('#moduleBody .field')]
            .find(x => (x.querySelector('label')?.textContent || '').includes('U 值預設'));
          [...f.querySelectorAll('.seg button')].find(b => b.textContent.includes('3000')).click();
        }""")
        page.wait_for_timeout(250)
        check('U preset 3000 applied to the field', num(page.input_value('#hx-u')), 3000, 1e-9)
        check('U 3000 gives a larger area than U 5000',
              num(tile('面積')) > A, True)

        # ---- U reference table carries the workbook's 5000 W/m2K plate value ----
        u_tbl = page.evaluate("""() => {
          const c = [...document.querySelectorAll('#moduleBody .card')][1];
          return [...c.querySelectorAll('tbody tr')].map(tr => tr.textContent);
        }""")
        check('U reference table lists the plate range incl. 5000',
              any('3000 ~ 7000' in r and '5000' in r for r in u_tbl), True)
        check('vendor note points at the workbook HISAKA link',
              'hisaka.co.jp/simulator' in page.inner_text('#moduleBody'), True)

        body = page.inner_text('#moduleBody')
        check('no NaN on the page', 'NaN' not in body, True)
        check('console/page errors', len(errors), 0, 1e-9)
        if errors:
            for e in errors[:5]:
                print('    !', e)

        browser.close()

    print('\nRESULT: %d ok / %d fail' % (ok, fail))
    return 1 if fail else 0


if __name__ == '__main__':
    raise SystemExit(main())
