// Module: Fan Coil Unit (風機盤管) — from 'FCU' sheet
import { register } from '../registry.js';
import { h, res, flag, card, form, results, seg } from '../ui.js';
import * as F from '../engine/fluids.js';
import { STEEL_PIPES } from '../data/pipes.js';
import { CARRIER_42CN } from '../data/hk_catalogs.js';

const I18N = {
  title: { en: 'Fan Coil Unit (FCU)', zh: '風機盤管（FCU）' },
  desc: { en: 'Model/speed selection from the workbook catalog; coil loads, chilled & hot water flows, dimensions, duct sizes and quick pipe sizing.', zh: '按原檔型錄選型（型號/風速）；盤管負荷、冷熱水量、尺寸、風管尺寸與水管速算。' },
};

const SPEED_F = { High: 1.0, Mid: 0.85, Low: 0.65 };
const MODELS = [
  { id: '4', cfm: 400, sens: 1.70, tot: 2.31, heat: 4.63, dim: [983, 543, 248], duct: ['600x150', '600x300'] },
  { id: '6', cfm: 600, sens: 2.61, tot: 3.59, heat: 7.39, dim: [1153, 543, 248], duct: ['800x150', '800x300'] },
  { id: '8', cfm: 800, sens: 3.86, tot: 5.07, heat: 10.71, dim: [1433, 543, 248], duct: ['1000x150', '1000x300'] },
  { id: '10', cfm: 1000, sens: 4.76, tot: 6.38, heat: 13.42, dim: [1683, 543, 248], duct: ['1200x150', '1200x300'] },
  { id: '12', cfm: 1200, sens: 6.05, tot: 7.96, heat: 16.88, dim: [1853, 543, 248], duct: ['1400x150', '1400x300'] },
  { id: '14', cfm: 1400, sens: 6.50, tot: 8.58, heat: 18.94, dim: [1983, 543, 248], duct: ['1600x150', '1600x300'] },
];

