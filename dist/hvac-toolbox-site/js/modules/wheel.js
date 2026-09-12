// Module: Energy Recovery Wheel (轉輪熱回收) — rebuilt cell by cell from the workbook 'Wheel' sheet.
//
// Workbook layout being mirrored (print area Wheel!$B$2:$AC$45 plus drawing7.xml):
//   B2:E4    'Select System' option buttons (summer / winter, linked cell AF1), Altitude, Pressure,
//            Air Density ρair
//   B6:K11   Design Conditions — 4 inlet rows (Supply/Exhaust × Summer/Winter) with DB, WB, RH
//            entered and WB, w, h, dew point, RH computed (via the hidden 'Wheel Support' sheet)
//   B13:E16  Air Flow — Vs, Ve and the Supply:Exhaust ratio guard (F16: ratio > 1.5 or < 0.7)
//   B17:D19  Thermal Wheel Recovery Efficiency — 'Sensible Heat ηS', 'Total Heat ηT'
//   M5:T40   SUMMER column: max total energy recovered (QT = min(Vs,Ve)·ρC·(h_o,1 − h_r,1)·ηT),
//            max sensible (QS = ·(t_o,1 − t_r,1)·ηS), QS, QL = QT − QS, supply/exhaust outlet
//            states (t_o,2 = t_o,1 − Q/(m·ρC), t_r,2 = Q/(m·ρC) + t_r,1) and condensation notes
//   V5:AC40  WINTER column: sensible-only preheat, same structure, moisture content unchanged
//   B21:F37  the wheel schematic drawn with cells: Outdoor to,1 ↔ Thermal Wheel ↔ Indoor to,2 and
//            Indoor tr,1 → wheel → Outdoor tr,2, each point labelled 'DB / WB'
//
// Deliberate deviations from the workbook, each because the workbook value is physically impossible
// (details in docs/audit/page02_wheel.md):
//   * ρ·cp: the workbook uses ρ × 1.02 for every air power; cp of dry air is 1.006, and this module
//     uses the standard value (difference < 1.5%).
//   * ηS / ηT: the workbook's cached inputs are 2354 and 2356 in a `0.0%` cell — i.e. 235400%.
//     Defaults here are 0.75 / 0.70 and both are editable.
//   * Vs / Ve: the workbook's cached 1132 sits under an 'm3/s' label, which would be 4 million m³/h.
//     It is only sensible as L/s, so this module offers L/s | m³/s | m³/h with 1132 L/s as the default.
import { register } from '../registry.js';
import { h, res, flag, card, form, results, seg } from '../ui.js';
import * as P from '../engine/psychro.js';

