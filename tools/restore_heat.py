import io
p = r"C:\Users\Kyle Ng\OneDrive\Desktop\HVAC_Toolbox_Pro_App\HVAC Tool\app\js\modules\coil.js"
c = io.open(p, encoding="utf-8").read()
block = '''
  // 7) Preheat / Reheat / Steam / Humidification (folded — workbook Coil sheet block)
  const hBox = h('div');
  const heatCard = card(L({ en: 'Preheat / Reheat / Steam / Humidification', zh: '預熱／再熱／蒸汽／加濕' }), '', (body) => {
    const f = form([
      { key: 'preT', label: L({ en: 'Preheat target (OA)', zh: '預熱目標（新風）' }), unit: '°C', def: 16 },
      { key: 'reT', label: L({ en: 'Reheat target', zh: '再熱目標' }), unit: '°C', def: 20 },
      { key: 'hTur', label: L({ en: 'Humidify target W', zh: '加濕目標含濕量' }), unit: 'kg/kg', def: 0.007 },
      { key: 'hfg', label: L({ en: 'Steam hfg', zh: '蒸汽汽化熱 hfg' }), unit: 'kJ/kg', def: 2257 },
    ], drawH, 'grid4');
    body.append(f.grid, hBox);
    function drawH(st) {
      if ([st.preT, st.reT, st.hTur, st.hfg].some((x) => x == null)) { results(hBox, []); return; }
      const sOW = P.state({ t: S.oaWt, rh: S.oaWrh });
      if (!sOW || st.hfg <= 0) { results(hBox, []); return; }
      const m = S.vs * S.rho, mO = S.vs * S.fra * S.rho;
      const qPre = mO * 1.006 * (st.preT - S.oaWt);
      const qRe = m * 1.006 * (st.reT - S.ts);
      results(hBox, [
        res(L({ en: 'Preheat load', zh: '預熱負荷' }), qPre, 'kW', { digits: 1 }),
        res(L({ en: 'Steam flow', zh: '蒸汽量' }), qPre > 0 ? qPre * 3600 / st.hfg : 0, 'kg/h', { digits: 0 }),
        res(L({ en: 'Reheat load', zh: '再熱負荷' }), qRe, 'kW', { digits: 1 }),
        res(L({ en: 'Humidification', zh: '加濕量' }), Math.max(0, mO * (st.hTur - sOW.w) * 3600), 'kg/h', { digits: 1, big: true }),
      ]);
    }
    drawH(f.all());
    redraws.push(() => drawH(f.all()));
  }, { src: 'Coil sheet (workbook) — preheat / reheat / steam / humidification' });

  root.append(fold(L({ en: 'Advanced — preheat / reheat / steam / humidification', zh: '進階 — 預熱／再熱／蒸汽／加濕' }), heatCard));
}

register({'''
old = '''
}

register({'''
assert old in c
c = c.replace(old, block, 1)
io.open(p, "w", encoding="utf-8").write(c)
print("heat card restored:", "Preheat / Reheat / Steam" in c)
