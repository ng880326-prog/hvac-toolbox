"""End-to-end check of the preset editor: edit -> persist across reload -> apply -> manage.

Everything runs against a real browser and a real localStorage, because the whole point of the feature
is that the user's own company conditions survive a reload. The check also confirms the applied preset
actually reaches the module inputs (not just the storage).
"""
import sys

from playwright.sync_api import sync_playwright

URL = 'http://localhost:8080/#m/coil'
KEY = 'hvac-toolbox-presets-v1'


def main():
    ok = fail = 0

    def check(name, got, want):
        nonlocal ok, fail
        good = got == want
        ok, fail = (ok + 1, fail) if good else (ok, fail + 1)
        print('  %-46s got %-28s want %-28s %s' % (name, repr(got)[:28], repr(want)[:28], 'OK' if good else 'FAIL'))

    with sync_playwright() as pw:
        browser = pw.chromium.launch()
        ctx = browser.new_context(viewport={'width': 1440, 'height': 1000})
        page = ctx.new_page()
        errors = []
        page.on('pageerror', lambda e: errors.append(str(e)))
        page.on('console', lambda m: errors.append(m.text) if m.type == 'error' else None)

        # Start from a clean slate so the run is reproducible.
        page.goto(URL, wait_until='networkidle')
        page.evaluate("k => localStorage.removeItem(k)", KEY)
        page.reload(wait_until='networkidle')
        page.wait_for_selector('.preset-actions', timeout=15000)

        def preset_state():
            return page.evaluate("""k => {
              const raw = JSON.parse(localStorage.getItem(k) || '[]');
              return {
                count: raw.length,
                ids: raw.map(p => p.id),
                names: raw.map(p => p.name.zh || p.name.en),
                first: raw[0] ? raw[0].values : null,
                selectOptions: [...document.querySelectorAll('#preset-pick option')].map(o => o.textContent.trim()),
                selected: document.querySelector('#preset-pick')?.value,
              };
            }""", KEY)

        print('initial state')
        st = preset_state()
        check('factory presets stored on first render', st['count'], 3)
        check('select lists them', len(st['selectOptions']), 3)
        check('CHW pair seeded 7 / 12.5', [st['first']['chws'], st['first']['chwr']], [7, 12.5])
        check('HWS pair seeded 60 / 50', [st['first']['hws'], st['first']['hwr']], [60, 50])
        check('return air seeded 24 / 50', [st['first']['rat'], st['first']['rarh']], [24, 50])

        # --- derived values must follow the pairs, never contradict them -------------------
        # The preset editor namespaces its DOM ids ('preset-') and its derived box has its own class,
        # so these tiles are unambiguous even though the coil module reuses the same field keys.
        derived = page.eval_on_selector_all('.preset-derived .res',
                                            """els => els.map(e => [e.querySelector('.lbl').textContent.trim(),
                                                                   e.querySelector('.val').textContent.trim()])""")
        dmap = dict(derived)
        check('derived CHW ΔT shown', dmap.get('冷媒水溫差'), '5.50°C')
        check('derived HWS ΔT shown', dmap.get('熱媒水溫差'), '10.00°C')

        # --- edit a field, reload, and confirm it survived ---------------------------------
        oa_st = page.query_selector('#preset-oaSt')
        oa_st.fill('33')
        oa_st.dispatch_event('input')
        page.wait_for_timeout(150)
        page.reload(wait_until='networkidle')
        page.wait_for_selector('#preset-oaSt', timeout=15000)
        check('edit survives reload', page.input_value('#preset-oaSt'), '33')
        check('stored value updated', preset_state()['first']['oaSt'], 33)

        # --- apply: the module inputs must follow the preset ------------------------------
        page.click('.preset-actions .btn-primary')
        page.wait_for_timeout(200)
        applied = page.evaluate("""() => {
          const v = id => document.querySelector('#f-' + id)?.value;
          return { oaSt: v('oaSt'), rat: v('rat'), chws: v('tws'), chwr: v('twr'), dtW: v('dtW') };
        }""")
        check('apply pushes oaSt into design conditions', applied['oaSt'], '33')
        check('apply pushes CHW supply', applied['chws'], '7')
        check('apply derives coil CHW ΔT from the pair', applied['dtW'], '5.5')

        # --- duplicate / delete / restore -------------------------------------------------
        btns = page.query_selector_all('.preset-actions .btn')
        btns[2].click()   # duplicate
        page.wait_for_timeout(150)
        check('duplicate adds a preset', preset_state()['count'], 4)
        btns = page.query_selector_all('.preset-actions .btn')
        btns[3].click()   # delete the selected (the copy)
        page.wait_for_timeout(150)
        check('delete removes it again', preset_state()['count'], 3)
        btns = page.query_selector_all('.preset-actions .btn')
        btns[4].click()   # restore factory
        page.wait_for_timeout(200)
        st = preset_state()
        check('restore factory resets the count', st['count'], 3)
        check('restore factory resets the values', st['first']['oaSt'], 35)

        # --- a hand-edited / corrupt store must not break the page ------------------------
        page.evaluate("k => localStorage.setItem(k, JSON.stringify([{id:'x',name:'broken',values:{oaSt:'NaN'}}]))", KEY)
        page.reload(wait_until='networkidle')
        page.wait_for_selector('.preset-actions', timeout=15000)
        check('corrupt store falls back to a usable preset', page.eval_on_selector_all('#preset-pick option', 'o => o.length'), 1)
        check('corrupt store still renders numbers', page.input_value('#f-oaSt') != '', True)
        page.evaluate("k => localStorage.removeItem(k)", KEY)

        page.reload(wait_until='networkidle')
        page.wait_for_selector('.preset-actions', timeout=15000)
        page.screenshot(path='docs/verification/presets_desktop.png', full_page=True)
        page.set_viewport_size({'width': 390, 'height': 844})
        page.wait_for_timeout(300)
        page.screenshot(path='docs/verification/presets_mobile.png', full_page=True)

        print('\n  console/page errors: %d %s' % (len(errors), errors[:3]))
        if errors:
            fail += 1
        browser.close()

    print('\nRESULT: %d ok / %d fail' % (ok, fail))
    return 1 if fail else 0


if __name__ == '__main__':
    sys.exit(main())
