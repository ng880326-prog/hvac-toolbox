// Module: Insulation (保溫) — from '29_Insulations' sheet, upgraded to BEC 2024 / BEC 2012
//
// The workbook page is a blank BEC-2012 template: three side-by-side minimum-thickness tables
// (pipework, duct/AHU casing, refrigerant pipework) whose lookups all resolve to empty rows, plus a
// right-hand "Calculation of Thickness of Insulation" block that was never filled in. This module
// carries the published BEC tables for both editions (2024 default, 2012 for older submissions),
// reproduces the code equations for materials/conditions outside the tables, and shows whether a
// proposed thickness complies.
import { register } from '../registry.js';
import { h, res, flag, card, form, results, seg } from '../ui.js';
import * as F from '../engine/fluids.js';
import { BEC_EDITIONS, BEC_CURRENT, INSULATION_MATERIALS } from '../data/insulation_refs.js';

const I18N = {
  title: { en: 'Insulation', zh: '保溫' },
  desc: {
    en: 'BEC minimum insulation thickness (pipework, duct/AHU casing, refrigerant) plus the code heat-transfer calculation.',
    zh: 'BEC 最低保溫厚度（管道、風管／AHU 機箱、冷媒管）及條例換熱計算。',
  },
  edition: { en: 'Code edition', zh: '條例版本' },
  exposure: { en: 'Ambient condition', zh: '環境工況' },
  outdoor: { en: 'Outdoor', zh: '室外' },
  unconditioned: { en: 'Unconditioned', zh: '非空調空間' },
  void: { en: 'Ceiling void', zh: '天花空腔' },
  conditioned: { en: 'Conditioned', zh: '空調空間' },
  lambda: { en: 'Thermal conductivity λ', zh: '導熱係數 λ' },
  hCoef: { en: 'Surface coefficient h', zh: '表面換熱係數 h' },
  anyH: { en: 'any value', zh: '任意值' },
  doLabel: { en: 'Pipe outside diameter do', zh: '管外徑 do' },
  pipe: { en: 'Chilled water pipework', zh: '冷凍水管道' },
  pipeSrc: { en: 'BEC Table 6.11a', zh: 'BEC 表 6.11a' },
  duct: { en: 'Ductwork / AHU casing', zh: '風管／AHU 機箱' },
  ductSrc: { en: 'BEC Table 6.11c + TG 6.11.1(a)', zh: 'BEC 表 6.11c＋TG 6.11.1(a)' },
  refrig: { en: 'Suction refrigerant pipework', zh: '冷媒吸入管' },
  refrigSrc: { en: 'BEC Table 6.11b', zh: 'BEC 表 6.11b' },
  lineTemp: { en: 'Line temperature', zh: '管內溫度' },
  dT: { en: 'ΔT inside/surrounding', zh: '內外溫差 ΔT' },
  dn: { en: 'Nominal / OD', zh: '標稱／外徑' },
  standard: { en: 'Code minimum', zh: '標準最低' },
  calculated: { en: 'Calculated (a)+(b)', zh: '計算值 (a)+(b)' },
  commercial: { en: 'Commercial size', zh: '商用厚度' },
  required: { en: 'Required minimum thickness', zh: '要求最低厚度' },
  yourThickness: { en: 'Proposed thickness', zh: '擬用厚度' },
  compliant: { en: 'Proposed thickness meets the code minimum ✔', zh: '擬用厚度符合標準最低要求 ✔' },
  short: { en: 'Proposed thickness is below the code minimum — increase it.', zh: '擬用厚度低於標準最低要求 — 請加厚。' },
  notTabulated: {
    en: 'λ/h not in the table — thickness from Equations (a)+(b) as BEC §6.11.1(a)(iv) allows.',
    zh: 'λ／h 不在表內 — 依 BEC §6.11.1(a)(iv) 以公式 (a)+(b) 計算厚度。',
  },
  conditionedNote: {
    en: 'Conditioned-space values follow ASHRAE 90.1 with a 13 mm floor, so no equation is shown.',
    zh: '空調空間數值依 ASHRAE 90.1 並以 13 mm 為下限，故不列公式值。',
  },
  calcTitle: { en: 'Thickness of insulation (code equations)', zh: '保溫厚度計算（條例公式）' },
  calcDesc: {
    en: 'Equation (a) gives the provisional thickness; Equation (b) converts it to a cylindrical pipe layer (no circular surface for ducts, so c itself is the thickness).',
    zh: '公式 (a) 得臨時厚度；公式 (b) 換算為圓管保溫層厚度（風管無圓周面，c 即為厚度）。',
  },
  provC: { en: 'Provisional thickness c', zh: '臨時厚度 c' },
  laMin: { en: 'Pipe insulation thickness La,min', zh: '管道保溫厚度 La,min' },
  equivDe: { en: 'Equivalent thickness de at the proposed t', zh: '等效厚度 de（按擬用厚度）' },
  surfT: { en: 'Insulation surface temperature', zh: '保溫表面溫度' },
  dewPoint: { en: 'Ambient dew point θd', zh: '環境露點 θd' },
  fluidT: { en: 'Cold surface / line temperature θl', zh: '冷表面／管內溫度 θl' },
  ambientT: { en: 'Ambient still air θm', zh: '環境靜止空氣 θm' },
  useStandard: { en: 'Use this edition’s basis', zh: '套用本版本設計基準' },
  noCond: { en: 'Surface stays above dew point — no condensation ✔', zh: '表面高於露點 — 不結露 ✔' },
  cond: { en: 'Surface below dew point — condensation will form.', zh: '表面低於露點 — 會結露。' },
  barrier: { en: 'Vapour barrier', zh: '防潮層' },
};

