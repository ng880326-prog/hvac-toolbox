import io
p = r"C:\Users\Kyle Ng\OneDrive\Desktop\HVAC_Toolbox_Pro_App\HVAC Tool\app\js\modules\ducts.js"
c = io.open(p, encoding="utf-8").read()
start = "  // Duct sizing\n  root.append(card(T('ductTitle'), T('ductSub'), (body) => {"
end = "  }, {\n    formula: 'λ = (1 / (−1.8·log₁₀(6.9/Re + (k/(3.71·D))^1.11)))²   (Haaland 1983)   ·   ΔP/L = λ·ρ·V²/(2D)',\n    src: 'CIBSE Guide C (workbook ref); ASHRAE Fundamentals 2025 Ch.21 Duct Design; Haaland (1983)',\n  }));"
i = c.find(start); j = c.find(end)
assert i > 0 and j > i, (i, j)
new_block = '''  // Duct sizing — three cases side by side (workbook Case1 round / Case2 rect / Case3 oval)
  root.append(card(T('ductTitle'), L({ en: 'One input set -> round | rectangular | oval compared side by side (workbook Cases 1-3).', zh: '一組輸入 → 圓形｜矩形｜扁圓 並排比較（原表 Case1-3）。' }), (body) => {
    const f = form([
      { key: 'q', label: T('flow'), unit: 'm³/s', def: 1 },
      { key: 'ratio', label: T('aspect'), unit: 'b/a', def: 1.5 },
      { key: 't', label: T('tAir'), unit: '°C', def: 24 },
      { key: 'rh', label: T('rhAir'), unit: '%', def: 50 },
      { key: 'vMax', label: T('vMax'), unit: 'm/s', def: 7 },
      { key: 'pdMax', label: T('pdMax'), unit: 'Pa/m', def: 1.2 },
    ], (st) => draw(st), 'grid3');
    const box = h('div');
    body.append(f.grid, box);

    function sizingDe(q, rho, mu, vMax, pdMax) {
      let de = D.diaForVelocity(q, vMax);
      let r = D.ductFriction(q, de, rho, mu, 0.1);
      if (r.pd > pdMax) {
        let lo = de, hi = de * 10;
        for (let i = 0; i < 60; i++) { const mid = (lo + hi) / 2; if (D.ductFriction(q, mid, rho, mu, 0.1).pd > pdMax) lo = mid; else hi = mid; }
        de = hi; r = D.ductFriction(q, de, rho, mu, 0.1);
      }
      return { de, ...r };
    }
    const r25 = (m) => Math.ceil(m * 1000 / 25) * 25;

    function draw(st) {
      if ([st.q, st.ratio, st.t, st.rh, st.vMax, st.pdMax].some((x) => x == null || x <= 0)) { results(box, []); return; }
      const s = P.state({ t: st.t, rh: st.rh });
      if (!s) { results(box, []); return; }
      const mu = D.sutherland(st.t);
      const { de, v, Re, f: lam, pd } = sizingDe(st.q, s.rho, mu, st.vMax, st.pdMax);
      const vp = D.velocityPressure(s.rho, v);
      const ok = v <= st.vMax + 1e-9 && pd <= st.pdMax + 1e-9;
      const rect = D.rectDimsForDe(de / 1000, st.ratio);
      const oval = D.ovalDimsForDe(de / 1000, st.ratio);
      const arOK = st.ratio <= 4;

      const tbl = h('table', { class: 'pipes-table' });
      tbl.append(h('tr', {}, h('th', {}, ''), h('th', {}, 'Case1 Round'), h('th', {}, 'Case2 Rectangular'), h('th', {}, 'Case3 Oval')));
      const row = (label, a, b, c2) => h('tr', {}, h('td', {}, label), h('td', {}, a), h('td', {}, b), h('td', {}, c2));
      tbl.append(row(L({ en: 'Size', zh: '尺寸' }),
        'Ø' + r25(de) + ' mm',
        r25(rect.a) + ' × ' + r25(rect.b) + ' mm',
        r25(oval.a) + ' × ' + r25(oval.b) + ' mm'));
      tbl.append(row(L({ en: 'Equivalent De', zh: '當量直徑 De' }), de.toFixed(0), (de).toFixed(0), (de).toFixed(0)));
      tbl.append(row(L({ en: 'Velocity', zh: '流速' }), v.toFixed(2), v.toFixed(2), v.toFixed(2)));
      tbl.append(row(L({ en: 'Reynolds', zh: '雷諾數' }), String(Math.round(Re)), String(Math.round(Re)), String(Math.round(Re))));
      tbl.append(row('λ', lam.toFixed(4), lam.toFixed(4), lam.toFixed(4)));
      tbl.append(row(L({ en: 'Friction', zh: '比摩阻' }), pd.toFixed(2), pd.toFixed(2), pd.toFixed(2)));
      tbl.append(row(L({ en: 'Velocity pressure', zh: '動壓' }), vp.toFixed(1), vp.toFixed(1), vp.toFixed(1)));
      tbl.append(row(L({ en: 'Aspect / notes', zh: '長寬比／備註' }),
        L({ en: 'n/a', zh: '不適用' }),
        L({ en: 'ratio ' + st.ratio + (arOK ? ' ✓' : ' >1:4 ✗'), zh: '長寬比 ' + st.ratio + (arOK ? ' ✓' : ' 超 1:4 ✗') }),
        L({ en: 'ratio ' + st.ratio, zh: '長寬比 ' + st.ratio })));
      box.append(tbl);
      box.append(flag(ok ? T('okNote') : T('failNote'), ok ? 'ok' : 'bad'));
      if (!arOK) box.append(flag(L({ en: 'Rectangular aspect ratio exceeds 1:4 — use a larger minor side.', zh: '矩形長寬比超 1:4 — 請加大短邊。' }), 'bad'));
      box.append(h('div', { class: 'note' },
        L({ en: 'Rect/oval sizes are friction-equivalent to the round diameter (Huebscher / CIBSE-type relation), so all three cases carry the same V, Re, λ and Pa/m.', zh: '矩形／扁圓尺寸為圓管之摩擦等值（Huebscher／CIBSE 型關係），故三案流速、雷諾數、λ、Pa/m 相同。' })));
    }
    draw(f.all());
  }, {
    formula: 'λ = (1 / (−1.8·log₁₀(6.9/Re + (k/(3.71·D))^1.11)))²   (Haaland 1983)   ·   ΔP/L = λ·ρ·V²/(2D)',
    src: 'CIBSE Guide C (workbook ref); ASHRAE Fundamentals 2025 Ch.21 Duct Design; Haaland (1983)',
  }));'''
c = c[:i] + new_block + c[j+len(end):]
io.open(p, "w", encoding="utf-8").write(c)
print("ducts card replaced, three-case table:", "Case3 Oval" in c)
