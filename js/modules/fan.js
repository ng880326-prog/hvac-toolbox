// Module: Fan Selection (風機選型) — full catalogue from the 'Fan' sheet
import { register } from '../registry.js';
import { h, res, card, form, results, seg } from '../ui.js';
import { FANS } from '../data/fans.js';

const I18N = {
  title: { en: 'Fan Selection', zh: '風機選型' },
  desc: { en: 'Full catalogue from the workbook Fan sheet (brands × speed × external static), matching motors to pressure.', zh: '原檔 Fan 工作表完整型錄（品牌×轉速×機外靜壓），按靜壓匹配電機。' },
  brand: { en: 'Brand', zh: '品牌' },
  speed: { en: 'Speed', zh: '轉速' },
  static: { en: 'External static', zh: '機外靜壓' },
  model: { en: 'Model', zh: '型號' },
  dia: { en: 'Ø × Length', zh: '直徑×長度' },
  wt: { en: 'Weight', zh: '重量' },
  motor: { en: 'Motor', zh: '電機' },
  note: { en: 'Verified vs Kruger official catalogue (China/HK): TDA-L 315–1400 mm; Class F motor, min. IP55; ≤2.2 kW DOL, ≥3.0 kW Y-Δ. Full catalogue: https://www.krugerfan.com.cn/', zh: '已對照 Kruger 官方型錄核實：TDA-L 315–1400 mm、F 級電機 IP55、≤2.2 kW 直接起動／≥3.0 kW 星三角。完整型錄：https://www.krugerfan.com.cn/' },
};

function render(root, { L }) {
  const T = (k) => L(I18N[k]);
  const brands = [...new Set(FANS.map((f) => f.brand))];
  const speeds = [...new Set(FANS.map((f) => f.speed))];

  root.append(card(T('title'), T('desc'), (body) => {
    let brand = brands[0], speed = '<=1450';
    const statics = () => [...new Set(FANS.filter((f) => f.brand === brand && f.speed === speed).map((f) => f.static))].sort((a, b) => a - b);
    const brandRow = h('div', { class: 'field' }, h('label', {}, T('brand')),
      seg(brands.map((b) => ({ v: b, label: b })), brand, (v) => { brand = v; rebuild(); }));
    const speedRow = h('div', { class: 'field' }, h('label', {}, T('speed')),
      seg(speeds.map((s) => ({ v: s, label: s })), speed, (v) => { speed = v; rebuild(); }));
    const stRow = h('div', { class: 'field' }, h('label', {}, T('static')), h('div', { id: 'fanStatic' }));
    const box = h('div');
    body.append(brandRow, speedRow, stRow, box);

    function draw(st) {
      const rows = FANS.filter((f) => f.brand === brand && f.speed === speed && f.static === st);
      box.innerHTML = '';
      if (!rows.length) { results(box, [res(L({ en: 'No models at this static', zh: '此靜壓下無型號' }), '—', '', { digits: 0, err: true })]); return; }
      results(box, [
        res(T('model'), rows[0].model, '', { digits: 0, big: true }),
        res(T('dia'), rows[0].dia, '', { digits: 0 }),
        res(T('wt'), rows[0].wt, 'kg', { digits: 0 }),
        res(T('motor'), rows[0].motor, 'kW', { digits: 1 }),
      ]);
      const tbl = h('table', { class: 'pipes-table' });
      tbl.append(h('tr', {}, h('th', {}, T('model')), h('th', {}, T('dia')), h('th', {}, T('wt')), h('th', {}, T('motor') + ' kW')));
      for (const f of rows) tbl.append(h('tr', {}, h('td', {}, f.model), h('td', {}, f.dia), h('td', {}, f.wt), h('td', {}, f.motor)));
      box.append(tbl, h('div', { class: 'note' }, T('note')));
    }
    function rebuild() {
      const sList = statics();
      const wrap = document.getElementById && h; // noop guard
      const host = document.querySelector ? null : null;
      const stHost = body.querySelector('#fanStatic');
      if (stHost) {
        stHost.innerHTML = '';
        stHost.append(seg(sList.map((s) => ({ v: s, label: s + ' Pa' })), sList[0], (v) => draw(v)));
        draw(sList[0]);
      }
    }
    rebuild();
  }, { src: 'Fan sheet (workbook) — Kruger · National · Ostberg, ≤1450 / ≤2900 RPM, 100–1200 Pa' }));

  // ---- EAF selection sheets (Fantech, HK rep. Anway) — real data ----
  root.append(card(L({ en: 'EAF Selection Sheets (Fantech · Anway HK)', zh: 'EAF 選型單（Fantech · Anway 香港代理）' }), '', (body) => {
    const tbl = h('table', { class: 'pipes-table' });
    tbl.append(h('tr', {}, h('th', {}, 'EAF'), h('th', {}, 'Model'), h('th', {}, 'm³/s'), h('th', {}, 'Pa'), h('th', {}, 'Ø mm'), h('th', {}, 'kW')));
    for (const r of EAF) tbl.append(h('tr', {}, ...r.map((x) => h('td', {}, String(x)))));
    body.append(tbl);
    body.append(h('div', { class: 'note' },
      L({ en: '27 real selection sheets from the catalogue library (Fantech HXM propeller / PowerLine centrifugal / HCE, 240 V 50 Hz, 4-pole). Sources: G:\\我的雲端硬碟\\catalogue\\Ventilation Fan (EAF-*.pdf). K-flex / Kooltherm insulation PDFs are image-based — λ values need an OCR pass.', zh: '27 份真實選型單（Fantech HXM 軸流／PowerLine 離心／HCE，240 V 50 Hz、4 極）。來源：G:\\我的雲端硬碟\\catalogue\\Ventilation Fan（EAF-*.pdf）。K-flex／Kooltherm 保溫 PDF 為圖片式 — λ 值需 OCR 處理。' })));
  }), { src: 'Ventilation Fan (EAF-*.pdf) — Fantech, HK rep. Anway Engineering' });
}

