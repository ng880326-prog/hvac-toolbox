"""Verification of the insulation page against BEC 2012 / BEC 2024 and the workbook.

Workbook reference (sheet 29_Insulations, blank BEC-2012 template):
  D2       'Minimum Insulation Thickness Requirement - BEC 2012'
  AB10:AK25  chilled-water pipework table (16 outer diameters x 10 columns)
  AB50:AK52  ductwork / AHU casing table (dT 10 / 15 / 20 C x the same columns)
  K19:N31    refrigerant suction pipework (outer diameters + 0 / -10 / -20 C, thickness cells blank)
  Q13        c = 1000*(l/h)*{(qd-q1)/(qm-qd)}          -- code Equation (a)
  Q21        c = 0.5*(do+2La)*ln[1+2La/do]             -- code Equation (b)
  Q23/Q27    'minimum insulation thickness' / 'Airduct / AHU casing: c = La'
  Q28        S28 = ROUNDUP(S13,0)

Standards:
  BEC 2024 Tables 6.11a/6.11b/6.11c (pp. 32-34) - lambda 0.024/0.038, adds the ceiling-void condition
  TG-BEC 2024 section 6.11.1, Tables 6.11.1(a) (10 C supplement) and 6.11.1(e) (commercial sizes)
  BEC 2012 Tables 6.11a/6.11b/6.11c (pp. 23-26) - lambda 0.024/0.04

The expectations below are recomputed in Python from the code equations rather than copied from the
page, so the verifier is an independent check of the implementation.

Usage: python tools/verify_insulation.py
"""
import math
import re

from playwright.sync_api import sync_playwright

URL = 'http://localhost:8080/#m/insulation'


def num(text):
    m = re.search(r'-?\d[\d,]*(?:\.\d+)?', text or '')
    return float(m.group(0).replace(',', '')) if m else float('nan')


def eq_a(lam, h, dew, line, amb):
    """BEC/TG Equation (a): provisional thickness in mm."""
    return 1000 * (lam / h) * ((dew - line) / (amb - dew))


def eq_b(do, la):
    """BEC/TG Equation (b): equivalent thickness of a cylindrical layer, mm."""
    return 0.5 * (do + 2 * la) * math.log(1 + 2 * la / do)


def la_from_c(do, c):
    """Invert Equation (b) by bisection."""
    lo, hi = 0.0, max(c, 1e-3)
    while eq_b(do, hi) < c:
        hi *= 2
    for _ in range(200):
        mid = (lo + hi) / 2
        if eq_b(do, mid) < c:
            lo = mid
        else:
            hi = mid
    return (lo + hi) / 2


