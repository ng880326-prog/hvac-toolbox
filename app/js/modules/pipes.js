// Module: Pipe Sizing (水管管徑) — rebuilt from the workbook 'Pipe Sizing' sheet.
//
// Workbook layout being mirrored (print area 'Pipe Sizing'!$B$2:$CG$44):
//   D4:D5    Select System (closed circuit / open circuit)
//   D7:E7    Roughness Factor C = 140
//   D10:E11  Design Criteria — Max. Velocity 2.5 m/s, Max. Pressure Drop 400 Pa/m
//   D13:G16  Chilled / heating water temperature pairs (workbook: CHW 10/18, HW 60/50)
//   D18:F30  Size by Capacity — capacity in kW/RT -> flow L/s & m³/h -> Pipe size, with the workbook's
//            '(Overridding)' cell that lets the user force a size and see the resulting v and Pa/m.
//            The workbook runs the block twice: once for chilled water, once for hot water.
//   I6:N30   Pipe table — nominal / outside / internal / thickness / flowrate at the 400 Pa/m limit
//            (L/s and m³/h) for DN15…DN800
//   O6:T30   Velocity, pressure drop per DN at the design flow, with a '►' marker column
//            (Q7 = IF(OR($AJ$43=I7,$AR$43=I7),"►","")) flagging the chosen sizes
//   X4:AE15  Condensate drain pipe — coil load (kW, RT) vs pipe dia. and slope 1:40 / 1:70
//   AR:CG68  Steam / condensate schedules — condensate pipe Ø vs kg/hr, header Ø (workbook note
//            '*Velocity = 10m/s'), plus steam pressure/hg/hf bookkeeping
//
// Temperatures follow the company standard loaded from the presets (CHW 7/12.5, HWS 60/50); the
// workbook's own 10/18 pair is written next to it so the difference is visible rather than silent.
import { register } from '../registry.js';
import { h, res, flag, card, form, results, seg, fold } from '../ui.js';
import * as F from '../engine/fluids.js';
import {
  STEEL_PIPES, PIPE_DEFAULTS, CONDENSATE_DRAIN, CONDENSATE_PIPE_KGHR, HEADER_SIZES,
  STEAM_HEADER_VELOCITY,
} from '../data/pipes.js';
import { loadPresets } from '../data/presets.js';
import { tdpFromPw } from '../engine/psychro.js';

