// Module: Heat Exchanger (換熱器) — from '24_Hx' sheet
//
// Workbook layout mirrored here:
//   C5/D5   capacity + unit selector (kW or RT; M5/M6 hold the unit labels)
//   C6      capacity converted to the other unit      =IF(D5=M6,C5*3.516,C5/3.516)
//   M7      capacity used downstream                  =IF(D5=M5,C5,C6)
//   C11/C12 hot side in/out, C15/C16 cold side in/out
//   C13/C17 side ΔT                                   =IF(C11*C12*C5>0,ABS(C11-C12),"-")
//   O6/O7   LMTD terminals  =ABS(C16-C11) and =ABS(C15-C12);  O8 = (O6-O7)/LN(O6/O7) or the mean
//   P32/Q32 side water flow (kg/s) = M7/4.185/ΔT   — the sheet's cp is 4.185 kJ/kg·K
//           P33/Q33 the same in m³/h (×3.6)
//   C23     overall U, 5000 W/m²·K in the workbook's label row
//   C27     area = M7/C23/O8*1000 (m²)               — the sheet labels this "A = U∆T / Q", inverted;
//           the correct relation Q = U·A·ΔT is used here and noted as a workbook label error
//   G31:H36 Out/In schematic of the two water sides (drawn below)
//   C31/C32 HISAKA plate model + dimensions, C34/C35 the vendor's online selection page. Those cells
//           are empty in the workbook and there is no vendor data file in the project, so the page
//           points at the vendor's own selection tool instead of carrying untraceable dimensions.
import { register } from '../registry.js';
import { h, res, flag, card, form, results, seg } from '../ui.js';
import * as F from '../engine/fluids.js';

const I18N = {
  title: { en: 'Heat Exchanger', zh: '換熱器計算' },
  desc: {
    en: 'Duty, LMTD, water flow per side and heat-transfer area, plus the temperature-cross check.',
    zh: '換熱量、對數平均溫差 LMTD、兩側水流量與傳熱面積，並含溫度交叉檢核。',
  },
  unit: { en: 'Capacity unit', zh: '換熱量單位' },
  kW: { en: 'kW', zh: 'kW' },
  rt: { en: 'RT', zh: 'RT' },
  q: { en: 'Heat duty Q', zh: '換熱量 Q' },
  qOther: { en: 'Q in the other unit', zh: '另一單位之 Q' },
  hotIn: { en: 'Hot side in', zh: '熱側進' },
  hotOut: { en: 'Hot side out', zh: '熱側出' },
  coldIn: { en: 'Cold side in', zh: '冷側進' },
  coldOut: { en: 'Cold side out', zh: '冷側出' },
  dTHot: { en: 'Hot side ΔT', zh: '熱側溫差 ΔT' },
  dTCold: { en: 'Cold side ΔT', zh: '冷側溫差 ΔT' },
  flowHot: { en: 'Hot side water flow', zh: '熱側水流量' },
  flowCold: { en: 'Cold side water flow', zh: '冷側水流量' },
  u: { en: 'Overall U', zh: '總傳熱係數 U' },
  a: { en: 'Heat transfer area A', zh: '傳熱面積 A' },
  dT1: { en: 'ΔT at hot-in end', zh: '熱進端溫差 ΔT1' },
  dT2: { en: 'ΔT at hot-out end', zh: '熱出端溫差 ΔT2' },
  lmtd: { en: 'LMTD', zh: '對數平均溫差' },
  meanT: { en: 'ΔT (equal terminals — arithmetic mean)', zh: 'ΔT（兩端相等 — 算術平均）' },
  cross: { en: 'Temperature cross', zh: '溫度交叉' },
  ok: { en: 'No temperature cross ✔', zh: '無溫度交叉 ✔' },
  bad: { en: 'Temperature cross — the cold side cannot leave hotter than the hot side enters.', zh: '出現溫度交叉 — 冷側出口不可能高於熱側進口。' },
  uRef: { en: 'U reference values', zh: 'U 值參考' },
  uRefNote: {
    en: 'The workbook uses 5000 W/m²·K for a plate heat exchanger; the other values are typical ranges — always use the vendor’s rated U for the selected model.',
    zh: '工作簿板式換熱器採 5000 W/m²·K；其餘為常見範圍 — 選型時應以廠商提供之 U 值為準。',
  },
  vendor: { en: 'Vendor selection', zh: '廠商選型' },
  vendorNote: {
    en: 'The workbook points at the HISAKA plate-type online selection page (www.hisaka.co.jp/simulator) for model, plate count and dimensions. Those cells are empty here, so no dimensions are quoted.',
    zh: '工作簿指向 HISAKA 板式換熱器線上選型頁（www.hisaka.co.jp/simulator）取得型號、板片數與尺寸。該等儲存格為空白，故本頁不列出任何尺寸。',
  },
  sheet: { en: 'Sheet side', zh: '板側' },
  hotSide: { en: 'Hot', zh: '熱側' },
  coldSide: { en: 'Cold', zh: '冷側' },
};

