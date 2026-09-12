// Module: Psychrometrics (濕空氣計算) — rebuilt from the workbook 'Psychrometric Chart' sheet.
//
// Workbook layout being mirrored ('Psychrometric Chart'!$B$2:$I$25):
//   B2       title
//   B5:C6    Altitude (m) and Atmospheric Pressure (kPa) — one pair feeding every state on the page
//   B8:D8    two side-by-side columns, 'Air 1' and 'Air 2'
//   B9:D12   INPUT rows  — dry bulb / wet bulb / dew point / relative humidity
//   B15:D22  OUTPUT rows — dry bulb / wet bulb / dew point / relative humidity / specific volume /
//            air density / moisture content / specific enthalpy
//   B24      'Reference:' citation line
//
// One deliberate behavioural change, approved by the user: the workbook echoes any input the user
// typed and derives only the blanks, so its own Air 2 row (10 °C dry bulb, 9.6 °C wet bulb, 40 % RH)
// displays numbers that cannot coexist — that pair is about 95 % RH. Here the entered values stay
// visible, the consistent state is shown next to them, and any disagreement is flagged with both
// numbers so the user can decide which entry to drop.
import { register } from '../registry.js';
import { h, res, flag, card, form, results, seg, fold } from '../ui.js';
import * as P from '../engine/psychro.js';
import { psychroChartSVG } from '../charts.js';

const I18N = {
  title: { en: 'Psychrometric Chart', zh: '濕空氣圖（Psychrometric Chart）' },
  desc: {
    en: 'Two air states side by side exactly as in the workbook: enter any of dry bulb, wet bulb, dew point or RH per column, and every other property follows.',
    zh: '照原檔把兩個空氣狀態並排：每欄可填 乾球／濕球／露點／相對濕度 其中任意項，其餘性質自動求出。',
  },
  sysCond: { en: 'System Conditions', zh: '系統條件' },
  alt: { en: 'Altitude', zh: '海拔高度' },
  pressure: { en: 'Atmospheric Pressure', zh: '大氣壓力' },
  airTable: { en: 'Air 1 ｜ Air 2', zh: 'Air 1 ｜ Air 2' },
  airTableSub: {
    en: 'Top block: what you enter. Bottom block: the resulting state (workbook rows 15–22). Leave everything else blank — two independent entries are enough.',
    zh: '上半部：你輸入嘅值。下半部：計算出嘅狀態（原檔 15–22 列）。其餘留空即可 —— 有兩個獨立數值就足夠。',
  },
  inputBlock: { en: 'Input', zh: '輸入' },
  outputBlock: { en: 'Computed state', zh: '計算結果' },
  air1: { en: 'Air 1', zh: 'Air 1' },
  air2: { en: 'Air 2', zh: 'Air 2' },
  t: { en: 'Dry Bulb Temperature', zh: '乾球溫度' },
  twb: { en: 'Wet Bulb Temperature', zh: '濕球溫度' },
  tdp: { en: 'Dew Point Temperature', zh: '露點溫度' },
  rh: { en: 'Relative Humidity', zh: '相對濕度' },
  v: { en: 'Specific Volume', zh: '比容' },
  rho: { en: 'Air Density', zh: '空氣密度' },
  w: { en: 'Moisture Content', zh: '含濕量' },
  hh: { en: 'Specific Enthalpy', zh: '比焓' },
  pw: { en: 'Vapour pressure', zh: '水蒸氣分壓' },
  mu: { en: 'Degree of saturation', zh: '飽和度' },
  needTwo: { en: 'Enter two independent properties.', zh: '請輸入兩個獨立參數。' },
  wbGtDb: { en: 'ERROR — wet bulb is above dry bulb (workbook B16 rule).', zh: '錯誤 —— 濕球高於乾球（原檔 B16 規則）。' },
  conflict: { en: 'entries disagree', zh: '輸入互相矛盾' },
  conflictHint: {
    en: 'Both are shown: the value you typed and the value implied by the pair used. Remove one entry to resolve it.',
    zh: '兩者都列出：你輸入嘅值，以及由所採用組合推算嘅值。刪去其中一項即可解決。',
  },
  chart: { en: 'Chart', zh: '濕空氣圖' },
  chartSub: {
    en: 'Saturation curve with both states, optional process lines between them.',
    zh: '飽和線＋兩個狀態點，可加過程線。',
  },
  process: { en: 'Process line Air 1 → Air 2', zh: '過程線 Air 1 → Air 2' },
  advanced: { en: 'Advanced', zh: '進階' },
  quick: { en: 'Quick single state (any pair)', zh: '單狀態快速求解（任意組合）' },
  pair: { en: 'Known property pair', zh: '已知參數組合' },
  pairOpts: {
    t_rh: { en: 'T + RH', zh: '乾球 T＋相對濕度 RH' },
    t_twb: { en: 'T + Wet-bulb', zh: '乾球 T＋濕球 Twb' },
    t_tdp: { en: 'T + Dew point', zh: '乾球 T＋露點 Tdp' },
    t_w: { en: 'T + Humidity ratio', zh: '乾球 T＋含濕量 W' },
  },
  mixTitle: { en: 'Adiabatic Mixing (2 streams)', zh: '絕熱混合（兩股氣流）' },
  mixSub: { en: 'Balanced by mass flow rate.', zh: '按質量流量加權。' },
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
  outdoor: { en: 'Outdoor', zh: '室外' },
  indoor: { en: 'Indoor', zh: '室內' },
};

