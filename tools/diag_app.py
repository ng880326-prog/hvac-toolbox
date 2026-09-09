from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    errors = []
    page.on("console", lambda m: errors.append(f"[{m.type}] {m.text}") if m.type in ("error", "warning") else None)
    page.on("pageerror", lambda e: errors.append(f"[pageerror] {e}"))
    page.goto("http://localhost:8080", wait_until="networkidle")
    page.wait_for_timeout(800)
    print("HOME title:", page.locator("#heroTitle").inner_text() if page.locator("#heroTitle").count() else "MISSING")
    print("HOME tiles:", page.locator(".tile").count())
    page.goto("http://localhost:8080/index.html#m/psychro", wait_until="networkidle")
    page.wait_for_timeout(800)
    print("MODULE head:", page.locator("#moduleHead h1").count())
    print("MODULE cards:", page.locator("#moduleBody .card").count())
    print("TOC btns:", page.locator(".toc-btn").count(), "| tocBox:", page.locator("#moduleToc").count())
    print("console/page errors:", len(errors))
    for e in errors[:8]:
        print("  ", e[:140])
    page.screenshot(path="tools/diag.png", full_page=False)
    browser.close()
print("DIAG DONE")