function hxSVG(L, hi, ho, ci, co) {
  const lab = (x, y, t, cls) => `<text x="${x}" y="${y}" class="hx-lab ${cls || ''}">${t}</text>`;
  const temp = (x, y, v) => (v == null || Number.isNaN(v) ? '' : `<text x="${x}" y="${y}" class="hx-temp">${v.toFixed(1)} °C</text>`);
  return `<svg viewBox="0 0 640 150" width="100%" xmlns="http://www.w3.org/2000/svg" role="img"
      aria-label="${L(I18N.hotSide)} / ${L(I18N.coldSide)}">
    <rect x="215" y="18" width="210" height="114" rx="10" class="hx-box"/>
    <line x1="215" y1="46" x2="425" y2="46" class="hx-plate"/>
    <line x1="215" y1="74" x2="425" y2="74" class="hx-plate"/>
    <line x1="215" y1="102" x2="425" y2="102" class="hx-plate"/>
    ${lab(320, 84, L(I18N.title), 'hx-title')}
    <!-- hot side -->
    <path d="M20 46 H215" class="hx-flow hx-hot"/>
    <path d="M425 46 H620" class="hx-flow hx-hot"/>
    <path d="M215 46 l-11 -6 v12 z" class="hx-hot"/>
    <path d="M620 46 l-11 -6 v12 z" class="hx-hot"/>
    ${lab(24, 34, L(I18N.hotIn) + ' →', 'hx-hot')}${temp(24, 68, hi)}
    ${lab(516, 34, '→ ' + L(I18N.hotOut), 'hx-hot')}${temp(516, 68, ho)}
    <!-- cold side (counter-flow) -->
    <path d="M20 102 H215" class="hx-flow hx-cold"/>
    <path d="M425 102 H620" class="hx-flow hx-cold"/>
    <path d="M215 102 l-11 -6 v12 z" class="hx-cold"/>
    <path d="M620 102 l-11 -6 v12 z" class="hx-cold"/>
    ${lab(24, 128, L(I18N.coldOut) + ' ←', 'hx-cold')}${temp(24, 92, co)}
    ${lab(516, 128, '← ' + L(I18N.coldIn), 'hx-cold')}${temp(516, 92, ci)}
  </svg>`;
}

