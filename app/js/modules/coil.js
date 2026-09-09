// Module: Coil / AHU-PAU Standard Coil Sizing (盤管 sizing)
// Upgraded from the workbook 'Coil' sheet (AHU & PAU standard coil).
// Sections: design & air flow & mixing, cooling coil (load/SHR/water/condensate/ADP),
// preheat / reheat / steam / humidification, chilled-water pipe selection.
import { register } from '../registry.js';
import { h, res, flag, card, form, results, seg } from '../ui.js';
import * as P from '../engine/psychro.js';
import * as F from '../engine/fluids.js';
import { STEEL_PIPES } from '../data/pipes.js';
import { psychroChartSVG } from '../charts.js';

const I18N = {
  title: { en: 'Coil — AHU / PAU Sizing', zh: '盤管 · AHU／PAU 選型' },
  desc: { en: 'Standard AHU/PAU coil design: mixed on-coil state, cooling load + SHR + chilled-water + condensate + ADP, preheat/reheat, steam & humidification, and chilled-water pipe.', zh: '標準 AHU／PAU 盤管設計：混風盤前狀態、冷卻負荷＋SHR＋冷水量＋冷凝水＋ADP、預熱／再熱、蒸汽與加濕、冷水管選徑。' },
  // System & air
  sysTitle: { en: 'System & Air Design', zh: '系統與空氣設計' },
  unit: { en: 'Unit type', zh: '設備類型' },
  ahu: { en: 'AHU', zh: 'AHU' },
  pau: { en: 'PAU', zh: 'PAU' },
  rho: { en: 'Air density ρ', zh: '空氣密度 ρ' },
  oaS: { en: 'OA Summer', zh: '室外夏季' },
  oaW: { en: 'OA Winter', zh: '室外冬季' },
  ra: { en: 'Return air (RA)', zh: '回風（RA）' },
  vs: { en: 'Supply air flow Vs', zh: '送風量 Vs' },
  fra: { en: 'Fresh air fraction', zh: '新風比例' },
  ts: { en: 'Supply off-coil T (s)', zh: '送風出盤溫度 (s)' },
  rhs: { en: 'Supply off-coil RH (s)', zh: '送風出盤相對濕度 (s)' },
  mix: { en: 'On-coil (mixing) state', zh: '盤前（混風）狀態' },
  off: { en: 'Off-coil (supply) state', zh: '盤後（送風）狀態' },
  qvent: { en: 'Ventilation load', zh: '通風負荷' },
  // Cooling
  coolTitle: { en: 'Cooling Coil (AHU / PAU)', zh: '冷卻盤管（AHU／PAU）' },
  qt: { en: 'Total cooling load', zh: '總冷卻負荷' },
  qs: { en: 'Sensible cooling', zh: '顯熱冷卻' },
  ql: { en: 'Latent cooling', zh: '潛熱冷卻' },
  shr: { en: 'SHR', zh: '顯熱比' },
  dtW: { en: 'Chilled water ΔT', zh: '冷媒水溫差' },
  chw: { en: 'Chilled water flow', zh: '冷水量' },
  cond: { en: 'Condensate', zh: '冷凝水量' },
  adp: { en: 'Coil ADP (approx)', zh: '盤管 ADP（近似）' },
  bf: { en: 'Bypass factor BF', zh: '旁通係數 BF' },
  // Heat & humidify
  heatTitle: { en: 'Preheat / Reheat / Steam / Humidification', zh: '預熱／再熱／蒸汽／加濕' },
  preT: { en: 'Preheat target (fresh air)', zh: '預熱目標（新風）' },
  reT: { en: 'Reheat target', zh: '再熱目標' },
  hTur: { en: 'Humidification target W', zh: '加濕目標含濕量' },
  qPre: { en: 'Preheat load', zh: '預熱負荷' },
  qRe: { en: 'Reheat load', zh: '再熱負荷' },
  steamIn: { en: 'Steam heating', zh: '蒸汽加熱' },
  hfg: { en: 'Steam latent heat hfg', zh: '蒸汽汽化熱 hfg' },
  steamRate: { en: 'Steam flow', zh: '蒸汽量' },
  hum: { en: 'Humidification', zh: '加濕量' },
  // pipe
  pipeTitle: { en: 'Chilled-Water Pipe', zh: '冷媒水管選徑' },
  vmax: { en: 'Velocity limit', zh: '流速限值' },
  pdmax: { en: 'Pressure-drop limit', zh: '比摩阻限值' },
  dn: { en: 'Selected DN', zh: '選定 DN' },
  vel: { en: 'Velocity', zh: '流速' },
  pd: { en: 'Pressure drop', zh: '比摩阻' },
  warn: { en: 'Off-coil T ≥ on-coil T — verify cooling case.', zh: '出盤溫 ≥ 盤前溫 — 請確認是否冷卻工況。' },
  fallback: { en: 'For engineering reference only. Verify with a registered engineer.', zh: '僅供工程參考，請由註冊工程師覆核。' },
};

