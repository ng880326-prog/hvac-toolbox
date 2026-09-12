from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b = p.chromium.launch(headless=True)
    pg = b.new_page()
    errs = []
    pg.on("pageerror", lambda e: errs.append(str(e)[:100]))
    pg.goto("http://localhost:8080/index.html#m/ducts", wait_until="networkidle")
    pg.wait_for_timeout(500)
    print("cards:", pg.locator("#moduleBody .card").count())
    print("tables:", pg.locator("#moduleBody table").count())
    hdrs = pg.eval_on_selector_all("#moduleBody table tr:first-child", "els => els.map(e => e.innerText.replace(/\\n/g,' | '))")
    for h in hdrs[:4]: print("  hdr:", h[:110])
    print("three-case row:", pg.eval_on_selector_all("#moduleBody table tr", "els => { const r = els.find(e => e.innerText.includes('Case3 Oval')); return r ? r.innerText.replace(/\\n/g,' | ') : 'NOT FOUND'; }")[:130])
    print("console errors:", len(errs))
    pg.screenshot(path="tools/ducts_cards.png", full_page=False)
    b.close()
print("DUCTS CHECK DONE")