const I18N = {
  title: { en: 'Water Pipe Sizing', zh: '水管管徑計算' },
  desc: {
    en: 'Chilled / hot water pipe selection by Hazen–Williams with the workbook design criteria, capacity-to-flow conversion, an override cell per system, and the ► marker on the chosen size.',
    zh: '冷／熱水管按 Hazen–Williams 選管徑：原檔設計條件、容量→流量換算、每個系統可手動覆寫管徑，並以 ► 標示選定尺寸。',
  },
  criteria: { en: 'Design Criteria', zh: '設計條件' },
  system: { en: 'Select System', zh: '系統類型' },
  closed: { en: 'Closed circuit (C=140)', zh: '閉式系統（C=140）' },
  open: { en: 'Open circuit (C=100)', zh: '開式系統（C=100）' },
  rough: { en: 'Roughness factor C', zh: '粗糙係數 C' },
  vMax: { en: 'Max. velocity', zh: '最大流速' },
  pdMax: { en: 'Max. pressure drop', zh: '最大比摩阻' },
  waterTemp: { en: 'Chilled / heating water temperature', zh: '冷媒水／熱媒水溫度' },
  chwS: { en: 'CHW supply', zh: '冷媒水 供水' },
  chwR: { en: 'CHW return', zh: '冷媒水 回水' },
  hwsS: { en: 'HWS supply', zh: '熱媒水 供水' },
  hwsR: { en: 'HWS return', zh: '熱媒水 回水' },
  dT: { en: 'ΔT', zh: '溫差 ΔT' },
  wbNote: {
    en: 'Workbook value: CHW 10/18 °C (ΔT 8). This page defaults to the company standard from the presets (CHW 7/12.5, HWS 60/50) — change it in the preset card.',
    zh: '原檔數值：冷媒水 10／18 °C（ΔT 8）。本頁預設用 presets 內嘅公司標準（冷媒水 7／12.5、熱媒水 60／50）——可於預設卡更改。',
  },
  sizing: { en: 'Size by Capacity', zh: '按容量選管徑' },
  capacity: { en: 'Capacity', zh: '容量' },
  chw: { en: 'Chilled water', zh: '冷媒水' },
  hws: { en: 'Hot water', zh: '熱媒水' },
  flow: { en: 'Flow rate', zh: '流量' },
  pipeSize: { en: 'Pipe size', zh: '管徑' },
  auto: { en: 'Auto (by limits)', zh: '自動（按限值）' },
  override: { en: '(Overridding)', zh: '（手動覆寫）' },
  velocity: { en: 'Velocity', zh: '流速' },
  pressDrop: { en: 'Pressure drop', zh: '比摩阻' },
  okNote: { en: 'Within both limits ✔', zh: '符合兩項限值 ✔' },
  vFail: { en: 'Velocity over limit', zh: '流速超出限值' },
  pdFail: { en: 'Pressure drop over limit', zh: '比摩阻超出限值' },
  noFit: { en: 'No table size meets both limits.', zh: '表內沒有管徑同時符合兩項限值。' },
  table: { en: 'Pipe Table (DN15–DN800)', zh: '管徑表（DN15–DN800）' },
  tableSub: {
    en: 'The flowrate column is the capacity at the binding limit (400 Pa/m or the velocity limit), exactly as the workbook computes it; v and Pa/m are at the design flows above, and ► marks the chosen size.',
    zh: '流量欄係「較細嘅限值」下嘅輸送量（400 Pa/m 或流速限值），與原檔計法一致；流速與比摩阻係按上方設計流量計算，► 標示選定尺寸。',
  },
  nominal: { en: 'Nominal', zh: '公稱' },
  outside: { en: 'Outside', zh: '外徑' },
  inside: { en: 'Internal', zh: '內徑' },
  wall: { en: 'Thickness', zh: '厚度' },
  flowLimit: { en: 'Flow @400 Pa/m', zh: '400 Pa/m 流量' },
  flowAtVelocity: { en: 'Flow @max velocity', zh: '最大流速流量' },
  governing: { en: 'Governing capacity', zh: '採用輸送量' },
  governsNote: {
    en: 'The workbook prints a single flowrate column: it is the capacity at whichever limit binds — 400 Pa/m for the smaller bores, the velocity limit from DN250 upwards. Both limits are shown here so the binding one is visible.',
    zh: '原檔只印一欄流量：其實係兩個限值中較細嘅一個 —— 小口徑由 400 Pa/m 控制，DN250 起由流速控制。此處兩個限值都列出，方便看出由邊個控制。',
  },
  condensate: { en: 'Condensate Drain Pipe', zh: '冷凝水管' },
  condensateSub: {
    en: 'Drain size from the coil load (workbook table). Slope is 1:40 up to DN100 and 1:70 for DN125/150.',
    zh: '按盤管負荷選冷凝水管（原檔表）。坡度 DN100 以下用 1:40，DN125／150 用 1:70。',
  },
  coilLoad: { en: 'Coil load', zh: '盤管負荷' },
  slope: { en: 'Slope', zh: '坡度' },
  steam: { en: 'Steam / Condensate / Header', zh: '蒸汽／冷凝水／集管' },
  steamSub: {
    en: 'Saturated steam pipe selection plus the workbook schedules: condensate pipe Ø vs kg/hr, and header Ø at the workbook note velocity of 10 m/s (its kg/hr column is empty, so the capacity shown is computed).',
    zh: '飽和蒸汽管選徑，加原檔表：冷凝水管 Ø 對 kg/hr，以及集管 Ø（原檔註明流速 10 m/s；其 kg/hr 欄為空，故容量由程式計算）。',
  },
  steamFlow: { en: 'Steam flow', zh: '蒸汽流量' },
  pressure: { en: 'Pressure', zh: '壓力' },
  tsat: { en: 'Saturation temperature', zh: '飽和溫度' },
  hfg: { en: 'Latent heat hfg', zh: '汽化熱 hfg' },
  steamCap: { en: 'Steam capacity', zh: '蒸汽容量' },
  condKgHr: { en: 'Condensate flow', zh: '冷凝水量' },
  condPipe: { en: 'Condensate pipe', zh: '冷凝水管' },
  headerFlow: { en: 'Header steam flow', zh: '集管蒸汽量' },
  headerSize: { en: 'Header size', zh: '集管尺寸' },
  exceeds: { en: 'Exceeds the table', zh: '超出表列' },
  computed: { en: 'computed at 10 m/s', zh: '按 10 m/s 計算' },
};