function render(root, { L }) {
  const T = (k) => L(I18N[k]);
  let unit = 'AHU';

  // ---- Card A: System & air design + mixing ----
  root.append(card(T('sysTitle'), '', (body) => {
    const unitRow = h('div', { class: 'field' }, h('label', {}, T('unit')),
      seg([{ v: 'AHU', label: T('ahu') }, { v: 'PAU', label: T('pau') }], unit, (v) => { unit = v; draw(f.all()); }));
    const f = form([
      { key: 'rho', label: T('rho'), unit: 'kg/m³', def: 1.2 },
      { key: 'oaSt', label: T('oaS') + ' DB', unit: '°C', def: 35 },
      { key: 'oaSwb', label: T('oaS') + ' WB', unit: '°C', def: 28 },
      { key: 'oaWt', label: T('oaW') + ' DB', unit: '°C', def: 7 },
      { key: 'oaWrh', label: T('oaW') + ' RH', unit: '%', def: 60 },
      { key: 'rat', label: T('ra') + ' DB', unit: '°C', def: 24 },
      { key: 'rarh', label: T('ra') + ' RH', unit: '%', def: 55 },
      { key: 'vs', label: T('vs'), unit: 'm³/s', def: 2.5 },
      { key: 'fra', label: T('fra'), unit: '0–1', def: 0.25 },
      { key: 'ts', label: T('ts'), unit: '°C', def: 13 },
      { key: 'rhs', label: T('rhs'), unit: '%', def: 95 },
    ], (st) => draw(st), 'grid4');
    const box = h('div');
    const chartBox = h('div', { class: 'chart-box' });
    body.append(unitRow, f.grid, box, chartBox);
    function draw(st) {
      if ([st.rho, st.oaSt, st.oaSwb, st.oaWt, st.oaWrh, st.rat, st.rarh, st.vs, st.fra, st.ts, st.rhs].some((x) => x == null)) { results(box, []); return; }
      const sOaS = P.state({ t: st.oaSt, twb: st.oaSwb });
      const sOaW = P.state({ t: st.oaWt, rh: st.oaWrh });
      const sR = P.state({ t: st.rat, rh: st.rarh });
      const sOff = P.state({ t: st.ts, rh: st.rhs });
      if (!sOaS || !sOaW || !sR || !sOff) { results(box, []); return; }
      const Vo = st.vs * st.fra, Vr = st.vs - Vo;
      const sMix = P.mix(sOaS, sR, Vo * st.rho, Vr * st.rho);
      const qvent = Vo * st.rho * (sOaS.h - sR.h);
      const chart = chartBox;
      chart.innerHTML = psychroChartSVG(
        [
          { id: 'O', name: 'OA', t: sOaS.t, w: sOaS.w, show: `OA ${sOaS.t.toFixed(0)}°` },
          { id: 'H', name: 'RA', t: sR.t, w: sR.w, show: `RA ${sR.t.toFixed(0)}°` },
          { id: 'M', name: 'Mixed', t: sMix.t, w: sMix.w, show: `${sMix.t.toFixed(1)}°` },
          { id: 'S', name: 'SA', t: sOff.t, w: sOff.w, show: `SA ${sOff.t.toFixed(0)}°` },
        ],
        [
          { points: [sOaS.t, sOaS.w, sR.t, sR.w], color: 'mix', dash: true, label: 'M IX' },
          { points: [sMix.t, sMix.w, sOff.t, sOff.w], color: 'cool', label: 'Cooling' },
          { points: [sOff.t, sOff.w, sR.t, sR.w], color: 'heat', label: 'Room' },
        ],
        { pws: P.pws, p: 101.325 });
      results(box, [
        res(L({ en: 'Mixing T', zh: '混風溫度' }), sMix.t, '°C', { digits: 2 }),
        res(L({ en: 'Mixing h', zh: '混風焓值' }), sMix.h, 'kJ/kg', { digits: 2 }),
        res(L({ en: 'RA h', zh: '回風焓值' }), sR.h, 'kJ/kg', { digits: 2 }),
        res(L({ en: 'OA(summer) h', zh: '室外(夏)焓值' }), sOaS.h, 'kJ/kg', { digits: 2 }),
        res(T('qvent'), qvent, 'kW', { digits: 2 }),
        res(L({ en: 'Supply h (off-coil)', zh: '送風焓值(盤後)' }), sOff.h, 'kJ/kg', { digits: 2 }),
      ]);
      box.append(h('div', { class: 'note' }, T('fallback'), ' · ', h('a', { href: '#m/pipes', 'data-nav': '' }, L({ en: 'Chilled-water pipe sizing ->', zh: '冷媒水選徑 ➜ 🚿' }))));
    }
    draw(f.all());
  }, { src: 'Coil sheet (workbook): mixing point & ventilation load' }));

  // ---- Card B: Cooling coil ----
  root.append(card(T('coolTitle'), '', (body) => {
    const f = form([
      { key: 'rho', label: T('rho'), unit: 'kg/m³', def: 1.2 },
      { key: 'oaSt', label: T('oaS') + ' DB', unit: '°C', def: 35 },
      { key: 'oaSwb', label: T('oaS') + ' WB', unit: '°C', def: 28 },
      { key: 'rat', label: T('ra') + ' DB', unit: '°C', def: 24 },
      { key: 'rarh', label: T('ra') + ' RH', unit: '%', def: 55 },
      { key: 'vs', label: T('vs'), unit: 'm³/s', def: 2.5 },
      { key: 'fra', label: T('fra'), unit: '0–1', def: 0.25 },
      { key: 'ts', label: T('ts'), unit: '°C', def: 13 },
      { key: 'rhs', label: T('rhs'), unit: '%', def: 95 },
      { key: 'dtW', label: T('dtW'), unit: '°C', def: 5 },
      { key: 'bf', label: T('bf'), unit: '—', def: 0.1 },
    ], (st) => draw(st), 'grid4');
    const box = h('div');
    body.append(f.grid, box);
    function draw(st) {
      if ([st.rho, st.oaSt, st.oaSwb, st.rat, st.rarh, st.vs, st.fra, st.ts, st.rhs, st.dtW, st.bf].some((x) => x == null)) { results(box, []); return; }
      const sO = P.state({ t: st.oaSt, twb: st.oaSwb });
      const sR = P.state({ t: st.rat, rh: st.rarh });
      const sOff = P.state({ t: st.ts, rh: st.rhs });
      if (!sO || !sR || !sOff) { results(box, []); return; }
      const Vo = st.vs * st.fra, Vr = st.vs - Vo;
      const sMix = P.mix(sO, sR, Vo * st.rho, Vr * st.rho);
      const m = st.vs * st.rho;
      const qt = m * (sMix.h - sOff.h);
      const qs = m * 1.006 * (sMix.t - st.ts);
      const ql = qt - qs;
      const shr = qt > 0 ? qs / qt : 0;
      const cond = Math.max(0, m * (sMix.w - sOff.w)) * 3600;
      const chw = qt > 0 ? qt / (4.186789 * st.dtW) : 0;
      const bf = Math.min(0.99, Math.max(0, st.bf));
      const tADP = (st.ts - bf * sMix.t) / (1 - bf);
      const wADP = Math.max(1e-4, (sOff.w - bf * sMix.w) / (1 - bf));
      const adpRh = P.RHfromPw(tADP, P.pwFromW(wADP));
      const isCool = qt > 0 && st.ts < sMix.t;
      results(box, [
        res(T('qt'), qt, 'kW', { digits: 1, big: true }),
        res(T('qs'), qs, 'kW', { digits: 1 }),
        res(T('ql'), ql, 'kW', { digits: 1 }),
        res(T('shr'), shr, '—', { digits: 3 }),
        res(T('chw'), chw, 'L/s', { digits: 2 }),
        res(T('cond'), cond, 'kg/h', { digits: 1 }),
        res(T('adp'), tADP, '°C', { digits: 2 }),
        res(L({ en: 'ADP RH', zh: 'ADP 相對濕度' }), adpRh, '%', { digits: 1 }),
      ]);
      box.append(flag(isCool
        ? L({ en: `Cooling + de-humidification (SHR ${shr.toFixed(3)}) · ${unit}`, zh: `冷卻除濕（SHR ${shr.toFixed(3)}）· ${unit}` }) : T('warn'), isCool ? 'ok' : 'bad'));
    }
    draw(f.all());
  }, {
    formula: 'Q_t = m·Δh;  Q_s = m·cₚ·ΔT;  SHR = Q_s/Q_t;  CHW = Q_t/(4.187·ΔT_w);  t_ADP = (t_s − BF·t_mix)/(1−BF)',
    src: 'Coil sheet (workbook); psychrometrics per ASHRAE',
  }));


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

  // ---- Card B2: water temperature & duct design ----
  root.append(card(L({ en: 'Water Temperature & Duct Design', zh: '水溫與風管設計' }), '', (body) => {
    const f = form([
      { key: 'tws', label: L({ en: 'CHW supply', zh: '冷媒水供水' }), unit: '°C', def: 7 },
      { key: 'twr', label: L({ en: 'CHW return', zh: '冷媒水回水' }), unit: '°C', def: 12 },
      { key: 'hws', label: L({ en: 'HWS supply', zh: '熱媒水供水' }), unit: '°C', def: 60 },
      { key: 'hwr', label: L({ en: 'HWS return', zh: '熱媒水回水' }), unit: '°C', def: 50 },
      { key: 'kw', label: L({ en: 'Duty', zh: '負荷' }), unit: 'kW', def: 100 },
      { key: 'vMax', label: L({ en: 'Duct max velocity', zh: '風管最大流速' }), unit: 'm/s', def: 2.5 },
      { key: 'pdMax', label: L({ en: 'Duct max PD', zh: '風管最大比摩阻' }), unit: 'Pa/m', def: 400 },
    ], draw, 'grid3');
    const box = h('div');
    body.append(f.grid, box);
    function draw(st) {
      if ([st.tws, st.twr, st.hws, st.hwr, st.kw, st.vMax, st.pdMax].some((x) => x == null)) { results(box, []); return; }
      const dTc = st.twr - st.tws, dTh = st.hws - st.hwr;
      results(box, [
        res(L({ en: 'CHW ΔT', zh: '冷媒水溫差' }), dTc, '°C', { digits: 1 }),
        res(L({ en: 'CHW flow @ duty', zh: '冷水量@負荷' }), st.kw / (4.186789 * dTc), 'L/s', { digits: 2 }),
        res(L({ en: 'HWS ΔT', zh: '熱媒水溫差' }), dTh, '°C', { digits: 1 }),
        res(L({ en: 'HWS flow @ duty', zh: '熱水量@負荷' }), st.kw / (4.186789 * dTh), 'L/s', { digits: 2 }),
        res(L({ en: 'Duct design limits', zh: '風管設計限值' }), st.vMax + ' m/s · ' + st.pdMax + ' Pa/m', '', { digits: 0 }),
      ]);
    }
    draw(f.all());
  }, { src: 'Coil sheet (workbook): water temperatures & duct design blocks', collapsed: true }));

  // ---- Card C: preheat / reheat / steam / humidification ----
  root.append(card(T('heatTitle'), '', (body) => {
    const f = form([
      { key: 'rho', label: T('rho'), unit: 'kg/m³', def: 1.2 },
      { key: 'oaWt', label: T('oaW') + ' DB', unit: '°C', def: 7 },
      { key: 'oaWrh', label: T('oaW') + ' RH', unit: '%', def: 60 },
      { key: 'vs', label: T('vs'), unit: 'm³/s', def: 2.5 },
      { key: 'fra', label: T('fra'), unit: '0–1', def: 0.25 },
      { key: 'preT', label: T('preT'), unit: '°C', def: 16 },
      { key: 'reT', label: T('reT'), unit: '°C', def: 20 },
      { key: 'ts', label: T('ts'), unit: '°C', def: 13 },
      { key: 'hTur', label: T('hTur'), unit: 'kg/kg', def: 0.007 },
      { key: 'hfg', label: T('hfg'), unit: 'kJ/kg', def: 2257 },
    ], (st) => draw(st), 'grid4');
    const box = h('div');
    body.append(f.grid, box);
    function draw(st) {
      if ([st.rho, st.oaWt, st.oaWrh, st.vs, st.fra, st.preT, st.reT, st.ts, st.hTur, st.hfg].some((x) => x == null)) { results(box, []); return; }
      const sOW = P.state({ t: st.oaWt, rh: st.oaWrh });
      if (!sOW || st.hfg <= 0) { results(box, []); return; }
      const m = st.vs * st.rho;
      const mO = st.vs * st.fra * st.rho;
      const qPre = mO * 1.006 * (st.preT - st.oaWt);
      const qRe = m * 1.006 * (st.reT - st.ts);
      const steam = qPre > 0 ? qPre * 3600 / st.hfg : 0;
      const hum = Math.max(0, mO * (st.hTur - sOW.w) * 3600);
      results(box, [
        res(T('qPre'), qPre, 'kW', { digits: 1 }),
        res(T('steamIn'), steam, 'kg/h', { digits: 0 }),
        res(T('qRe'), qRe, 'kW', { digits: 1 }),
        res(T('hum'), hum, 'kg/h', { digits: 1, big: true }),
      ]);
      box.append(h('div', { class: 'note' },
        L({ en: 'Steam uses hfg = ' + st.hfg + ' kJ/kg (100 °C, 1 atm = 2257). Humidification on fresh air only.', zh: '蒸汽以 hfg = ' + st.hfg + ' kJ/kg（100°C、1 atm 為 2257）。加濕僅計算新鮮空氣。' })));
    }
    draw(f.all());
  }, { src: 'Steam tables; sensible-heat relations (workbook Coil sheet)', collapsed: true }));

  // ---- Card D: chilled water pipe ----
  root.append(card(T('pipeTitle'), '', (body) => {
    const f = form([
      { key: 'q', label: T('chw'), unit: 'L/s', def: 6.1 },
      { key: 'vMax', label: T('vmax'), unit: 'm/s', def: 2.5 },
      { key: 'pdMax', label: T('pdmax'), unit: 'Pa/m', def: 400 },
      { key: 'c', label: L({ en: 'Roughness C', zh: '粗糙係數 C' }), unit: '—', def: 140 },
    ], (st) => draw(st), 'grid4');
    const box = h('div');
    body.append(f.grid, box);
    function draw(st) {
      if ([st.q, st.vMax, st.pdMax, st.c].some((x) => x == null || x <= 0)) { results(box, []); return; }
      const rows = STEEL_PIPES.map((p) => {
        const v = F.velocityFromFlow(st.q, p.id);
        const pd = F.hazenWilliams(v, p.id, st.c);
        return { p, v, pd, ok: v <= st.vMax && pd <= st.pdMax };
      });
      const pick = rows.find((r) => r.ok);
      if (pick) {
        results(box, [
          res(T('dn'), 'DN' + pick.p.dn, '', { digits: 0, big: true }),
          res(T('vel'), pick.v, 'm/s', { digits: 2 }),
          res(T('pd'), pick.pd, 'Pa/m', { digits: 0 }),
        ]);
        box.append(flag(L({ en: 'Within limits ✔', zh: '符合限值 ✔' }), 'ok'));
      } else {
        results(box, [res(T('dn'), L({ en: 'No size fits', zh: '無合適管徑' }), '', { digits: 0, err: true })]);
      }
    }
    draw(f.all());
  }, { formula: 'Hazen–Williams:  ΔP/L = 6.819·(V/C)^1.852/d^1.167·9810', src: 'ASHRAE F. Ch.22; CIBSE limits 2.5 m/s / 400 Pa/m', collapsed: true }));
}

register({ id: 'coil', icon: '🧊', group: 'air', title: I18N.title, desc: I18N.desc, src: 'Coil sheet (AHU/PAU) · ASHRAE psychrometrics', render });
