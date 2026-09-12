// Module: Psychrometrics (濕空氣計算) — upgraded from 'Psychrometric Chart' sheet
import { register } from '../registry.js';
import { h, res, flag, card, form, results, parseNum, seg } from '../ui.js';
import * as P from '../engine/psychro.js';
import { psychroChartSVG } from '../charts.js';

const I18N = {
  title: { en: 'Psychrometric Calculator', zh: '濕空氣計算器' },
  desc: { en: 'Air state from any two properties (T / Twb / Tdp / RH / W), mixing of two air streams, and coil load (sensible / latent / total).', zh: '由任意兩個獨立參數（T／Twb／Tdp／RH／W）求空氣狀態、兩股氣流混合、盤管負荷（顯熱／潛熱／全熱）。' },
  pressure: { en: 'Atmospheric pressure p', zh: '大氣壓力 p' },
  pair: { en: 'Known property pair', zh: '已知參數組合' },
  pairOpts: {
    t_rh: { en: 'T + RH', zh: '乾球 T＋相對濕度 RH' },
    t_twb: { en: 'T + Wet-bulb', zh: '乾球 T＋濕球 Twb' },
    t_tdp: { en: 'T + Dew point', zh: '乾球 T＋露點 Tdp' },
    t_w: { en: 'T + Humidity ratio', zh: '乾球 T＋含濕量 W' },
  },
  t: { en: 'Dry bulb T', zh: '乾球溫度 T' },
  twb: { en: 'Wet bulb Twb', zh: '濕球溫度 Twb' },
  tdp: { en: 'Dew point Tdp', zh: '露點溫度 Tdp' },
  rh: { en: 'Relative humidity', zh: '相對濕度' },
  w: { en: 'Humidity ratio W', zh: '含濕量 W' },
  h: { en: 'Enthalpy h', zh: '焓值 h' },
  v: { en: 'Specific volume v', zh: '比容 v' },
  rho: { en: 'Density ρ', zh: '密度 ρ' },
  pw: { en: 'Vapour pressure pw', zh: '水蒸氣分壓 pw' },
  mu: { en: 'Degree of saturation µ', zh: '飽和度 µ' },
  err: { en: 'Enter two independent properties to compute the state.', zh: '請輸入兩個獨立參數以計算狀態。' },
  mixTitle: { en: 'Adiabatic Mixing (2 streams)', zh: '絕熱混合（兩股氣流）' },
  mixSub: { en: 'Balanced by mass flow rate.', zh: '按質量流量加權。' },
  air1: { en: 'Air 1', zh: '氣流 1' },
  air2: { en: 'Air 2', zh: '氣流 2' },
  m1: { en: 'Mass flow m₁', zh: '質量流量 m₁' },
  m2: { en: 'Mass flow m₂', zh: '質量流量 m₂' },
  coilTitle: { en: 'Coil Load (Air Process)', zh: '盤管負荷（空氣處理過程）' },
  coilSub: { en: 'Entering and leaving air states + volume flow.', zh: '進／出風狀態＋風量。' },
  inState: { en: 'Entering air', zh: '進風' },
  outState: { en: 'Leaving air', zh: '出風' },
  flow: { en: 'Volume flow V', zh: '風量 V' },
  qs: { en: 'Sensible load', zh: '顯熱負荷' },
  ql: { en: 'Latent load', zh: '潛熱負荷' },
  qt: { en: 'Total load', zh: '全熱負荷' },
  cond: { en: 'Condensate rate', zh: '冷凝水量' },
  shr: { en: 'SHR', zh: '顯熱比' },
};

const PAIRS = ['t_rh', 't_twb', 't_tdp', 't_w'];