const I18N = {
  title: { en: 'Energy Recovery Wheel', zh: '轉輪熱回收' },
  desc: {
    en: 'Replica of the workbook Wheel sheet: design conditions, airflow ratio guard, ηS/ηT, side-by-side summer and winter recovery, wheel schematic.',
    zh: '照原檔 Wheel 工作表重建：設計條件、風量比範圍、ηS／ηT、夏季與冬季並排回收、轉輪示意圖。',
  },
  sysCond: { en: 'System Conditions', zh: '系統條件' },
  sysCondSub: {
    en: 'The workbook selects summer (total-heat wheel) or winter (sensible wheel) with an option button; altitude sets the pressure used for every psychrometric state.',
    zh: '原檔以選項按鈕切換夏季（全熱輪）或冬季（顯熱輪）；高度決定所有濕空氣狀態所用嘅大氣壓力。',
  },
  mode: { en: 'Select system', zh: '系統選擇' },
  summer: { en: 'Summer — total heat', zh: '夏季 — 全熱回收' },
  winter: { en: 'Winter — sensible heat', zh: '冬季 — 顯熱回收' },
  alt: { en: 'Altitude', zh: '海拔高度' },
  press: { en: 'Pressure', zh: '大氣壓力' },
  rhoAir: { en: 'Air density ρair', zh: '空氣密度 ρair' },
  design: { en: 'Design Conditions', zh: '設計條件' },
  designSub: {
    en: 'Four inlet rows as in the workbook. Enter DB plus either WB or RH — the last one you edit drives the state, and the other is recomputed and checked against it.',
    zh: '照原檔四行入風條件。填 DB，再加 WB 或 RH 其中一項 —— 以你最後修改嘅一項為準，另一項會重算並互相核對。',
  },
  loc: { en: 'Inlet', zh: '入風位置' },
  season: { en: 'Season', zh: '季節' },
  supplyIn: { en: 'Supply inlet (OA)', zh: '供風入口（新風）' },
  exhaustIn: { en: 'Exhaust inlet (RA)', zh: '排風入口（回風）' },
  flow: { en: 'Air Flow', zh: '風量' },
  flowSub: {
    en: 'Workbook cached values are Vs = Ve = 1132 under an m³/s label; 1132 only makes sense as L/s, so the unit is selectable here.',
    zh: '原檔快取 Vs = Ve = 1132 而標籤寫 m³/s；1132 只有當 L/s 才合理，故本模組可選單位。',
  },
  flowUnit: { en: 'Flow unit', zh: '風量單位' },
  vs: { en: 'Supply flow Vs', zh: '供風量 Vs' },
  ve: { en: 'Exhaust flow Ve', zh: '排風量 Ve' },
  ratio: { en: 'Supply : Exhaust ratio', zh: '供排風量比' },
  eff: { en: 'Recovery Efficiency', zh: '回收效率' },
  effSub: {
    en: 'The workbook cached ηS = 2354 and ηT = 2356 in a 0.0% cell (i.e. 235400% — unusable leftovers), so defaults here are 0.75 / 0.70.',
    zh: '原檔快取 ηS = 2354、ηT = 2356 而格式係 0.0%（即 235400%，屬無效殘值），故本模組預設 0.75／0.70。',
  },
  effS: { en: 'Sensible heat ηS', zh: '顯熱效率 ηS' },
  effT: { en: 'Total heat ηT', zh: '全熱效率 ηT' },
  results: { en: 'Results Side-by-Side (Summer | Winter)', zh: '結果並排（夏季｜冬季）' },
  resultsSub: {
    en: 'Summer column = total-heat wheel of the workbook (M–T). Winter column = sensible-only preheat (V–AC), moisture content unchanged. The active system is highlighted.',
    zh: '夏季欄＝原檔全熱輪（M–T）。冬季欄＝只計顯熱預熱（V–AC），含濕量不變。現行系統會高亮。',
  },
  maxQT: { en: 'Max total recovered QT', zh: '最大全熱回收 QT' },
  maxQS: { en: 'Max sensible recovered QS', zh: '最大顯熱回收 QS' },
  qs: { en: 'Sensible recovered QS', zh: '顯熱回收 QS' },
  ql: { en: 'Latent recovered QL', zh: '潛熱回收 QL' },
  qt: { en: 'Total recovered QT', zh: '全熱回收 QT' },
  supOut: { en: 'Supply outlet (to,2)', zh: '供風出口（to,2）' },
  exhOut: { en: 'Exhaust outlet (tr,2)', zh: '排風出口（tr,2）' },
  db: { en: 'Dry bulb', zh: '乾球' },
  wb: { en: 'Wet bulb', zh: '濕球' },
  rhCol: { en: 'RH', zh: '相對濕度' },
  wCol: { en: 'w', zh: '含濕量' },
  hCol: { en: 'h', zh: '焓' },
  tdpCol: { en: 'Dew pt.', zh: '露點' },
  dbfield: { en: 'DB', zh: '乾球 DB' },
  wbfield: { en: 'WB', zh: '濕球 WB' },
  rhfield: { en: 'RH', zh: '相對濕度 RH' },
  noSensible: { en: 'n/a — sensible wheel: moisture content unchanged', zh: '不適用 — 顯熱輪：含濕量不變' },
  sch: { en: 'Wheel Schematic', zh: '轉輪示意圖' },
  schSub: {
    en: 'Redrawn from the workbook diagram (B21:F37): outdoor air crosses the wheel into the room, return air crosses back to exhaust, each port labelled DB / WB.',
    zh: '照原檔圖（B21:F37）重繪：新風經轉輪入室內，回風經轉輪排出戶外，四個接口標示 乾球／濕球。',
  },
  outdoor: { en: 'Outdoor', zh: '戶外' },
  indoor: { en: 'Indoor', zh: '室內' },
  wheelLabel: { en: 'Thermal Wheel', zh: '轉輪' },
  condExhaust: { en: 'Condensation occurs at the exhaust outlet — the exhaust temperature must be resolved from the saturated enthalpy.', zh: '排風出口結露 — 排風溫度需按飽和焓重新求解。' },
  condSupply: { en: 'Supply outlet is at or below its dew point — the wheel surface condenses and the state is corrected to saturation.', zh: '供風出口已達或低於露點 — 轉輪表面結露，狀態已按飽和修正。' },
  frost: { en: 'Frost risk at the exhaust outlet — preheat or frost control required.', zh: '排風出口結霜風險 — 需預熱或防霜控制。' },
  ratioHigh: { en: 'Ratio > 1.5 — Out of Range (workbook F16).', zh: '風量比 > 1.5 — 超出原檔容許範圍（原檔 F16）。' },
  ratioLow: { en: 'Ratio < 0.7 — Out of Range (workbook F16).', zh: '風量比 < 0.7 — 超出原檔容許範圍（原檔 F16）。' },
  mismatch: { en: 'entered RH disagrees with the DB/WB pair', zh: '輸入 RH 與 乾球／濕球 組合不符' },
  saturated: { en: 'Saturated at h =', zh: '已飽和，h =' },
  minFlow: { en: 'Mass flow uses min(Vs, Ve) as in the workbook (O6/O10).', zh: '質量流量取 min(Vs, Ve)，與原檔 O6／O10 一致。' },
};

