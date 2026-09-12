"""Independent verification of the rebuilt Wheel page (第②頁) against the workbook algebra.

The psychrometric reference here is written from scratch (Hyland-Wexler saturation pressure, W from pw,
h = 1.006·t + W·(2501 + 1.805·t), twb by bisection on the adiabatic-saturation relation) so it does not
import the app's engine. The wheel relations are transcribed from the workbook formulas extracted in
analysis/sheets/05_Wheel.txt (O6/O10/E16/O16/O22/O34/X22) — i.e. the check confirms the page implements
the workbook algebra, not merely that the page agrees with itself.

Usage: python tools/verify_wheel.py            (expects a server on http://localhost:8080)
"""
import math
import re
import sys

from playwright.sync_api import sync_playwright


def parse_lead_number(text):
    """Result tiles render '37.42' followed by a unit element, so the text is e.g. '37.42kW'."""
    m = re.search(r'-?\d[\d,]*(?:\.\d+)?', text)
    return float(m.group(0).replace(',', '')) if m else None

URL = 'http://localhost:8080/#m/wheel'
P = 101.325
RATIO = 0.621945
CP_AIR, H_FG0, CP_VAP = 1.006, 2501.0, 1.805


def pws(t):
    k = t + 273.15
    if t >= 0.01:
        c = [-5.8002206e3, 1.3914993, -4.8640239e-2, 4.1764768e-5, -1.4452093e-8, 6.5459673]
        ln = c[0] / k + c[1] + c[2] * k + c[3] * k * k + c[4] * k ** 3 + c[5] * math.log(k)
    else:
        c = [-5.6745359e3, 6.3925247, -9.677843e-3, 6.2215701e-7, 2.0747825e-9, -9.484024e-13, 4.1635019]
        ln = (c[0] / k + c[1] + c[2] * k + c[3] * k * k + c[4] * k ** 3 + c[5] * k ** 4
              + c[6] * math.log(k))
    return math.exp(ln) / 1000


def w_from_pw(pw, p=P):
    return RATIO * pw / (p - pw) if pw < p else float('inf')


def pw_from_w(w, p=P):
    return p * w / (RATIO + w)


def h_of(t, w):
    return CP_AIR * t + w * (H_FG0 + CP_VAP * t)


def w_of_ht(h, t):
    return max(0.0, (h - CP_AIR * t) / (H_FG0 + CP_VAP * t))


def rho(t, w, p=P):
    v = 0.2871 * (t + 273.15) * (1 + 1.6078 * w) / p
    return (1 + w) / v


def tdp(pw):
    lo, hi = -80.0, 100.0
    for _ in range(80):
        mid = (lo + hi) / 2
        if pws(mid) > pw:
            hi = mid
        else:
            lo = mid
    return (lo + hi) / 2


def twb(t, w):
    def hstar(tw):
        ws = w_from_pw(pws(tw))
        return h_of(tw, ws) - (ws - w) * 4.186 * tw  # adiabatic saturation
    lo, hi = -80.0, t
    for _ in range(80):
        mid = (lo + hi) / 2
        if hstar(mid) < h_of(t, w):
            lo = mid
        else:
            hi = mid
    return (lo + hi) / 2


class Air:
    def __init__(self, t, w=None, twb_in=None, rh=None):
        self.t = t
        if w is not None:
            self.w = w
        elif twb_in is not None:
            lo, hi = 0.0, 0.06
            for _ in range(80):
                mid = (lo + hi) / 2
                if twb(t, mid) < twb_in:
                    lo = mid
                else:
                    hi = mid
            self.w = (lo + hi) / 2
        elif rh is not None:
            self.w = w_from_pw(pws(t) * rh / 100)
        self.pw = pw_from_w(self.w)
        self.h = h_of(self.t, self.w)
        self.rho = rho(self.t, self.w)
        self.rh = self.pw / pws(self.t) * 100
        self.tdp = tdp(self.pw)
        self.twb = twb(self.t, self.w)


