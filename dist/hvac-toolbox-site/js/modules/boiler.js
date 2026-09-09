// Module: Boiler (鍋爐) — from 'Boiler' sheet
import { register } from '../registry.js';
import { h, res, card, form, results, seg } from '../ui.js';
import { CONV } from '../engine/fluids.js';
import { tdpFromPw } from '../engine/psychro.js';

const I18N = {
  title: { en: 'Boiler', zh: '鍋爐計算' },
  desc: { en: 'Boiler capacity conversions and steam generation rate. Two steam conventions offered (see audit: the workbook “668” is a ton/hr rule, not hfg).', zh: '鍋爐容量換算與產汽量。提供兩種產汽換算（檢驗發現：原檔「668」是 ton/hr 經驗值，並非汽化熱）。' },
  cap: { en: 'Boiler capacity', zh: '鍋爐容量' },
  eff: { en: 'Assumed boiler efficiency', zh: '假設鍋爐效率' },
  conv: { en: 'Steam convention', zh: '產汽換算方式' },
  convAtm: { en: '100 °C feed, 1 atm (hfg = 2257 kJ/kg)', zh: '100°C 進水、1 atm（hfg＝2257 kJ/kg）' },
  convWb: { en: 'Workbook rule (1 ton/h ≈ 668 kW @10 barg)', zh: '原檔經驗值（1 ton/h ≈ 668 kW @10 barg）' },
  steam: { en: 'Steam output', zh: '產汽量' },
  out: { en: 'Useful output', zh: '有效輸出' },
  note: { en: 'The workbook labelled kW×860 as “Mcal/hr” (1000× off — it is kcal/h) and used 668 kW per ton/h, which is sensitive to feed-water temperature (±16%).', zh: '原檔把 kW×860 標成「Mcal/hr」（實為 kcal/h，差 1000 倍），並以 668 kW/ton·h 換算（對給水溫度敏感 ±16%）。' },
};

function render(root, { L }) {
  const T = (k) => L(I18N[k]);
  let conv = 'atm';
  root.append(card(T('title'), T('desc'), (body) => {
    const convRow = h('div', { class: 'field' }, h('label', {}, T('conv')),
      seg([{ v: 'atm', label: T('convAtm') }, { v: 'wb', label: T('convWb') }], conv,
        (v) => { conv = v; draw(f.all()); }));
    const f = form([
      { key: 'cap', label: T('cap'), unit: 'kW', def: 1000 },
      { key: 'eff', label: T('eff'), unit: '—', def: 0.9 },
    ], (st) => draw(st), 'grid2');
    const box = h('div');
    body.append(convRow, f.grid, box);
    function draw(st) {
      if ([st.cap, st.eff].some((x) => x == null || x <= 0)) { results(box, []); return; }
      const useful = st.cap * st.eff;
      const steam = conv === 'atm' ? useful * 3600 / 2257 : useful * 1000 / 668;
      results(box, [
        res(T('cap'), st.cap * CONV.KCAL_PER_KW, 'kcal/h', { digits: 0 }),
        res(T('cap'), st.cap * CONV.BTUH_PER_KW, 'Btu/h', { digits: 0 }),
        res(T('out'), useful, 'kW', { digits: 1 }),
        res(T('steam'), steam, 'kg/h', { digits: 0, big: true }),
      ]);
      box.append(h('div', { class: 'note' }, T('note')));
    }
    draw(f.all());
  }, { src: 'IAPWS IF-97 hfg(100 °C) = 2257 kJ/kg; workbook ton/hr rule 668 kW' }));

  // ---- Steam pressure → saturation / hfg + expansion tank ----
  root.append(card(L({ en: 'Steam & Expansion Tank (at pressure)', zh: '蒸汽壓力與膨脹水箱（按壓力）' }), '', (body) => {
    const f = form([
      { key: 'p', label: L({ en: 'Steam pressure', zh: '蒸汽壓力' }), unit: 'bar', def: 5 },
      { key: 'kw', label: L({ en: 'Boiler useful output', zh: '鍋爐有效輸出' }), unit: 'kW', def: 900 },
      { key: 'vol', label: L({ en: 'System water volume', zh: '系統水容量' }), unit: 'm³', def: 5 },
    ], (st) => draw(st), 'grid3');
    const box = h('div');
    body.append(f.grid, box);
    function draw(st) {
      if ([st.p, st.kw, st.vol].some((x) => x == null || x <= 0)) { results(box, []); return; }
      const tsat = tdpFromPw(st.p * 100);  // pws inverse (Hyland–Wexler)
      // Watson correlation for hfg (kPa-consistent at 100 °C point)
      const hfg = 2257 * Math.pow((1 - tsat / 374.15) / (1 - 100 / 374.15), 0.38);
      const steam = st.kw * 3600 / hfg;
      const tank = st.vol * 0.04 * 1000; // ~4% of system volume → litres
      results(box, [
        res(L({ en: 'Saturation temp', zh: '飽和溫度' }), tsat, '°C', { digits: 1 }),
        res(L({ en: 'hfg (Watson approx)', zh: '汽化熱 hfg（Watson 近似）' }), hfg, 'kJ/kg', { digits: 0 }),
        res(L({ en: 'Steam output', zh: '產汽量' }), steam, 'kg/h', { digits: 0, big: true }),
        res(L({ en: 'Expansion tank (≈4% V)', zh: '膨脹水箱（≈4% 系統容積）' }), tank, 'L', { digits: 0 }),
      ]);
      box.append(h('div', { class: 'note' },
        L({ en: 'Watson hfg ≈ ±2% of IAPWS for 1–10 bar. Expansion tank 4% is a rule-of-thumb — size per ASME/CIBSE with system expansion calculation.', zh: 'Watson 公式在 1–10 bar 與 IAPWS 偏差約 ±2%。膨脹水箱 4% 為經驗值 — 請按 ASME／CIBSE 以系統膨脹量計算。' })));
    }
    draw(f.all());
  }, { formula: 'Tsat = pws⁻¹(p);  hfg = 2257·((1−Tsat/374.15)/(1−100/374.15))^0.38;  steam = kW·3600/hfg', src: 'IAPWS IF-97 · Watson correlation' }));
}

register({ id: 'boiler', icon: '🔥', group: 'equipment', title: I18N.title, desc: I18N.desc, src: 'Steam tables · workbook rule', render });