/** ISA troposphere pressure (kPa) for altitude z (m) — replaces the workbook's fixed 101.325 kPa. */
function pressureAt(z) { return 101.325 * Math.pow(1 - 2.25577e-5 * z, 5.2559); }

/**
 * Resolve a design-condition row into a psychrometric state.
 * drv = 'wb' | 'rh' records which input the user edited last, mirroring the workbook's habit of
 * accepting all three fields while only two are independent.
 */
function resolveRow(row, p) {
  const s = row.drv === 'rh' ? P.state({ t: row.db, rh: row.rh, p })
    : P.state({ t: row.db, twb: row.wb, p });
  if (!s || !isFinite(s.t)) return null;
  return s;
}

/** Schematic of the workbook's cell drawing: two streams crossing one wheel. */
function portLabels() {
  return {
    o1: I18N.outdoor.zh + ' to,1', o2: I18N.indoor.zh + ' to,2',
    r1: I18N.indoor.zh + ' tr,1', r2: I18N.outdoor.zh + ' tr,2',
  };
}

/**
 * Wide variant (the workbook's landscape layout). A narrow variant is rendered alongside it and
 * chosen by a CSS media query, so no resize listener is needed and nothing leaks on re-navigation.
 */
function wheelSVGWide(title, o1, o2, r1, r2) {
  const P0 = portLabels();
  const lab = (x, y, anchor, name, st) => `
    <text x="${x}" y="${y}" text-anchor="${anchor}" font-size="11" fill="var(--ink-soft)">${name}</text>
    <text x="${x}" y="${y + 14}" text-anchor="${anchor}" font-size="11.5" fill="var(--ink)" font-weight="700">${st}</text>`;
  return `<svg class="wheel-sch wheel-sch-wide" viewBox="0 0 720 200" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${title}">
    <text x="360" y="16" text-anchor="middle" font-size="12.5" fill="var(--brand)" font-weight="700">${title}</text>
    <rect x="300" y="42" width="120" height="116" rx="14" fill="var(--card)" stroke="var(--brand)" stroke-width="2"/>
    <circle cx="360" cy="100" r="38" fill="none" stroke="var(--brand-2)" stroke-width="2"/>
    <g stroke="var(--brand-2)" stroke-width="1.6">
      <line x1="360" y1="66" x2="360" y2="134"/><line x1="326" y1="100" x2="394" y2="100"/>
      <line x1="336" y1="76" x2="384" y2="124"/><line x1="384" y1="76" x2="336" y2="124"/>
    </g>
    <text x="360" y="176" text-anchor="middle" font-size="11" fill="var(--ink-soft)">${I18N.wheelLabel.zh}</text>
    <path d="M 60 62 H 292 l -9 -6 m 9 6 l -9 6" stroke="var(--brand)" stroke-width="2.4" fill="none"/>
    <path d="M 428 62 H 660" stroke="var(--brand)" stroke-width="2.4" fill="none"/>
    <path d="M 660 138 H 428 l 9 -6 m -9 6 l 9 6" stroke="#c2410c" stroke-width="2.4" fill="none"/>
    <path d="M 292 138 H 60" stroke="#c2410c" stroke-width="2.4" fill="none"/>
    ${lab(58, 44, 'start', P0.o1, o1)}
    ${lab(662, 44, 'end', P0.o2, o2)}
    ${lab(662, 158, 'end', P0.r1, r1)}
    ${lab(58, 158, 'start', P0.r2, r2)}
  </svg>`;
}