const areaOf = (idMm) => Math.PI * Math.pow(idMm / 2000, 2);          // m²
const velocityOf = (lps, idMm) => (lps / 1000) / areaOf(idMm);         // m/s
const pdOf = (lps, idMm, C) => F.hazenWilliams(velocityOf(lps, idMm), idMm, C);   // Pa/m
/** Flow (L/s) that reaches the pressure-drop limit for a given bore — the workbook's M column. */
const flowAtPdLimit = (pdMax, idMm, C) => F.flowFromVelocity(F.velocityForPd(pdMax, idMm, C), idMm);
const kWtoLps = (kw, dT) => (dT > 0 ? kw / (4.186789 * dT) : NaN);

/** Small table builder shared by the blocks below. */
function table(headers, rows, opts = {}) {
  const tbl = h('table', { class: 'pipes-table' + (opts.className ? ' ' + opts.className : '') });
  tbl.append(h('thead', {}, h('tr', {}, ...headers.map((x) => h('th', {}, x)))));
  const body = h('tbody');
  for (const r of rows) {
    const tr = h('tr', { class: r.class || '' });
    for (const cell of r.cells) {
      if (cell && typeof cell === 'object') {
        // a marker cell may legitimately be empty ('' — no ►), so test the object, not cell.node
        tr.append(h('td', { class: (cell.num ? 'num' : '') + (cell.class ? ' ' + cell.class : '') },
          cell.node ?? ''));
      } else {
        tr.append(h('td', {}, String(cell)));
      }
    }
    body.append(tr);
  }
  tbl.append(body);
  return h('div', { class: 'table-scroll' }, tbl);
}