/** Codes' design basis for one ambient condition (BEC remarks @2 / @5). */
function basisOf(ed, exposure) {
  if (exposure === 'void' && ed.voidSpace) return ed.voidSpace;
  if (exposure === 'conditioned') return null;
  return ed.outdoor;
}

function columnIndex(ed, exposure, lambda, hCoef) {
  return ed.columns.findIndex((c) => c.exposure === exposure
    && Math.abs(c.lambda - lambda) < 1e-9
    && (c.h == null || (hCoef != null && Math.abs(c.h - hCoef) < 1e-9)));
}

function hOptions(ed, exposure) {
  if (exposure === 'conditioned') return [{ v: null, label: '—' }];
  return ed.h[exposure === 'outdoor' ? 'outdoor' : 'indoor'].map((v) => ({ v, label: String(v) }));
}

function table(head, rows) {
  const t = h('table', { class: 'pipes-table ins-table' });
  t.append(h('thead', {}, h('tr', {}, ...head.map((x) => h('th', {}, x)))));
  const tb = h('tbody');
  for (const r of rows) {
    const tr = h('tr', { class: r.cls || null });
    for (const c of r.cells) tr.append(h('td', { class: c.num ? 'num' : null }, c.node));
    tb.append(tr);
  }
  t.append(tb);
  return h('div', { class: 'table-scroll' }, t);
}

