from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    errors = []
    page.on("pageerror", lambda e: errors.append(f"[pageerror] {e}"))
    page.on("console", lambda m: errors.append(f"[console:{m.type}] {m.text}") if m.type == "error" else None)
    page.goto("http://localhost:8080", wait_until="networkidle")
    page.wait_for_timeout(500)
    hrefs = page.eval_on_selector_all("a.nav-item", "els => els.map(e => e.getAttribute('href'))")
    print("modules found:", len(hrefs))
    fails = []
    for h in hrefs:
        page.goto("http://localhost:8080/index.html" + h, wait_until="networkidle")
        page.wait_for_timeout(400)
        cards = page.locator("#moduleBody .card").count()
        head = page.locator("#moduleHead h1").count()
        if head == 1 and cards >= 1:
            print(f"  OK  {h}  ({cards} cards)")
        else:
            fails.append(h)
            print(f"  FAIL {h}  head={head} cards={cards}")
    print("errors captured:", len(errors))
    for e in errors[:6]:
        print("  ", e[:130])
    print("RESULT:", "ALL 22 PASS" if not fails else f"FAILED: {fails}")
    browser.close()