def main():
    ok = fail = 0

    def check(name, got, want, tol=None):
        nonlocal ok, fail
        good = (abs(got - want) <= tol) if tol is not None else got == want
        ok, fail = (ok + 1, fail) if good else (ok, fail + 1)
        print('  %-58s got %-22s want %-22s %s' % (name, str(got)[:22], str(want)[:22], 'OK' if good else 'FAIL'))

    with sync_playwright() as pw:
        browser = pw.chromium.launch()
        page = browser.new_page(viewport={'width': 1280, 'height': 1100})
        errors = []
        page.on('pageerror', lambda e: errors.append(str(e)))
        page.on('console', lambda m: errors.append(m.text) if m.type == 'error' else None)
        page.goto(URL, wait_until='networkidle')
        page.wait_for_selector('#ins-do', timeout=15000)
        page.wait_for_timeout(300)

        def card(needle):
            return page.evaluate("""(needle) => {
              const cards = [...document.querySelectorAll('#moduleBody .card')];
              const c = cards.find(x => (x.querySelector('h3')?.textContent || '').includes(needle));
              if (!c) return null;
              return {
                tiles: [...c.querySelectorAll('.res')].map(e => [e.querySelector('.lbl').textContent.trim(),
                                                                 e.querySelector('.val').textContent.trim()]),
                flags: [...c.querySelectorAll('.flag')].map(e => e.textContent.trim()),
                note: (c.querySelector('.note')?.textContent || ''),
              };
            }""", needle)

        def tile(card_needle, sub):
            c = card(card_needle)
            if not c:
                return '(no card)'
            hits = [v for k, v in c['tiles'] if sub in k]
            return hits[0] if hits else '(missing)'

        def table_rows(card_needle, marker, nth=0):
            """Rows of the sub-table whose .ins-head source label contains `marker` (6.11a/b/c)."""
            return page.evaluate("""([needle, marker, nth]) => {
              const cards = [...document.querySelectorAll('#moduleBody .card')];
              const c = cards.find(x => (x.querySelector('h3')?.textContent || '').includes(needle));
              if (!c) return [];
              const heads = [...c.querySelectorAll('.ins-head')];
              const h = heads.filter(x => x.textContent.includes(marker))[nth];
              if (!h) return [];
              let t = h.nextElementSibling;
              while (t && !t.querySelector('table')) t = t.nextElementSibling;
              if (!t) return [];
              return [...t.querySelectorAll('tbody tr')].map(tr =>
                [...tr.querySelectorAll('td')].map(td => td.textContent.trim()));
            }""", [card_needle, marker, nth])

        def pick(label, text):
            """Click the seg button for `text` inside the field whose label contains `label`.

            Exact text wins; a substring match is only the fallback (otherwise '空調空間' would hit
            '非空調空間', and 'BEC 2024' must reach 'BEC 2024（現行）').
            """
            return page.evaluate("""([label, text]) => {
              const fields = [...document.querySelectorAll('#moduleBody .field')];
              const f = fields.find(x => (x.querySelector('label')?.textContent || '').includes(label));
              if (!f) return 'no field: ' + label;
              const btns = [...f.querySelectorAll('.seg button')];
              const exact = btns.filter(x => x.textContent.trim() === text);
              const loose = btns.filter(x => x.textContent.includes(text));
              const b = exact[0] || (loose.length === 1 ? loose[0] : null);
              if (!b) return 'no option ' + text + ' in ' + label + ' (have ' + btns.map(x => x.textContent.trim()).join('/') + ')';
              b.click();
              return 'ok';
            }""", [label, text])

        def row_of(rows, needle):
            for r in rows:
                if r and needle in r[0]:
                    return r
            return []

        # ---------------- Equation (a) and (b) cross-check (independent Python implementation) ---------
        c_out = eq_a(0.024, 9, 27, 5, 28.8)
        check('Eq (a) c(0.024, h9, 27, 5, 28.8) (Excel Q13 form)', round(c_out, 3), 32.593, 1e-3)
        check('Eq (b) La(do 21.3, c 32.593) = BEC 6.11a DN15 20 mm', round(la_from_c(21.3, c_out), 2), 20.09, 0.01)

        # ---------------- Card 1: pipework table, BEC 2024 (default) ----------------
        check('edition default BEC 2024', num(tile('保溫', '要求最低厚度')), 25, 1e-9)  # DN50 outdoor lam 0.024 h9 (2024 6.11a = 25)
        pipe = table_rows('保溫', '6.11a')
        check('pipe sub-table has 16 rows (DN15-DN400)', len(pipe), 16, 1e-9)
        r50 = row_of(pipe, 'DN50')
        check('BEC 2024 DN50 std = 25 mm (Table 6.11a)', num(r50[1]) if r50 else float('nan'), 25, 1e-9)
        check('BEC 2024 DN50 calculated = Eq (b)', num(r50[2]) if r50 else float('nan'), round(la_from_c(60.3, c_out), 1), 0.05)
        check('BEC 2024 DN50 commercial = 25 mm (TG 6.11.1(e))', num(r50[3]) if r50 else float('nan'), 25, 1e-9)
        check('pipe tile required = 25 mm', num(tile('保溫', '要求最低厚度')), 25, 1e-9)
        check('pipe tile La,min = Eq (b) value', num(tile('保溫', 'La,min')), round(la_from_c(60.3, c_out), 1), 0.05)

        # lam 0.038 (BEC 2024) - column 3
        print('  ' + pick('導熱係數', '≈0.038'))
        page.wait_for_timeout(250)
        pipe = table_rows('保溫', '6.11a')
        r50 = row_of(pipe, 'DN50')
        check('BEC 2024 DN50 lam0.038 h9 std = 36 mm', num(r50[1]) if r50 else float('nan'), 36, 1e-9)
        c38 = eq_a(0.038, 9, 27, 5, 28.8)
        check('BEC 2024 DN50 lam0.038 calculated', num(r50[2]) if r50 else float('nan'), round(la_from_c(60.3, c38), 1), 0.05)
        check('BEC 2024 DN50 lam0.038 commercial = 40 mm', num(r50[3]) if r50 else float('nan'), 40, 1e-9)

        # h 13.5 -> column 4
        print('  ' + pick('表面換熱係數 h', '13.5'))
        page.wait_for_timeout(250)
        pipe = table_rows('保溫', '6.11a')
        r50 = row_of(pipe, 'DN50')
        check('BEC 2024 DN50 lam0.038 h13.5 std = 26 mm', num(r50[1]) if r50 else float('nan'), 26, 1e-9)

        # ---------------- Exposure selector: ceiling void (BEC 2024 only) ----------------
        print('  ' + pick('環境工況', '天花空腔'))
        page.wait_for_timeout(250)
        print('  ' + pick('導熱係數', '≈0.024'))
        page.wait_for_timeout(200)
        print('  ' + pick('表面換熱係數 h', '5.7'))
        page.wait_for_timeout(250)
        pipe = table_rows('保溫', '6.11a')
        r50 = row_of(pipe, 'DN50')
        check('BEC 2024 DN50 void lam0.024 h5.7 std = 24 mm', num(r50[1]) if r50 else float('nan'), 24, 1e-9)
        check('void calculated uses theta_d 26 (Eq b)', num(r50[2]) if r50 else float('nan'),
              round(la_from_c(60.3, eq_a(0.024, 5.7, 26, 5, 28.8)), 1), 0.05)

        # ---------------- Conditioned space: tabulated only ----------------
        print('  ' + pick('環境工況', '空調空間'))
        page.wait_for_timeout(250)
        pipe = table_rows('保溫', '6.11a')
        r50 = row_of(pipe, 'DN50')
        check('conditioned DN50 lam0.024 std = 13 mm', num(r50[1]) if r50 else float('nan'), 13, 1e-9)
        check('conditioned calculated shows dash', r50[2] if r50 else '', '—')
        flags = card('保溫')['flags']
        check('conditioned note flagged', any('90.1' in f or 'ASHRAE' in f for f in flags), True)

        # ---------------- Ductwork / AHU casing ----------------
        print('  ' + pick('環境工況', '室外'))
        page.wait_for_timeout(200)
        print('  ' + pick('內外溫差 ΔT', '20 °C'))
        page.wait_for_timeout(250)
        duct = table_rows('保溫', '6.11c')
        check('duct sub-table has 3 temperature differences', len(duct), 3, 1e-9)
        d20 = row_of(duct, '20 °C')
        check('BEC 2024 dT20 outdoor lam0.024 h9 std = 27 mm', num(d20[1]) if d20 else float('nan'), 27, 1e-9)
        check('dT20 calculated = ceil Eq (a)', num(d20[2]) if d20 else float('nan'),
              math.ceil(eq_a(0.024, 9, 27, 28.8 - 20, 28.8) - 1e-9), 1e-9)

        # ---------------- Refrigerant pipework, line temperature -10 C ----------------
        print('  ' + pick('管內溫度', '-10 °C'))
        page.wait_for_timeout(250)
        ref = table_rows('保溫', '6.11b')
        check('refrigerant sub-table has 11 outer diameters', len(ref), 11, 1e-9)
        r22 = row_of(ref, '22 mm')
        check('BEC 2024 refrigerant -10 C OD22 std = 31 mm', num(r22[1]) if r22 else float('nan'), 31, 1e-9)
        check('refrigerant calculated = Eq (b) at -10 C', num(r22[2]) if r22 else float('nan'),
              round(la_from_c(22, eq_a(0.024, 9, 27, -10, 28.8)), 1), 0.05)

        # ---------------- Edition switch back to BEC 2012 ----------------
        print('  ' + pick('條例版本', 'BEC 2012'))
        page.wait_for_timeout(300)
        print('  ' + pick('導熱係數', '≈0.024'))
        page.wait_for_timeout(250)
        r50 = row_of(table_rows('保溫', '6.11a'), 'DN50')
        check('BEC 2012 DN50 outdoor lam0.024 h9 std = 25 mm', num(r50[1]) if r50 else float('nan'), 25, 1e-9)
        check('BEC 2012 has no commercial column (—)', r50[3] if r50 else '', '—')
        # BEC 2012 rates the second conductivity at 0.04, so its column differs from BEC 2024's 0.038
        print('  ' + pick('導熱係數', '橡塑泡棉'))
        page.wait_for_timeout(250)
        ref = table_rows('保溫', '6.11b')
        r22 = row_of(ref, '22 mm')
        check('BEC 2012 refrigerant -10 C OD22 lam0.04 std = 46 mm', num(r22[1]) if r22 else float('nan'), 46, 1e-9)
        check('BEC 2012 refrigerant -10 C OD22 lam0.04 calculated', num(r22[2]) if r22 else float('nan'),
              round(la_from_c(22, eq_a(0.04, 9, 27, -10, 28.8)), 1), 0.05)
        duct = table_rows('保溫', '6.11c')
        d15 = row_of(duct, '15 °C')
        check('BEC 2012 dT15 outdoor lam0.04 h9 std = 33 mm', num(d15[1]) if d15 else float('nan'), 33, 1e-9)
        # A conductivity outside the edition's table must fall back to the equations, not guess a column
        print('  ' + pick('導熱係數', '≈0.038'))
        page.wait_for_timeout(250)
        r50 = row_of(table_rows('保溫', '6.11a'), 'DN50')
        check('BEC 2012 has no 0.038 column -> standard shows dash', r50[1] if r50 else '', '—')
        check('BEC 2012 0.038 still calculated by Eq (b)', num(r50[2]) if r50 else float('nan'),
              round(la_from_c(60.3, eq_a(0.038, 9, 27, 5, 28.8)), 1), 0.05)
        check('not-tabulated lambda flagged', any('not in the table' in f or '不在表內' in f for f in card('保溫')['flags']), True)

        # ---------------- Compliance flag on a proposed thickness ----------------
        print('  ' + pick('條例版本', 'BEC 2024'))
        page.wait_for_timeout(250)
        print('  ' + pick('環境工況', '室外'))
        page.wait_for_timeout(200)
        print('  ' + pick('導熱係數', '聚氨酯泡沫'))
        page.wait_for_timeout(200)
        print('  ' + pick('表面換熱係數 h', '9'))
        page.wait_for_timeout(250)
        r50 = row_of(table_rows('保溫', '6.11a'), 'DN50')
        check('BEC 2024 DN50 lam0.024 h9 std = 25 mm (re-check)', num(r50[1]) if r50 else float('nan'), 25, 1e-9)
        page.fill('#ins-t', '20')
        page.dispatch_event('#ins-t', 'input')
        page.wait_for_timeout(250)
        flags = card('保溫')['flags']
        check('20 mm against DN50 (25 mm) flagged as short',
              any('below' in f or '低於' in f for f in flags), True)
        page.fill('#ins-t', '25')
        page.dispatch_event('#ins-t', 'input')
        page.wait_for_timeout(250)
        flags = card('保溫')['flags']
        check('25 mm against DN50 (25 mm) flagged compliant',
              any('meets' in f or '符合' in f for f in flags), True)

        # ---------------- Card 2: calculation block ----------------
        calc = card('保溫厚度計算')
        check('calc card present', calc is not None, True)
        check('calc c = Eq (a) 32.59 mm', num(tile('保溫厚度計算', '臨時厚度')), round(c_out, 2), 0.01)
        check('calc La,min = Eq (b)', num(tile('保溫厚度計算', 'La,min')), round(la_from_c(60.3, c_out), 1), 0.05)
        check('calc de = Eq (b) forward', num(tile('保溫厚度計算', '等效厚度')), round(eq_b(60.3, 25), 1), 0.1)
        # surface temperature with the proposed 25 mm on DN50
        de = eq_b(60.3, 25)
        r_ins = (de / 1000) / 0.024
        r_surf = 1 / 9
        surf = 28.8 - (28.8 - 5) * r_surf / (r_surf + r_ins)
        check('calc surface temperature', num(tile('保溫厚度計算', '表面溫度')), round(surf, 2), 0.02)
        check('calc no-condensation flag', any('no condensation' in f or '不結露' in f for f in calc['flags']), True)

        # "use this edition's basis" button restores the code inputs
        page.fill('#insc-lambda', '0.05')
        page.dispatch_event('#insc-lambda', 'input')
        page.wait_for_timeout(200)
        page.click('.ins-actions button')
        page.wait_for_timeout(250)
        check('basis button restores lambda 0.024',
              num(page.input_value('#insc-lambda')), 0.024, 1e-9)
        check('basis button restores h 9', num(page.input_value('#insc-hCoef')), 9, 1e-9)
        check('basis button restores theta_d 27', num(page.input_value('#insc-dew')), 27, 1e-9)
        check('basis button restores theta_m 28.8', num(page.input_value('#insc-amb')), 28.8, 1e-9)

        # ---------------- guards: no NaN, no console errors ----------------
        body = page.inner_text('#moduleBody')
        check('no NaN on the page', 'NaN' not in body, True)
        check('no undefined on the page', 'undefined' not in body, True)
        check('console/page errors', len(errors), 0, 1e-9)
        if errors:
            for e in errors[:5]:
                print('    !', e)

        browser.close()

    print('\nRESULT: %d ok / %d fail' % (ok, fail))
    return 1 if fail else 0


if __name__ == '__main__':
    raise SystemExit(main())
