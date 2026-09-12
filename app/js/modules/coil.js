// Module: Coil / AHU-PAU Standard Coil Sizing (盤管 sizing)
// Restructured (audit-driven): one shared design-condition source, compact cards,
// scenario presets (AHU / PAU / winter), side-by-side scenarios moved up,
// advanced blocks folded. Formulas unchanged from the verified version.
import { register } from '../registry.js';
import { h, res, flag, card, form, results, seg, fold } from '../ui.js';
import * as P from '../engine/psychro.js';
import { psychroChartSVG } from '../charts.js';
import { STEEL_PIPES } from '../data/pipes.js';

const I18N = {
  title: { en: 'Coil — AHU / PAU Sizing', zh: '盤管 · AHU／PAU 選型' },
  desc: { en: 'Shared design conditions → cooling coil, AHU|PAU scenarios, chart; advanced folded.', zh: '共用設計條件 → 冷卻盤管、AHU｜PAU 情境、圖表；進階摺疊。' },
};

const PRESETS = {
  AHU: { oaSt: 35, oaSwb: 28, oaWt: 7, oaWrh: 60, rat: 24, rarh: 55, vs: 2.5, fra: 0.25, ts: 13, rhs: 95, dtW: 5, bf: 0.1 },
  PAU: { oaSt: 35, oaSwb: 28, oaWt: 7, oaWrh: 60, rat: 24, rarh: 55, vs: 1.2, fra: 1.0, ts: 17, rhs: 95, dtW: 5, bf: 0.1 },
  WINTER: { oaSt: 35, oaSwb: 28, oaWt: 5, oaWrh: 70, rat: 22, rarh: 50, vs: 2.0, fra: 1.0, ts: 16, rhs: 60, dtW: 5, bf: 0.1 },
};

