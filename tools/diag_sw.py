from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b = p.chromium.launch(headless=True)
    pg = b.new_page()
    pg.goto("http://localhost:8080", wait_until="networkidle")
    pg.wait_for_timeout(600)
    print("secure context:", pg.evaluate("() => window.isSecureContext"))
    print("sw API:", pg.evaluate("() => 'serviceWorker' in navigator"))
    print("readyState:", pg.evaluate("() => document.readyState"))
    res = pg.evaluate("""async () => {
      try { const r = await navigator.serviceWorker.register('./sw.js'); return 'OK scope=' + r.scope; }
      catch (e) { return 'ERR ' + e.name + ': ' + e.message; }
    }""")
    print("manual register:", res)
    pg.wait_for_timeout(1200)
    print("state after:", pg.evaluate("async () => { const r = await navigator.serviceWorker.getRegistration(); return r ? (r.active?'active':r.installing?'installing':'waiting') : 'none'; }"))
    b.close()
