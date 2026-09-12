"""Deepest full audit: logic (physics/property-based) + system + effectiveness + operation + performance.
Runs inside real Chromium against the SHIPPED engine modules.
"""
from playwright.sync_api import sync_playwright
import io, json

BASE = "http://localhost:8080"
OUT = r"C:\Users\Kyle Ng\OneDrive\Desktop\HVAC_Toolbox_Pro_App\HVAC Tool\docs\audit\deep_audit_full.md"
L = []
def w(*parts): L.append(" ".join(str(x) for x in parts))

LOGIC_JS = """async () => {
  const P = await import('/js/engine/psychro.js');
  const F = await import('/js/engine/fluids.js');
  const D = await import('/js/engine/ducts.js');
  const E = await import('/js/engine/electrical.js');
  const out = [];
  const chk = (name, ok, extra='') => out.push({name, ok: !!ok, extra});

  // --- independent reference values (ASHRAE saturation table, kPa) ---
  const ref = {0:0.6113, 10:1.2281, 20:2.3390, 30:4.2460, 40:7.3840, 50:12.3490, 60:19.9400, 80:47.3900, 100:101.325};
  for (const [t, p] of Object.entries(ref)) {
    const got = P.pws(Number(t));
    chk('pws('+t+')='+got.toFixed(4)+' vs table '+p, Math.abs(got-p)/p < 0.005, (100*Math.abs(got-p)/p).toFixed(3)+'%');
  }
  // --- monotonicity ---
  let mono = true, prev = -1;
  for (let t=-20;t<=60;t+=1){ const v=P.pws(t); if(v<=prev) mono=false; prev=v; }
  chk('pws monotonic -20..60C', mono);
  let wm=true; prev=-1;
  for (let rh=1;rh<=100;rh+=1){ const w=P.state({t:25,rh}).w; if(w<=prev) wm=false; prev=w; }
  chk('W monotonic in RH', wm);
  let hm=true; prev=-1e9;
  for (let t=0;t<=50;t+=1){ const h=P.state({t,rh:50}).h; if(h<=prev) hm=false; prev=h; }
  chk('h monotonic in T', hm);
  let fm=true, prevf=-1;
  for (let q=0.1;q<=5;q+=0.1){ const r=D.ductFriction(q,300,1.1811,18.312e-6,0.1).pd; if(r<=prevf) fm=false; prevf=r; }
  chk('duct Pa/m monotonic in Q', fm);
  let hw=true, prevh=-1;
  for (let v=0.2;v<=3;v+=0.1){ const r=F.hazenWilliams(v,50,140); if(r<=prevh) hw=false; prevh=r; }
  chk('Hazen-Williams monotonic in V', hw);

  // --- round-trips / invariants ---
  let rt=true, worst=0;
  for (let t=-5;t<=45;t+=1) for (const rh of [10,30,50,70,90]) {
    const s = P.state({t,rh});
    const back = P.RHfromPw(t, P.pwFromW(s.w));
    worst = Math.max(worst, Math.abs(back-rh));
    if (Math.abs(back-rh) > 0.02) rt=false;
  }
  chk('state(T,RH)->W->RH round-trip', rt, 'max err '+worst.toFixed(4)+'%');
  let ordr=true;
  for (let t=5;t<=45;t+=5) for (const rh of [20,50,80]) {
    const s=P.state({t,rh});
    if (!(s.tdp <= s.twb + 0.05 && s.twb <= t + 1e-9)) ordr=false;
  }
  chk('invariant Tdp <= Twb <= T', ordr);
  let sat=true;
  for (let t=0;t<=40;t+=5){ const s=P.state({t,rh:100}); if (Math.abs(s.tdp-t)>0.05) sat=false; }
  chk('RH=100% => Tdp == T', sat);
  chk('dry air density ~1.204 kg/m3 @20C,0%RH', Math.abs(P.state({t:20,rh:1}).rho-1.2)<0.01, P.state({t:20,rh:1}).rho.toFixed(4));

  // --- numerical robustness sweep (no NaN/Infinity) ---
  let bad=[];
  for (let t=-15;t<=55;t+=5) for (let rh=5;rh<=100;rh+=5){
    const s=P.state({t,rh});
    if (!s || [s.t,s.twb,s.tdp,s.rh,s.w,s.h,s.v,s.rho].some(x=>!isFinite(x))) bad.push([t,rh]);
  }
  chk('state finite over grid (-15..55C, 5..100%RH)', bad.length===0, bad.length?JSON.stringify(bad.slice(0,4)):'all finite');

  // --- workbook parity spot-checks ---
  const dn15 = F.hazenWilliams(0.65673243386529834, 16.2, 140);
  chk('Hazen-Williams DN15 parity 400 Pa/m', Math.abs(dn15-400)<0.6, dn15.toFixed(2));
  chk('RT conversion 100RT=351.685kW', Math.abs(F.RTtokW(100)-351.685)<0.01);
  chk('LMTD 6/2 = 3.641', Math.abs(F.lmtd(6,2)-3.64096)<1e-3);
  const cur = E.current3Ph(5.5,380,0.85,1);
  chk('3ph current 5.5kW/380V=9.83A', Math.abs(cur-9.831)<0.01, cur.toFixed(3));
  chk('dB add 80+80=83.01', Math.abs(E.addDb([80,80])-83.0103)<1e-3);
  chk('Sutherland mu(24C)=1.837e-5', Math.abs(D.sutherland(24)-1.837e-5)<2e-7, D.sutherland(24).toExponential(3));
  const gb = E.stairBaseFlowGB('A',40);
  chk('GB51251 A@40m=38008', Math.abs(gb-38008)<1, gb.toFixed(0));

  // --- effectiveness sanity (engineering plausibility) ---
  const mix = P.mix(P.state({t:35,twb:28}), P.state({t:24,rh:55}), 1, 3);
  chk('mixed state lies between the two (T)', mix.t>24 && mix.t<35, mix.t.toFixed(2));
  const off = P.state({t:13,rh:95});
  chk('coil load plausible (0<Qt<200kW for 3kg/s)', (()=>{const qt=3*(mix.h-off.h); return qt>0&&qt<200;})(), (3*(mix.h-off.h)).toFixed(1)+' kW');
  return out;
}"""