function render(root, { L }) {
  const T = (k) => L(I18N[k]);
  const ed0 = BEC_CURRENT;
  const st = {
    ed: ed0,
    exposure: 'outdoor',
    lambda: 0.024,
    hCoef: 9,
    do: 60.3,
    lineTemp: 0,
    dT: 15,
  };
  const mats = INSULATION_MATERIALS.map((m) => ({ v: m.lambda, label: L(m.name) + ' ≈' + m.lambda }));

  root.append(card(T('title'), T('desc'), (body) => {
    const controls = h('div');
    const pickBox = h('div');
    const tableBox = h('div');
    const outBox = h('div');
    body.append(controls, pickBox, tableBox, outBox);

    const edRow = h('div', { class: 'field' }, h('label', {}, T('edition')),
      seg(BEC_EDITIONS.map((e) => ({ v: e.id, label: L(e.label) })), st.ed, (v) => {
        st.ed = BEC_EDITIONS.find((e) => e.id === v) || BEC_CURRENT;
        st.exposure = 'outdoor';
        st.hCoef = 9;
        buildPickers();
        draw();
      }));
    const expRow = h('div', { class: 'field' }, h('label', {}, T('exposure')));
    const hRow = h('div', { class: 'field' }, h('label', {}, T('hCoef')));
    const matRow = h('div', { class: 'field' }, h('label', {}, T('lambda')),
      seg(mats, st.lambda, (v) => { st.lambda = v; buildPickers(); draw(); }));
    const f = form([
      { key: 'do', label: T('doLabel'), unit: 'mm', def: st.do },
      { key: 't', label: T('yourThickness'), unit: 'mm', def: 25 },
    ], draw, 'grid2', 'ins-');
    f.grid.classList.add('ins-pick');
    controls.append(edRow, expRow, hRow, matRow, f.grid, pickBox);

    function buildPickers() {
      const exps = st.ed.columns.reduce((acc, c) => (acc.includes(c.exposure) ? acc : acc.concat(c.exposure)), []);
      const names = { outdoor: 'outdoor', unconditioned: 'unconditioned', void: 'void', conditioned: 'conditioned' };
      expRow.replaceChildren(h('label', {}, T('exposure')),
        seg(exps.map((e) => ({ v: e, label: T(names[e]) })), st.exposure, (v) => { st.exposure = v; buildPickers(); draw(); }));
      const hs = hOptions(st.ed, st.exposure);
      if (!hs.some((o) => o.v === st.hCoef)) st.hCoef = hs[0].v;
      hRow.replaceChildren(h('label', {}, T('hCoef')),
        hs[0].v == null
          ? h('div', { class: 'ins-any' }, T('anyH'))
          : seg(hs, st.hCoef, (v) => { st.hCoef = v; draw(); }));
    }

    function draw() {
      const state = f.all();
      if (state.do != null && state.do > 0) st.do = state.do;
      const ed = st.ed;
      const ci = columnIndex(ed, st.exposure, st.lambda, st.hCoef);
      const basis = basisOf(ed, st.exposure);
      const tabRow = st.exposure === 'conditioned' ? null : basis;
      const cOf = (lineTemp) => (tabRow
        ? F.provisionalThicknessMm(st.lambda, st.hCoef, tabRow.dewPoint, lineTemp, tabRow.ambientDB)
        : NaN);

      // ---- pickers that only affect the sub-table selection
      const dTRow = h('div', { class: 'field' }, h('label', {}, T('dT')),
        seg(ed.duct.map((r) => ({ v: r.dT, label: r.dT + ' °C' })), st.dT, (v) => { st.dT = v; draw(); }));
      const ltRow = h('div', { class: 'field' }, h('label', {}, T('lineTemp')),
        seg([0, -10, -20].map((v) => ({ v, label: v + ' °C' })), st.lineTemp, (v) => { st.lineTemp = v; draw(); }));
      pickBox.replaceChildren(dTRow, ltRow);

      // ---- sub-table A: chilled water pipework
      const nearest = (rows) => rows.reduce((best, r) => (Math.abs(r.od - st.do) < Math.abs(best.od - st.do) ? r : best), rows[0]);
      const pipePick = nearest(ed.pipe);
      const pipeRows = ed.pipe.map((r) => {
        const c = cOf(ed.pipeLineTemp);
        const la = Number.isFinite(c) ? F.pipeThicknessFromEquivalentMm(r.od, c) : NaN;
        const std = ci >= 0 ? r.mm[ci] : null;
        const com = ed.commercial && ci >= 0 ? ed.commercial.find((x) => x.dn === r.dn) : null;
        return {
          cls: r === pipePick ? 'sel' : null,
          cells: [
            { node: 'DN' + r.dn + ' / ' + r.od },
            { node: std == null ? '—' : std + ' mm', num: true },
            { node: Number.isFinite(la) ? la.toFixed(1) + ' mm' : '—', num: true },
            { node: com && ci >= 0 ? com.mm[ci] + ' mm' : '—', num: true },
          ],
        };
      });
      const pipeTable = table(
        [T('dn'), T('standard'), T('calculated'), T('commercial')],
        pipeRows,
      );

      // ---- sub-table B: suction refrigerant pipework
      const refPick = nearest(ed.refrigerant);
      const refRows = ed.refrigerant.map((r) => {
        const c = cOf(st.lineTemp);
        const la = Number.isFinite(c) ? F.pipeThicknessFromEquivalentMm(r.od, c) : NaN;
        const std = ci >= 0 ? r.mm[st.lineTemp][ci] : null;
        return {
          cls: r === refPick ? 'sel' : null,
          cells: [
            { node: r.od + ' mm' },
            { node: std == null ? '—' : std + ' mm', num: true },
            { node: Number.isFinite(la) ? la.toFixed(1) + ' mm' : '—', num: true },
          ],
        };
      });
      const refTable = table([T('dn'), T('standard'), T('calculated')], refRows);

      // ---- sub-table C: ductwork / AHU casing (flat, c is the thickness)
      const ductRows = ed.duct.map((r) => {
        const c = cOf(r.ambient != null ? r.ambient : (tabRow ? tabRow.ambientDB - r.dT : NaN));
        const std = ci >= 0 ? r.mm[ci] : null;
        return {
          cls: r.dT === st.dT ? 'sel' : null,
          cells: [
            { node: r.dT + ' °C' },
            { node: std == null ? '—' : std + ' mm', num: true },
            { node: Number.isFinite(c) ? Math.ceil(c - 1e-9) + ' mm' : '—', num: true },
          ],
        };
      });
      const ductTable = table([T('dT'), T('standard'), T('calculated')], ductRows);

      const head = (title, src) => h('div', { class: 'ins-head' }, h('strong', {}, title), h('span', { class: 'ins-src' }, src));
      tableBox.replaceChildren(
        head(T('pipe'), T('pipeSrc')), pipeTable,
        head(T('duct'), T('ductSrc')), ductTable,
        head(T('refrig'), T('refrigSrc')), refTable,
      );

      // ---- results for the pipe nearest the entered do
      const items = [];
      const stdPick = ci >= 0 ? pipePick.mm[ci] : null;
      if (stdPick != null) items.push(res(T('required'), stdPick, 'mm', { digits: 0, big: true }));
      const cPipe = cOf(ed.pipeLineTemp);
      if (Number.isFinite(cPipe)) {
        items.push(res(T('laMin'), F.pipeThicknessFromEquivalentMm(pipePick.od, cPipe), 'mm', { digits: 1 }));
      }
      const comPick = ed.commercial && ci >= 0 ? ed.commercial.find((x) => x.dn === pipePick.dn) : null;
      if (comPick && ci >= 0) items.push(res(T('commercial'), comPick.mm[ci], 'mm', { digits: 0 }));
      results(outBox, items);
      const flags = h('div', { class: 'ins-flags' });
      if (ci < 0) flags.append(flag(T('notTabulated'), 'info'));
      if (st.exposure === 'conditioned') flags.append(flag(T('conditionedNote'), 'info'));
      if (stdPick != null && state.t != null && state.t > 0) {
        flags.append(flag(state.t >= stdPick ? T('compliant') : T('short'), state.t >= stdPick ? 'ok' : 'bad'));
      }
      outBox.append(flags);
      outBox.append(h('div', { class: 'note ins-basis' },
        (st.ed.vapourBarrier || '') + ' · ' + (st.ed.source || '')));
    }

    buildPickers();
    draw();
  }));

  // ---------------- Calculation block (workbook 'Calculation of Thickness of Insulation') ----------------
  root.append(card(T('calcTitle'), T('calcDesc'), (body) => {
    const box = h('div');
    const f = form([
      { key: 'lambda', label: T('lambda'), unit: 'W/m·K', def: 0.024 },
      { key: 'hCoef', label: T('hCoef'), unit: 'W/m²·K', def: 9 },
      { key: 'dew', label: T('dewPoint'), unit: '°C', def: 27 },
      { key: 'line', label: T('fluidT'), unit: '°C', def: 5 },
      { key: 'amb', label: T('ambientT'), unit: '°C', def: 28.8 },
      { key: 'do', label: T('doLabel'), unit: 'mm', def: 60.3 },
      { key: 't', label: T('yourThickness'), unit: 'mm', def: 25 },
    ], draw, 'grid3', 'insc-');
    const useBtn = h('button', { class: 'btn', type: 'button' }, T('useStandard'));
    useBtn.addEventListener('click', () => {
      const basis = basisOf(st.ed, st.exposure) || st.ed.outdoor;
      f.set('lambda', st.lambda);
      f.set('hCoef', st.hCoef == null ? 9 : st.hCoef);
      f.set('dew', basis.dewPoint);
      f.set('amb', basis.ambientDB);
      f.set('line', st.exposure === 'outdoor' || st.exposure === 'unconditioned' || st.exposure === 'void'
        ? st.ed.pipeLineTemp : basis.ambientDB - 10);
      f.set('do', st.do);
      draw();
    });
    body.append(f.grid, h('div', { class: 'ins-actions' }, useBtn), box);

    function draw() {
      const s = f.all();
      const ok = [s.lambda, s.hCoef, s.dew, s.line, s.amb].every((x) => x != null) && s.lambda > 0 && s.hCoef > 0
        && s.amb > s.dew;
      if (!ok) { results(box, []); return; }
      const c = F.provisionalThicknessMm(s.lambda, s.hCoef, s.dew, s.line, s.amb);
      const items = [res(T('provC'), c, 'mm', { digits: 2, big: true })];
      let la = NaN;
      if (s.do != null && s.do > 0) {
        la = F.pipeThicknessFromEquivalentMm(s.do, c);
        items.push(res(T('laMin'), la, 'mm', { digits: 1 }));
      }
      const tIns = s.t != null && s.t > 0 ? s.t : la; // proposed thickness, else the calculated one
      let surf = NaN;
      if (s.do != null && s.do > 0 && Number.isFinite(tIns)) {
        const deMm = F.cylindricalEquivalentMm(s.do, tIns);
        items.push(res(T('equivDe'), deMm, 'mm', { digits: 1 }));
        const rIns = (deMm / 1000) / s.lambda;
        const rSurf = 1 / s.hCoef;
        surf = s.amb - (s.amb - s.line) * rSurf / (rSurf + rIns);
        items.push(res(T('surfT'), surf, '°C', { digits: 2 }));
      }
      results(box, items);
      if (Number.isFinite(surf)) {
        // 0.1 °C tolerance: the tabulated code thicknesses are rounded to whole millimetres, so the
        // surface lands a few hundredths of a degree either side of the dew point.
        const okSurf = surf >= s.dew - 0.1;
        box.append(flag(okSurf ? T('noCond') : T('cond'), okSurf ? 'ok' : 'bad'));
      }
      box.append(h('div', { class: 'note' },
        'c = 1000·(λ/h)·{(θd−θl)/(θm−θd)}   (a)   ·   c = 0.5·(do+2La)·ln[1+2La/do]   (b)   ·   ' + st.ed.source));
    }
    draw();
  }, {
    formula: 'BEC/TG §6.11.1 Equation (a) c = 1000·(λ/h)·{(θd−θl)/(θm−θd)};  Equation (b) c = 0.5·(do+2La)·ln[1+2La/do] (ductwork: c = La)',
    src: 'BEC 2024 Tables 6.11a/6.11b/6.11c · TG-BEC 2024 §6.11.1 · BEC 2012 Tables 6.11a–c (workbook 29_Insulations)',
  }));
}

register({
  id: 'insulation',
  icon: '🧊',
  group: 'water',
  title: I18N.title,
  desc: I18N.desc,
  src: 'BEC 2024 / BEC 2012 §6.11 · TG-BEC §6.11.1',
  render,
});
