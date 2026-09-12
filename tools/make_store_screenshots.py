"""Generate store screenshots for the PWA manifest (PWABuilder / Partner Center / Play listing).

Writes two captures into app/screenshots/: a phone-sized one (1080x1920 for store listings) and a
wide desktop one, both of the app in its own UI (no browser chrome). Regenerate whenever the UI moves.

Usage: python tools/make_store_screenshots.py
"""
import os

from playwright.sync_api import sync_playwright

OUT = os.path.join('app', 'screenshots')
SHOTS = [
    # (module id, viewport, output name, scale)
    ('home', (390, 844), 'shot-phone.png', 2.77),
    ('psychro', (390, 844), 'shot-phone-psychro.png', 2.77),
    ('wheel', (1280, 800), 'shot-wide.png', 1.0),
]


def main():
    os.makedirs(OUT, exist_ok=True)
    with sync_playwright() as pw:
        browser = pw.chromium.launch()
        for mid, (w, h), name, scale in SHOTS:
            page = browser.new_page(viewport={'width': w, 'height': h}, device_scale_factor=scale)
            url = 'http://localhost:8080/index.html' + ('' if mid == 'home' else '#m/' + mid)
            page.goto(url, wait_until='networkidle')
            page.wait_for_timeout(600)
            path = os.path.join(OUT, name)
            page.screenshot(path=path)          # viewport-sized, no full_page
            size = os.path.getsize(path)
            real = page.evaluate('() => [window.innerWidth, window.innerHeight, devicePixelRatio]')
            print('%-24s %sx%s @%sx -> %s (%d bytes)'
                  % (name, real[0], real[1], real[2], path, size))
            page.close()
        browser.close()
    print('screenshots written to %s' % OUT)
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