function render(root, { L }) {
  const T = (k) => L(I18N[k]);
  let speed = 'Mid';
  root.append(card(T('title'), T('desc'), (body) => {
    const speedRow = h('div', { class: 'field' }, h('label', {}, L({ en: 'Fan speed', zh: '風速' })),
      seg(Object.keys(SPEED_F).map((s) => ({ v: s, label: L({ en: s, zh: s === 'High' ? '高' : s === 'Mid' ? '中' : '低' }) })), speed, (v) => { speed = v; draw(); }));
    const wrap = h('div', { id: 'fcu' });
    const selBox = h('div', { id: 'fcuSel' });
    body.append(speedRow, wrap, selBox);
    function draw() {
      wrap.innerHTML = '';
      const f = form([{ key: 'm', label: L({ en: 'Model', zh: '型號' }), def: '4', type: 'select', options: MODELS.map((m) => ({ v: m.id, label: m.id + ' — ' + m.cfm + ' CFM' })) }], () => drawSel(), 'grid2');
      wrap.append(f.grid);
      drawSel();
    }
    function drawSel() {
      const sel = wrap.querySelector('#f-m');
      const m = MODELS.find((x) => x.id === (sel ? sel.value : '4')) || MODELS[0];
      const k = SPEED_F[speed];
      const tot = m.tot * k, sens = m.sens * k, heat = m.heat * k;
      results(selBox, [
        res(L({ en: 'Air flow', zh: '風量' }), (m.cfm * k).toFixed(0), 'CFM · ' + (m.cfm * 0.472 * k).toFixed(0) + ' L/s', { digits: 0 }),
        res(L({ en: 'Sensible coil', zh: '顯熱盤管' }), sens, 'kW', { digits: 2 }),
        res(L({ en: 'Total coil', zh: '全熱盤管' }), tot, 'kW', { digits: 2, big: true }),
        res(L({ en: 'Heating coil', zh: '加熱盤管' }), heat, 'kW', { digits: 2 }),
        res(L({ en: 'CHW flow', zh: '冷水量' }), tot / (4.2 * 5), 'L/s (ΔT 5)', { digits: 3 }),
        res(L({ en: 'HWS flow', zh: '熱水量' }), heat / (4.2 * 10), 'L/s (ΔT 10)', { digits: 3 }),
        res(L({ en: 'Dimensions', zh: '尺寸' }), m.dim.join(' × '), 'mm', { digits: 0 }),
        res(L({ en: 'Ducts SA / RA', zh: '風管 SA／RA' }), m.duct[0] + ' / ' + m.duct[1], '', { digits: 0 }),
      ]);
    }
    draw();
    body.append(h('div', { class: 'note' },
      L({ en: 'Speed multipliers are model-specific in the workbook; approximate High 1.00 / Mid 0.85 / Low 0.65 shown — verify with factory data.', zh: '風速折減因數於原檔隨型號而異；此處以近似 High 1.00 / Mid 0.85 / Low 0.65 顯示 — 請以廠家資料覆核。' })));
  }, { src: 'FCU sheet (workbook) — data rows; CHW = kW/(4.2×(12−7)); HWS = kW/(4.2×(60−50))' }));

  root.append(card(L({ en: 'Quick Pipe Sizing (2.5 m/s, 300 Pa/m)', zh: '水管速算（2.5 m/s、300 Pa/m）' }), '', (body) => {
    const f = form([
      { key: 'q', label: L({ en: 'CHW flow', zh: '冷水量' }), unit: 'L/s', def: 0.31 },
      { key: 'vMax', label: L({ en: 'Max velocity', zh: '最大流速' }), unit: 'm/s', def: 2.5 },
      { key: 'pdMax', label: L({ en: 'Max PD', zh: '最大比摩阻' }), unit: 'Pa/m', def: 300 },
    ], (st) => draw(st), 'grid3');
    const box = h('div');
    body.append(f.grid, box);
    function draw(st) {
      if ([st.q, st.vMax, st.pdMax].some((x) => x == null || x <= 0)) { results(box, []); return; }
      const pick = STEEL_PIPES.find((p) => {
        const v = F.velocityFromFlow(st.q, p.id);
        return v <= st.vMax && F.hazenWilliams(v, p.id, 140) <= st.pdMax;
      });
      if (pick) {
        const v = F.velocityFromFlow(st.q, pick.id);
        results(box, [res('DN' + pick.dn, '', '', { digits: 0, big: true }), res(L({ en: 'CHW flow', zh: '冷水量' }), st.q, 'L/s', { digits: 2 }), res(L({ en: 'Velocity', zh: '流速' }), v, 'm/s', { digits: 2 }), res(L({ en: 'PD', zh: '比摩阻' }), F.hazenWilliams(v, pick.id, 140), 'Pa/m', { digits: 0 })]);
        box.append(flag('OK', 'ok'));
      } else results(box, [res(L({ en: 'No size fits', zh: '無合適管徑' }), '—', '', { digits: 0, err: true })]);
    }
    draw(f.all());
  }, { src: 'ASHRAE F. Ch.22; Hazen–Williams C=140' }));

  root.append(card(L({ en: 'Carrier 42CN (real HK data)', zh: 'Carrier 42CN（香港實數據）' }), '', (body) => {
    const f = form([{ key: 'model', label: L({ en: 'Model', zh: '型號' }), def: '42CN00430C', type: 'select', options: CARRIER_42CN.map((m) => ({ v: m.model, label: m.model })) }], draw, 'grid1');
    const box = h('div');
    body.append(f.grid, box);
    function draw(st) {
      const m = CARRIER_42CN.find((x) => x.model === st.model) || CARRIER_42CN[0];
      results(box, [
        res(L({ en: 'Airflow (high)', zh: '風量（高）' }), m.flow, 'm³/h', { digits: 0 }),
        res(L({ en: 'Capacity @7/15°C', zh: '冷量@7/15°C' }), m.cool715 / 1000, 'kW', { digits: 2 }),
        res(L({ en: 'Capacity @10/16.4°C', zh: '冷量@10/16.4°C' }), m.cool1016 / 1000, 'kW', { digits: 2, big: true }),
        res(L({ en: 'CHW flow', zh: '冷水量' }), m.chw, 'L/min', { digits: 1 }),
      ]);
    }
    draw(f.all());
    const tbl = h('table', { class: 'pipes-table' });
    tbl.append(h('tr', {}, h('th', {}, 'Model'), h('th', {}, 'm³/h'), h('th', {}, 'kW @7/15'), h('th', {}, 'kW @10/16.4'), h('th', {}, 'L/min')));
    for (const m of CARRIER_42CN) tbl.append(h('tr', {}, h('td', {}, m.model), h('td', {}, String(m.flow)), h('td', {}, (m.cool715 / 1000).toFixed(2)), h('td', {}, (m.cool1016 / 1000).toFixed(2)), h('td', {}, String(m.chw))));
    body.append(tbl);
    body.append(h('div', { class: 'note' },
      L({ en: 'Source: Carrier HK 42CN capacity data (on-coil 25.5 °C / 54.4% RH; CHW 7/15 °C & 10/16.4 °C) — from the local catalogue library (NWKR Site 1 enquiry, 2020).', zh: '來源：Carrier 香港 42CN 容量數據（盤前 25.5°C／54.4% RH；冷媒水 7/15°C 及 10/16.4°C）— 取自本機型錄庫（NWKR Site 1 詢價，2020）。' })));
  }, { src: 'G:\\我的雲端硬碟\\catalogue\\Fan coil\\Carrier — FCU capacity 10/18°C', collapsed: true }));
}

register({ id: 'fcu', icon: '🪟', group: 'equipment', title: I18N.title, desc: I18N.desc, src: 'FCU sheet (workbook)', render });
