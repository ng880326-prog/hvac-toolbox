// Module: Air-side / Duct Sizing (風管計算) — upgraded from 'Air-side' sheet
import { register } from '../registry.js';
import { h, res, flag, card, form, results, parseNum, seg } from '../ui.js';
import * as D from '../engine/ducts.js';
import * as P from '../engine/psychro.js';

const I18N = {
  title: { en: 'Air-side / Duct Sizing', zh: '空氣側／風管計算' },
  desc: { en: 'ACH, duct sizing (round/rectangular/oval) by Darcy–Weisbach + Haaland, diffuser and louvre sizing.', zh: '換氣次數 ACH、風管選徑（圓／矩形／扁圓，Darcy–Weisbach＋Haaland）、送風口及百葉選型。' },
  achTitle: { en: 'Air Change per Hour (ACH)', zh: '換氣次數（ACH）' },
  achSub: { en: 'Flow = room volume × ACH (both directions).', zh: '風量＝房間體積×ACH（雙向計算）。' },
  area: { en: 'Room area', zh: '房間面積' },
  height: { en: 'Room height', zh: '房間高度' },
  ach: { en: 'Air changes', zh: '換氣次數' },
  flowOut: { en: 'Air flow', zh: '風量' },
  ductTitle: { en: 'Duct Sizing', zh: '風管選徑' },
  ductSub: { en: 'Friction by Darcy–Weisbach with Haaland friction factor, k = 0.1 mm galvanised.', zh: '摩阻用 Darcy–Weisbach＋Haaland 摩擦係數，鍍鋅鋼板 k＝0.1 mm。' },
  flow: { en: 'Air flow Q', zh: '風量 Q' },
  shape: { en: 'Duct shape', zh: '風管形狀' },
  round: { en: 'Round', zh: '圓形' },
  rect: { en: 'Rectangular', zh: '矩形' },
  oval: { en: 'Oval', zh: '扁圓' },
  aspect: { en: 'Aspect ratio b/a', zh: '長寬比 b/a' },
  tAir: { en: 'Air temperature', zh: '空氣溫度' },
  rhAir: { en: 'Air RH', zh: '空氣相對濕度' },
  vMax: { en: 'Velocity limit', zh: '流速限值' },
  pdMax: { en: 'Friction limit', zh: '比摩阻限值' },
  dia: { en: 'Equivalent diameter De', zh: '當量直徑 De' },
  dims: { en: 'Duct dimensions', zh: '風管尺寸' },
  vel: { en: 'Velocity', zh: '流速' },
  re: { en: 'Reynolds number', zh: '雷諾數' },
  fric: { en: 'Friction factor λ', zh: '摩擦係數 λ' },
  pd: { en: 'Pressure drop', zh: '比摩阻' },
  vp: { en: 'Velocity pressure', zh: '動壓' },
  check: { en: 'Check', zh: '檢核' },
  okNote: { en: 'Velocity & friction within limits ✔', zh: '流速與比摩阻符合限值 ✔' },
  failNote: { en: 'Limits exceeded — increase size or reduce flow.', zh: '超出限值 — 請加大風管或減風量。' },
  diffTitle: { en: 'Diffuser Sizing', zh: '送風口選型' },
  diffSub: { en: 'Neck area = flow ÷ velocity ÷ effectiveness.', zh: '喉口面積＝風量÷流速÷效率。' },
  neckV: { en: 'Neck velocity', zh: '喉口風速' },
  eff: { en: 'Diffuser effectiveness', zh: '送風口效率' },
  neckArea: { en: 'Required neck area', zh: '所需喉口面積' },
  louvTitle: { en: 'Louvre Sizing', zh: '百葉選型' },
  louvSub: { en: 'Free area at recommended face velocity.', zh: '按建議迎面風速求自由面積。' },
  faceV: { en: 'Face velocity', zh: '迎面風速' },
  freeArea: { en: 'Free area', zh: '自由面積' },
};