/** Narrow variant: same topology, taller box and larger type so phones can read it. */
function wheelSVGNarrow(title, o1, o2, r1, r2) {
  const P0 = portLabels();
  const lab = (x, y, anchor, name, st) => `
    <text x="${x}" y="${y}" text-anchor="${anchor}" font-size="14" fill="var(--ink-soft)">${name}</text>
    <text x="${x}" y="${y + 18}" text-anchor="${anchor}" font-size="15" fill="var(--ink)" font-weight="700">${st}</text>`;
  return `<svg class="wheel-sch wheel-sch-narrow" viewBox="0 0 400 330" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${title}">
    <text x="200" y="22" text-anchor="middle" font-size="16" fill="var(--brand)" font-weight="700">${title}</text>
    <rect x="150" y="95" width="100" height="140" rx="14" fill="var(--card)" stroke="var(--brand)" stroke-width="2"/>
    <circle cx="200" cy="165" r="44" fill="none" stroke="var(--brand-2)" stroke-width="2"/>
    <g stroke="var(--brand-2)" stroke-width="1.8">
      <line x1="200" y1="121" x2="200" y2="209"/><line x1="156" y1="165" x2="244" y2="165"/>
      <line x1="169" y1="134" x2="231" y2="196"/><line x1="231" y1="134" x2="169" y2="196"/>
    </g>
    <text x="200" y="255" text-anchor="middle" font-size="14" fill="var(--ink-soft)">${I18N.wheelLabel.zh}</text>
    <path d="M 18 140 H 144 l -10 -7 m 10 7 l -10 7" stroke="var(--brand)" stroke-width="2.8" fill="none"/>
    <path d="M 256 140 H 382" stroke="var(--brand)" stroke-width="2.8" fill="none"/>
    <path d="M 382 232 H 256 l 10 -7 m -10 7 l 10 7" stroke="#c2410c" stroke-width="2.8" fill="none"/>
    <path d="M 144 232 H 18" stroke="#c2410c" stroke-width="2.8" fill="none"/>
    ${lab(16, 92, 'start', P0.o1, o1)}
    ${lab(384, 92, 'end', P0.o2, o2)}
    ${lab(384, 268, 'end', P0.r1, r1)}
    ${lab(16, 268, 'start', P0.r2, r2)}
  </svg>`;
}

