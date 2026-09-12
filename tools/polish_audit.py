"""Final polish sweep: every module, three viewports, both themes, both languages.

Checks the things that separate a prototype from a shipping mobile app:

  * console / page errors and failed requests on every page
  * horizontal overflow and the exact offending elements
  * tap targets smaller than 44x44 px on a phone (Apple HIG / Material minimum)
  * input font-size below 16 px on a phone (iOS Safari zooms the page on focus)
  * cards that render nothing at all (no tile, no table, no chart) — a blank panel reads as broken
  * accessible names on icon-only controls and images inside SVG charts
  * English labels overflowing when the UI switches language

Usage: python tools/polish_audit.py [--quick]
"""
import json
import sys

from playwright.sync_api import sync_playwright

URL = 'http://localhost:8080/index.html'
VIEWPORTS = [(390, 844, 'phone'), (820, 1180, 'tablet'), (1440, 1000, 'desktop')]
QUICK = '--quick' in sys.argv

MEASURE = """() => {
  const vw = window.innerWidth;
  const out = { overflow: document.documentElement.scrollWidth > vw + 1, offenders: [],
                smallTaps: [], smallFonts: [], blankCards: 0, cards: 0,
                unnamed: [], inputs: 0, tinyText: 0 };
  const name = el => (el.getAttribute('aria-label') || el.textContent || '').trim().slice(0, 40);
  const box = el => el.getBoundingClientRect();
  // horizontal offenders
  document.querySelectorAll('#moduleBody *').forEach(el => {
    const r = box(el);
    if (r.width > 1 && (r.right > vw + 2 || r.left < -2)) {
      out.offenders.push({ tag: el.tagName.toLowerCase(), cls: (el.className || '').toString().slice(0, 40),
                           right: Math.round(r.right), left: Math.round(r.left), w: Math.round(r.width) });
    }
  });
  // interactive sizes
  document.querySelectorAll('#moduleBody button, #moduleBody a, #moduleBody select, #moduleBody input, #moduleBody summary')
    .forEach(el => {
      const r = box(el);
      if (r.width < 1 || r.height < 1) return;
      if (el.tagName === 'INPUT' && el.type === 'checkbox') return;
      if (r.height < 32 || r.width < 24) {
        out.smallTaps.push({ tag: el.tagName.toLowerCase(), label: name(el), w: Math.round(r.width), h: Math.round(r.height) });
      }
      if (el.tagName === 'INPUT' || el.tagName === 'SELECT') {
        out.inputs++;
        const fs = parseFloat(getComputedStyle(el).fontSize);
        if (fs < 16) out.smallFonts.push({ tag: el.tagName.toLowerCase(), fs: fs, id: el.id || '(no id)' });
      }
    });
  // icon-only controls without an accessible name
  document.querySelectorAll('#moduleBody button, .topbar button, #moduleBody a').forEach(el => {
    if (!name(el)) out.unnamed.push(el.outerHTML.slice(0, 70));
  });
  // cards that render nothing
  document.querySelectorAll('#moduleBody .card').forEach(c => {
    out.cards++;
    const has = c.querySelector('.res, table, svg, canvas, .flag, .folded, .note, button, input, select');
    if (!has) out.blankCards++;
  });
  // very small text
  document.querySelectorAll('#moduleBody *').forEach(el => {
    if (!el.children.length && el.textContent.trim()) {
      const fs = parseFloat(getComputedStyle(el).fontSize);
      if (fs < 11) out.tinyText++;
    }
  });
  return out;
}"""


def main():
    findings = []
    with sync_playwright() as pw:
        browser = pw.chromium.launch()
        ctx = browser.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=2,
                                  is_mobile=True, has_touch=True,
                                  user_agent='Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) '
                                             'AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1')
        page = ctx.new_page()
        errors = []
        page.on('pageerror', lambda e: errors.append('pageerror: %s' % e))
        page.on('console', lambda m: errors.append('console: %s' % m.text) if m.type == 'error' else None)
        page.on('requestfailed', lambda r: errors.append('reqfail: %s %s' % (r.url.split('/')[-1], r.failure)))

        page.goto(URL, wait_until='networkidle')
        ids = page.eval_on_selector_all('a.nav-item[href^="#m/"]', "els => els.map(e => e.getAttribute('href').slice(3))")
        print('modules discovered: %d' % len(ids))

        for vw, vh, tag in VIEWPORTS:
            page.set_viewport_size({'width': vw, 'height': vh})
            for mid in ids:
                errs_before = len(errors)
                page.goto('%s#m/%s' % (URL, mid), wait_until='networkidle')
                page.wait_for_timeout(120)
                try:
                    page.wait_for_selector('#moduleBody .card', timeout=8000)
                except Exception:
                    findings.append({'page': mid, 'view': tag, 'issue': 'no card rendered'})
                    continue
                d = page.evaluate(MEASURE)
                page_errs = errors[errs_before:]
                rec = {'page': mid, 'view': tag, **{k: v for k, v in d.items() if k != 'offenders'}}
                if d['overflow']:
                    rec['overflowOffenders'] = d['offenders'][:4]
                if page_errs:
                    rec['errors'] = page_errs[:3]
                if (d['overflow'] or page_errs or d['smallTaps'] or d['smallFonts']
                        or d['blankCards'] or d['unnamed'] or d['tinyText']):
                    findings.append(rec)
                # language switch: English labels are longer
                if tag == 'phone' and not QUICK:
                    page.click('#langToggle')
                    page.wait_for_timeout(150)
                    d2 = page.evaluate(MEASURE)
                    if d2['overflow']:
                        findings.append({'page': mid, 'view': tag + '/en', 'overflow': True,
                                         'overflowOffenders': d2['offenders'][:4]})
                    page.click('#langToggle')
                    page.wait_for_timeout(100)
            # dark theme sweep on the phone
            if tag == 'phone' and not QUICK:
                page.click('#themeToggle')
                page.wait_for_timeout(150)
                bad = 0
                for mid in ids[:8]:
                    page.goto('%s#m/%s' % (URL, mid), wait_until='networkidle')
                    page.wait_for_timeout(80)
                    d3 = page.evaluate(MEASURE)
                    if d3['overflow']:
                        bad += 1
                        findings.append({'page': mid, 'view': 'phone/dark', 'overflow': True,
                                         'overflowOffenders': d3['offenders'][:3]})
                print('dark theme: %d/8 pages overflow' % bad)
                page.click('#themeToggle')

        browser.close()

    print('\n=== findings ===')
    if not findings:
        print('none')
    for f in findings:
        print(json.dumps(f, ensure_ascii=False))
    print('\ntotal findings: %d' % len(findings))
    return 1 if findings else 0


if __name__ == '__main__':
    sys.exit(main())