function render(root, { L }) {
  const T = (k) => L(I18N[k]);

  // ACH
  root.append(card(T('achTitle'), T('achSub'), (body) => {
    const f = form([
      { key: 'area', label: T('area'), unit: 'm²', def: 30 },
      { key: 'height', label: T('height'), unit: 'm', def: 3 },
      { key: 'ach', label: T('ach'), unit: 'h⁻¹', def: 6 },
    ], draw, 'grid3');
    const box = h('div');
    body.append(f.grid, box);
    function draw(st) {
      if ([st.area, st.height, st.ach].some((x) => x == null)) { results(box, []); return; }
      const flow = st.area * st.height * st.ach; // m³/h
      results(box, [
        res(T('flowOut'), flow, 'm³/h', { digits: 0, big: true }),
        res(T('flowOut'), flow / 3600, 'm³/s', { digits: 3 }),
        res(T('flowOut'), flow * 1000 / 3600, 'L/s', { digits: 1 }),
        res(T('flowOut'), flow / 3600 / 0.472, 'CFM', { digits: 0 }),
      ]);
    }
    draw(f.all());
  }));

  // Duct sizing
  root.append(card(T('ductTitle'), T('ductSub'), (body) => {
    let shape = 'round', ratio = 1.5;
    const shapeRow = h('div', { class: 'field' }, h('label', {}, T('shape')),
      seg([{ v: 'round', label: T('round') }, { v: 'rect', label: T('rect') }, { v: 'oval', label: T('oval') }], shape,
        (v) => { shape = v; draw(f.all()); }));
    const f = form([
      { key: 'q', label: T('flow'), unit: 'm³/s', def: 1 },
      { key: 'ratio', label: T('aspect'), unit: 'b/a', def: 1.5 },
      { key: 't', label: T('tAir'), unit: '°C', def: 24 },
      { key: 'rh', label: T('rhAir'), unit: '%', def: 50 },
      { key: 'vMax', label: T('vMax'), unit: 'm/s', def: 7 },
      { key: 'pdMax', label: T('pdMax'), unit: 'Pa/m', def: 1.2 },
    ], (st) => draw(st), 'grid3');
    const box = h('div');
    body.append(shapeRow, f.grid, box);

    function draw(st) {
      box.innerHTML = '';
      if ([st.q, st.ratio, st.t, st.rh, st.vMax, st.pdMax].some((x) => x == null || x <= 0)) return;
      const s = P.state({ t: st.t, rh: st.rh });
      if (!s) return;
      const mu = D.sutherland(st.t);
      // iterate diameter to hit the stricter limit
      let de = D.diaForVelocity(st.q, st.vMax); // mm at vMax
      let r = D.ductFriction(st.q, de, s.rho, mu, 0.1);
      if (r.pd > st.pdMax) {
        let lo = de, hi = de * 10;
        for (let i = 0; i < 60; i++) {
          const mid = (lo + hi) / 2;
          if (D.ductFriction(st.q, mid, s.rho, mu, 0.1).pd > st.pdMax) lo = mid; else hi = mid;
        }
        de = hi;
        r = D.ductFriction(st.q, de, s.rho, mu, 0.1);
      }
      const ok = r.v <= st.vMax + 1e-9 && r.pd <= st.pdMax + 1e-9;
      let dims = 'Ø ' + Math.ceil(de / 25) * 25 + ' mm';
      if (shape === 'rect') {
        // friction-equivalent dims via Huebscher
        const d = D.rectDimsForDe(de / 1000, st.ratio);
        dims = Math.ceil(d.a * 1000 / 25) * 25 + ' × ' + Math.ceil(d.b * 1000 / 25) * 25 + ' mm';
      } else if (shape === 'oval') {
        // friction-equivalent dims via CIBSE-type relation (workbook variant)
        const d = D.ovalDimsForDe(de / 1000, st.ratio);
        dims = Math.ceil(d.a * 1000 / 25) * 25 + ' × ' + Math.ceil(d.b * 1000 / 25) * 25 + ' mm (a × b)';
      }
      results(box, [
        res(T('dia'), de, 'mm', { digits: 0, big: true }),
        res(T('dims'), dims, '', { digits: 0 }),
        res(T('vel'), r.v, 'm/s', { digits: 2 }),
        res(T('re'), r.Re, '—', { digits: 0 }),
        res(T('fric'), r.f, '—', { digits: 4 }),
        res(T('pd'), r.pd, 'Pa/m', { digits: 2 }),
        res(T('vp'), D.velocityPressure(s.rho, r.v), 'Pa', { digits: 1 }),
      ]);
      box.append(flag(ok ? T('okNote') : T('failNote'), ok ? 'ok' : 'bad'));
    }
    draw(f.all());
  }, {
    formula: 'λ = (1 / (−1.8·log₁₀(6.9/Re + (k/(3.71·D))^1.11)))²   (Haaland 1983)   ·   ΔP/L = λ·ρ·V²/(2D)',
    src: 'CIBSE Guide C (workbook ref); ASHRAE Fundamentals 2025 Ch.21 Duct Design; Haaland (1983)',
  }));

  // Standard duct size table (equivalent of the workbook's friction lookup table)
  root.append(card(L({ en: 'Standard Sizes — friction table', zh: '標準風管尺寸表（摩擦速查）' }), '', (body) => {
    const f = form([
      { key: 'q', label: T('flow'), unit: 'm³/s', def: 2.5 },
      { key: 't', label: T('tAir'), unit: '°C', def: 24 },
      { key: 'rh', label: T('rhAir'), unit: '%', def: 50 },
      { key: 'vMax', label: T('vMax'), unit: 'm/s', def: 7 },
      { key: 'pdMax', label: T('pdMax'), unit: 'Pa/m', def: 1.2 },
    ], (st) => draw(st), 'grid3');
    const box = h('div');
    body.append(f.grid, box);
    const SIZES = [100, 120, 140, 160, 180, 200, 225, 250, 280, 300, 350, 400, 450, 500, 560, 630, 700, 800, 900, 1000, 1120, 1250, 1400, 1600];
    function draw(st) {
      if ([st.q, st.t, st.rh, st.vMax, st.pdMax].some((x) => x == null || x <= 0)) { results(box, []); return; }
      const s = P.state({ t: st.t, rh: st.rh });
      if (!s) { results(box, []); return; }
      const mu = D.sutherland(st.t);
      const rows = SIZES.map((dn) => {
        const r = D.ductFriction(st.q, dn, s.rho, mu, 0.1);
        return { dn, ...r, ok: r.v <= st.vMax && r.pd <= st.pdMax };
      });
      const pick = rows.find((r) => r.ok);
      results(box, pick
        ? [res(L({ en: 'Selected size', zh: '選定尺寸' }), 'Ø' + pick.dn, 'mm', { digits: 0, big: true })]
        : [res(L({ en: 'Sizes exhausted for this flow', zh: '此風量超出表列範圍' }), '—', '', { digits: 0, err: true })]);
      const tbl = h('table', { class: 'pipes-table' });
      tbl.append(h('tr', {}, h('th', {}, 'Ø mm'), h('th', {}, 'V m/s'), h('th', {}, 'Re'), h('th', {}, 'λ'), h('th', {}, 'Pa/m')));
      for (const r of rows.slice(0, 14)) {
        tbl.append(h('tr', { class: pick && pick.dn === r.dn ? 'sel' : r.ok ? 'okrow' : '' },
          h('td', {}, 'Ø' + r.dn), h('td', {}, r.v.toFixed(2)), h('td', {}, String(Math.round(r.Re))), h('td', {}, r.f.toFixed(4)), h('td', {}, r.pd.toFixed(2))));
      }
      box.append(h('div', { class: 'note' }, 'v ≤ ' + st.vMax + ' m/s · Pa/m ≤ ' + st.pdMax + ' — ' + L({ en: 'green = OK', zh: '綠色＝合用' })));
      box.append(tbl);
    }
    draw(f.all());
  }, { src: 'ASHRAE Fundamentals 2025 Ch.21 · generated from Haaland/Darcy-Weisbach (replaces 3000-row lookup)' }));

  // Diffuser
  root.append(card(T('diffTitle'), T('diffSub'), (body) => {
    const f = form([
      { key: 'q', label: T('flow'), unit: 'm³/s', def: 0.5 },
      { key: 'v', label: T('neckV'), unit: 'm/s', def: 2.5 },
      { key: 'eff', label: T('eff'), unit: '—', def: 0.85 },
    ], draw, 'grid3');
    const box = h('div');
    body.append(f.grid, box);
    function draw(st) {
      if ([st.q, st.v, st.eff].some((x) => x == null || x <= 0)) { results(box, []); return; }
      const A = st.q / st.v / st.eff;
      results(box, [res(T('neckArea'), A, 'm²', { digits: 4, big: true })]);
    }
    draw(f.all());
  }, { src: 'CIBSE Guide B3 — Table 3.4 (workbook ref)' }));

  // Louvre
  root.append(card(T('louvTitle'), T('louvSub'), (body) => {
    const f = form([
      { key: 'q', label: T('flow'), unit: 'm³/s', def: 1 },
      { key: 'v', label: T('faceV'), unit: 'm/s', def: 2.5 },
    ], draw, 'grid2');
    const box = h('div');
    body.append(f.grid, box);
    function draw(st) {
      if ([st.q, st.v].some((x) => x == null || x <= 0)) { results(box, []); return; }
      results(box, [res(T('freeArea'), st.q / st.v, 'm²', { digits: 3, big: true })]);
    }
    draw(f.all());
  }, { src: 'ASHRAE Fundamentals 2025 Ch.21 (workbook ref)' }));
}

register({ id: 'ducts', icon: '💨', group: 'air', title: I18N.title, desc: I18N.desc, src: 'ASHRAE F. Ch.21 · CIBSE C/B3 · Haaland', render });