function render(root, { L }) {
  const T = (k) => L(I18N[k]);
  const st = (db, wb, rh, drv) => ({ db, wb, rh, drv });

  // The workbook's B2:E19 input block, held once and shared by every block below.
  const S = {
    mode: 'summer',
    alt: 0,
    p: 101.325,
    sup: { summer: st(35, 28, null, 'wb'), winter: st(5, null, 70, 'rh') },
    exh: { summer: st(24, 17, null, 'wb'), winter: st(22, null, 50, 'rh') },
    unit: 'L/s',
    vs: 1132,
    ve: 1132,
    effS: 0.75,
    effT: 0.70,
  };
  const redraws = [];
  const notify = () => { for (const fn of redraws) fn(); };
  const toM3s = (v) => (S.unit === 'L/s' ? v / 1000 : S.unit === 'm³/h' ? v / 3600 : v);

  // ---- 1) System conditions (workbook B2:E4 + the option buttons) ----
  root.append(card(T('sysCond'), T('sysCondSub'), (body) => {
    const modeRow = h('div', { class: 'field' }, h('label', {}, T('mode')),
      seg([{ v: 'summer', label: T('summer') }, { v: 'winter', label: T('winter') }], S.mode,
        (v) => { S.mode = v; notify(); }));
    // Altitude is the source of the pressure used for every state; typing a pressure by hand
    // overrides it until the altitude is edited again. (The workbook's altitude cell does nothing at
    // all — the pressure is pinned at 101.325 — and a dead-zone comparison here once swallowed small
    // altitude changes entirely, so moving the altitude by 1 m left the pressure reading unchanged.)
    let pOverride = false;
    const f = form([
      { key: 'alt', label: T('alt'), unit: 'm', def: S.alt, step: '1' },
      { key: 'p', label: T('press'), unit: 'kPa', def: S.p, step: '0.001' },
    ], (a) => {
      const altEdited = a.alt !== S.alt;
      const pEdited = a.p !== S.p;
      S.alt = a.alt;
      S.p = a.p;
      if (altEdited) pOverride = false;
      else if (pEdited) pOverride = true;
      notify();
    }, 'grid2');
    const rhoBox = h('div');
    const pNote = h('div', { class: 'note' });
    body.append(modeRow, f.grid, rhoBox, pNote, h('div', { class: 'note' }, T('minFlow')));
    redraws.push(() => {
      if (!pOverride) {
        const pa = +pressureAt(S.alt).toFixed(3);
        if (pa !== S.p) { S.p = pa; f.set('p', pa); return; }  // set() re-enters with the new value
      }
      pNote.textContent = pOverride ? L({
        en: 'Pressure overridden by hand; edit the altitude to go back to the ISA value.',
        zh: '壓力已手動覆寫；改動高度即回復由 ISA 公式推算。',
      }) : L({
        en: 'Pressure derived from altitude (ISA): p = 101.325·(1 − 2.25577e-5·z)^5.2559 kPa.',
        zh: '壓力由高度以 ISA 公式推算：p = 101.325·(1 − 2.25577e-5·z)^5.2559 kPa。',
      });
      const sup = resolveRow(S.sup[S.mode], S.p);
      const exh = resolveRow(S.exh[S.mode], S.p);
      const rho = sup && exh ? (sup.rho + exh.rho) / 2 : sup ? sup.rho : null;
      results(rhoBox, [
        res(T('rhoAir'), rho, 'kg/m³', { digits: 3 }),
        res(L({ en: 'Pressure used', zh: '採用壓力' }), S.p, 'kPa', { digits: 3 }),
      ]);
    });
  }, { src: 'Wheel!B2:E4 · option buttons + ISA pressure' }));

  // ---- 2) Design conditions: the workbook's four inlet rows ----
  root.append(card(T('design'), T('designSub'), (body) => {
    const rows = [
      ['supSummer', T('supplyIn'), T('summer'), 'sup', 'summer'],
      ['supWinter', T('supplyIn'), T('winter'), 'sup', 'winter'],
      ['exhSummer', T('exhaustIn'), T('summer'), 'exh', 'summer'],
      ['exhWinter', T('exhaustIn'), T('winter'), 'exh', 'winter'],
    ];
    const tbody = h('tbody');
    const computed = new Map();
    const num = (val, onEdit, step) => {
      const inp = h('input', {
        type: 'number', inputmode: 'decimal', step: step ?? 'any', autocomplete: 'off',
        class: 'cell-in', value: val == null ? '' : val,
      });
      inp.addEventListener('input', () => onEdit(inp.value === '' ? null : parseFloat(inp.value)));
      return inp;
    };
    for (const [key, loc, season, grp, sea] of rows) {
      const row = S[grp][sea];
      const cells = {};
      for (const fldName of ['wb', 'rh']) {
        cells[fldName] = num(row[fldName], (v) => { row[fldName] = v; row.drv = fldName; notify(); });
      }
      cells.db = num(row.db, (v) => { row.db = v; notify(); });
      const out = {};
      const td = (label) => {
        const el = h('td', { class: 'num' });
        out[label] = el;
        return el;
      };
      tbody.append(h('tr', {}, h('td', {}, loc), h('td', {}, season),
        h('td', {}, cells.db), h('td', {}, cells.wb), h('td', {}, cells.rh),
        td('wb'), td('w'), td('h'), td('tdp'), td('rh')));
      computed.set(key, out);
    }
    const thead = h('thead', {}, h('tr', {},
      h('th', {}, T('loc')), h('th', {}, T('season')),
      h('th', {}, T('dbfield')), h('th', {}, T('wbfield')), h('th', {}, T('rhfield')),
      h('th', {}, T('wb')), h('th', {}, T('wCol') + ' kg/kg'), h('th', {}, T('hCol') + ' kJ/kg'),
      h('th', {}, T('tdpCol')), h('th', {}, T('rhCol'))));
    const notes = h('div');
    body.append(h('div', { class: 'table-scroll' },
      h('table', { class: 'pipes-table wheel-dc' }, thead, tbody)), notes,
    h('div', { class: 'note' }, L({
      en: 'On a phone the table scrolls sideways (swipe) — the workbook spreads these nine columns across the sheet.',
      zh: '手機上此表可左右滑動（滑動查看）；原檔係把這九欄橫向攤在工作表上。',
    })));
    redraws.push(() => {
      const msgs = [];
      for (const [key, loc, season, grp, sea] of rows) {
        const out = computed.get(key);
        const s = resolveRow(S[grp][sea], S.p);
        if (!s) { for (const el of Object.values(out)) el.textContent = '—'; continue; }
        const set = (el, v) => { el.textContent = v; };
        set(out.wb, s.twb.toFixed(1));
        set(out.w, s.w.toFixed(5));
        set(out.h, s.h.toFixed(2));
        set(out.tdp, s.tdp.toFixed(1));
        set(out.rh, s.rh.toFixed(1));
        // The workbook happily stores a RH that contradicts the DB/WB pair (its Air2 row does):
        // surface it instead of echoing the wrong number.
        const row = S[grp][sea];
        if (row.rh != null && row.wb != null && Math.abs(row.rh - s.rh) > 1.5) {
          msgs.push(loc + ' · ' + season + '：' + T('mismatch') + ' (' +
            row.rh.toFixed(0) + '% vs ' + s.rh.toFixed(1) + '%)');
        }
      }
      notes.innerHTML = '';
      for (const m of msgs) notes.append(flag(m, 'warn'));
    });
  }, { src: 'Wheel!B6:K11 + hidden Wheel Support (8 state blocks)' }));

  // ---- 3) Air flow (workbook B13:F16) ----
  root.append(card(T('flow'), T('flowSub'), (body) => {
    const unitRow = h('div', { class: 'field' }, h('label', {}, T('flowUnit')),
      seg([{ v: 'L/s', label: 'L/s' }, { v: 'm³/s', label: 'm³/s' }, { v: 'm³/h', label: 'm³/h' }],
        S.unit, (v) => { S.unit = v; notify(); }));
    const f = form([
      { key: 'vs', label: T('vs'), unit: S.unit, def: S.vs },
      { key: 've', label: T('ve'), unit: S.unit, def: S.ve },
    ], (a) => { S.vs = a.vs; S.ve = a.ve; notify(); }, 'grid2');
    const box = h('div');
    body.append(unitRow, f.grid, box);
    redraws.push(() => {
      const r = S.ve > 0 ? S.vs / S.ve : null;
      const si = toM3s(S.vs), ei = toM3s(S.ve);
      results(box, [
        res(T('ratio'), r, '—', { digits: 3, warn: r != null && (r > 1.5 || r < 0.7) }),
        res(T('vs'), si, 'm³/s', { digits: 3 }),
        res(T('ve'), ei, 'm³/s', { digits: 3 }),
        res(L({ en: 'Used in the calculation', zh: '計算採用' }), Math.min(si, ei), 'm³/s', { digits: 3, big: true }),
      ]);
      if (r != null && r > 1.5) box.append(flag(T('ratioHigh'), 'warn'));
      else if (r != null && r < 0.7) box.append(flag(T('ratioLow'), 'warn'));
    });
  }, { src: 'Wheel!B13:F16 · ratio guard 0.7–1.5' }));

  // ---- 4) Recovery efficiency (workbook B17:D19) ----
  root.append(card(T('eff'), T('effSub'), (body) => {
    const f = form([
      { key: 'effS', label: T('effS'), def: S.effS, step: '0.01', min: '0', max: '1' },
      { key: 'effT', label: T('effT'), def: S.effT, step: '0.01', min: '0', max: '1' },
    ], (a) => { S.effS = a.effS; S.effT = a.effT; notify(); }, 'grid2');
    body.append(f.grid, h('div', { class: 'formula' },
      L({
        en: 'QT = min(Vs,Ve)·ρ·cp·|h_o,1 − h_r,1|·ηT   QS = min(Vs,Ve)·ρ·cp·|t_o,1 − t_r,1|·ηS   QL = QT − QS',
        zh: 'QT = min(Vs,Ve)·ρ·cp·|h_o,1 − h_r,1|·ηT   QS = min(Vs,Ve)·ρ·cp·|t_o,1 − t_r,1|·ηS   QL = QT − QS',
      })));
  }, { src: 'Wheel!B17:D19 · M6/O6/O10/T7/T11' }));

  // ---- 5) Summer | Winter result columns ----
  const colBoxes = {};
  root.append(card(T('results'), T('resultsSub'), (body) => {
    const grid = h('div', { class: 'grid2' });
    for (const season of ['summer', 'winter']) {
      const box = h('div', { class: 'wheel-col' });
      const head = h('div', { class: 'wheel-col-head' }, season === 'summer' ? T('summer') : T('winter'));
      const inner = h('div');
      colBoxes[season] = { box, head, inner };
      box.append(head, inner);
      grid.append(box);
    }
    body.append(grid);
    redraws.push(() => {
      for (const season of ['summer', 'winter']) {
        const { box, head, inner } = colBoxes[season];
        head.classList.toggle('on', S.mode === season);
        renderSeason(inner, season);
        void box;
      }
    });
  }, { src: 'Wheel!M5:T40 (summer) · V5:AC40 (winter)' }));

  function renderSeason(box, season) {
    const sup = resolveRow(S.sup[season], S.p);
    const exh = resolveRow(S.exh[season], S.p);
    if (!sup || !exh) { results(box, []); return; }
    const cp = P.CONST.CP_AIR;
    const vs = toM3s(S.vs), ve = toM3s(S.ve);
    const m = Math.min(vs * sup.rho, ve * exh.rho);          // workbook O6/O10: min(Vs,Ve)
    const total = season === 'summer';                        // summer = total-heat wheel
    const effS = S.effS, effT = total ? S.effT : 0;

    // Recovered energy is reported as a positive magnitude: the workbook writes the summer column as
    // (t_o,1 − t_r,1) and the winter column as (t_r,1 − t_o,1) — same quantity, opposite direction.
    const qsMax = m * cp * Math.abs(sup.t - exh.t) * effS;
    const qtMax = total ? m * Math.abs(sup.h - exh.h) * effT : null;

    // Supply outlet: sensible effectiveness fixes T, total effectiveness fixes h (as the workbook
    // does via its Wheel Support lookup), then W follows from that (h, T) pair.
    const t2 = sup.t + effS * (exh.t - sup.t);
    const h2 = total ? sup.h + effT * (exh.h - sup.h) : P.enthalpy(t2, sup.w);
    let w2 = total ? P.WfromEnthalpyT(h2, t2) : sup.w;
    const diag = [];
    if (total && t2 < P.tdpFromPw(P.pwFromW(w2, S.p), S.p)) {
      w2 = P.Ws(t2, S.p);                                     // saturated — workbook Z33
      diag.push(flag(T('condSupply') + ' (' + T('saturated') + ' ' + P.enthalpy(t2, w2).toFixed(1) + ' kJ/kg)', 'warn'));
    }
    const h2f = P.enthalpy(t2, w2);

    // Exhaust outlet — the same relations on the return side.
    const tr2 = exh.t + effS * (sup.t - exh.t);
    const hr2 = total ? exh.h + effT * (sup.h - exh.h) : P.enthalpy(tr2, exh.w);
    let wr2 = total ? P.WfromEnthalpyT(hr2, tr2) : exh.w;
    const tr2Tdp = P.tdpFromPw(P.pwFromW(wr2, S.p), S.p);
    if (tr2 <= tr2Tdp) diag.push(flag(T('condExhaust') + ' — < ' + Math.ceil(tr2Tdp) + ' °C ' +
      L({ en: 'dew point of exhaust air', zh: '排風露點' }), 'bad'));
    if (tr2 < 0) diag.push(flag(T('frost'), 'bad'));
    const hr2f = P.enthalpy(tr2, wr2);

    const qs = m * cp * Math.abs(sup.t - t2);
    const qt = m * Math.abs(sup.h - h2f);
    const ql = qt - qs;
    const rhoC = (sup.rho + exh.rho) / 2 * cp;

    results(box, [
      res(T('maxQT'), total ? qtMax : null, total ? 'kW' : '', { digits: 2, big: true }),
      res(T('maxQS'), qsMax, 'kW', { digits: 2, big: true }),
      res(T('qs'), qs, 'kW', { digits: 2 }),
      res(T('ql'), total ? ql : 0, 'kW', { digits: 2 }),
      res(T('qt'), qt, 'kW', { digits: 2 }),
      res(T('supOut') + ' · ' + T('db'), t2, '°C', { digits: 2 }),
      res(T('supOut') + ' · ' + T('wb'), P.twbFromTW(t2, w2, S.p), '°C', { digits: 2 }),
      res(T('supOut') + ' · ' + T('hCol'), h2f, 'kJ/kg', { digits: 2 }),
      res(T('exhOut') + ' · ' + T('db'), tr2, '°C', { digits: 2 }),
      res(T('exhOut') + ' · ' + T('wb'), P.twbFromTW(tr2, wr2, S.p), '°C', { digits: 2 }),
      res(T('exhOut') + ' · ' + T('hCol'), hr2f, 'kJ/kg', { digits: 2 }),
      res(L({ en: 'Mass flow used (ρ·cp = ' + rhoC.toFixed(3) + ')', zh: '採用質量流量（ρ·cp = ' + rhoC.toFixed(3) + '）' }),
        m, 'kg/s', { digits: 3 }),
    ]);
    if (!total) box.append(flag(T('noSensible'), 'info'));
    for (const d of diag) box.append(d);
    box.append(h('div', { class: 'note' }, L({
      en: 'W_o,2 = ' + w2.toFixed(5) + ' kg/kg · W_r,2 = ' + wr2.toFixed(5) + ' kg/kg',
      zh: '供風出口含濕量 ' + w2.toFixed(5) + ' kg/kg · 排風出口含濕量 ' + wr2.toFixed(5) + ' kg/kg',
    })));
  }

  // ---- 6) Schematic (workbook B21:F37) ----
  const schBox = h('div');
  root.append(card(T('sch'), T('schSub'), (body) => {
    body.append(schBox);
    redraws.push(() => {
      const part = (season) => {
        const sup = resolveRow(S.sup[season], S.p);
        const exh = resolveRow(S.exh[season], S.p);
        if (!sup || !exh) return '';
        const effS = S.effS, effT = season === 'summer' ? S.effT : 0;
        const t2 = sup.t + effS * (exh.t - sup.t);
        const h2 = season === 'summer' ? sup.h + effT * (exh.h - sup.h) : P.enthalpy(t2, sup.w);
        const w2 = season === 'summer' ? P.WfromEnthalpyT(h2, t2) : sup.w;
        const tr2 = exh.t + effS * (sup.t - exh.t);
        const hr2 = season === 'summer' ? exh.h + effT * (sup.h - exh.h) : P.enthalpy(tr2, exh.w);
        const wr2 = season === 'summer' ? P.WfromEnthalpyT(hr2, tr2) : exh.w;
        const f = (t, w) => t.toFixed(1) + ' / ' + P.twbFromTW(t, w, S.p).toFixed(1) + ' °C';
        const a = f(sup.t, sup.w), b = f(t2, w2), c = f(exh.t, exh.w), d = f(tr2, wr2);
        const title = L(season === 'summer' ? I18N.summer : I18N.winter);
        return wheelSVGWide(title, a, b, c, d) + wheelSVGNarrow(title, a, b, c, d);
      };
      schBox.innerHTML = part('summer') + part('winter');
    });
  }, { src: 'Wheel!B21:F37 · drawing7.xml' }));

  notify();
}

register({
  id: 'wheel', icon: '⚙️', group: 'air', title: I18N.title, desc: I18N.desc,
  src: 'Effectiveness relations · workbook Wheel sheet',
  render,
});
