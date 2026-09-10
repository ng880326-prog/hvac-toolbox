from playwright.sync_api import sync_playwright

BASE = "http://localhost:8080"
with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    ctx = browser.new_context()
    page = ctx.new_page()
    console_errors, failed_reqs = [], []
    page.on("pageerror", lambda e: console_errors.append(str(e)[:120]))
    page.on("console", lambda m: console_errors.append(m.text[:120]) if m.type == "error" else None)
    page.on("requestfailed", lambda r: failed_reqs.append(f"{r.url} :: {r.failure}"))
    page.on("response", lambda r: failed_reqs.append(f"HTTP {r.status} {r.url}") if r.status >= 400 else None)

    # 1) boot + service worker
    page.goto(BASE, wait_until="networkidle")
    page.wait_for_timeout(1200)
    sw_state = page.evaluate("async () => { const r = await navigator.serviceWorker.getRegistration(); return r ? (r.active ? 'active' : 'registered') : 'none'; }")
    print("1) SW state:", sw_state)

    # 2) privacy page
    r = page.goto(BASE + "/privacy.html", wait_until="domcontentloaded")
    print("2) privacy.html:", r.status)

    # 3) full module sweep (interactions too)
    page.goto(BASE, wait_until="networkidle")
    hrefs = page.eval_on_selector_all("a.nav-item", "els => els.map(e => e.getAttribute('href'))")
    ok = 0
    for h in hrefs:
        page.goto(BASE + "/index.html" + h, wait_until="networkidle")
        page.wait_for_timeout(250)
        cards = page.locator("#moduleBody .card").count()
        tiles = page.locator("#moduleBody .res").count()
        if cards >= 1:
            ok += 1
        else:
            print("   FAIL", h)
    print(f"3) modules: {ok}/{len(hrefs)} render")

    # 4) interaction: type into first field of psychro and read a result
    page.goto(BASE + "/index.html#m/psychro", wait_until="networkidle")
    page.locator("#f-t").fill("30")
    page.wait_for_timeout(400)
    val = page.locator("#moduleBody .res .val").first.inner_text()
    print("4) live calc after input: first result =", val)

    # 5) OFFLINE reload test
    ctx.set_offline(True)
    try:
        page.reload(wait_until="domcontentloaded")
        page.wait_for_timeout(800)
        off_home = page.locator("#heroTitle").count()
        off_tiles = page.locator(".tile").count()
        print(f"5) OFFLINE reload: heroTitle={off_home} tiles={off_tiles}")
    except Exception as e:
        print("5) OFFLINE reload FAILED:", str(e)[:120])
    ctx.set_offline(False)

    print("6) console errors:", len(console_errors))
    for e in console_errors[:5]: print("   ", e)
    print("7) failed/4xx+ requests:", len(failed_reqs))
    for f in failed_reqs[:6]: print("   ", f)
    browser.close()
print("DEEP BROWSER DONE")