const PAIRS = ['t_rh', 't_twb', 't_tdp', 't_w'];
const TOL = { t: 0.15, twb: 0.15, tdp: 0.15, rh: 1.5 };   // display tolerance per property

/**
 * Resolve one Air column the way the workbook's supporting tables would, but honestly.
 *
 * The workbook trusts whichever input rows are non-blank (B15–B18) and derives the rest, which lets a
 * column hold mutually impossible numbers. Here the entered values are kept for display, the state is
 * resolved from a canonical independent pair, and every entered value is compared against that state.
 *
 * @returns {{state:object|null, conflicts:Array, wbGtDb:boolean, usedPair:string|null}}
 */
function resolveAir(vals, p) {
  const { t, twb, tdp, rh } = vals;
  const wbGtDb = t != null && twb != null && twb > t;
  // Priority order over the independent pairs, most robust first. Every pair is a resolver because the
  // engine's state() takes specific combinations — (wet bulb + dew point) is not one of them, so it is
  // converted to (wet bulb + humidity ratio) first.
  const pairs = [
    ['t_twb', t != null && twb != null && twb <= t, () => P.state({ t, twb, p })],
    ['t_rh', t != null && rh != null, () => P.state({ t, rh, p })],
    ['t_tdp', t != null && tdp != null, () => P.state({ t, tdp, p })],
    ['twb_rh', twb != null && rh != null, () => P.state({ twb, rh, p })],
    ['tdp_rh', tdp != null && rh != null, () => P.state({ tdp, rh, p })],
    ['twb_tdp', twb != null && tdp != null,
      () => P.state({ twb, w: P.WfromPw(P.pws(tdp), p), p })],
  ];
  const pick = pairs.find((entry) => entry[1]);
  const state = pick ? pick[2]() : null;
  const conflicts = [];
  if (state) {
    const inPair = pick[0].split('_');
    for (const [key, value] of [['t', t], ['twb', twb], ['tdp', tdp], ['rh', rh]]) {
      if (value == null || inPair.includes(key)) continue;
      const implied = state[key];
      if (Number.isFinite(implied) && Math.abs(implied - value) > TOL[key]) {
        conflicts.push({ key, entered: value, implied });
      }
    }
  }
  return { state, conflicts, wbGtDb, usedPair: pick ? pick[0] : null };
}

