// Module: PN Grade / Pressure (系統壓力等級) — from 'PN' sheet
import { register } from '../registry.js';
import { h, res, flag, card, form, results } from '../ui.js';

const I18N = {
  title: { en: 'System Pressure Grade (PN)', zh: '系統壓力等級（PN）' },
  desc: { en: 'Static pressure from chiller/riser heights; select the least PN grade and convert m H₂O ↔ bar ↔ kPa ↔ MPa (workbook constants noted).', zh: '由冷機/立管高度求靜壓；按最小壓力等級選 PN 並換算 m 水柱↔bar↔kPa↔MPa（保留原檔常數）。' },
  hc: { en: 'Chiller / Hx height', zh: '冷機／換熱器高度' },
  hp: { en: 'Pump height (AFFL)', zh: '泵安裝高度（AFFL）' },
  ht: { en: 'Top terminal height', zh: '最高末端高度' },
  stat: { en: 'Static head', zh: '靜水柱' },
  preq: { en: 'Min. required PN grade', zh: '最小所需壓力等級' },
  inBar: { en: 'Pressure (bar)', zh: '壓力（bar）' },
  inKPa: { en: 'Pressure (kPa)', zh: '壓力（kPa）' },
  inMPa: { en: 'Pressure (MPa)', zh: '壓力（MPa）' },
  ok: { en: 'PN grade adequate (typical grades PN4/6/10/16/25)', zh: '壓力等級適用（典型 PN4/6/10/16/25）' },
  warn: { en: 'Very high static head — consider pressure break.', zh: '靜壓很高 — 建議考慮壓力隔斷。' },
  note: { en: 'Workbook conversion 1 m H₂O = 0.0980414 bar (≈ 0.0980665 standard, −0.026%). App shows both below.', zh: '原檔 1 m 水柱＝0.0980414 bar（標準 0.0980665，差 −0.026%）。下方同時顯示。' },
};

const GRADES = [4, 6, 10, 16, 25];

function render(root, { L }) {
  const T = (k) => L(I18N[k]);
  root.append(card(T('title'), T('desc'), (body) => {
    const f = form([
      { key: 'hc', label: T('hc'), unit: 'm', def: 8 },
      { key: 'hp', label: T('hp'), unit: 'm', def: 3 },
      { key: 'ht', label: T('ht'), unit: 'm', def: 40 },
    ], (st) => draw(st), 'grid3');
    const box = h('div');
    body.append(f.grid, box);
    function draw(st) {
      if ([st.hc, st.hp, st.ht].some((x) => x == null)) { results(box, []); return; }
      const head = st.ht + st.hc; // static head above pump/chiller base (m)
      const bar = head * 0.0980665;
      const grade = GRADES.find((g) => g >= bar + 0.5) || 25;
      const high = head > 55;
      results(box, [
        res(T('stat'), head, 'm H₂O', { digits: 1, big: true }),
        res(T('preq'), 'PN' + grade, '', { digits: 0 }),
        res(T('inBar'), bar, 'bar', { digits: 2 }),
        res(T('inBar'), head * 0.0980414, 'bar (原檔)', { digits: 2 }),
        res(T('inKPa'), bar * 100, 'kPa', { digits: 1 }),
        res(T('inMPa'), bar / 10, 'MPa', { digits: 3 }),
      ]);
      box.append(flag(high ? T('warn') : T('ok'), high ? 'bad' : 'ok'));
      box.append(h('div', { class: 'note' }, T('note')));
    }
    draw(f.all());
  }, { src: 'PN sheet (workbook); pressure conversion 1 mH₂O = 0.0980665 bar' }));
}

register({ id: 'pn', icon: '🧱', group: 'water', title: I18N.title, desc: I18N.desc, src: 'PN sheet (workbook)', render });
