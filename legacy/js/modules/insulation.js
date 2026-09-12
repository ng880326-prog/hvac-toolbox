// Module: Insulation (保溫) — from 'Insulations' sheet
import { register } from '../registry.js';
import { h, res, flag, card, form, results, parseNum, seg } from '../ui.js';
import * as F from '../engine/fluids.js';

const I18N = {
  title: { en: 'Pipe Insulation', zh: '管道保溫計算' },
  desc: { en: 'Equivalent thickness (round→flat), condensation check and minimum anti-condensation thickness.', zh: '等效厚度（圓管→平板）、結露檢核與防結露最小厚度。' },
  d: { en: 'Pipe outside diameter d', zh: '管外徑 d' },
  t: { en: 'Insulation thickness t', zh: '保溫層厚度 t' },
  eq: { en: 'Equivalent thickness de', zh: '等效厚度 de' },
  lambda: { en: 'Thermal conductivity λ', zh: '導熱係數 λ' },
  alpha: { en: 'Surface coefficient α', zh: '表面換熱係數 α' },
  ta: { en: 'Ambient temperature Ta', zh: '環境溫度 Ta' },
  tdp: { en: 'Dew point of ambient Td', zh: '環境露點 Td' },
  ts: { en: 'Fluid temperature Ts', zh: '介質溫度 Ts' },
  tMin: { en: 'Min. anti-condensation thickness', zh: '防結露最小厚度' },
  check: { en: 'Condensation check', zh: '結露檢核' },
  ok: { en: 'Surface above dew point — no condensation ✔', zh: '表面高於露點 — 不結露 ✔' },
  bad: { en: 'Condensation will occur — increase thickness.', zh: '會結露 — 請加厚保溫。' },
};

function render(root, { L }) {
  const T = (k) => L(I18N[k]);
  root.append(card(T('title'), T('desc'), (body) => {
    const MATS = [
      { v: 0.024, label: L({ en: 'PU foam', zh: '聚氨酯泡沫 ≈0.024' }) },
      { v: 0.03, label: L({ en: 'XPS', zh: '擠塑聚苯板 ≈0.030' }) },
      { v: 0.038, label: L({ en: 'Glass fibre', zh: '玻璃棉 ≈0.038' }) },
      { v: 0.04, label: L({ en: 'Rubber foam', zh: '橡塑 ≈0.040' }) },
      { v: 0.044, label: L({ en: 'Rock wool', zh: '岩棉 ≈0.044' }) },
      { v: 0.034, label: L({ en: 'K-Flex EC (K-flex)', zh: 'K-Flex EC（K-flex）≈0.034' }) },
      { v: 0.022, label: L({ en: 'Kooltherm K8 (phenolic)', zh: 'Kooltherm K8（酚醛）≈0.022' }) },
    ];
    const f = form([
      { key: 'd', label: T('d'), unit: 'mm', def: 100 },
      { key: 't', label: T('t'), unit: 'mm', def: 50 },
      { key: 'lambda', label: T('lambda'), unit: 'W/m·K', def: 0.04 },
      { key: 'alpha', label: T('alpha'), unit: 'W/m²·K', def: 8.14 },
      { key: 'ta', label: T('ta'), unit: '°C', def: 28.8 },
      { key: 'tdp', label: T('tdp'), unit: '°C', def: 27 },
      { key: 'ts', label: T('ts'), unit: '°C', def: 7 },
    ], draw, 'grid3');
    const matRow = h('div', { class: 'field' }, h('label', {}, L({ en: 'Material preset', zh: '材料預設' })),
      seg(MATS, 0.04, (v) => { f.set('lambda', v); }));
    const alphaRow = h('div', { class: 'field' }, h('label', {}, L({ en: 'α preset', zh: 'α 預設' })),
      seg([{ v: 8.14, label: L({ en: 'Indoor pipe', zh: '室內管道 ≈8.14' }) }, { v: 23, label: L({ en: 'Outdoor', zh: '室外 ≈23' }) }], 8.14, (v) => { f.set('alpha', v); }));
    const box = h('div');
    body.append(f.grid, matRow, alphaRow, box);
    function draw(st) {
      if ([st.d, st.t, st.lambda, st.alpha, st.ta, st.tdp, st.ts].some((x) => x == null || x <= 0)) { results(box, []); return; }
      const de = F.equivalentThickness(st.d / 1000, st.t / 1000) * 1000; // mm
      const tMin = F.antiCondensationThickness(st.lambda, st.alpha, st.ta, st.tdp, st.ts) * 1000; // mm
      const rSurf = 1 / st.alpha;
      const rIns = (de / 1000) / st.lambda;
      const surfT = st.ta - (st.ta - st.ts) * rSurf / (rSurf + rIns);
      const ok = st.t >= tMin - 1e-9;
      results(box, [
        res(T('eq'), de, 'mm', { digits: 1 }),
        res(T('tMin'), tMin, 'mm', { digits: 1, big: true }),
        res(T('check'), surfT, '°C', { digits: 2 }),
      ]);
      box.append(flag(ok ? T('ok') : T('bad'), ok ? 'ok' : 'bad'));
    }
    draw(f.all());
  }, {
    formula: 'de = 0.5·(d+2t)·ln(1+2t/d);  δ_min = (λ/α)·(Td−Ts)/(Ta−Td)',
    src: 'ISO 12241 / GB 50264-2013 (workbook ' + 'Insulations' + ' sheet matches)',
  }));
}

register({ id: 'insulation', icon: '🧊', group: 'water', title: I18N.title, desc: I18N.desc, src: 'ISO 12241 · GB 50264', render });
