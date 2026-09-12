// Module: Chiller (冷機) — rebuilt from the workbook 'Chiller' sheet.
//
// Workbook layout being mirrored (print area 'Chiller'!$B$2:$AG$41):
//   B8:F15   Unit Conversion — one capacity value in kW / RT / HP / Btu/h / kcal/h, converted to all
//   G2:I17   Cooling Load Density — a density with a selectable unit (W/m², ft²/RT, m²/kW, ft²/HP) and
//            an area with a selectable unit (m², ft²) give the cooling load in every capacity unit
//   L2:N36   國內空調冷負荷設計指標的統計值 — 32 building types with a W/m² range (picking a row fills
//            the density field, so the table drives the calculator instead of just documenting it)
//   P2:Y13   Plant Capacity References — eight real projects; names anonymised to A–H per the user's
//            decision, numbers unchanged. The workbook's overall density is Total(RT)·3.517 / AC area.
//   AA2:AE20 Efficiency or Coefficient — COP = 3.516/(ikW/RT) and the AHRI 550/590 IPLV schedule with
//            its weights (0.01/0.42/0.45/0.12) and condensing-water temperatures
//   AG4:AG41 Heat Dissipation From Electrical Equipment — reference rules for plant rooms; listed in
//            the folded electrical block below (same sheet in the workbook, but it belongs with the
//            electrical material in the app)
import { register } from '../registry.js';
import { h, res, flag, card, form, results, seg, fold } from '../ui.js';
import { CONV, plantDensityWm2 } from '../engine/fluids.js';
import { GART_MODELS } from '../data/chiller_mhi.js';
import {
  DESIGN_LOAD_INDEX, PLANT_REFERENCES, IPLV_POINTS, COP_RT_CONSTANT, ELEC_HEAT,
} from '../data/chiller_refs.js';

const M2_PER_FT2 = 0.09290304;
const kW_PER_HP = 0.7457;

