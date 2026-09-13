// Module: Split AC (SAC) — real HK data from the catalogue library
import { register } from '../registry.js';
import { h, res, flag, card, form, results } from '../ui.js';
import { CONV } from '../engine/fluids.js';
import { MITSUBISHI_SINGLE, MITSUBISHI_MULTI, FUJITSU_AOHG18 } from '../data/hk_catalogs.js';

const I18N = {
  title: { en: 'Split AC (SAC)', zh: '分體空調（SAC）' },
  desc: { en: 'Capacity conversions plus real HK catalogue data (Mitsubishi Electric MSZ-GE / MXZ multi-split, Fujitsu General AOHG18LAC2).', zh: '冷量換算，加上香港實型錄數據（三菱電機 MSZ-GE／MXZ 多聯、富士通 AOHG18LAC2）。' },
  cap: { en: 'Capacity', zh: '冷量' },
};

function render(root, { L }) {
  const T = (k) => L(I18N[k]);
  root.append(card(T('title'), T('desc'), (body) => {
    const f = form([{ key: 'kw', label: T('cap'), unit: 'kW', def: 12 }], (st) => {
      const box = body.querySelector('#sac');
      if (box && st.kw != null && st.kw > 0) {
        results(box, [
          res('RT', st.kw / 3.516, 'RT', { digits: 2 }),
          res(L({ en: 'HP (匹, ×2.6 kW)', zh: '匹（×2.6 kW）' }), st.kw / 2.6, 'HP', { digits: 2 }),
          res('Btu/h', st.kw * 3412, 'Btu/h', { digits: 0 }),
          res('kcal/h', st.kw * 860, 'kcal/h', { digits: 0 }),
        ]);
      }
    }, 'grid1');
    const box = h('div', { id: 'sac' });
    body.append(f.grid, box);
    results(box, [
      res('RT', 12 / 3.516, 'RT', { digits: 2 }),
      res(L({ en: 'HP (匹, ×2.6 kW)', zh: '匹（×2.6 kW）' }), 12 / 2.6, 'HP', { digits: 2 }),
      res('Btu/h', 12 * 3412, 'Btu/h', { digits: 0 }),
      res('kcal/h', 12 * 860, 'kcal/h', { digits: 0 }),
    ]);
    body.append(h('div', { class: 'note' },
      L({ en: 'Workbook conversions: 1 kW = 860 kcal/h = 3412 Btu/h; 1 RT = 3.516 kW; HP(匹) ≈ 2.6 kW (mainland convention), not SI 0.735 kW.', zh: '原檔換算：1 kW＝860 kcal/h＝3412 Btu/h；1 RT＝3.516 kW；「匹」≈2.6 kW（內地慣例），非 SI 0.735 kW。' })));
  }, { src: 'SAC sheet (workbook) — unit conversion' }));

  // ---- Single-split spec sheet (workbook G2:R33 layout) ----
  // The workbook ships this block as an empty template (every value cell is '-'), so it is built here as
  // an editable record with the sheet's own field list, plus a prefill from the HK catalogue rows.
  const spec = {
    type: 'Wall-mounted', hp: 2, brand: 'Mitsubishi Electric', speed: 'Variable',
    refrigerant: 'R32', inModel: 'MSZ-GE50VA', cool2450: 5.0, cool2750: 5.0, heat2750: 6.0,
    inH: 290, inW: 1050, inD: 250, outModel: 'MUZ-GE50VA', outH: 714, outW: 800, outD: 285, spl: 46,
  };
  const specBox = h('div');
  root.append(card(L({ en: 'Single-split unit record (workbook layout)', zh: '分體機規格紀錄（原檔版面）' }),
    L({ en: 'The workbook’s G:R block is an empty template; this is the same field list as an editable record with the capacity conversions it implies.', zh: '原檔 G:R 區塊係空白模板；此處用同一組欄位做成可編輯紀錄，並顯示其對應換算。' }),
    (body) => {
      const f = form([
        // The text fields must declare type:'text'; as number inputs the browser rejects their default
        // strings and the boxes come up empty.
        { key: 'type', label: L({ en: 'Type', zh: '型式' }), type: 'text', def: spec.type },
        { key: 'hp', label: L({ en: 'Capacity', zh: '匹數' }), unit: 'HP', def: spec.hp, step: '0.5' },
        { key: 'brand', label: L({ en: 'Brand', zh: '廠牌' }), type: 'text', def: spec.brand },
        { key: 'speed', label: L({ en: 'Speed', zh: '調速' }), type: 'text', def: spec.speed },
        { key: 'refrigerant', label: L({ en: 'Refrigerant', zh: '冷媒' }), type: 'text', def: spec.refrigerant },
        { key: 'inModel', label: L({ en: 'Indoor unit model', zh: '室內機型號' }), type: 'text', def: spec.inModel },
        { key: 'cool2450', label: L({ en: 'Cooling @ 24 °C/50 %', zh: '冷卻 @ 24 °C/50%' }), unit: 'kW', def: spec.cool2450 },
        { key: 'cool2750', label: L({ en: 'Cooling @ 27 °C/50 %', zh: '冷卻 @ 27 °C/50%' }), unit: 'kW', def: spec.cool2750 },
        { key: 'heat2750', label: L({ en: 'Heating @ 27 °C/50 %', zh: '加熱 @ 27 °C/50%' }), unit: 'kW', def: spec.heat2750 },
        { key: 'inH', label: L({ en: 'Indoor H', zh: '室內機 高' }), unit: 'mm', def: spec.inH },
        { key: 'inW', label: L({ en: 'Indoor W', zh: '室內機 闊' }), unit: 'mm', def: spec.inW },
        { key: 'inD', label: L({ en: 'Indoor D', zh: '室內機 深' }), unit: 'mm', def: spec.inD },
        { key: 'outModel', label: L({ en: 'Outdoor unit model', zh: '室外機型號' }), type: 'text', def: spec.outModel },
        { key: 'outH', label: L({ en: 'Outdoor H', zh: '室外機 高' }), unit: 'mm', def: spec.outH },
        { key: 'outW', label: L({ en: 'Outdoor W', zh: '室外機 闊' }), unit: 'mm', def: spec.outW },
        { key: 'outD', label: L({ en: 'Outdoor D', zh: '室外機 深' }), unit: 'mm', def: spec.outD },
        { key: 'spl', label: L({ en: 'SPL', zh: '聲壓級' }), unit: 'dB(A)', def: spec.spl },
      ], (a) => { Object.assign(spec, a); drawSpec(); }, 'grid4', 'spec-');
      body.append(f.grid, specBox);
      function drawSpec() {
        const kw = spec.cool2750;
        if (!(kw > 0)) { results(specBox, []); return; }
        const ratio = spec.cool2450 > 0 ? spec.cool2750 / spec.cool2450 : NaN;
        results(specBox, [
          res(L({ en: 'Rated cooling', zh: '額定冷量' }), kw, 'kW', { digits: 2, big: true }),
          res('RT', kw / CONV.kW_PER_RT, 'RT', { digits: 2 }),
          res('Btu/h', kw * CONV.BTUH_PER_KW, 'Btu/h', { digits: 0 }),
          res('kcal/h', kw * CONV.KCAL_PER_KW, 'kcal/h', { digits: 0 }),
          res(L({ en: 'HP by the 2.6 kW 匹 convention', zh: '按 2.6 kW／匹' }), kw / 2.6, 'HP', { digits: 2 }),
          res(L({ en: '27 °C / 24 °C capacity ratio', zh: '27 °C 與 24 °C 冷量比' }), ratio, '—', { digits: 3 }),
          res(L({ en: 'Indoor W × D × H', zh: '室內機 闊×深×高' }), spec.inW + ' × ' + spec.inD + ' × ' + spec.inH, 'mm'),
          res(L({ en: 'Outdoor W × D × H', zh: '室外機 闊×深×高' }), spec.outW + ' × ' + spec.outD + ' × ' + spec.outH, 'mm'),
        ]);
        if (ratio > 1.05) specBox.append(flag(L({ en: 'The 27 °C/50 % rating exceeds the 24 °C/50 % one — check the catalogue columns.', zh: '27 °C/50% 冷量高於 24 °C/50% —— 請核對目錄欄位。' }), 'warn'));
      }
      drawSpec();
      const picker = form([{
        key: 'model', label: L({ en: 'Prefill from the HK catalogue', zh: '由香港型錄帶入' }), def: MITSUBISHI_SINGLE[1].model,
        type: 'select', options: MITSUBISHI_SINGLE.map((m) => ({ v: m.model, label: m.hp + ' — ' + m.model + ' (' + m.kw + ' kW)' })),
      }], (a) => {
        const m = MITSUBISHI_SINGLE.find((x) => x.model === a.model);
        if (!m) return;
        f.set('inModel', m.model.split(' / ')[0]);
        f.set('outModel', m.model.split(' / ')[1] || '');
        f.set('hp', parseFloat(m.hp));
        f.set('cool2750', m.kw);
        f.set('cool2450', m.kw);
      }, 'grid2', 'pref-');
      body.append(h('div', { class: 'note' }, L({ en: 'Catalogue rows carry the model, capacity and COP only — dimensions, SPL and the 24 °C rating are not in the source, so they stay as entered.', zh: '型錄只有型號、冷量與 COP —— 尺寸、SPL 與 24 °C 冷量原檔沒有，故保留你輸入的值。' })),
        picker.grid);
    }, { src: 'SAC!G2:R33 (field list) · data/hk_catalogs.js (prefill)' }));

  // ---- Mitsubishi Electric (single + multi) ----
  root.append(card('Mitsubishi Electric — MSZ-GE / MXZ', '', (body) => {
    const tab = (rows, headers, cells) => {
      const tbl = h('table', { class: 'pipes-table' });
      tbl.append(h('tr', {}, ...headers.map((x) => h('th', {}, x))));
      for (const r of rows) tbl.append(h('tr', {}, ...cells(r)));
      return tbl;
    };
    body.append(h('div', { class: 'note' }, L({ en: 'Single split (1.5–3 HP)', zh: '單聯（1.5–3HP）' })));
    body.append(tab(MITSUBISHI_SINGLE, ['HP', 'kW', 'COP', 'Model'], (r) => [r.hp, String(r.kw), String(r.cop), r.model]));
    body.append(h('div', { class: 'note' }, L({ en: 'Multi split (derating: pipe 0.97 @15 m, temp 0.94)', zh: '多聯（衰減：管路 0.97@15m、溫差 0.94）' })));
    body.append(tab(MITSUBISHI_MULTI, ['Config', 'kW', 'COP', 'Model'], (r) => [r.config, String(r.kw), String(r.cop), r.model]));
    body.append(h('div', { class: 'note' },
      L({ en: 'Source: capacity info.xlsx — G:\\我的雲端硬碟\\catalogue\\Mitsubishi', zh: '來源：capacity info.xlsx — G:\\我的雲端硬碟\\catalogue\\Mitsubishi' })));
  }));

  // ---- Fujitsu AOHG18LAC2 ----
  root.append(card('Fujitsu General — AOHG18LAC2 Multi Split', '', (body) => {
    const tbl = h('table', { class: 'pipes-table' });
    tbl.append(h('tr', {}, h('th', {}, 'Indoor'), h('th', {}, 'kW'), h('th', {}, 'Input kW'), h('th', {}, 'EER'), h('th', {}, 'SEER'), h('th', {}, 'Class')));
    for (const r of FUJITSU_AOHG18) tbl.append(h('tr', {}, h('td', {}, r.combi), h('td', {}, r.tot.toFixed(2)), h('td', {}, r.input.toFixed(2)), h('td', {}, r.eer.toFixed(2)), h('td', {}, String(r.seer)), h('td', {}, r.cls)));
    body.append(tbl);
    body.append(h('div', { class: 'note' },
      L({ en: '2-room combos (cooling min–max 1.7–5.8 kW); source: Cooling Capacity Table — G:\\我的雲端硬碟\\catalogue\\GENERAL', zh: '兩室組合（冷量範圍 1.7–5.8 kW）；來源：AOHG18LAC2 Cooling Capacity Table — G:\\我的雲端硬碟\\catalogue\\GENERAL' })));
  }));
}

register({ id: 'sac', icon: '🛋️', group: 'equipment', title: I18N.title, desc: I18N.desc, src: 'HK catalogues: Mitsubishi · Fujitsu · Carrier', render });
