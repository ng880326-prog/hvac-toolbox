import io
p = r"app\js\modules\psychro.js"
c = io.open(p, encoding="utf-8").read()
dual = '''
  // ---- Dual air comparison (original Air1/Air2 columns) ----
  root.append(card(L({ en: 'Dual Air Comparison (Air1 / Air2)', zh: '雙空氣比較（Air1／Air2）' }), '', (body) => {
    const f1 = form([
      { key: 'a1t', label: 'Air1 ' + T('t'), unit: '°C', def: 24.6 },
      { key: 'a1rh', label: 'Air1 ' + T('rh'), unit: '%', def: 50 },
    ], () => drawDual(), 'grid2');
    const f2 = form([
      { key: 'a2t', label: 'Air2 ' + T('t'), unit: '°C', def: 10 },
      { key: 'a2rh', label: 'Air2 ' + T('rh'), unit: '%', def: 40 },
    ], () => drawDual(), 'grid2');
    const box = h('div');
    body.append(f1.grid, f2.grid, box);
    function drawDual() {
      const s1 = P.state({ t: f1.get('a1t'), rh: f1.get('a1rh') });
      const s2 = P.state({ t: f2.get('a2t'), rh: f2.get('a2rh') });
      if (!s1 || !s2) { results(box, []); return; }
      const rows = [
        ['tdb °C', s1.t, s2.t], ['twb °C', s1.twb, s2.twb], ['tdp °C', s1.tdp, s2.tdp],
        ['RH %', s1.rh, s2.rh], ['W kg/kg', s1.w, s2.w], ['h kJ/kg', s1.h, s2.h], ['v m3/kg', s1.v, s2.v], ['rho kg/m3', s1.rho, s2.rho],
      ];
      const tbl = h('table', { class: 'pipes-table' });
      tbl.append(h('tr', {}, h('th', {}, ''), h('th', {}, 'Air1'), h('th', {}, 'Air2'), h('th', {}, 'D (Air2-Air1)')));
      for (const r of rows) tbl.append(h('tr', {}, h('td', {}, r[0]), h('td', {}, r[1].toFixed(3)), h('td', {}, r[2].toFixed(3)), h('td', {}, (r[2] - r[1]).toFixed(3))));
      box.append(tbl);
      box.append(h('div', { class: 'note' }, L({ en: 'Same layout as the workbook Psychrometric Chart sheet (two states side by side).', zh: '與原表 Psychrometric Chart 同版面（兩狀態並排）。' })));
    }
    drawDual();
  }));

'''
anchor = '  // ---- Section 2: mixing ----'
assert anchor in c, 'anchor mixing not found'
c = c.replace(anchor, dual + anchor, 1)
mixEnd = "\n  // ---- Section 3: coil load ----"
assert mixEnd in c, 'mix end not found'
c = c.replace(mixEnd, ", { collapsed: true }));" + mixEnd, 1)
procEnd = "  }));\n}"
assert procEnd in c, 'proc end not found'
c = c.replace(procEnd, "  }, { collapsed: true }));\n}", 1)
io.open(p, "w", encoding="utf-8").write(c)
print("folded count:", c.count("collapsed: true"))