function render(root, { L }) {
  const T = (k) => L(I18N[k]);

  // ---- Section 1: state from any pair ----
  let pInput = null, pair = 't_rh', stateForm = null, stateWrap = null;
  const stateBox = h('div');
  const chartBox = h('div', { class: 'chart-box' });

  function drawChart(s) {
    if (!s) { chartBox.innerHTML = ''; return; }
    chartBox.innerHTML = psychroChartSVG(
      [{ id: 'S', name: 'State', t: s.t, w: s.w, show: `${s.t.toFixed(1)}° / ${s.rh.toFixed(0)}%` }],
      [], { pws: P.pws, p: s.p ?? 101.325 });
  }

  const stateCard = card(T('title'), T('desc'), (body) => {
    pInput = form([{ key: 'p', label: T('pressure'), unit: 'kPa', def: 101.325 }], () => drawState()).grid;
    body.append(pInput);
    const pairRow = h('div', { class: 'field' }, h('label', {}, T('pair')),
      seg(PAIRS.map((v) => ({ v, label: T(I18N.pairOpts[v]) })), pair, (v) => { pair = v; rebuildInputs(); }));
    body.append(pairRow);
    stateWrap = h('div');
    body.append(stateWrap, stateBox, chartBox);
    rebuildInputs();
  }, {
    src: 'ASHRAE Fundamentals 2025 Ch.1/Ch.1; Hyland & Wexler (1983) — W=0.62198·pw/(p−pw); h=1.006T+W(2501+1.805T); v=0.2871(T+273.15)(1+1.6078W)/p',
  });

  function rebuildInputs() {
    if (!stateWrap) return;
    stateWrap.innerHTML = '';
    const specs = [{ key: 't', label: T('t'), unit: '°C', def: 24.6 }];
    if (pair === 't_rh') specs.push({ key: 'rh', label: T('rh'), unit: '%', def: 50 });
    else if (pair === 't_twb') specs.push({ key: 'twb', label: T('twb'), unit: '°C', def: 19.2 });
    else if (pair === 't_tdp') specs.push({ key: 'tdp', label: T('tdp'), unit: '°C', def: 16.5 });
    else specs.push({ key: 'w', label: T('w'), unit: 'kg/kg', def: 0.0117 });
    stateForm = form(specs, () => drawState());
    stateWrap.append(stateForm.grid);
    drawState();
  }

  function drawState() {
    const p = parseNum(pInput?.querySelector?.('input')?.value) ?? 101.325;
    const t = parseNum(stateForm?.grid.querySelector('#f-t')?.value);
    const key = pair === 't_rh' ? 'rh' : pair === 't_twb' ? 'twb' : pair === 't_tdp' ? 'tdp' : 'w';
    const v2 = parseNum(stateForm?.grid.querySelector('#f-' + key)?.value);
    if (t == null || v2 == null) { results(stateBox, []); drawChart(null); return; }
    const s = P.state({ t, [key]: v2, p });
    if (!s) { results(stateBox, [res(T('err'), '—')]); drawChart(null); return; }
    results(stateBox, [
      res(T('t'), s.t, '°C', { digits: 2 }),
      res(T('twb'), s.twb, '°C', { digits: 2 }),
      res(T('tdp'), s.tdp, '°C', { digits: 2 }),
      res(T('rh'), s.rh, '%', { digits: 1 }),
      res(T('w'), s.w, 'kg/kg', { digits: 5 }),
      res(T('h'), s.h, 'kJ/kg', { digits: 2 }),
      res(T('v'), s.v, 'm³/kg', { digits: 3 }),
      res(T('rho'), s.rho, 'kg/m³', { digits: 3 }),
      res(T('pw'), s.pw, 'kPa', { digits: 3 }),
      res(T('mu'), s.mu, '—', { digits: 4 }),
    ]);
    drawChart(s);
  }
  root.append(stateCard);


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

  // ---- Section 2: mixing ----
  root.append(card(T('mixTitle'), T('mixSub'), (body) => {
    const f = form([
      { key: 't1', label: T('air1') + ' T', unit: '°C', def: 24.6 },
      { key: 'rh1', label: T('air1') + ' RH', unit: '%', def: 50 },
      { key: 'm1', label: T('m1'), unit: 'kg/s', def: 1 },
      { key: 't2', label: T('air2') + ' T', unit: '°C', def: 10 },
      { key: 'rh2', label: T('air2') + ' RH', unit: '%', def: 40 },
      { key: 'm2', label: T('m2'), unit: 'kg/s', def: 1 },
    ], draw, 'grid3');
    const box = h('div');
    body.append(f.grid, box);
    function draw(st) {
      if ([st.t1, st.rh1, st.m1, st.t2, st.rh2, st.m2].some((x) => x == null)) { results(box, []); return; }
      const s1 = P.state({ t: st.t1, rh: st.rh1 });
      const s2 = P.state({ t: st.t2, rh: st.rh2 });
      if (!s1 || !s2) { results(box, []); return; }
      const sm = P.mix(s1, s2, st.m1, st.m2);
      results(box, [
        res(T('t'), sm.t, '°C', { digits: 2 }),
        res(T('twb'), sm.twb, '°C', { digits: 2 }),
        res(T('rh'), sm.rh, '%', { digits: 1 }),
        res(T('w'), sm.w, 'kg/kg', { digits: 5 }),
        res(T('h'), sm.h, 'kJ/kg', { digits: 2 }),
        res(T('rho'), sm.rho, 'kg/m³', { digits: 3 }),
      ]);
    }
    draw(f.all());
  }, { collapsed: true }));
  // ---- Section 3: coil load ----
  root.append(card(T('coilTitle'), T('coilSub'), (body) => {
    const f = form([
      { key: 't1', label: T('inState') + ' T', unit: '°C', def: 27 },
      { key: 'rh1', label: T('inState') + ' RH', unit: '%', def: 55 },
      { key: 't2', label: T('outState') + ' T', unit: '°C', def: 13 },
      { key: 'rh2', label: T('outState') + ' RH', unit: '%', def: 95 },
      { key: 'v', label: T('flow'), unit: 'm³/s', def: 1 },
    ], draw, 'grid3', 'coil-');
    const box = h('div');
    body.append(f.grid, box);
    function draw(st) {
      if ([st.t1, st.rh1, st.t2, st.rh2, st.v].some((x) => x == null)) { results(box, []); return; }
      const s1 = P.state({ t: st.t1, rh: st.rh1 });
      const s2 = P.state({ t: st.t2, rh: st.rh2 });
      if (!s1 || !s2) { results(box, []); return; }
      const m = st.v * s1.rho;
      const qt = m * (s1.h - s2.h);
      const qs = m * 1.006 * (s1.t - s2.t);
      const ql = Math.max(0, qt - qs);
      const cond = Math.max(0, m * (s1.w - s2.w));
      const shr = qt > 0 ? qs / qt : 1;
      const kind = ql < 0.001 ? (qt >= 0 ? 'sens' : 'heat') : 'wet';
      results(box, [
        res(T('qs'), qs, 'kW', { digits: 2 }),
        res(T('ql'), ql, 'kW', { digits: 2 }),
        res(T('qt'), qt, 'kW', { digits: 2, big: true }),
        res(T('cond'), cond * 3600, 'kg/h', { digits: 3 }),
        res(T('shr'), shr, '—', { digits: 3 }),
      ]);
      box.append(flag(kind === 'wet' ? L({ en: 'Cooling + dehumidification (wet coil)', zh: '冷卻除濕（濕盤管）' })
        : kind === 'sens' ? L({ en: 'Sensible cooling only (dry coil)', zh: '純顯熱冷卻（乾盤管）' })
        : L({ en: 'Heating process', zh: '加熱過程' }), 'info'));
    }
    draw(f.all());
  }, { collapsed: true }));
}

register({ id: 'psychro', icon: '🌡️', group: 'air', title: I18N.title, desc: I18N.desc, src: 'ASHRAE Fundamentals · Hyland & Wexler 1983', render });
