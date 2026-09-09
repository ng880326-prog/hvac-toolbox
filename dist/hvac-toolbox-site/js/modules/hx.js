// Module: Heat Exchanger (換熱器) — from 'Hx' sheet
import { register } from '../registry.js';
import { h, res, flag, card, form, results, seg } from '../ui.js';
import { lmtd } from '../engine/fluids.js';

const I18N = {
  title: { en: 'Heat Exchanger', zh: '換熱器計算' },
  desc: { en: 'LMTD, Q = U·A·LMTD and temperature-cross check.', zh: '對數平均溫差 LMTD、Q＝U·A·LMTD、溫度交叉檢核。' },
  mode: { en: 'Calc mode', zh: '計算模式' },
  mArea: { en: 'Find area A', zh: '求面積 A' },
  mQ: { en: 'Find duty Q', zh: '求換熱量 Q' },
  q: { en: 'Heat duty Q', zh: '換熱量 Q' },
  u: { en: 'Overall U', zh: '總傳熱係數 U' },
  a: { en: 'Area A', zh: '面積 A' },
  hotIn: { en: 'Hot in', zh: '熱側進' },
  hotOut: { en: 'Hot out', zh: '熱側出' },
  coldIn: { en: 'Cold in', zh: '冷側進' },
  coldOut: { en: 'Cold out', zh: '冷側出' },
  dT1: { en: 'ΔT at hot-in end', zh: '熱進端溫差 ΔT1' },
  dT2: { en: 'ΔT at hot-out end', zh: '熱出端溫差 ΔT2' },
  lmtd: { en: 'LMTD', zh: '對數平均溫差' },
  cross: { en: 'Temperature cross', zh: '溫度交叉' },
  ok: { en: 'No temperature cross ✔', zh: '無溫度交叉 ✔' },
  bad: { en: 'Temperature cross — inappropriate temperatures!', zh: '出現溫度交叉 — 溫度設定不當！' },
};

function render(root, { L }) {
  const T = (k) => L(I18N[k]);
  root.append(card(T('title'), T('desc'), (body) => {
    const U_PRESETS = [
      { v: 3000, label: L({ en: 'Plate (water/water)', zh: '板式（水/水）≈3000' }) },
      { v: 1000, label: L({ en: 'Shell & tube (water/water)', zh: '管殼（水/水）≈1000' }) },
      { v: 1500, label: L({ en: 'Steam/water', zh: '蒸汽／水 ≈1500' }) },
      { v: 500, label: L({ en: 'Finned coil (water/air)', zh: '翅片盤管（水/空氣）≈500' }) },
    ];
    const f = form([
      { key: 'hi', label: T('hotIn'), unit: '°C', def: 90 },
      { key: 'ho', label: T('hotOut'), unit: '°C', def: 70 },
      { key: 'ci', label: T('coldIn'), unit: '°C', def: 30 },
      { key: 'co', label: T('coldOut'), unit: '°C', def: 50 },
      { key: 'q', label: T('q'), unit: 'kW', def: 100 },
      { key: 'u', label: T('u'), unit: 'W/m²·K', def: 800 },
      { key: 'a', label: T('a'), unit: 'm²', def: '' },
    ], draw, 'grid3');
    const uRow = h('div', { class: 'field' }, h('label', {}, L({ en: 'U presets', zh: 'U 值預設' })),
      seg(U_PRESETS, 800, (v) => { f.set('u', v); }));
    const box = h('div');
    body.append(f.grid, uRow, box);
    function draw(st) {
      if ([st.hi, st.ho, st.ci, st.co, st.q, st.u].some((x) => x == null || x <= 0)) { results(box, []); return; }
      const dT1 = st.hi - st.co;   // hot-in end
      const dT2 = st.ho - st.ci;   // hot-out end
      const cross = dT1 < 0 || dT2 < 0;
      if (cross) {
        results(box, [
          res(T('dT1'), dT1, '°C', { digits: 1, err: true }),
          res(T('dT2'), dT2, '°C', { digits: 1, err: true }),
        ]);
        box.append(flag(T('bad'), 'bad'));
        return;
      }
      const L = lmtd(dT1, dT2);
      const A = st.q * 1000 / (st.u * L); // m²
      results(box, [
        res(T('dT1'), dT1, '°C', { digits: 1 }),
        res(T('dT2'), dT2, '°C', { digits: 1 }),
        res(T('lmtd'), L, '°C', { digits: 2, big: true }),
        res(T('a'), A, 'm²', { digits: 2 }),
        res(T('q'), st.u * L * (st.a || A) / 1000, 'kW', { digits: 1 }),
      ]);
      box.append(flag(T('ok'), 'ok'));
    }
    draw(f.all());
  }, {
    formula: 'LMTD = (ΔT1 − ΔT2) / ln(ΔT1/ΔT2);  ΔT1 = Th,i − Tc,o;  ΔT2 = Th,o − Tc,i;  Q = U·A·LMTD',
    src: 'Standard heat exchanger relations (workbook ' + 'Hx' + ' sheet matches)',
  }));
}

register({ id: 'hx', icon: '🔀', group: 'equipment', title: I18N.title, desc: I18N.desc, src: 'Standard HX relations', render });