const I18N = {
  title: { en: 'Cooling Load & Chillers', zh: '冷負荷與冷機' },
  desc: {
    en: 'Workbook page rebuilt: load density × area → plant capacity, the 32-row design-index table, unit conversion, COP/IPLV and the project reference rows.',
    zh: '照原檔重建：負荷密度×面積 → 全廠冷量、32 行設計指標表、單位換算、COP／IPLV 與項目參考值。',
  },
  density: { en: 'Cooling Load Density', zh: '冷負荷密度' },
  densitySub: {
    en: 'Pick a building type below to fill the density, or type your own. Area and density units are selectable, as in the workbook.',
    zh: '可由下方設計指標表點選建築類型自動填入密度，或自行輸入。面積與密度單位可選，與原檔一致。',
  },
  densUnit: { en: 'Density unit', zh: '密度單位' },
  areaUnit: { en: 'Area unit', zh: '面積單位' },
  densityLabel: { en: 'Load density', zh: '負荷密度' },
  area: { en: 'Air-conditioned area', zh: '空調面積' },
  load: { en: 'Cooling load', zh: '冷負荷' },
  indexTable: { en: 'Design Load Index (W/m², PRC statistics)', zh: '空調冷負荷設計指標（W/m²，國內統計值）' },
  indexSub: {
    en: 'Workbook L5:N36. Click a row to use it: min, mid or max of the printed range.',
    zh: '原檔 L5:N36。點選一行即可套用：可選範圍下限、中值或上限。',
  },
  pick: { en: 'Use', zh: '套用' },
  min: { en: 'Min', zh: '下限' },
  mid: { en: 'Mid', zh: '中值' },
  max: { en: 'Max', zh: '上限' },
  type: { en: 'Building type / room', zh: '建築類型及房間名稱' },
  range: { en: 'Index range', zh: '指標範圍' },
  conversion: { en: 'Unit Conversion', zh: '容量單位換算' },
  capKw: { en: 'Capacity', zh: '冷量' },
  efficiency: { en: 'Efficiency & IPLV (AHRI 550/590)', zh: '效率與 IPLV（AHRI 550/590）' },
  effSub: {
    en: 'COP = 3.516 / (ikW/RT) as printed in the workbook; IPLV uses the four AHRI load points with their weights and condensing-water temperatures.',
    zh: '原檔印明 COP = 3.516 / (ikW/RT)；IPLV 用 AHRI 四個負載點、各自權重與冷凝水溫。',
  },
  cap: { en: 'Chiller capacity', zh: '冷機冷量' },
  power: { en: 'Power input', zh: '輸入功率' },
  cop: { en: 'COP', zh: 'COP' },
  kwrt: { en: 'kW/RT', zh: 'kW/RT' },
  good: { en: 'Good efficiency (water-cooled class)', zh: '效率良好（水冷機級別）' },
  fair: { en: 'Fair (typical air-cooled)', zh: '一般（典型風冷機）' },
  poor: { en: 'Poor — check data or consider replacement', zh: '偏低 — 請檢查數據或考慮更換' },
  effNote: {
    en: 'Reference kW/RT: water-cooled ≈ 0.55–0.75, air-cooled ≈ 1.0–1.4 (full load).',
    zh: '參考 kW/RT：水冷 ≈ 0.55–0.75、風冷 ≈ 1.0–1.4（滿載）。',
  },
  loadPoint: { en: 'Load point', zh: '負載點' },
  weight: { en: 'Weight', zh: '權重' },
  condWater: { en: 'Condensing water', zh: '冷凝水溫' },
  iplv: { en: 'IPLV', zh: 'IPLV' },
  plants: { en: 'Plant Capacity References', zh: '項目容量參考值' },
  plantsSub: {
    en: 'Eight projects from the workbook. Its client names are replaced by letters; every number is unchanged. The overall density is computed as Total(RT)·3.517 / AC area and compared with the workbook value.',
    zh: '原檔八個項目。客戶名稱以字母代替，數值完全不變。整體密度按 總冷量(RT)×3.517 ÷ 空調面積 計算，並與原檔數值對比。',
  },
  project: { en: 'Project', zh: '項目' },
  gfa: { en: 'GFA (m²)', zh: '總樓面 (m²)' },
  rooms: { en: 'No. of rooms/units', zh: '房間／單位數' },
  acArea: { en: 'AC area (m²)', zh: '空調面積 (m²)' },
  totalRT: { en: 'Total (RT)', zh: '總冷量 (RT)' },
  chillers: { en: 'Chiller', zh: '冷機配置' },
  densPodium: { en: 'Podium', zh: '裙樓' },
  densTower: { en: 'Tower', zh: '塔樓' },
  densBasement: { en: 'B/F', zh: '地庫' },
  densOverall: { en: 'Overall', zh: '整體' },
  computed: { en: 'computed', zh: '計算值' },
  mismatch: { en: 'workbook value differs', zh: '與原檔數值不符' },
  elecHeat: { en: 'Heat Dissipation From Electrical Equipment', zh: '電氣設備發熱量（原檔同頁）' },
  transformer: { en: 'Transformers', zh: '變壓器' },
  switchgear: { en: 'Switchgear', zh: '開關櫃' },
  mcc: { en: 'Motor control centres & starters', zh: '馬達控制中心與起動器' },
  catalogue: { en: 'MHI Thermal Systems — Water-cooled Chillers (2025 catalogue)', zh: 'MHI 水冷機（2025 目錄）' },
  gartTable: { en: 'MHI GART — catalogue table (OCR-verified)', zh: 'MHI GART — 目錄表（OCR 核對）' },
};

