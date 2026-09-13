"""Live status probe: load every module route, report tiles and console errors, save screenshots.

Usage: python tools/status_probe.py [base-url]
"""
import sys

from playwright.sync_api import sync_playwright

BASE = sys.argv[1] if len(sys.argv) > 1 else 'http://localhost:8080'
SHOTS = 'docs/verification'

MODULES = [
    'ducts', 'wheel', 'psychro', 'coil', 'pipes', 'chiller', 'boiler', 'ahu', 'fcu', 'fan', 'sac',
    'motor', 'hx', 'insulation', 'acoustics', 'pn', 'stairwell', 'convert', 'vrf', 'verify',
    'webtools', 'presets',
]


def main():
    errors = 0
    with sync_playwright() as pw:
        browser = pw.chromium.launch()
        page = browser.new_page(viewport={'width': 1280, 'height': 950})

        page.goto(BASE, wait_until='networkidle')
        page.wait_for_selector('#tiles .tile', timeout=15000)
        home = page.evaluate("""() => ({
          tiles: document.querySelectorAll('#tiles .tile').length,
          title: document.title,
        })""")
        print('home            %-34s tiles %s' % (home['title'], home['tiles']))

        for mid in MODULES:
            errs = []
            page.on('pageerror', lambda e, bag=errs: bag.append(str(e)))
            page.on('console', lambda m, bag=errs: bag.append(m.text) if m.type == 'error' else None)
            page.goto('%s/#m/%s' % (BASE, mid), wait_until='networkidle')
            page.wait_for_timeout(220)
            info = page.evaluate("""() => ({
              cards: document.querySelectorAll('#moduleBody .card').length,
              tiles: document.querySelectorAll('#moduleBody .res').length,
              nan: /NaN|undefined|Infinity/.test(document.querySelector('#moduleBody').innerText),
              title: document.title,
            })""")
            errors += len(errs)
            flag = 'ERR' if errs or info['nan'] else 'ok '
            print('%-15s %-34s cards %-3s tiles %-4s %s' % (mid, info['title'][:34], info['cards'], info['tiles'], flag))
            if errs:
                for e in errs[:3]:
                    print('      !', e)

        # screenshots of the two newest pages + the home screen
        page.goto(BASE, wait_until='networkidle')
        page.wait_for_timeout(300)
        page.screenshot(path='%s/status-home.png' % SHOTS, full_page=False)
        page.goto('%s/#m/insulation' % BASE, wait_until='networkidle')
        page.wait_for_timeout(400)
        page.screenshot(path='%s/status-insulation.png' % SHOTS, full_page=True)
        page.goto('%s/#m/hx' % BASE, wait_until='networkidle')
        page.wait_for_timeout(400)
        page.screenshot(path='%s/status-hx.png' % SHOTS, full_page=True)
        browser.close()

    print('\nmodules probed: %d   console/page errors: %d' % (len(MODULES), errors))
    return 1 if errors else 0


if __name__ == '__main__':
    raise SystemExit(main())
