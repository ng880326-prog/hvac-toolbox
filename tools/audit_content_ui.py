"""Detailed content + UI audit -> docs/audit/content_ui_audit.md"""
from playwright.sync_api import sync_playwright
import io, os

BASE = "http://localhost:8080"
OUT = r"C:\Users\Kyle Ng\OneDrive\Desktop\HVAC_Toolbox_Pro_App\HVAC Tool\docs\audit\content_ui_audit.md"

EXTRACT = """() => {
  const cards = [...document.querySelectorAll('#moduleBody .card')].map(c => {
    const h = c.querySelector('h3,h2');
    const inputs = [...c.querySelectorAll('input[type=number],input:not([type])')].map(i => ({
      id: i.id, label: (c.querySelector('label[for="'+i.id+'"]')||{}).textContent || '',
      unit: (i.closest('.ctl')||c).querySelector('.unit') ? (i.closest('.ctl')||c).querySelector('.unit').textContent : '',
      def: i.value
    }));
    const selects = [...c.querySelectorAll('select')].map(s => ({ id: s.id, opts: s.options.length }));
    const checks = [...c.querySelectorAll('input[type=checkbox]')];
    const segs = [...c.querySelectorAll('.seg')].map(s => s.querySelectorAll('button').length);
    const ress = [...c.querySelectorAll('.res')].map(r => ({
      l: (r.querySelector('.lbl')||{}).textContent || '', v: (r.querySelector('.val')||{}).textContent || ''
    }));
    const tables = [...c.querySelectorAll('table')].map(t => ({ rows: t.rows.length, cols: t.rows[0] ? t.rows[0].cells.length : 0,
      headers: t.rows[0] ? [...t.rows[0].cells].map(x=>x.textContent.trim()) : [] }));
    return {
      title: h ? h.textContent.trim() : '(no title)',
      collapsed: c.tagName === 'DETAILS' || !!c.closest('details'),
      inputs, selects, checks: checks.length, segs,
      results: ress, tables,
      formula: !!(c.querySelector('.formula')),
      src: (c.querySelector('.note code')||{}).textContent || '',
      notes: [...c.querySelectorAll('.note')].length
    };
  });
  return {
    title: (document.querySelector('#moduleHead h1')||{}).textContent || '',
    cards,
    toc: document.querySelectorAll('.toc-btn').length,
    h1: document.querySelectorAll('h1').length,
    folded: document.querySelectorAll('details.folded').length
  };
}"""

with sync_playwright() as p:
    b = p.chromium.launch(headless=True)
    pg = b.new_page()
    pg.goto(BASE, wait_until="networkidle")
    hrefs = pg.eval_on_selector_all("a.nav-item", "els => els.map(e => e.getAttribute('href'))")
    lines = ["# 內容與 UI 詳細審計（自動生成）", "", f"模組數：{len(hrefs)}", ""]
    issues = []
    tot_inputs = tot_results = tot_tablesles = tot_rows = 0
    for h in hrefs:
        pg.goto(BASE + "/index.html" + h, wait_until="networkidle")
        pg.wait_for_timeout(200)
        d = pg.evaluate(EXTRACT)
        mid = h.replace("#m/", "")
        n_in = sum(len(c["inputs"]) for c in d["cards"])
        n_res = sum(len(c["results"]) for c in d["cards"])
        n_tab = sum(len(c["tables"]) for c in d["cards"])
        n_rows = sum(t["rows"] for c in d["cards"] for t in c["tables"])
        tot_inputs += n_in; tot_results += n_res; tot_tablesles += n_tab; tot_rows += n_rows
        lines.append(f"## {mid} — {d['title']}  (cards {len(d['cards'])} · inputs {n_in} · results {n_res} · tables {n_tab}/{n_rows} rows)")
        for c in d["cards"]:
            tag = "🔽" if c["collapsed"] else "  "
            hdr = f"- {tag} **{c['title']}** — in {len(c['inputs'])}, sel {len(c['selects'])}, chk {c['checks']}, seg {c['segs']}, res {len(c['results'])}, notes {c['notes']}{', formula' if c['formula'] else ''}"
            lines.append(hdr)
            if c["src"]:
                lines.append(f"    - src: {c['src'][:110]}")
            for t in c["tables"]:
                lines.append(f"    - table: {t['rows']}×{t['cols']} hdr=[{', '.join(t['headers'][:6])}]")
            # UI checks
            for i in c["inputs"]:
                if not i["label"].strip():
                    issues.append(f"{mid}: input #{i['id']} 無標籤")
                if not i["unit"].strip():
                    issues.append(f"{mid}: input #{i['id']} ({i['label'][:22]}) 無單位")
            for r in c["results"]:
                if r["v"].strip() in ("—", ""):
                    issues.append(f"{mid}: 結果「{r['l'][:22]}」預設為空")
            for s in c["selects"]:
                if s["opts"] == 0:
                    issues.append(f"{mid}: select #{s['id']} 無選項")
        lines.append("")
    lines += ["## 全局 UI 指標", f"- 每頁 h1 數：{d['h1']}", f"- 目錄 chips：{d['toc']}（手機顯示）",
              f"- 摺疊卡（本頁 {d['folded']}）", "",
              "## 匯總", f"- 欄位總數 {tot_inputs}｜結果瓦片 {tot_results}｜表格 {tot_tablesles}（{tot_rows} 列）", "",
              f"## 潛在 UI 待改進：{len(issues)}"]
    agg = {}
    for i in issues:
        k = i.split(":")[1].strip()[:40]
        agg[k] = agg.get(k, 0) + 1
    for k, v in sorted(agg.items(), key=lambda x: -x[1])[:25]:
        lines.append(f"- ({v}×) {k}")
    io.open(OUT, "w", encoding="utf-8").write("\n".join(lines))
    print("REPORT:", OUT)
    print("modules:", len(hrefs), "| inputs:", tot_inputs, "| results:", tot_results, "| tables:", tot_tables, "rows:", tot_rows)
    print("ui issues:", len(issues))
    for i in issues[:12]:
        print("  -", i)
    b.close()