function render(root, { L }) {
  const T = (k) => L(I18N[k]);
  root.append(card(T('title'), T('desc'), (body) => {
    const U_PRESETS = [
      { v: 5000, label: L({ en: 'Plate HX (workbook value)', zh: '板式（工作簿值）5000' }) },
      { v: 3000, label: L({ en: 'Plate water/water ≈3000', zh: '板式水／水 ≈3000' }) },
      { v: 1000, label: L({ en: 'Shell & tube ≈1000', zh: '管殼 ≈1000' }) },
      { v: 1500, label: L({ en: 'Steam/water ≈1500', zh: '蒸汽／水 ≈1500' }) },
      { v: 500, label: L({ en: 'Finned coil water/air ≈500', zh: '翅片盤管水／空氣 ≈500' }) },
    ];
    const st = { unit: 'kW' };
    const f = form([
      { key: 'q', label: T('q'), unit: 'kW', def: 100 },
      { key: 'hi', label: T('hotIn'), unit: '°C', def: 12.5 },
      { key: 'ho', label: T('hotOut'), unit: '°C', def: 7 },
      { key: 'ci', label: T('coldIn'), unit: '°C', def: 4 },
      { key: 'co', label: T('coldOut'), unit: '°C', def: 9 },
      { key: 'u', label: T('u'), unit: 'W/m²·K', def: 5000 },
    ], draw, 'grid3', 'hx-');
    const unitRow = h('div', { class: 'field' }, h('label', {}, T('unit')),
      seg([{ v: 'kW', label: T('kW') }, { v: 'RT', label: T('rt') }], st.unit, (v) => { st.unit = v; draw(); }));
    const uRow = h('div', { class: 'field' }, h('label', {}, L({ en: 'U presets', zh: 'U 值預設' })),
      seg(U_PRESETS, 5000, (v) => { f.set('u', v); draw(); }));
    const schBox = h('div', { class: 'hx-sch' });
    const box = h('div');
    body.append(f.grid, unitRow, uRow, schBox, box);

    function draw() {
      const s = f.all();
      const qkW = s.q == null ? null : (st.unit === 'kW' ? s.q : s.q * F.CONV.kW_PER_RT);
      if (qkW == null || qkW <= 0 || [s.hi, s.ho, s.ci, s.co, s.u].some((x) => x == null || x <= 0)) {
        results(box, []);
        schBox.innerHTML = hxSVG(L, s.hi, s.ho, s.ci, s.co);
        return;
      }
      const dTHot = Math.abs(s.hi - s.ho);
      const dTCold = Math.abs(s.ci - s.co);
      const dT1 = s.hi - s.co;   // hot-in end (workbook O6)
      const dT2 = s.ho - s.ci;   // hot-out end (workbook O7)
      schBox.innerHTML = hxSVG(L, s.hi, s.ho, s.ci, s.co);
      if (dT1 <= 0 || dT2 <= 0) {
        // Degenerate terminals (one side flat, or both sides equal): keep the same tiles the normal
        // path shows — marked as errors — instead of collapsing the card to two numbers.
        results(box, [
          res(T('dT1'), dT1, '°C', { digits: 1, err: true }),
          res(T('dT2'), dT2, '°C', { digits: 1, err: true }),
          res(T('lmtd'), NaN, '°C', { digits: 2, err: true }),
          res(T('a'), NaN, 'm²', { digits: 2, err: true }),
        ]);
        box.append(flag(T('bad'), 'bad'));
        return;
      }
      const equal = Math.abs(dT1 - dT2) < 1e-9;
      const Lm = F.lmtd(dT1, dT2);
      const A = qkW * 1000 / (s.u * Lm);              // m², workbook C27
      const mHot = dTHot > 0 ? qkW / 4.185 / dTHot : NaN;   // kg/s, workbook P32 (cp 4.185)
      const mCold = dTCold > 0 ? qkW / 4.185 / dTCold : NaN; // kg/s, workbook Q32
      const items = [
        res(T('dT1'), dT1, '°C', { digits: 2 }),
        res(T('dT2'), dT2, '°C', { digits: 2 }),
        res(equal ? T('meanT') : T('lmtd'), Lm, '°C', { digits: 2, big: true }),
        res(T('a'), A, 'm²', { digits: 2 }),
        res(T('qOther'), st.unit === 'kW' ? qkW / F.CONV.kW_PER_RT : qkW, st.unit === 'kW' ? 'RT' : 'kW', { digits: 2 }),
      ];
      if (Number.isFinite(mHot)) items.push(res(T('flowHot'), mHot, 'kg/s', { digits: 3 }));
      if (Number.isFinite(mCold)) items.push(res(T('flowCold'), mCold, 'kg/s', { digits: 3 }));
      if (Number.isFinite(mHot)) items.push(res(T('flowHot') + ' ×3.6', mHot * 3.6, 'm³/h', { digits: 2 }));
      if (Number.isFinite(mCold)) items.push(res(T('flowCold') + ' ×3.6', mCold * 3.6, 'm³/h', { digits: 2 }));
      if (dTHot > 0) items.push(res(T('dTHot'), dTHot, '°C', { digits: 2 }));
      if (dTCold > 0) items.push(res(T('dTCold'), dTCold, '°C', { digits: 2 }));
      results(box, items);
      box.append(flag(T('ok'), 'ok'));
      box.append(h('div', { class: 'note' },
        'Q = U·A·LMTD · m = Q/(cp·ΔT), cp = 4.185 kJ/kg·K (workbook P32/Q32) · A = Q·1000/(U·ΔT_lm) (workbook C27)'));
    }
    draw();
  }, {
    formula: 'LMTD = (ΔT1 − ΔT2)/ln(ΔT1/ΔT2);  ΔT1 = Th,i − Tc,o;  ΔT2 = Th,o − Tc,i;  A = Q/(U·LMTD);  m = Q/(cp·ΔT)',
    src: '24_Hx C5:C27, O6:O8, P32:Q33 · workbook label "A = U∆T / Q" is inverted (Q = U·A·ΔT)',
  }));

  root.append(card(T('uRef'), T('uRefNote'), (body) => {
    const rows = [
      { k: L({ en: 'Plate, water/water', zh: '板式 水／水' }), v: '3000 ~ 7000', s: 'workbook Hx (plate, HISAKA): 5000' },
      { k: L({ en: 'Shell & tube, water/water', zh: '管殼 水／水' }), v: '800 ~ 1500', s: 'typical range' },
      { k: L({ en: 'Steam / water', zh: '蒸汽／水' }), v: '1000 ~ 2000', s: 'typical range' },
      { k: L({ en: 'Finned coil, water/air', zh: '翅片盤管 水／空氣' }), v: '30 ~ 60 (per air-side area)', s: 'typical range' },
    ];
    const t = h('table', { class: 'pipes-table hx-u' });
    t.append(h('thead', {}, h('tr', {}, h('th', {}, T('sheet')), h('th', {}, 'U (W/m²·K)'), h('th', {}, 'note'))));
    const tb = h('tbody');
    for (const r of rows) tb.append(h('tr', {}, h('td', {}, r.k), h('td', { class: 'num' }, r.v), h('td', {}, r.s)));
    t.append(tb);
    body.append(h('div', { class: 'table-scroll' }, t));
    body.append(h('div', { class: 'note' }, T('vendorNote')));
  }, { src: '24_Hx B30:C35 (HISAKA plate type) · typical U ranges' }));
}

register({
  id: 'hx',
  icon: '🔀',
  group: 'equipment',
  title: I18N.title,
  desc: I18N.desc,
  src: '24_Hx · LMTD & Q = U·A·LMTD',
  render,
});
