import io
p = r"app\js\modules\coil.js"
c = io.open(p, encoding="utf-8").read()
scn = '''
  // ---- Scenarios side-by-side (AHU | PAU) ----
  root.append(card(L({ en: 'Scenarios Side-by-Side (AHU | PAU)', zh: '情境並排（AHU｜PAU）' }), '', (body) => {
    const col = (name, te, rhe, tl, rhl, v) => {
      const f = form([
        { key: name + 'te', label: name + ' ' + L({ en: 'Entering T', zh: '進風T' }), unit: '°C', def: te },
        { key: name + 'rhe', label: name + ' ' + L({ en: 'Entering RH', zh: '進風RH' }), unit: '%', def: rhe },
        { key: name + 'tl', label: name + ' ' + L({ en: 'Leaving T', zh: '出風T' }), unit: '°C', def: tl },
        { key: name + 'rhl', label: name + ' ' + L({ en: 'Leaving RH', zh: '出風RH' }), unit: '%', def: rhl },
        { key: name + 'v', label: name + ' ' + T('flow'), unit: 'm³/s', def: v },
        { key: name + 'dt', label: name + ' ' + T('dtW'), unit: '°C', def: 5 },
      ], () => drawScn(), 'grid2');
      return f;
    };
    const fa = col('AHU', 27, 55, 13, 95, 2.5), fp = col('PAU', 35, 60, 17, 95, 1.2);
    const box = h('div');
    body.append(fa.grid, fp.grid, box);
    function scnResult(f) {
      const s1 = P.state({ t: f.get('te') ?? f.get('AHUte') ?? f.get('PAUte'), rh: f.get('rhe') ?? f.get('AHUrhe') ?? f.get('PAUrhe') });
      return null;
    }
    function drawScn() {
      const out = [];
      for (const [name, f] of [['AHU', fa], ['PAU', fp]]) {
        const g = (k) => f.get(name + k);
        const s1 = P.state({ t: g('te'), rh: g('rhe') });
        const s2 = P.state({ t: g('tl'), rh: g('rhl') });
        if (!s1 || !s2) continue;
        const m = g('v') * s1.rho;
        const qt = m * (s1.h - s2.h);
        const qs = m * 1.006 * (s1.t - s2.t);
        const shr = qt > 0 ? qs / qt : 0;
        out.push(res(name + ' Qt', qt, 'kW', { digits: 1, big: true }));
        out.push(res(name + ' SHR', shr, '—', { digits: 3 }));
        out.push(res(name + ' CHW', qt / (4.186789 * g('dt')), 'L/s', { digits: 2 }));
        out.push(res(name + ' Cond', Math.max(0, m * (s1.w - s2.w)) * 3600, 'kg/h', { digits: 1 }));
      }
      results(box, out);
    }
    drawScn();
  }));

'''
anchor = "  // ---- Card B2: water temperature & duct design ----"
assert anchor in c
c = c.replace(anchor, scn + anchor, 1)
io.open(p, "w", encoding="utf-8").write(c)
print("scenarios inserted:", c.count('Scenarios Side-by-Side'))