function render(root, { L }) {
  const T = (k) => L(I18N[k]);
  const std = loadPresets()[0]?.values ?? {};
  const S = {
    system: 'closed',
    c: 140,
    vMax: PIPE_DEFAULTS.vMax,
    pdMax: PIPE_DEFAULTS.pdMax,
    chws: Number.isFinite(std.chws) ? std.chws : 7,
    chwr: Number.isFinite(std.chwr) ? std.chwr : 12.5,
    hws: Number.isFinite(std.hws) ? std.hws : 60,
    hwr: Number.isFinite(std.hwr) ? std.hwr : 50,
    capKw: 4080,
    condKw: 500,
    // 0 = automatic selection, otherwise a DN forced by the user (the workbook's '(Overridding)')
    ovr: { chw: 0, hws: 0 },
  };
  const redraws = [];
  const notify = () => { for (const fn of redraws) fn(); };

  /** Flow for one water system (L/s) at the current capacity. */
  const systemFlow = (key) => kWtoLps(S.capKw, key === 'chw' ? S.chwr - S.chws : S.hws - S.hwr);

  /** Per-DN evaluation at a given flow: velocity, drop and whether both limits hold. */
  const evaluate = (lps) => STEEL_PIPES.map((p) => {
    if (!(lps > 0)) return { p, v: NaN, pd: NaN, ok: false };
    const v = velocityOf(lps, p.id);
    const pd = pdOf(lps, p.id, S.c);
    return { p, v, pd, ok: v <= S.vMax && pd <= S.pdMax };
  });

  function select(key) {
    const forced = S.ovr[key];
    const lps = systemFlow(key);
    const rows = evaluate(lps);
    if (forced) {
      const r = rows.find((x) => x.p.dn === forced);
      return r ? { ...r, forced: true } : null;
    }
    const auto = rows.find((x) => x.ok);
    return auto ? { ...auto, forced: false } : null;
  }

  // ---- 1) Design criteria (workbook D4:E11 + D13:G16) ----
  root.append(card(T('criteria'), '', (body) => {
    const sysRow = h('div', { class: 'field' }, h('label', {}, T('system')),
      seg([{ v: 'closed', label: T('closed') }, { v: 'open', label: T('open') }], S.system,
        (v) => { S.system = v; S.c = v === 'closed' ? 140 : 100; critForm.set('c', S.c); notify(); }));
    const critForm = form([
      { key: 'c', label: T('rough'), unit: '—', def: S.c },
      { key: 'vMax', label: T('vMax'), unit: 'm/s', def: S.vMax },
      { key: 'pdMax', label: T('pdMax'), unit: 'Pa/m', def: S.pdMax },
      { key: 'chws', label: T('chwS'), unit: '°C', def: S.chws },
      { key: 'chwr', label: T('chwR'), unit: '°C', def: S.chwr },
      { key: 'hws', label: T('hwsS'), unit: '°C', def: S.hws },
      { key: 'hwr', label: T('hwsR'), unit: '°C', def: S.hwr },
    ], (a) => { Object.assign(S, a); notify(); }, 'grid4', 'crit-');
    const tempBox = h('div');
    body.append(sysRow, critForm.grid, h('div', { class: 'note' }, T('waterTemp')), tempBox,
      h('div', { class: 'note' }, T('wbNote')));
    redraws.push(() => {
      results(tempBox, [
        res(T('chw') + ' ' + T('dT'), S.chwr - S.chws, '°C', { digits: 2, big: true }),
        res(T('chw') + ' ' + T('flow'), systemFlow('chw'), 'L/s', { digits: 2 }),
        res(T('hws') + ' ' + T('dT'), S.hws - S.hwr, '°C', { digits: 2, big: true }),
        res(T('hws') + ' ' + T('flow'), systemFlow('hws'), 'L/s', { digits: 2 }),
      ]);
    });
  }, { src: 'Pipe Sizing!D4:E11 · D13:G16', formula: 'Q [L/s] = kW / (4.186789 × ΔT)' }));

  // ---- 2) Size by capacity, chilled | hot side by side (workbook D18:F30) ----
  const sizeBoxes = { chw: h('div'), hws: h('div') };
  const ovrSelects = {};
  root.append(card(T('sizing'), '', (body) => {
    const capForm = form([
      { key: 'capKw', label: T('capacity'), unit: 'kW', def: S.capKw },
    ], (a) => { S.capKw = a.capKw; notify(); }, 'grid2', 'cap-');
    const rtBox = h('div');
    const grid = h('div', { class: 'grid2' });
    for (const key of ['chw', 'hws']) {
      const col = h('div', { class: 'panel-col' });
      col.append(h('div', { class: 'panel-col-head' }, T(key)));
      // The override cell: the workbook's '(Overridding)' next to 'Pipe size'.
      const sel = h('select', { id: 'ovr-' + key, 'aria-label': T(key) + ' ' + T('override') });
      sel.append(h('option', { value: '0' }, T('auto')));
      for (const p of STEEL_PIPES) sel.append(h('option', { value: String(p.dn) }, 'DN' + p.dn));
      sel.addEventListener('change', () => { S.ovr[key] = Number(sel.value); notify(); });
      ovrSelects[key] = sel;
      col.append(h('div', { class: 'field' }, h('label', { for: 'ovr-' + key }, T('pipeSize') + ' ' + T('override')),
        h('div', { class: 'ctl' }, sel)), sizeBoxes[key]);
      grid.append(col);
    }
    body.append(capForm.grid, rtBox, grid);
    redraws.push(() => {
      results(rtBox, [
        res(T('capacity'), S.capKw, 'kW', { digits: 0, big: true }),
        res(T('capacity'), S.capKw / 3.517, 'RT', { digits: 1 }),
      ]);
      for (const key of ['chw', 'hws']) {
        const lps = systemFlow(key);
        const pick = select(key);
        if (!(lps > 0) || !pick) {
          results(sizeBoxes[key], [res(T('flow'), lps > 0 ? lps : null, 'L/s', { digits: 2 })]);
          if (lps > 0 && !pick) sizeBoxes[key].append(flag(T('noFit'), 'bad'));
          continue;
        }
        if (ovrSelects[key].value !== String(S.ovr[key])) ovrSelects[key].value = String(S.ovr[key]);
        results(sizeBoxes[key], [
          res(T('flow'), lps, 'L/s', { digits: 2, big: true }),
          res(T('flow'), lps * 3.6, 'm³/h', { digits: 2 }),
          res(T('pipeSize'), 'DN' + pick.p.dn, pick.forced ? '· ' + T('override') : '', { digits: 0, big: true }),
          res(T('inside'), pick.p.id, 'mm', { digits: 1 }),
          res(T('velocity'), pick.v, 'm/s', { digits: 3, warn: pick.v > S.vMax }),
          res(T('pressDrop'), pick.pd, 'Pa/m', { digits: 0, warn: pick.pd > S.pdMax }),
        ]);
        if (pick.forced) sizeBoxes[key].append(flag(T('override') + ' — ' + T('pipeSize') + ' DN' + pick.p.dn, 'info'));
        if (pick.v > S.vMax) sizeBoxes[key].append(flag(T('vFail') + ' (' + pick.v.toFixed(2) + ' > ' + S.vMax + ' m/s)', 'bad'));
        if (pick.pd > S.pdMax) sizeBoxes[key].append(flag(T('pdFail') + ' (' + Math.round(pick.pd) + ' > ' + S.pdMax + ' Pa/m)', 'bad'));
        if (!pick.forced && pick.ok) sizeBoxes[key].append(flag(T('okNote'), 'ok'));
      }
    });
  }, { src: 'Pipe Sizing!D18:F30 · (Overridding) cell', formula: 'Hazen–Williams: ΔP/L = 6.819·(V/C)^1.852 / d^1.167 · 9810' }));

  // ---- 3) Pipe table with per-system v / Pa/m and the ► markers (workbook I6:T30) ----
  root.append(card(T('table'), T('tableSub'), (body) => {
    const holder = h('div');
    body.append(holder);
    redraws.push(() => {
      const lpsChw = systemFlow('chw'), lpsHws = systemFlow('hws');
      const rows = STEEL_PIPES.map((p) => {
        const vC = lpsChw > 0 ? velocityOf(lpsChw, p.id) : NaN;
        const pdC = lpsChw > 0 ? pdOf(lpsChw, p.id, S.c) : NaN;
        const vH = lpsHws > 0 ? velocityOf(lpsHws, p.id) : NaN;
        const pdH = lpsHws > 0 ? pdOf(lpsHws, p.id, S.c) : NaN;
        // The workbook's flowrate column is the capacity at whichever limit binds: the 400 Pa/m drop
        // for the small bores, the velocity limit from DN250 up.
        const limPd = flowAtPdLimit(S.pdMax, p.id, S.c);
        const limV = F.flowFromVelocity(S.vMax, p.id);
        const governs = limPd <= limV ? 'ΔP' : 'v';
        return { p, vC, pdC, vH, pdH, limPd, limV, governs, lim: Math.min(limPd, limV),
          okC: vC <= S.vMax && pdC <= S.pdMax, okH: vH <= S.vMax && pdH <= S.pdMax };
      });
      const pickC = select('chw'), pickH = select('hws');
      const n = (x, d) => (Number.isFinite(x) ? x.toFixed(d) : '—');
      holder.innerHTML = '';
      holder.append(table(
        [T('nominal') + ' (mm)', T('outside'), T('inside'), T('wall'),
          T('flowLimit') + ' (L/s)', T('flowAtVelocity') + ' (L/s)', T('governing') + ' (L/s)',
          T('chw') + ' v', T('chw') + ' ΔP', '►', T('hws') + ' v', T('hws') + ' ΔP', '►'],
        rows.map((r) => {
          const markC = pickC && pickC.p.dn === r.p.dn ? '►' : '';
          const markH = pickH && pickH.p.dn === r.p.dn ? '►' : '';
          const selC = markC ? ' sel' : (r.okC ? ' okrow' : '');
          const selH = markH ? ' sel' : (r.okH ? ' okrow' : '');
          return {
            class: selC || selH,
            cells: [
              { num: true, node: String(r.p.dn) }, { num: true, node: n(r.p.od, 1) },
              { num: true, node: n(r.p.id, 1) }, { num: true, node: n(r.p.t, 1) },
              { num: true, node: n(r.limPd, 3) }, { num: true, node: n(r.limV, 3) },
              { num: true, node: n(r.lim, 3) + ' · ' + r.governs },
              { num: true, node: n(r.vC, 2) }, { num: true, node: Number.isFinite(r.pdC) ? String(Math.round(r.pdC)) : '—' },
              { node: markC, class: 'mark' },
              { num: true, node: n(r.vH, 2) }, { num: true, node: Number.isFinite(r.pdH) ? String(Math.round(r.pdH)) : '—' },
              { node: markH, class: 'mark' },
            ],
          };
        }), { className: 'pipe-full' }));
      holder.append(h('div', { class: 'note' }, T('governsNote')));
    });
  }, { src: 'Pipe Sizing!I6:N30 (table) · O6:T30 (velocity, ΔP, ► marker)' }));

  // ---- 4) Condensate drain (workbook X4:AE15) ----
  root.append(card(T('condensate'), T('condensateSub'), (body) => {
    const f = form([
      { key: 'kw', label: T('coilLoad'), unit: 'kW', def: 500 },
    ], (a) => { S.condKw = a.kw; notify(); }, 'grid2', 'cond-');
    const box = h('div');
    const holder = h('div');
    body.append(f.grid, box, holder);
    redraws.push(() => {
      const condLoad = S.condKw;
      const pick = CONDENSATE_DRAIN.find((x) => x.kw >= condLoad) || CONDENSATE_DRAIN[CONDENSATE_DRAIN.length - 1];
      const over = condLoad > CONDENSATE_DRAIN[CONDENSATE_DRAIN.length - 1].kw;
      results(box, [
        res(T('pipeSize'), 'DN' + pick.dn, 'mm', { digits: 0, big: true }),
        res(T('slope'), pick.slope, '', { digits: 0 }),
        res(T('coilLoad'), condLoad, 'kW', { digits: 0 }),
        res(T('coilLoad'), condLoad / 3.517, 'RT', { digits: 1 }),
      ]);
      if (over) box.append(flag(T('exceeds'), 'warn'));
      holder.innerHTML = '';
      holder.append(table(
        [T('nominal') + ' (mm)', T('coilLoad') + ' (kW)', T('coilLoad') + ' (RT)', T('slope')],
        CONDENSATE_DRAIN.map((x) => ({
          class: x.dn === pick.dn ? 'sel' : '',
          cells: [{ num: true, node: String(x.dn) }, { num: true, node: String(x.kw) },
            { num: true, node: String(x.rt) }, { node: x.slope }],
        }))));
    });
  }, { src: 'Pipe Sizing!X4:AE15', collapsed: true }));

  // ---- 5) Steam / condensate schedule / header (workbook AR:CG) ----
  const steamBox = h('div');
  const condSchedBox = h('div');
  const headerBox = h('div');
  root.append(fold(T('steam') + ' — ' + T('steamSub'), card(T('steam'), T('steamSub'), (body) => {
    const f = form([
      { key: 'm', label: T('steamFlow'), unit: 'kg/h', def: 500 },
      { key: 'p', label: T('pressure'), unit: 'bar', def: 5 },
      { key: 'vMax', label: T('vMax'), unit: 'm/s', def: 30 },
      { key: 'cond', label: T('condKgHr'), unit: 'kg/h', def: 500 },
    ], () => { drawSteam(f.all()); }, 'grid4', 'st-');
    body.append(f.grid, steamBox, condSchedBox, headerBox);
    drawSteam(f.all());
    function drawSteam(a) {
      if (!(a.m > 0) || !(a.p > 0) || !(a.vMax > 0)) { results(steamBox, []); return; }
      const tsat = tdpFromPw(a.p * 100);
      const hfg = 2257 * Math.pow((1 - tsat / 374.15) / (1 - 100 / 374.15), 0.38);
      const rho = (a.p * 100 * 18.02) / (8.314 * (tsat + 273.15));   // ideal-gas approximation
      const volFlow = (a.m / 3600) / rho;                            // m³/s
      const pick = STEEL_PIPES.find((p) => volFlow / areaOf(p.id) <= a.vMax);
      results(steamBox, [
        res(T('tsat'), tsat, '°C', { digits: 1 }),
        res(T('hfg'), hfg, 'kJ/kg', { digits: 0 }),
        res(T('steamCap'), a.m * hfg / 3600, 'kW', { digits: 1 }),
        res(T('pipeSize'), pick ? 'DN' + pick.dn : T('exceeds'), '', { digits: 0, big: true }),
        res(T('velocity'), pick ? volFlow / areaOf(pick.id) : null, 'm/s', { digits: 1 }),
      ]);
      // condensate pipe schedule (workbook CA12:CB20)
      const cPick = CONDENSATE_PIPE_KGHR.find((x) => x.kgHr >= a.cond) ||
        CONDENSATE_PIPE_KGHR[CONDENSATE_PIPE_KGHR.length - 1];
      results(condSchedBox, [
        res(T('condKgHr'), a.cond, 'kg/h', { digits: 0 }),
        res(T('condPipe'), 'DN' + cPick.dn, 'mm', { digits: 0, big: true }),
      ]);
      // header: the workbook lists the sizes and notes 10 m/s, so capacity is computed
      const hdr = HEADER_SIZES.map((x) => ({ od: x.od, cap: rho * areaOf(x.od) * STEAM_HEADER_VELOCITY * 3600 }))
        .find((x) => x.cap >= a.m);
      results(headerBox, [
        res(T('headerFlow'), a.m, 'kg/h', { digits: 0 }),
        res(T('headerSize'), hdr ? 'Ø' + hdr.od : T('exceeds'), T('computed'), { digits: 0, big: true }),
        res(L({ en: 'at velocity', zh: '按流速' }), STEAM_HEADER_VELOCITY, 'm/s', { digits: 0 }),
        res(L({ en: 'steam density', zh: '蒸汽密度' }), rho, 'kg/m³', { digits: 3 }),
      ]);
    }
    redraws.push(() => drawSteam(f.all()));
  }, { formula: 'Tsat = pws⁻¹(p);  hfg (Watson);  V = ṁ/(ρA);  ρₛ ≈ p·M/(R·T)',
    src: 'Pipe Sizing!AR4:CG68 · IAPWS IF-97 · ideal-gas ρ (±5%)' })));

  notify();
}

register({
  id: 'pipes', icon: '🚿', group: 'water', title: I18N.title, desc: I18N.desc,
  src: 'ASHRAE F. Ch.22 · Hazen–Williams · workbook Pipe Sizing sheet',
  render,
});