function render(root, { L }) {
  const T = (k) => L(I18N[k]);
  const st = (t, twb, tdp, rh) => ({ t, twb, tdp, rh });

  // Shared page state — the workbook's B5:C6 plus the two air columns.
  const S = {
    alt: 0,
    p: 101.325,
    pOverride: false,
    air: [st(24.6, 19.2, null, null), st(10, 9.6, null, 40)],
  };
  const redraws = [];
  const notify = () => { for (const fn of redraws) fn(); };

  // ---- 1) System conditions (workbook B5:C6) ----
  root.append(card(T('sysCond'), '', (body) => {
    const f = form([
      { key: 'alt', label: T('alt'), unit: 'm', def: S.alt, step: '1' },
      { key: 'p', label: T('pressure'), unit: 'kPa', def: S.p, step: '0.001' },
    ], (a) => {
      const altEdited = a.alt !== S.alt;
      const pEdited = a.p !== S.p;
      S.alt = a.alt;
      S.p = a.p;
      if (altEdited) S.pOverride = false;
      else if (pEdited) S.pOverride = true;
      notify();
    }, 'grid2');
    const note = h('div', { class: 'note' });
    body.append(f.grid, note);
    redraws.push(() => {
      if (!S.pOverride) {
        const pa = +P.pressureAtAltitude(S.alt).toFixed(3);
        if (pa !== S.p) { S.p = pa; f.set('p', pa); return; }
      }
      note.textContent = S.pOverride
        ? L({ en: 'Pressure overridden by hand; edit the altitude to return to the standard atmosphere.', zh: '壓力已手動覆寫；改動高度即回復標準大氣推算值。' })
        : L({ en: 'p = 101.325·(1 − 2.25577e-5·z)^5.2559 kPa (ASHRAE Fundamentals ch.1) — the workbook pins this at 101.325 kPa and ignores its own altitude cell.', zh: 'p = 101.325·(1 − 2.25577e-5·z)^5.2559 kPa（ASHRAE Fundamentals 第 1 章）—— 原檔固定 101.325 kPa，其高度欄其實無作用。' });
    });
  }, { src: 'Psychrometric Chart!B5:C6 · ASHRAE F ch.1 eq. 3' }));

  // ---- 2) Air 1 | Air 2 (workbook B8:D22) ----
  root.append(card(T('airTable'), T('airTableSub'), (body) => {
    const tbl = h('table', { class: 'pipes-table psy-air' });
    const outCells = {};
    const mkInput = (col, key) => {
      const inp = h('input', {
        type: 'number', inputmode: 'decimal', step: 'any', autocomplete: 'off', class: 'cell-in',
        'aria-label': T(key) + ' — ' + (col === 0 ? T('air1') : T('air2')),
        value: S.air[col][key] == null ? '' : S.air[col][key],
      });
      inp.addEventListener('input', () => {
        S.air[col][key] = inp.value === '' ? null : parseFloat(inp.value);
        notify();
      });
      return inp;
    };
    const OUT_ROWS = [
      ['t', (s) => s.t, '°C', 2], ['twb', (s) => s.twb, '°C', 2], ['tdp', (s) => s.tdp, '°C', 2],
      ['rh', (s) => s.rh, '%', 1], ['v', (s) => s.v, 'm³/kg', 4], ['rho', (s) => s.rho, 'kg/m³', 3],
      ['w', (s) => s.w, 'kg/kg', 5], ['hh', (s) => s.h, 'kJ/kg', 2],
      ['pw', (s) => s.pw, 'kPa', 3], ['mu', (s) => s.mu, '—', 4],
    ];
    tbl.append(h('thead', {},
      h('tr', {}, h('th', {}, ''), h('th', {}, T('air1')), h('th', {}, T('air2'))),
      h('tr', { class: 'psy-group' }, h('th', { colspan: '3' }, T('inputBlock')))));
    for (const [key, label] of [['t', 't'], ['twb', 'twb'], ['tdp', 'tdp'], ['rh', 'rh']]) {
      tbl.append(h('tr', {},
        h('th', {}, T(label) + (key === 'rh' ? ' (%)' : ' (°C)')),
        h('td', {}, mkInput(0, key)), h('td', {}, mkInput(1, key))));
    }
    tbl.append(h('tr', { class: 'psy-group' }, h('th', { colspan: '3' }, T('outputBlock'))));
    for (const [key, , unit] of OUT_ROWS) {
      const c0 = h('td', { class: 'num' });
      const c1 = h('td', { class: 'num' });
      outCells[key] = [c0, c1];
      tbl.append(h('tr', {}, h('th', {}, T(key) + ' (' + unit + ')'), c0, c1));
    }
    const flags = h('div');
    body.append(h('div', { class: 'table-scroll' }, tbl), flags);

    redraws.push(() => {
      flags.innerHTML = '';
      const resolved = S.air.map((vals) => resolveAir(vals, S.p));
      const states = resolved.map((r) => r.state);
      for (let i = 0; i < 2; i++) {
        const s = states[i];
        for (const [key, get, , digits] of OUT_ROWS) {
          const el = outCells[key][i];
          el.textContent = s ? (key === 'rh' ? s.rh.toFixed(1) : Number(get(s)).toFixed(digits)) : '—';
        }
        if (!s) flags.append(flag('Air ' + (i + 1) + '：' + T('needTwo'), 'info'));
        if (resolved[i].wbGtDb) flags.append(flag('Air ' + (i + 1) + '：' + T('wbGtDb'), 'bad'));
        for (const c of resolved[i].conflicts) {
          const unit = c.key === 'rh' ? ' %' : ' °C';
          flags.append(flag('Air ' + (i + 1) + ' ' + T('conflict') + ' — ' + T(c.key) + '：' +
            c.entered + unit + ' vs ' + c.implied.toFixed(c.key === 'rh' ? 1 : 2) + unit, 'warn'));
        }
      }
      if (resolved.some((r) => r.conflicts.length)) {
        flags.append(h('div', { class: 'note' }, T('conflictHint')));
      }
      drawChart(states);
    });
  }, { src: 'Psychrometric Chart!B8:D22 · Supporting 1–6 (state solver)' }));

  // ---- 3) Chart ----
  const chartBox = h('div', { class: 'chart-box' });
  let showProcess = true;
  function drawChart(states) {
    const pts = states.map((s, i) => (s ? {
      id: i === 0 ? 'H' : 'O', name: i === 0 ? T('air1') : T('air2'), t: s.t, w: s.w,
      show: s.t.toFixed(1) + '° / ' + s.rh.toFixed(0) + '%',
    } : null)).filter(Boolean);
    if (!pts.length) { chartBox.innerHTML = ''; return; }
    const lines = (showProcess && states[0] && states[1])
      ? [{ points: [states[0].t, states[0].w, states[1].t, states[1].w], color: 'cool', label: '1 → 2' }]
      : [];
    chartBox.innerHTML = psychroChartSVG(pts, lines, { pws: P.pws, p: S.p });
  }
  root.append(card(T('chart'), T('chartSub'), (body) => {
    body.append(h('div', { class: 'field' }, h('label', {}, T('process')),
      seg([{ v: 'on', label: L({ en: 'Show', zh: '顯示' }) }, { v: 'off', label: L({ en: 'Hide', zh: '隱藏' }) }],
        'on', (v) => { showProcess = v === 'on'; notify(); })),
    chartBox);
  }, { src: 'Chart drawn by the app (the workbook sheet holds only tables)' }));

  // ---- 4) Advanced (folded): quick single state, mixing, coil load ----
  const quickBox = h('div');
  let pair = 't_rh';
  const quickCard = card(T('quick'), '', (body) => {
    let qForm = null;
    const pairRow = h('div', { class: 'field' }, h('label', {}, T('pair')),
      seg(PAIRS.map((v) => ({ v, label: T(I18N.pairOpts[v]) })), pair, (v) => { pair = v; rebuild(); }));
    const wrap = h('div');
    body.append(pairRow, wrap, quickBox);
    function rebuild() {
      wrap.innerHTML = '';
      const specs = [{ key: 't', label: T('t'), unit: '°C', def: 24.6 }];
      if (pair === 't_rh') specs.push({ key: 'rh', label: T('rh'), unit: '%', def: 50 });
      else if (pair === 't_twb') specs.push({ key: 'twb', label: T('twb'), unit: '°C', def: 19.2 });
      else if (pair === 't_tdp') specs.push({ key: 'tdp', label: T('tdp'), unit: '°C', def: 16.5 });
      else specs.push({ key: 'w', label: T('w'), unit: 'kg/kg', def: 0.0117 });
      qForm = form(specs, drawQuick, 'grid2', 'quick-');
      wrap.append(qForm.grid);
      drawQuick(qForm.all());
    }
    function drawQuick(a) {
      const second = pair === 't_rh' ? { rh: a.rh } : pair === 't_twb' ? { twb: a.twb }
        : pair === 't_tdp' ? { tdp: a.tdp } : { w: a.w };
      const s = (a.t == null || Object.values(second)[0] == null) ? null : P.state({ t: a.t, ...second, p: S.p });
      if (!s) { results(quickBox, [res(T('needTwo'), '—')]); return; }
      results(quickBox, [
        res(T('t'), s.t, '°C', { digits: 2 }), res(T('twb'), s.twb, '°C', { digits: 2 }),
        res(T('tdp'), s.tdp, '°C', { digits: 2 }), res(T('rh'), s.rh, '%', { digits: 1 }),
        res(T('w'), s.w, 'kg/kg', { digits: 5 }), res(T('hh'), s.h, 'kJ/kg', { digits: 2 }),
        res(T('v'), s.v, 'm³/kg', { digits: 4 }), res(T('rho'), s.rho, 'kg/m³', { digits: 3 }),
        res(T('pw'), s.pw, 'kPa', { digits: 3 }), res(T('mu'), s.mu, '—', { digits: 4 }),
      ]);
    }
    rebuild();
  }, { src: 'ASHRAE Fundamentals 2025 ch.1 · Hyland & Wexler 1983' });
  root.append(fold(T('advanced') + ' — ' + T('quick'), quickCard));

  const mixBox = h('div');
  const mixCard = card(T('mixTitle'), T('mixSub'), (body) => {
    const f = form([
      { key: 't1', label: 'Air 1 ' + T('t'), unit: '°C', def: 24.6 },
      { key: 'rh1', label: 'Air 1 ' + T('rh'), unit: '%', def: 50 },
      { key: 'm1', label: T('m1'), unit: 'kg/s', def: 1 },
      { key: 't2', label: 'Air 2 ' + T('t'), unit: '°C', def: 10 },
      { key: 'rh2', label: 'Air 2 ' + T('rh'), unit: '%', def: 40 },
      { key: 'm2', label: T('m2'), unit: 'kg/s', def: 1 },
    ], drawMix, 'grid3');
    body.append(f.grid, mixBox);
    function drawMix(a) {
      if ([a.t1, a.rh1, a.m1, a.t2, a.rh2, a.m2].some((x) => x == null) || a.m1 + a.m2 <= 0) {
        results(mixBox, []); return;
      }
      const s1 = P.state({ t: a.t1, rh: a.rh1, p: S.p });
      const s2 = P.state({ t: a.t2, rh: a.rh2, p: S.p });
      if (!s1 || !s2) { results(mixBox, []); return; }
      const sm = P.mix(s1, s2, a.m1, a.m2);
      results(mixBox, [
        res(T('t'), sm.t, '°C', { digits: 2 }), res(T('twb'), sm.twb, '°C', { digits: 2 }),
        res(T('rh'), sm.rh, '%', { digits: 1 }), res(T('w'), sm.w, 'kg/kg', { digits: 5 }),
        res(T('hh'), sm.h, 'kJ/kg', { digits: 2 }), res(T('rho'), sm.rho, 'kg/m³', { digits: 3 }),
      ]);
    }
    drawMix(f.all());
  }, { src: 'Adiabatic mixing, mass-weighted' });
  root.append(fold(T('advanced') + ' — ' + T('mixTitle'), mixCard));

  const coilBox = h('div');
  const coilCard = card(T('coilTitle'), T('coilSub'), (body) => {
    const f = form([
      { key: 't1', label: T('inState') + ' T', unit: '°C', def: 27 },
      { key: 'rh1', label: T('inState') + ' RH', unit: '%', def: 55 },
      { key: 't2', label: T('outState') + ' T', unit: '°C', def: 13 },
      { key: 'rh2', label: T('outState') + ' RH', unit: '%', def: 95 },
      { key: 'v', label: T('flow'), unit: 'm³/s', def: 1 },
    ], drawCoil, 'grid3', 'proc-');
    body.append(f.grid, coilBox);
    function drawCoil(a) {
      if ([a.t1, a.rh1, a.t2, a.rh2, a.v].some((x) => x == null) || !(a.v > 0)) { results(coilBox, []); return; }
      const s1 = P.state({ t: a.t1, rh: a.rh1, p: S.p });
      const s2 = P.state({ t: a.t2, rh: a.rh2, p: S.p });
      if (!s1 || !s2) { results(coilBox, []); return; }
      const m = a.v * s1.rho;
      const qt = m * (s1.h - s2.h);
      const qs = m * P.CONST.CP_AIR * (s1.t - s2.t);
      const cond = Math.max(0, m * (s1.w - s2.w)) * 3600;
      results(coilBox, [
        res(T('qs'), qs, 'kW', { digits: 2 }), res(T('ql'), qt - qs, 'kW', { digits: 2 }),
        res(T('qt'), qt, 'kW', { digits: 2, big: true }),
        res(T('shr'), qt !== 0 ? qs / qt : 0, '—', { digits: 3 }),
        res(T('cond'), cond, 'kg/h', { digits: 2 }),
      ]);
    }
    drawCoil(f.all());
  }, { src: 'Steady-flow energy balance on moist air' });
  root.append(fold(T('advanced') + ' — ' + T('coilTitle'), coilCard));

  notify();
}

/** Small local helper: the shared ui.fold() keeps module code readable. */

register({
  id: 'psychro', icon: '🌡️', group: 'air', title: I18N.title, desc: I18N.desc,
  src: 'ASHRAE Fundamentals · Hyland & Wexler 1983',
  render,
});