function render(root, { L }) {
  const T = (k) => L(I18N[k]);
  const S = Object.assign({ rho: 1.2 }, PRESETS.AHU);   // shared single source of truth
  const redraws = [];
  const notify = () => redraws.forEach((f) => { try { f(); } catch (e) { /* keep UI alive */ } });

  // 1) Design conditions (8 compact fields, feeds everything below)
  let designForm = null;
  root.append(card(L({ en: 'Design Conditions', zh: '設計條件' }), '', (body) => {
    designForm = form([
      { key: 'oaSt', label: L({ en: 'OA summer DB', zh: '室外夏 乾球' }), unit: '°C', def: S.oaSt },
      { key: 'oaSwb', label: L({ en: 'OA summer WB', zh: '室外夏 濕球' }), unit: '°C', def: S.oaSwb },
      { key: 'oaWt', label: L({ en: 'OA winter DB', zh: '室外冬 乾球' }), unit: '°C', def: S.oaWt },
      { key: 'oaWrh', label: L({ en: 'OA winter RH', zh: '室外冬 RH' }), unit: '%', def: S.oaWrh },
      { key: 'rat', label: L({ en: 'Return air DB', zh: '回風 乾球' }), unit: '°C', def: S.rat },
      { key: 'rarh', label: L({ en: 'Return air RH', zh: '回風 RH' }), unit: '%', def: S.rarh },
      { key: 'vs', label: L({ en: 'Supply flow', zh: '送風量' }), unit: 'm³/s', def: S.vs },
      { key: 'fra', label: L({ en: 'Fresh air fraction', zh: '新風比例' }), unit: '0–1', def: S.fra },
    ], (st) => { Object.assign(S, st); notify(); }, 'grid4');
    body.append(designForm.grid);
    body.append(h('div', { class: 'note' }, L({ en: 'Shared source for every block below.', zh: '下方所有區塊的共用來源。' })));
  }, { src: 'Coil sheet (workbook) — design conditions' }));

  // 2) Scenario presets
  root.append(card(L({ en: 'Scenario Presets', zh: '情境預設' }), '', (body) => {
    const apply = (name) => {
      Object.assign(S, PRESETS[name]);
      if (designForm) for (const k of Object.keys(PRESETS[name])) designForm.set(k, PRESETS[name][k]);
      notify();
    };
    body.append(seg([
      { v: 'AHU', label: L({ en: 'AHU standard', zh: 'AHU 標準' }) },
      { v: 'PAU', label: L({ en: 'PAU standard (100% OA)', zh: 'PAU 標準（全新風）' }) },
      { v: 'WINTER', label: L({ en: 'Winter preheat', zh: '冬季預熱' }) },
    ], 'AHU', apply));
    body.append(h('div', { class: 'note' }, L({ en: 'One click fills the shared design conditions (OA/RA/flow/fresh-air/supply).', zh: '一鍵填入共用設計條件（室外／回風／風量／新風比／送風）。' })));
  }));

  // 3) Scenarios side-by-side (moved up, per audit)
  root.append(card(L({ en: 'Scenarios Side-by-Side (AHU | PAU)', zh: '情境並排（AHU｜PAU）' }), '', (body) => {
    const col = (name, te, rhe, tl, rhl, v) => form([
      { key: name + 'te', label: name + ' ' + L({ en: 'Entering T', zh: '進風T' }), unit: '°C', def: te },
      { key: name + 'rhe', label: name + ' ' + L({ en: 'Entering RH', zh: '進風RH' }), unit: '%', def: rhe },
      { key: name + 'tl', label: name + ' ' + L({ en: 'Leaving T', zh: '出風T' }), unit: '°C', def: tl },
      { key: name + 'rhl', label: name + ' ' + L({ en: 'Leaving RH', zh: '出風RH' }), unit: '%', def: rhl },
      { key: name + 'v', label: name + ' ' + L({ en: 'Flow', zh: '風量' }), unit: 'm³/s', def: v },
      { key: name + 'dt', label: name + ' ' + L({ en: 'CHW ΔT', zh: '冷媒水溫差' }), unit: '°C', def: 5 },
    ], () => drawScn(), 'grid2');
    const fa = col('AHU', 27, 55, 13, 95, S.vs), fp = col('PAU', 35, 60, 17, 95, +(S.vs * S.fra).toFixed(2));
    const box = h('div');
    body.append(fa.grid, fp.grid, box);
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
        out.push(res(name + ' Qt', qt, 'kW', { digits: 1, big: true }));
        out.push(res(name + ' SHR', qt > 0 ? qs / qt : 0, '—', { digits: 3 }));
        out.push(res(name + ' CHW', qt / (4.186789 * g('dt')), 'L/s', { digits: 2 }));
        out.push(res(name + ' Cond', Math.max(0, m * (s1.w - s2.w)) * 3600, 'kg/h', { digits: 1 }));
      }
      results(box, out);
    }
    drawScn();
    redraws.push(drawScn);
  }));

  // 4) Cooling coil — only 4 coil-specific inputs; design comes from above
  const chartBox = h('div', { class: 'chart-box' });
  root.append(card(L({ en: 'Cooling Coil (AHU / PAU)', zh: '冷卻盤管（AHU／PAU）' }), '', (body) => {
    const f = form([
      { key: 'ts', label: L({ en: 'Supply off-coil T', zh: '送風出盤 T' }), unit: '°C', def: S.ts },
      { key: 'rhs', label: L({ en: 'Supply off-coil RH', zh: '送風出盤 RH' }), unit: '%', def: S.rhs },
      { key: 'dtW', label: L({ en: 'CHW ΔT', zh: '冷媒水溫差' }), unit: '°C', def: S.dtW },
      { key: 'bf', label: L({ en: 'Bypass factor BF', zh: '旁通係數 BF' }), unit: '—', def: S.bf },
    ], (st) => { Object.assign(S, st); draw(); }, 'grid4');
    const box = h('div');
    body.append(f.grid, box, chartBox);
    function draw() {
      const sO = P.state({ t: S.oaSt, twb: S.oaSwb });
      const sR = P.state({ t: S.rat, rh: S.rarh });
      const sOff = P.state({ t: S.ts, rh: S.rhs });
      if (!sO || !sR || !sOff) { results(box, []); chartBox.innerHTML = ''; return; }
      const Vo = S.vs * S.fra, Vr = S.vs - Vo;
      const sMix = P.mix(sO, sR, Vo * S.rho, Vr * S.rho);
      const m = S.vs * S.rho;
      const qt = m * (sMix.h - sOff.h);
      const qs = m * 1.006 * (sMix.t - S.ts);
      const bf = Math.min(0.99, Math.max(0, S.bf));
      chartBox.innerHTML = psychroChartSVG(
        [{ id: 'O', name: 'OA', t: sO.t, w: sO.w }, { id: 'H', name: 'RA', t: sR.t, w: sR.w },
          { id: 'M', name: 'Mixed', t: sMix.t, w: sMix.w }, { id: 'S', name: 'SA', t: sOff.t, w: sOff.w }],
        [{ points: [sO.t, sO.w, sR.t, sR.w], color: 'mix', dash: true, label: 'MIX' },
          { points: [sMix.t, sMix.w, sOff.t, sOff.w], color: 'cool', label: 'Cooling' },
          { points: [sOff.t, sOff.w, sR.t, sR.w], color: 'heat', label: 'Room' }], { pws: P.pws, p: 101.325 });
      results(box, [
        res(L({ en: 'Mixed (on-coil) T', zh: '混風盤前 T' }), sMix.t, '°C', { digits: 2 }),
        res(L({ en: 'Total cooling', zh: '總冷卻負荷' }), qt, 'kW', { digits: 1, big: true }),
        res(L({ en: 'Sensible', zh: '顯熱' }), qs, 'kW', { digits: 1 }),
        res('SHR', qt > 0 ? qs / qt : 0, '—', { digits: 3 }),
        res(L({ en: 'CHW flow', zh: '冷水量' }), qt / (4.186789 * S.dtW), 'L/s', { digits: 2 }),
        res(L({ en: 'Condensate', zh: '冷凝水' }), Math.max(0, m * (sMix.w - sOff.w)) * 3600, 'kg/h', { digits: 1 }),
        res('ADP', (S.ts - bf * sMix.t) / (1 - bf), '°C', { digits: 2 }),
      ]);
      const isCool = qt > 0 && S.ts < sMix.t;
      box.append(flag(isCool ? L({ en: 'Cooling + de-humidification', zh: '冷卻除濕' }) : L({ en: 'Verify cooling case', zh: '請確認冷卻工況' }), isCool ? 'ok' : 'bad'));
    }
    draw();
    redraws.push(draw);
  }, {
    formula: 'Q_t = m·Δh; Q_s = m·cₚ·ΔT; SHR = Q_s/Q_t; CHW = Q_t/(4.187·ΔT_w); t_ADP = (t_s − BF·t_mix)/(1−BF)',
    src: 'Coil sheet (workbook); psychrometrics per ASHRAE',
  }));

  // 5) Advanced (folded)
  const wBox = h('div');
  const wtCard = card(L({ en: 'Water Temperature & Duct Design', zh: '水溫與風管設計' }), '', (body) => {
    const f = form([
      { key: 'tws', label: L({ en: 'CHW supply', zh: '冷媒水供水' }), unit: '°C', def: 7 },
      { key: 'twr', label: L({ en: 'CHW return', zh: '冷媒水回水' }), unit: '°C', def: 12 },
      { key: 'hws', label: L({ en: 'HWS supply', zh: '熱媒水供水' }), unit: '°C', def: 60 },
      { key: 'hwr', label: L({ en: 'HWS return', zh: '熱媒水回水' }), unit: '°C', def: 50 },
      { key: 'kw', label: L({ en: 'Duty', zh: '負荷' }), unit: 'kW', def: 100 },
      { key: 'vMax', label: L({ en: 'Duct max velocity', zh: '風管最大流速' }), unit: 'm/s', def: 2.5 },
    ], drawW, 'grid3');
    body.append(f.grid, wBox);
    function drawW(st) {
      if ([st.tws, st.twr, st.hws, st.hwr, st.kw, st.vMax].some((x) => x == null)) { results(wBox, []); return; }
      results(wBox, [
        res(L({ en: 'CHW ΔT', zh: '冷媒水溫差' }), st.twr - st.tws, '°C', { digits: 1 }),
        res(L({ en: 'CHW flow @ duty', zh: '冷水量@負荷' }), st.kw / (4.186789 * (st.twr - st.tws)), 'L/s', { digits: 2 }),
        res(L({ en: 'HWS flow @ duty', zh: '熱水量@負荷' }), st.kw / (4.186789 * (st.hws - st.hwr)), 'L/s', { digits: 2 }),
      ]);
    }
    drawW(f.all());
  }, { src: 'Coil sheet (workbook): water temperature & duct design blocks' });

  root.append(fold(L({ en: 'Advanced — water temperature & duct design', zh: '進階 — 水溫與風管設計' }), wtCard));

  // 6) Chilled-water pipe (folded)
  const pBox = h('div');
  const pipeCard = card(L({ en: 'Chilled-Water Pipe', zh: '冷媒水管選徑' }), '', (body) => {
    const f = form([
      { key: 'q', label: L({ en: 'CHW flow', zh: '冷水量' }), unit: 'L/s', def: 6.1 },
      { key: 'vMax', label: L({ en: 'Velocity limit', zh: '流速限值' }), unit: 'm/s', def: 2.5 },
      { key: 'pdMax', label: L({ en: 'PD limit', zh: '比摩阻限值' }), unit: 'Pa/m', def: 400 },
      { key: 'c', label: L({ en: 'Roughness C', zh: '粗糙係數 C' }), unit: '—', def: 140 },
    ], drawP, 'grid4');
    body.append(f.grid, pBox);
    function drawP(st) {
      if ([st.q, st.vMax, st.pdMax, st.c].some((x) => x == null || x <= 0)) { results(pBox, []); return; }
      const pick = STEEL_PIPES.map((p) => {
        const v = (st.q / 1000) / (Math.PI * Math.pow(p.id / 2000, 2));
        return { p, v, pd: 6.819 * Math.pow(v / st.c, 1.852) / Math.pow(p.id / 1000, 1.167) * 9810 };
      }).find((r) => r.v <= st.vMax && r.pd <= st.pdMax);
      if (pick) {
        results(pBox, [
          res(L({ en: 'Selected DN', zh: '選定管徑' }), 'DN' + pick.p.dn, '', { digits: 0, big: true }),
          res(L({ en: 'Velocity', zh: '流速' }), pick.v, 'm/s', { digits: 2 }),
          res(L({ en: 'PD', zh: '比摩阻' }), pick.pd, 'Pa/m', { digits: 0 }),
        ]);
        pBox.append(flag(L({ en: 'Within limits', zh: '符合限值' }), 'ok'));
      } else results(pBox, [res(L({ en: 'No size fits', zh: '無合適管徑' }), '—', '', { digits: 0, err: true })]);
    }
    drawP(f.all());
  }, { formula: 'Hazen–Williams: ΔP/L = 6.819·(V/C)^1.852/d^1.167·9810', src: 'ASHRAE F. Ch.22 · CIBSE 2.5 m/s / 400 Pa/m' });

  root.append(fold(L({ en: 'Advanced — chilled-water pipe sizing', zh: '進階 — 冷媒水管選徑' }), pipeCard));
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

register({ id: 'coil', icon: '🧊', group: 'air', title: I18N.title, desc: I18N.desc, src: 'Coil sheet (AHU/PAU) · ASHRAE psychrometrics', render });
