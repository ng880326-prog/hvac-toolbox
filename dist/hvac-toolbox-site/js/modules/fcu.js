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
  // Workbook C15 shows 'Mid', but its table prints the nominal catalogue ratings; the module therefore
  // starts at High so the displayed numbers match the sheet, and Mid/Low apply the documented factors.
  let speed = 'High';
  // Workbook selection block (B9:B15): system, brand, fan static, fan speed.
  const cond = { system: '2-pipe', brand: 'Trane', staticPa: 50, chws: 12, chwr: 7, hwS: 60, hwR: 50 };
  root.append(card(T('title'), T('desc'), (body) => {
    const selRow = h('div', { class: 'grid3' },
      h('div', { class: 'field' }, h('label', {}, L({ en: 'Select system', zh: '系統' })),
        seg([{ v: '2-pipe', label: L({ en: '2-pipe', zh: '2 管' }) },
          { v: '4-pipe', label: L({ en: '4-pipe', zh: '4 管' }) }], cond.system,
          (v) => { cond.system = v; draw(); })),
      h('div', { class: 'field' }, h('label', {}, L({ en: 'Select brand', zh: '廠牌' })),
        seg([{ v: 'Trane', label: 'Trane' }], cond.brand, () => {})),
      h('div', { class: 'field' }, h('label', {}, L({ en: 'Fan speed', zh: '風速' })),
        seg(Object.keys(SPEED_F).map((s) => ({ v: s, label: L({ en: s, zh: s === 'High' ? '高' : s === 'Mid' ? '中' : '低' }) })), speed, (v) => { speed = v; draw(); })));
    const condForm = form([
      { key: 'staticPa', label: L({ en: 'Fan static', zh: '風機靜壓' }), unit: 'Pa', def: cond.staticPa },
      { key: 'chws', label: L({ en: 'CHW supply', zh: '冷媒水供水' }), unit: '°C', def: cond.chws },
      { key: 'chwr', label: L({ en: 'CHW return', zh: '冷媒水回水' }), unit: '°C', def: cond.chwr },
      { key: 'hwS', label: L({ en: 'HWS supply', zh: '熱媒水供水' }), unit: '°C', def: cond.hwS },
      { key: 'hwR', label: L({ en: 'HWS return', zh: '熱媒水回水' }), unit: '°C', def: cond.hwR },
    ], (a) => { Object.assign(cond, a); draw(); }, 'grid4', 'fcuc-');
    const wrap = h('div', { id: 'fcu' });
    const selBox = h('div', { id: 'fcuSel' });
    const noteBox = h('div');
    body.append(selRow, condForm.grid, wrap, selBox, noteBox);
    function draw() {
      wrap.innerHTML = '';
      const f = form([{ key: 'm', label: L({ en: 'Model', zh: '型號' }), def: '4', type: 'select', options: MODELS.map((m) => ({ v: m.id, label: m.id + ' — ' + m.cfm + ' CFM' })) }], () => drawSel(), 'grid2', 'fcum-');
      wrap.append(f.grid);
      drawSel();
    }
    function drawSel() {
      const sel = wrap.querySelector('#fcum-m');
      const m = MODELS.find((x) => x.id === (sel ? sel.value : '4')) || MODELS[0];
      const k = SPEED_F[speed];
      const tot = m.tot * k, sens = m.sens * k, heat = m.heat * k;
      const chwDt = cond.chws - cond.chwr;      // workbook L6 = J6/(4.2×(12−7))
      const hwDt = cond.hwS - cond.hwR;         // workbook M6 = K6/(4.2×(60−50))
      results(selBox, [
        res(L({ en: 'Air flow', zh: '風量' }), (m.cfm * k).toFixed(0), 'CFM', { digits: 0 }),
        res(L({ en: 'Air flow', zh: '風量' }), (m.cfm * 0.472 * k).toFixed(1), 'L/s', { digits: 1 }),
        res(L({ en: 'Sensible coil', zh: '顯熱盤管' }), sens, 'kW', { digits: 2 }),
        res(L({ en: 'Total coil', zh: '全熱盤管' }), tot, 'kW', { digits: 2, big: true }),
        // The workbook prints a heating capacity for every model regardless of system; only the coil
        // note changes with 2-pipe / 4-pipe, so the figure is always shown.
        res(L({ en: 'Heating coil', zh: '加熱盤管' }), heat, 'kW', { digits: 2 }),
        res(L({ en: 'CHW flow', zh: '冷水量' }), chwDt > 0 ? tot / (4.2 * chwDt) : NaN, 'L/s (ΔT ' + chwDt + ')', { digits: 3 }),
        res(L({ en: 'HWS flow', zh: '熱水量' }), hwDt > 0 ? heat / (4.2 * hwDt) : NaN, 'L/s (ΔT ' + hwDt + ')', { digits: 3 }),
        res(L({ en: 'Dimensions', zh: '尺寸' }), m.dim.join(' × '), 'mm', { digits: 0 }),
        res(L({ en: 'Ducts SA / RA', zh: '風管 SA／RA' }), m.duct[0] + ' / ' + m.duct[1], '', { digits: 0 }),
        res(L({ en: 'Fan static', zh: '風機靜壓' }), cond.staticPa, 'Pa', { digits: 0 }),
      ]);
      noteBox.innerHTML = '';
      noteBox.append(h('div', { class: 'note' }, cond.system === '4-pipe'
        ? L({ en: '*3-row cooling coil + 1-row heating coil is selected (4-pipe).', zh: '＊4 管系統：已選 3 排冷卻盤管 ＋ 1 排加熱盤管。' })
        : L({ en: '*3-row cooling coil is selected (2-pipe).', zh: '＊2 管系統：已選 3 排冷卻盤管。' })));
      if (cond.system === '4-pipe' && !(hwDt > 0)) noteBox.append(flag(L({ en: 'HWS supply must exceed return.', zh: '熱媒水供水必須高於回水。' }), 'bad'));
      if (!(chwDt > 0)) noteBox.append(flag(L({ en: 'CHW supply must exceed return.', zh: '冷媒水供水必須高於回水。' }), 'bad'));
    }
    draw();
    body.append(h('div', { class: 'note' },
      L({ en: 'Speed multipliers are model-specific in the workbook; approximate High 1.00 / Mid 0.85 / Low 0.65 shown — verify with factory data.', zh: '風速折減因數於原檔隨型號而異；此處以近似 High 1.00 / Mid 0.85 / Low 0.65 顯示 — 請以廠家資料覆核。' })));
    body.append(h('div', { class: 'note' }, L({
      en: 'Workbook notes — 1) chilled water 12/7 °C  2) heating water 60/50 °C  3) entering air: cooling DB 24 °C / RH 50 %, heating DB 21 °C / RH 40 %.',
      zh: '原檔註記 —— 1) 冷媒水 12／7 °C  2) 熱媒水 60／50 °C  3) 進風條件：冷卻 乾球 24 °C／RH 50%，加熱 乾球 21 °C／RH 40%。',
    })));
  }, { src: 'FCU!B9:B15 (selectors) · F4:R19 (catalogue) · CHW = kW/(4.2×(12−7)); HWS = kW/(4.2×(60−50))' }));

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