def wheel(sup, exh, vs_m3s, ve_m3s, eff_s, eff_t, total):
    """Workbook algebra: O6/O10 min flow, O16 QL = QT - QS, O22/X22 outlet temperatures."""
    m = min(vs_m3s * sup.rho, ve_m3s * exh.rho)
    # Recovered energy is a positive magnitude: workbook summer writes (to,1 - tr,1), winter the reverse.
    qs_max = m * CP_AIR * abs(sup.t - exh.t) * eff_s
    qt_max = m * abs(sup.h - exh.h) * eff_t if total else None
    t2 = sup.t + eff_s * (exh.t - sup.t)
    h2 = sup.h + eff_t * (exh.h - sup.h) if total else h_of(t2, sup.w)
    w2 = w_of_ht(h2, t2) if total else sup.w
    h2f = h_of(t2, w2)
    tr2 = exh.t + eff_s * (sup.t - exh.t)
    hr2 = exh.h + eff_t * (sup.h - exh.h) if total else h_of(tr2, exh.w)
    wr2 = w_of_ht(hr2, tr2) if total else exh.w
    qs = m * CP_AIR * abs(sup.t - t2)
    qt = m * abs(sup.h - h2f)
    return {
        'm': m, 'qs_max': qs_max, 'qt_max': qt_max, 'qs': qs, 'qt': qt, 'ql': qt - qs,
        't2': t2, 'w2': w2, 'h2': h2f, 'twb2': twb(t2, w2),
        'tr2': tr2, 'wr2': wr2, 'hr2': h_of(tr2, wr2), 'twbr2': twb(tr2, wr2),
        'cond_exh': tr2 <= tdp(pw_from_w(wr2)),
    }