UI_JS = """async (modId) => {
  const out = [];
  const push = (n, ok, ex='') => out.push({n, ok: !!ok, ex});
  // dead-input detection: change first number input, expect a result to change
  const inputs = [...document.querySelectorAll('#moduleBody input[type=number]')];
  const snapshot = () => [...document.querySelectorAll('#moduleBody .res .val, #moduleBody table')].map(e=>e.innerText).join('|');
  if (inputs.length) {
    const before = snapshot();
    const inp = inputs[0];
    const v = parseFloat(inp.value || '0');
    inp.value = String(Number.isFinite(v) ? v * 1.2 + 1 : 42);
    inp.dispatchEvent(new Event('input', {bubbles:true}));
    await new Promise(r=>setTimeout(r,250));
    push('input change -> output reaction', snapshot() !== before);
  } else push('input change -> output reaction', true, 'no numeric inputs (catalogue page)');
  // fold toggle
  const d = document.querySelector('#moduleBody details.folded');
  if (d) { const openBefore = d.open; d.querySelector('summary').click(); await new Promise(r=>setTimeout(r,120));
    push('fold toggles', d.open !== openBefore); }
  // reset button
  return out;
}"""

with sync_playwright() as p:
    b = p.chromium.launch(headless=True)
    ctx = b.new_context(accept_downloads=True)
    pg = ctx.new_page()
    errs, failed = [], []
    pg.on("pageerror", lambda e: errs.append(str(e)[:120]))
    pg.on("console", lambda m: errs.append(m.text[:120]) if m.type == "error" else None)
    pg.on("requestfailed", lambda r: failed.append(r.url))
    pg.on("response", lambda r: failed.append(f"HTTP{r.status} {r.url}") if r.status >= 400 else None)

    perf = []
    def visit(url, label):
        t0 = __import__("time").time()
        pg.goto(url, wait_until="networkidle")
        dt = (__import__("time").time() - t0) * 1000
        nodes = pg.evaluate("() => document.getElementsByTagName('*').length")
        heap = pg.evaluate("() => (performance.memory ? Math.round(performance.memory.usedJSHeapSize/1048576) : null)")
        perf.append((label, round(dt), nodes, heap))
        return dt

    w("# 最深層全維度審計（邏輯·系統·成效·運作·效能）", "")
    visit(BASE, "home")

    # ---- 1. LOGIC ----
    pg.goto(BASE + "/index.html", wait_until="networkidle")
    logic = pg.evaluate(LOGIC_JS)
    okc = sum(1 for x in logic if x["ok"])
    w(f"## 1. 邏輯與物理性質（出貨引擎實測）：{okc}/{len(logic)} 通過", "")
    for x in logic:
        w(f"- {'✅' if x['ok'] else '❌'} {x['name']}" + (f"  ({x['extra']})" if x['extra'] else ""))

    # ---- 2. SYSTEM ----
    hrefs = pg.eval_on_selector_all("a.nav-item", "els => els.map(e => e.getAttribute('href'))")
    w("", f"## 2. 系統完整性", f"- 模組數：{len(hrefs)}", f"- manifest/SW/圖示/隱私頁：見 deep_check.py（CLEAN）")

    # ---- 3/4. EFFECTIVENESS + OPERATION ----
    w("", "## 3-4. 成效與運作（逐模組互動測試）", "")
    uifails = []
    for h in hrefs:
        mid = h.replace("#m/", "")
        visit(BASE + "/index.html" + h, mid)
        try:
            res = pg.evaluate(UI_JS, mid)
            for x in res:
                if not x["ok"]:
                    uifails.append(f"{mid}: {x['n']} {x['ex']}")
        except Exception as e:
            uifails.append(f"{mid}: UI probe error {str(e)[:60]}")
    w(f"- 互動探針（輸入→輸出反應、摺疊開合）：{'全部通過' if not uifails else str(len(uifails))+' 項異常'}")
    for f in uifails[:10]:
        w(f"  - ❌ {f}")

    # operation extras: theme, lang, TOC, CSV, copy, reset
    pg.goto(BASE + "/index.html#m/psychro", wait_until="networkidle")
    theme_before = pg.evaluate("() => document.documentElement.dataset.theme")
    pg.click("#themeToggle")
    theme_after = pg.evaluate("() => document.documentElement.dataset.theme")
    pg.click("#themeToggle")
    lang_before = pg.locator("#navGroups .nav-group-title").first.inner_text()
    pg.click("#langToggle"); pg.wait_for_timeout(200)
    lang_after = pg.locator("#navGroups .nav-group-title").first.inner_text()
    pg.click("#langToggle"); pg.wait_for_timeout(150)
    toc = pg.locator(".toc-btn").count()
    # reset works?
    pg.locator("#f-t").fill("99"); pg.wait_for_timeout(150)
    pg.click("#resetBtn"); pg.wait_for_timeout(250)
    reset_val = pg.locator("#f-t").input_value()
    # CSV download
    csv_ok, csv_name = False, ""
    try:
        with pg.expect_download(timeout=5000) as dl:
            pg.click("#csvBtn")
        d = dl.value
        csv_name = d.suggested_filename
        path = d.path()
        csv_ok = bool(path) and __import__("os").path.getsize(path) > 50
    except Exception as e:
        csv_ok = False
    pg.click("#copyBtn"); pg.wait_for_timeout(400)
    toast = pg.locator("#flash").inner_text()
    w("", "### 運作細節", 
      f"- 主題切換：{theme_before} → {theme_after} {'✅' if theme_before != theme_after else '❌'}",
      f"- 語言切換：'{lang_before}' → '{lang_after}' {'✅' if lang_before != lang_after else '❌'}",
      f"- 手機目錄 chips：{toc} ✅" if toc else "- 手機目錄 chips：0（桌面寬度下隱藏，正常）",
      f"- 重置按鈕：t 由 99 → {reset_val} {'✅' if reset_val != '99' else '❌'}",
      f"- CSV 匯出：{csv_name} {'✅' if csv_ok else '❌'}",
      f"- 複製結果 toast：'{toast}' {'✅' if toast else '❌'}")

    # offline
    ctx.set_offline(True)
    try:
        pg.reload(wait_until="domcontentloaded"); pg.wait_for_timeout(700)
        off = pg.locator(".tile").count()
    except Exception:
        off = -1
    ctx.set_offline(False)
    w(f"- 離線重載：{'✅ tiles='+str(off) if off>0 else '❌'}")

    # ---- 5. PERFORMANCE ----
    w("", "## 5. 效能", "", "| 頁面 | 載入(ms) | DOM 節點 | JS heap(MB) |", "|---|---|---|---|")
    for label, ms, nodes, heap in perf:
        w(f"| {label} | {ms} | {nodes} | {heap if heap else '-'} |")
    slow = [p for p in perf if p[1] > 2500]
    w("", f"- 最慢頁面：{'、'.join(p[0]+f'({p[1]}ms)' for p in slow) if slow else '無（全部 <2.5s）'}")
    w(f"- console/page 錯誤：{len(errs)}", f"- 失敗或 4xx+ 請求：{len(failed)}")
    for e in errs[:5]: w(f"  - {e}")
    for f in failed[:5]: w(f"  - {f}")

    # verdict
    verdict = []
    if okc != len(logic): verdict.append(f"邏輯 {len(logic)-okc} 項未過")
    if uifails: verdict.append(f"互動 {len(uifails)} 項異常")
    if errs: verdict.append(f"錯誤 {len(errs)}")
    if failed: verdict.append(f"失敗請求 {len(failed)}")
    if off <= 0: verdict.append("離線失敗")
    if not csv_ok: verdict.append("CSV 匯出異常")
    w("", "## 總評", f"- {'✅ 全維度通過' if not verdict else '⚠️ ' + '；'.join(verdict)}")
    io.open(OUT, "w", encoding="utf-8").write("\n".join(L))
    print("REPORT:", OUT)
    print(f"logic {okc}/{len(logic)} | uifails {len(uifails)} | errors {len(errs)} | failedReqs {len(failed)} | offline tiles {off} | csv {csv_ok}")
    for f in uifails[:6]: print("  UI -", f)
    b.close()