register({ id: 'fan', icon: '🪭', group: 'equipment', title: I18N.title, desc: I18N.desc, src: 'Fan sheet (workbook) full catalogue', render });

// ---- EAF selection sheets (Fantech, HK rep. Anway) — real data from the catalogue library ----
const EAF = [
  ['EAF-1F-01', 'PCD504DD', 1.81, 250, 500, 1.1], ['EAF-1F-02', 'PCE454DD', 1.08, 250, 450, 0.75],
  ['EAF-1F-03', 'PCD564DD', 2.60, 300, 560, 2.2], ['EAF-1F-04', 'PCE454DD', 1.18, 250, 450, 0.75],
  ['EAF-1F-05', 'WCD314E', 0.09, 50, 310, 0.18], ['EAF-2F-01', 'PCE354DD', 0.23, 200, 350, 0.25],
  ['EAF-2F-02', 'PCE354DD', 0.24, 200, 350, 0.25], ['EAF-2F-03', 'HCE200', 0.08, 200, 200, 0.12],
  ['EAF-2F-04', 'HCE200', 0.09, 200, 200, 0.12], ['EAF-8F-01', 'HXM-350', 0.24, 50, 350, 0.07],
  ['EAF-8F-02', 'HXM-350', 0.22, 50, 350, 0.07], ['EAF-8F-03', 'HCE200', 0.08, 200, 200, 0.12],
  ['EAF-8F-05', 'PCE454DD', 1.15, 250, 450, 0.75], ['EAF-8F-06', 'PCE354DD', 0.36, 250, 350, 0.25],
  ['EAF-9F-01&02', 'PCD564DD', 1.90, 400, 560, 2.2], ['EAF-10F-01-04', 'MMD806/4', 6.60, 300, 800, 5.5],
  ['EAF-10F-05', 'PCE454DD', 1.01, 200, 450, 0.75], ['EAF-10F-06', 'PCD504DD', 1.40, 200, 500, 1.1],
  ['EAF-10F-07', 'PCD636DD', 1.87, 250, 630, 1.1], ['EAF-GF-01', 'PCE404DD', 0.57, 300, 400, 0.55],
  ['EAF-GF-02', 'TE3-200', 0.09, 300, 220, 0.12], ['EAF-GF-03', 'PCE354DD', 0.20, 250, 350, 0.25],
  ['EAF-GF-04', 'PCE404DD', 0.80, 200, 400, 0.55], ['EAF-GF-05', 'PCE404DD', 0.77, 200, 400, 0.55],
  ['EAF-GF-06', 'CPD0354F', 0.47, 50, 350, 0.12], ['EAF-RF-01', 'PCE404DD', 0.66, 150, 400, 0.55],
];