function render(root, { L }) {
  const T = (k) => L(I18N[k]);
  const S = {
    densUnit: 'W/m2',
    areaUnit: 'm2',
    density: 194,          // workbook's overall density for project A
    area: 39500,           // project A AC area
    capKw: 1000,
    power: 210,
  };
  const redraws = [];
  const notify = () => { for (const fn of redraws) fn(); };

  /** Cooling load (kW) from a density expressed in the selected unit and an area in the selected unit. */
  function loadFromDensity(density, area, densUnit, areaUnit) {
    if (!(density > 0) || !(area > 0)) return null;
    const aM2 = areaUnit === 'ft2' ? area * M2_PER_FT2 : area;
    switch (densUnit) {
      case 'W/m2': return aM2 * density / 1000;
      case 'ft2/RT': {                        // area (ft²) per ton
        const aFt2 = aM2 / M2_PER_FT2;
        return (aFt2 / density) * CONV.kW_PER_RT;
      }
      case 'm2/kW': return aM2 / density;
      case 'ft2/HP': {                        // area (ft²) per compressor horsepower
        const aFt2 = aM2 / M2_PER_FT2;
        return (aFt2 / density) * kW_PER_HP;
      }
      default: return null;
    }
  }

  /** Every capacity unit the workbook lists. */
  function capacityTiles(kw, big = false) {
    return [
      res(T('load'), kw, 'kW', { digits: 1, big }),
      res(T('load'), kw / CONV.kW_PER_RT, 'RT', { digits: 1, big }),
      res(T('load'), kw / kW_PER_HP, 'HP', { digits: 1 }),
      res(T('load'), kw * CONV.BTUH_PER_KW, 'Btu/h', { digits: 0 }),
      res(T('load'), kw * CONV.KCAL_PER_KW, 'kcal/h', { digits: 0 }),
    ];
  }

  // ---- 1) Cooling load density (workbook G2:I17) ----
  const densBox = h('div');
  let densForm = null;
  root.append(card(T('density'), T('densitySub'), (body) => {
    const unitRow = h('div', { class: 'grid2' },
      h('div', { class: 'field' }, h('label', {}, T('densUnit')),
        seg([{ v: 'W/m2', label: 'W/m²' }, { v: 'ft2/RT', label: 'ft²/RT' },
          { v: 'm2/kW', label: 'm²/kW' }, { v: 'ft2/HP', label: 'ft²/HP' }], S.densUnit,
          (v) => { S.densUnit = v; notify(); })),
      h('div', { class: 'field' }, h('label', {}, T('areaUnit')),
        seg([{ v: 'm2', label: 'm²' }, { v: 'ft2', label: 'ft²' }], S.areaUnit,
          (v) => { S.areaUnit = v; notify(); })));
    densForm = form([
      { key: 'density', label: T('densityLabel'), unit: S.densUnit, def: S.density },
      { key: 'area', label: T('area'), unit: S.areaUnit === 'ft2' ? 'ft²' : 'm²', def: S.area },
    ], (a) => { S.density = a.density; S.area = a.area; notify(); }, 'grid2', 'dens-');
    body.append(unitRow, densForm.grid, densBox);
    redraws.push(() => {
      const kw = loadFromDensity(S.density, S.area, S.densUnit, S.areaUnit);
      if (kw == null) { results(densBox, []); return; }
      results(densBox, capacityTiles(kw, true));
      densBox.append(h('div', { class: 'note' }, S.density + ' ' + S.densUnit + ' × ' + S.area + ' ' +
        (S.areaUnit === 'ft2' ? 'ft²' : 'm²') + ' → ' + kw.toFixed(1) + ' kW'));
    });
  }, { src: 'Chiller!G2:I17', formula: 'kW = area(m²)·density(W/m²)/1000;  1 RT = 3.51685 kW;  1 HP = 0.7457 kW;  1 m² = 10.7639 ft²' }));

  // ---- 2) Design load index table (workbook L2:N36) ----
  root.append(card(T('indexTable'), T('indexSub'), (body) => {
    let pick = 'mid';
    const segRow = h('div', { class: 'field' }, h('label', {}, T('pick')),
      seg([{ v: 'min', label: T('min') }, { v: 'mid', label: T('mid') }, { v: 'max', label: T('max') }],
        pick, (v) => { pick = v; }));
    const table = h('table', { class: 'pipes-table ref-index' });
    table.append(h('thead', {}, h('tr', {},
      h('th', {}, '#'), h('th', {}, T('type')), h('th', {}, T('range')), h('th', {}, T('pick')))));
    const tbody = h('tbody');
    for (const row of DESIGN_LOAD_INDEX) {
      const value = () => (pick === 'min' ? row.min : pick === 'max' ? row.max : (row.min + row.max) / 2);
      const btn = h('button', {
        type: 'button', class: 'btn', 'aria-label': T('pick') + ' ' + row.type,
        onclick: () => {
          S.density = value();
          S.densUnit = 'W/m2';
          if (densForm) { densForm.set('density', S.density); }
          notify();
        },
      }, T('pick'));
      tbody.append(h('tr', {}, h('td', { class: 'num' }, String(row.no)),
        h('td', {}, row.type), h('td', { class: 'num' }, row.min + '~' + row.max), h('td', {}, btn)));
    }
    table.append(tbody);
    body.append(segRow, h('div', { class: 'table-scroll' }, table));
  }, { src: 'Chiller!L5:N36 (國內空調冷負荷設計指標的統計值)' }));

  // ---- 3) Unit conversion (workbook B8:F15) ----
  root.append(card(T('conversion'), '', (body) => {
    const f = form([
      { key: 'capKw', label: T('capKw'), unit: 'kW', def: S.capKw },
    ], (a) => { S.capKw = a.capKw; notify(); }, 'grid2', 'cv-');
    const box = h('div');
    body.append(f.grid, box);
    redraws.push(() => {
      if (!(S.capKw > 0)) { results(box, []); return; }
      results(box, [
        res(T('capKw'), S.capKw, 'kW', { digits: 1, big: true }),
        res(T('capKw'), S.capKw / CONV.kW_PER_RT, 'RT', { digits: 2, big: true }),
        res(T('capKw'), S.capKw / kW_PER_HP, 'HP', { digits: 1 }),
        res(T('capKw'), S.capKw * CONV.BTUH_PER_KW, 'Btu/h', { digits: 0 }),
        res(T('capKw'), S.capKw * CONV.KCAL_PER_KW, 'kcal/h', { digits: 0 }),
      ]);
    });
  }, { src: 'Chiller!B8:F15', formula: '1 RT = 12000 Btu/h = 3.51685 kW;  1 HP = 0.7457 kW;  1 kW = 3412.14 Btu/h = 860.42 kcal/h' }));

  // ---- 4) Efficiency and IPLV (workbook AA2:AE20) ----
  root.append(card(T('efficiency'), T('effSub'), (body) => {
    const f = form([
      { key: 'cap', label: T('cap'), unit: 'kW', def: S.capKw },
      { key: 'power', label: T('power'), unit: 'kW', def: S.power },
    ], draw, 'grid2', 'eff-');
    const box = h('div');
    const points = h('div');
    const iplvBox = h('div');
    body.append(f.grid, box, points, iplvBox);
    const pForms = IPLV_POINTS.map((pt, i) => ({
      pt,
      f: form([{ key: 'kwrt', label: (pt.load * 100) + '% kW/RT', unit: 'kW/RT', def: [0.55, 0.60, 0.65, 0.70][i] }],
        () => drawIplv(), 'grid4', 'iplv' + i + '-'),
    }));
    const tbl = h('table', { class: 'pipes-table eff-points' });
    tbl.append(h('thead', {}, h('tr', {},
      h('th', {}, T('loadPoint')), h('th', {}, T('weight')), h('th', {}, T('condWater')),
      h('th', {}, 'kW/RT'))));
    const tb = h('tbody');
    for (const { pt, f: pf } of pForms) {
      tb.append(h('tr', {}, h('td', { class: 'num' }, (pt.load * 100) + '%'),
        h('td', { class: 'num' }, pt.weight.toFixed(2)),
        h('td', { class: 'num' }, pt.condWater.toFixed(1) + ' °C'),
        h('td', {}, pf.grid)));
    }
    tbl.append(tb);
    points.append(h('div', { class: 'table-scroll' }, tbl));
    function draw(st) {
      if ([st.cap, st.power].some((x) => x == null || x <= 0)) { results(box, []); return; }
      const cop = st.cap / st.power;
      const kwrt = st.power / (st.cap / CONV.kW_PER_RT);
      const kind = kwrt <= 0.8 ? 'ok' : kwrt <= 1.4 ? 'info' : 'bad';
      results(box, [
        res(T('cop'), cop, '—', { digits: 2, big: true }),
        res(T('kwrt'), kwrt, 'kW/RT', { digits: 2, big: true }),
        res(L({ en: 'COP from kW/RT', zh: '由 kW/RT 反算 COP' }), COP_RT_CONSTANT / kwrt, '—', { digits: 2 }),
      ]);
      box.append(flag(kwrt <= 0.8 ? T('good') : kwrt <= 1.4 ? T('fair') : T('poor'), kind));
      box.append(h('div', { class: 'note' }, T('effNote')));
    }
    function drawIplv() {
      const vals = pForms.map(({ f: pf }) => pf.get('kwrt'));
      if (vals.some((x) => x == null || x <= 0)) { results(iplvBox, []); return; }
      const iplv = IPLV_POINTS.reduce((sum, pt, i) => sum + pt.weight * vals[i], 0);
      results(iplvBox, [
        res(T('iplv'), iplv, 'kW/RT', { digits: 3, big: true }),
        res(L({ en: 'IPLV COP', zh: 'IPLV COP' }), COP_RT_CONSTANT / iplv, '—', { digits: 2 }),
      ]);
      iplvBox.append(h('div', { class: 'note' },
        'IPLV = ' + IPLV_POINTS.map((pt, i) => pt.weight.toFixed(2) + '·' + vals[i].toFixed(3)).join(' + ')));
    }
    draw(f.all());
    drawIplv();
  }, { formula: 'COP = 3.516 / (ikW/RT);  IPLV = 0.01·A + 0.42·B + 0.45·C + 0.12·D (kW/RT)',
    src: 'Chiller!AA2:AE20 · *Reference: ARI 550/590-19 · AHRI 550/590-2023 weights' }));

  // ---- 5) Plant capacity references (workbook P2:Y13, names anonymised) ----
  root.append(card(T('plants'), T('plantsSub'), (body) => {
    const rows = [];
    const notes = h('div');
    const diffs = [];
    for (const p of PLANT_REFERENCES) {
      const calc = plantDensityWm2(p.totalRT, p.acArea);
      const differs = calc != null && p.densOverall != null && Math.abs(calc - p.densOverall) > 0.5;
      if (differs) diffs.push(p.id + ': ' + p.densOverall + ' vs ' + calc.toFixed(1));
      const cell = (v, digits = 1) => (v == null ? '—' : Number(v).toFixed(digits));
      rows.push({
        cells: [
          { node: p.id }, { num: true, node: p.gfa == null ? '—' : p.gfa.toLocaleString() },
          { num: true, node: p.rooms == null ? '—' : String(p.rooms) },
          { num: true, node: p.acArea == null ? '—' : p.acArea.toLocaleString() },
          { num: true, node: p.totalRT == null ? '—' : String(p.totalRT) },
          { node: p.chillers == null ? '—' : p.chillers },
          { num: true, node: cell(p.densPodium) }, { num: true, node: cell(p.densTower) },
          { num: true, node: cell(p.densBasement) },
          { num: true, node: p.densOverall == null ? '—' : p.densOverall.toFixed(1) },
          { num: true, node: calc == null ? '—' : calc.toFixed(1) + ' (' + T('computed') + ')' },
        ],
      });
    }
    const tbl = h('table', { class: 'pipes-table plants' });
    tbl.append(h('thead', {}, h('tr', {},
      h('th', {}, T('project')), h('th', {}, T('gfa')), h('th', {}, T('rooms')),
      h('th', {}, T('acArea')), h('th', {}, T('totalRT')), h('th', {}, T('chillers')),
      h('th', {}, T('densPodium')), h('th', {}, T('densTower')), h('th', {}, T('densBasement')),
      h('th', {}, T('densOverall')), h('th', {}, T('densOverall') + ' · ' + T('computed')))));
    const tb = h('tbody');
    for (const r of rows) {
      const tr = h('tr', { class: r.class });
      for (const c of r.cells) tr.append(h('td', { class: c.num ? 'num' : null }, c.node));
      tb.append(tr);
    }
    tbl.append(tb);
    body.append(h('div', { class: 'table-scroll' }, tbl), notes);
    if (diffs.length) notes.append(flag(T('mismatch') + ' — ' + diffs.join(' · '), 'warn'));
    notes.append(h('div', { class: 'note' },
      L({ en: 'Computed column = Total(RT) × 3.517 × 1000 / AC area (W/m²) — the workbook’s own relation; rows whose workbook value differs are highlighted.',
        zh: '計算欄 = 總冷量(RT)×3.517×1000 ÷ 空調面積 (W/m²) —— 原檔自身嘅關係；與原檔值不符嘅行會標示。' })));
  }, { src: 'Chiller!P6:Y13 (client names replaced by A–H) · Chiller!AC/AD: ikW/RT and sub-loading' }));

  // ---- 6) Electrical heat dissipation (workbook AG4:AG41, same sheet) ----
  root.append(fold(T('elecHeat'), card(T('elecHeat'), '', (body) => {
    const mk = (title, rows, unit) => {
      const tbl = h('table', { class: 'pipes-table' });
      tbl.append(h('thead', {}, h('tr', {}, h('th', {}, title), h('th', {}, unit || 'W'))));
      const tb = h('tbody');
      for (const r of rows) {
        tb.append(h('tr', {}, h('td', {}, r.range), h('td', { class: 'num' }, String(r.value) + (r.unit ? ' ' + r.unit : ''))));
      }
      tbl.append(tb);
      return h('div', { class: 'table-scroll' }, tbl);
    };
    body.append(mk(T('transformer'), ELEC_HEAT.transformers, 'W/kVA'),
      mk(T('switchgear'), ELEC_HEAT.switchgear), mk(T('mcc'), ELEC_HEAT.mcc));
    for (const n of ELEC_HEAT.notes) body.append(h('div', { class: 'note' }, L(n)));
  }, { src: 'Chiller!AG4:AG41 · heat dissipation from electrical equipment', collapsed: true })));

  // ---- 7) MHI catalogue tables (kept from the earlier build) ----
  root.append(fold(T('catalogue'), card(T('catalogue'), '', (body) => {
    const tbl = h('table', { class: 'pipes-table' });
    tbl.append(h('tr', {}, h('th', {}, 'Series'), h('th', {}, 'Drive'), h('th', {}, 'Refrigerant'), h('th', {}, 'Range')));
    for (const r of [
      ['ETI', 'VSD (built-in inverter)', 'HFC-134a', '250–2300 RT'],
      ['ETI-Z (Low GWP)', 'VSD', 'Low-GWP (R1234ze family)', 'approx. same range'],
      ['GART-P', 'Constant / Variable', 'HFC-134a', '250–2300 RT'],
      ['GART-R', 'Constant / Variable', 'HFC-134a', '250–2300 RT'],
    ]) tbl.append(h('tr', {}, ...r.map((x) => h('td', {}, x))));
    body.append(tbl);
  }, { src: 'MHI 2025 catalogue set (MTHSS007 rev. R3 + GART SERIES CATALOG 07/08)', collapsed: true })));

  root.append(fold(T('gartTable'), card(T('gartTable'), '', (body) => {
    const tbl = h('table', { class: 'pipes-table' });
    tbl.append(h('tr', {}, h('th', {}, 'RT'), h('th', {}, 'kW'), h('th', {}, 'Input kW'), h('th', {}, 'COP')));
    for (const g of GART_MODELS) tbl.append(h('tr', {}, ...[g.rt, g.kw, g.input, g.cop].map((x) => h('td', { class: 'num' }, String(x)))));
    body.append(h('div', { class: 'table-scroll' }, tbl));
    body.append(h('div', { class: 'note' },
      GART_MODELS.length + ' rows from the GART SERIES CATALOG scans, each passing the identity check kW = RT × 3.51685 (±0.5%) and COP = kW/input.'));
  }, { src: 'GART SERIES CATALOG 07/08 · OCR p10/p11', collapsed: true })));

  notify();
}

register({
  id: 'chiller', icon: '❄️', group: 'equipment', title: I18N.title, desc: I18N.desc,
  src: 'AHRI 550/590-2023 · workbook Chiller sheet',
  render,
});