def main():
    sup_s = Air(35, twb_in=28)
    exh_s = Air(24, twb_in=17)
    sup_w = Air(5, rh=70)
    exh_w = Air(22, rh=50)
    ref_s = wheel(sup_s, exh_s, 1.132, 1.132, 0.75, 0.70, True)
    ref_w = wheel(sup_w, exh_w, 1.132, 1.132, 0.75, 0.70, False)

    print('independent reference (workbook algebra, 1132 L/s, ηS 0.75, ηT 0.70)')
    print('  summer m=%.4f kg/s  QT_max=%.2f  QS_max=%.2f  QT=%.2f  QS=%.2f  QL=%.2f' % (
        ref_s['m'], ref_s['qt_max'], ref_s['qs_max'], ref_s['qt'], ref_s['qs'], ref_s['ql']))
    print('  summer supply out %.2f °C / %.2f °C WB / h %.2f | exhaust out %.2f / %.2f / %.2f' % (
        ref_s['t2'], ref_s['twb2'], ref_s['h2'], ref_s['tr2'], ref_s['twbr2'], ref_s['hr2']))
    print('  winter QS_max=%.2f  QT=%.2f  supply out %.2f °C  exhaust out %.2f °C' % (
        ref_w['qs_max'], ref_w['qt'], ref_w['t2'], ref_w['tr2']))

    with sync_playwright() as pw:
        browser = pw.chromium.launch()
        page = browser.new_page(viewport={'width': 1440, 'height': 1000})
        errors = []
        page.on('console', lambda m: errors.append(m.text) if m.type == 'error' else None)
        page.on('pageerror', lambda e: errors.append('pageerror: %s' % e))
        page.goto(URL, wait_until='networkidle')
        page.wait_for_selector('.wheel-dc', timeout=15000)

        # design-condition table: 4 rows x computed WB/w/h/dew/RH
        table = page.eval_on_selector_all('.wheel-dc tbody tr', """rows => rows.map(r =>
            [...r.querySelectorAll('td')].map(td => {
              const i = td.querySelector('input');
              return i ? i.value : td.textContent.trim();
            }))""")
        print('\n  browser design-conditions table')
        for r in table:
            print('    %-22s %-8s DB=%-7s WB=%-7s RH=%-7s -> WB %-6s w %-9s h %-7s tdp %-6s RH %s' % tuple(
                (r + [''] * 10)[:10]))

        tiles = page.eval_on_selector_all('.wheel-col', """cols => cols.map(c => ({
            head: c.querySelector('.wheel-col-head').textContent.trim(),
            on: c.querySelector('.wheel-col-head').classList.contains('on'),
            vals: [...c.querySelectorAll('.res')].map(r => [
              r.querySelector('.lbl').textContent.trim(),
              r.querySelector('.val').textContent.trim()])
        }))""")
        svg_count = page.eval_on_selector_all('.wheel-sch', 'els => els.length')
        card_count = page.eval_on_selector_all('.card', 'els => els.length')
        print('\n  cards on page: %d | wheel schematics: %d' % (card_count, svg_count))
        print('  console errors: %d %s' % (len(errors), errors[:3]))

        def collect(col):
            """Exact label -> numeric value. Tile text is 'value' + unit (e.g. '37.42kW'), labels bilingual."""
            out = {}
            for lbl, v in col['vals']:
                out[lbl] = None if v.strip() in ('—', 'n/a', '-') else parse_lead_number(v)
            return out

        ok = fail = 0

        def check(tag, name, labels, got_map, want, expect_na=False):
            nonlocal ok, fail
            found = [l for l in labels if l in got_map]
            if not found:
                fail += 1
                print('  %-7s %-22s MISSING LABEL %s' % (tag, name, labels))
                return
            got = got_map[found[0]]
            if expect_na:
                good = got is None
                print('  %-7s %-22s got %9s  expected n/a  %s' % (tag, name, 'n/a' if got is None else got,
                                                                  'OK' if good else 'FAIL'))
            else:
                good = got is not None and abs(got - want) <= max(abs(want) * 0.005, 0.02)
                print('  %-7s %-22s got %9s  ref %9.3f  %s' % (
                    tag, name, 'n/a' if got is None else '%.3f' % got, want, 'OK' if good else 'FAIL'))
            ok, fail = (ok + 1, fail) if good else (ok, fail + 1)

        LBL = {
            'maxQT': ['最大全熱回收 QT', 'Max total recovered QT'],
            'maxQS': ['最大顯熱回收 QS', 'Max sensible recovered QS'],
            'qs': ['顯熱回收 QS', 'Sensible recovered QS'],
            'ql': ['潛熱回收 QL', 'Latent recovered QL'],
            'qt': ['全熱回收 QT', 'Total recovered QT'],
            'supDb': ['供風出口（to,2） · 乾球', 'Supply outlet (to,2) · Dry bulb'],
            'supWb': ['供風出口（to,2） · 濕球', 'Supply outlet (to,2) · Wet bulb'],
            'supH': ['供風出口（to,2） · 焓', 'Supply outlet (to,2) · h'],
            'exhDb': ['排風出口（tr,2） · 乾球', 'Exhaust outlet (tr,2) · Dry bulb'],
            'exhWb': ['排風出口（tr,2） · 濕球', 'Exhaust outlet (tr,2) · Wet bulb'],
            'exhH': ['排風出口（tr,2） · 焓', 'Exhaust outlet (tr,2) · h'],
        }

        for col, ref, tag in [(tiles[0], ref_s, 'summer'), (tiles[1], ref_w, 'winter')]:
            got_map = collect(col)
            check(tag, 'max total QT', LBL['maxQT'], got_map, ref['qt_max'] or 0,
                  expect_na=ref['qt_max'] is None)
            check(tag, 'max sensible QS', LBL['maxQS'], got_map, ref['qs_max'])
            check(tag, 'sensible QS', LBL['qs'], got_map, ref['qs'])
            check(tag, 'latent QL', LBL['ql'], got_map, 0.0 if ref['qt_max'] is None else ref['ql'])
            check(tag, 'total QT', LBL['qt'], got_map, ref['qt'])
            check(tag, 'supply outlet DB', LBL['supDb'], got_map, ref['t2'])
            check(tag, 'supply outlet WB', LBL['supWb'], got_map, ref['twb2'])
            check(tag, 'supply outlet h', LBL['supH'], got_map, ref['h2'])
            check(tag, 'exhaust outlet DB', LBL['exhDb'], got_map, ref['tr2'])
            check(tag, 'exhaust outlet WB', LBL['exhWb'], got_map, ref['twbr2'])
            check(tag, 'exhaust outlet h', LBL['exhH'], got_map, ref['hr2'])

        page.screenshot(path='docs/verification/wheel_desktop.png', full_page=True)
        page.set_viewport_size({'width': 390, 'height': 844})
        page.wait_for_timeout(400)
        page.screenshot(path='docs/verification/wheel_mobile.png', full_page=True)
        browser.close()

    print('\nRESULT: %d ok / %d fail' % (ok, fail))
    return 1 if fail else 0


if __name__ == '__main__':
    sys.exit(main())
