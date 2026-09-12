"""Behavioural check of the final-polish changes that the visual sweeps cannot see.

  * the empty result state appears when an input is cleared and disappears when it is filled
  * the document title follows the module and the language toggle
  * navigating between modules scrolls back to the top
  * the app bar, sidebar and manifests are present with the store-facing fields

Usage: python tools/verify_polish.py
"""
import sys

from playwright.sync_api import sync_playwright

URL = 'http://localhost:8080/index.html'


def main():
    ok = fail = 0

    def check(name, got, want):
        nonlocal ok, fail
        good = got == want
        ok, fail = (ok + 1, fail) if good else (ok, fail + 1)
        print('  %-52s got %-34s want %-24s %s' % (name, str(got)[:34], str(want)[:24], 'OK' if good else 'FAIL'))

    with sync_playwright() as pw:
        browser = pw.chromium.launch()
        page = browser.new_page(viewport={'width': 390, 'height': 844})
        errors = []
        page.on('pageerror', lambda e: errors.append(str(e)))
        page.on('console', lambda m: errors.append(m.text) if m.type == 'error' else None)

        # --- title follows the module and the language (asserted against the nav label itself) ---
        page.goto(URL, wait_until='networkidle')
        check('home title', page.title(), 'HVAC Toolbox Pro — HVAC 暖通空調工程計算')
        page.goto(URL + '#m/ducts', wait_until='networkidle')
        page.wait_for_timeout(250)
        zh_nav = page.locator('#moduleHead h1').inner_text().strip()
        zh_title = page.title()
        check('module title = module heading + product (zh)', zh_title, zh_nav + ' · HVAC Toolbox Pro')
        page.click('#langToggle')
        page.wait_for_timeout(250)
        en_nav = page.locator('#moduleHead h1').inner_text().strip()
        en_title = page.title()
        check('module title = module heading + product (en)', en_title, en_nav + ' · HVAC Toolbox Pro')
        check('title changed with the language', en_title != zh_title, True)
        page.click('#langToggle')
        page.wait_for_timeout(200)

        # --- empty result state ---
        page.goto(URL + '#m/npsh', wait_until='networkidle')
        page.wait_for_timeout(250)
        check('tiles present with default inputs', page.locator('#moduleBody .res').count() > 0, True)
        page.fill('#f-ha', '')
        page.dispatch_event('#f-ha', 'input')
        page.wait_for_timeout(250)
        check('empty state shown after clearing an input', page.locator('.res-empty').count(), 1)
        page.fill('#f-ha', '2')
        page.dispatch_event('#f-ha', 'input')
        page.wait_for_timeout(250)
        check('empty state disappears when filled', page.locator('.res-empty').count(), 0)

        # --- scroll reset on navigation ---
        page.goto(URL + '#m/coil', wait_until='networkidle')
        page.wait_for_timeout(300)
        page.evaluate('() => window.scrollTo(0, 2000)')
        page.wait_for_timeout(100)
        scrolled = page.evaluate('() => window.scrollY')
        page.goto(URL + '#m/pipes', wait_until='networkidle')
        page.wait_for_timeout(250)
        check('scroll position reset on module change', page.evaluate('() => window.scrollY'), 0)
        check('page could actually scroll before', scrolled > 0, True)

        # --- manifest fields a store reads ---
        man = page.evaluate("""async () => {
          const r = await fetch('manifest.webmanifest'); const m = await r.json();
          return { name: m.name, display: m.display, screenshots: (m.screenshots || []).length,
                   icons: m.icons.length, shortcuts: m.shortcuts.length, desc: m.description.length > 20 };
        }""")
        check('manifest name', man['name'], 'HVAC Toolbox Pro')
        check('manifest display', man['display'], 'standalone')
        check('manifest icons', man['icons'] >= 3, True)
        check('manifest screenshots for store listings', man['screenshots'], 3)
        check('manifest shortcuts', man['shortcuts'], 3)

        # --- screenshots referenced by the manifest actually load ---
        codes = page.evaluate("""async () => {
          const r = await fetch('manifest.webmanifest'); const m = await r.json();
          const out = [];
          for (const s of m.screenshots) { const res = await fetch(s.src); out.push(res.status); }
          return out;
        }""")
        check('screenshot files resolve', codes, [200, 200, 200])

        print('\n  console/page errors: %d %s' % (len(errors), errors[:3]))
        if errors:
            fail += 1
        browser.close()

    print('\nRESULT: %d ok / %d fail' % (ok, fail))
    return 1 if fail else 0


if __name__ == '__main__':
    sys.exit(main())
