// Module: Split AC (SAC) — real HK data from the catalogue library
import { register } from '../registry.js';
import { h, res, card, form, results } from '../ui.js';
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
