// Module: Chiller (冷機) — from 'Chiller' sheet
import { register } from '../registry.js';
import { h, res, card, form, results } from '../ui.js';
import { CONV } from '../engine/fluids.js';
import { GART_MODELS } from '../data/chiller_mhi.js';

const I18N = {
  title: { en: 'Chiller Performance', zh: '冷機性能' },
  desc: { en: 'Capacity conversions (kW / RT / Btu/h / kcal/h), COP & kW/RT, efficiency check.', zh: '冷量換算（kW／RT／Btu/h／kcal/h）、COP 與 kW/RT、效率檢核。' },
  cap: { en: 'Chiller capacity', zh: '冷機冷量' },
  power: { en: 'Power input', zh: '輸入功率' },
  cop: { en: 'COP', zh: 'COP' },
  kwrt: { en: 'kW/RT', zh: 'kW/RT' },
  eff: { en: 'Efficiency', zh: '效率' },
  good: { en: 'Good efficiency (water-cooled class)', zh: '效率良好（水冷機級別）' },
  fair: { en: 'Fair (typical air-cooled)', zh: '一般（典型風冷機）' },
  poor: { en: 'Poor — check data or consider replacement', zh: '偏低 — 請檢查數據或考慮更換' },
  note: { en: 'Reference kW/RT: water-cooled ≈ 0.55–0.75, air-cooled ≈ 1.0–1.4 (full load). Workbook conversions: 1 RT = 3.516 kW, 1 kW = 3412 Btu/h, 860 kcal/h.', zh: '參考 kW/RT：水冷 ≈ 0.55–0.75、風冷 ≈ 1.0–1.4（滿載）。原檔換算：1 RT＝3.516 kW、1 kW＝3412 Btu/h、860 kcal/h。' },
};

function render(root, { L }) {
  const T = (k) => L(I18N[k]);
  root.append(card(T('title'), T('desc'), (body) => {
    const f = form([
      { key: 'cap', label: T('cap'), unit: 'kW', def: 1000 },
      { key: 'power', label: T('power'), unit: 'kW', def: 210 },
    ], draw, 'grid2');
    const box = h('div');
    body.append(f.grid, box);
    function draw(st) {
      if ([st.cap, st.power].some((x) => x == null || x <= 0)) { results(box, []); return; }
      const cop = st.cap / st.power;
      const kwrt = st.power / (st.cap / CONV.kW_PER_RT);
      const ver = kwrt <= 0.8 ? T('good') : kwrt <= 1.4 ? T('fair') : T('poor');
      const kind = kwrt <= 0.8 ? 'ok' : kwrt <= 1.4 ? 'info' : 'bad';
      results(box, [
        res(T('cap'), st.cap / CONV.kW_PER_RT, 'RT', { digits: 1 }),
        res(T('cap'), st.cap * CONV.BTUH_PER_KW, 'Btu/h', { digits: 0 }),
        res(T('cap'), st.cap * CONV.KCAL_PER_KW, 'kcal/h', { digits: 0 }),
        res(T('cop'), cop, '—', { digits: 2, big: true }),
        res(T('kwrt'), kwrt, 'kW/RT', { digits: 2 }),
      ]);
      box.append(h('div', { class: 'flag ' + kind }, ver));
      box.append(h('div', { class: 'note' }, T('note')));
    }
    draw(f.all());
  }, { src: 'AHRI 550/590-2023 conventions; workbook conversions' }));

  // ---- IPLV / NPLV (AHRI 550/590-2023) ----
  root.append(card(L({ en: 'IPLV / NPLV (AHRI 550/590-2023)', zh: 'IPLV／NPLV（AHRI 550/590-2023）' }), '', (body) => {
    const f = form([
      { key: 'a', label: L({ en: '100% kW/RT', zh: '100% kW/RT' }), unit: 'kW/RT', def: 0.55 },
      { key: 'b', label: L({ en: '75%', zh: '75%' }), unit: 'kW/RT', def: 0.60 },
      { key: 'c', label: L({ en: '50%', zh: '50%' }), unit: 'kW/RT', def: 0.65 },
      { key: 'd', label: L({ en: '25%', zh: '25%' }), unit: 'kW/RT', def: 0.70 },
    ], (st) => draw(st), 'grid4');
    const box = h('div');
    body.append(f.grid, box);
    function draw(st) {
      if ([st.a, st.b, st.c, st.d].some((x) => x == null || x <= 0)) { results(box, []); return; }
      const iplv = 0.01 * st.a + 0.42 * st.b + 0.45 * st.c + 0.12 * st.d;
      results(box, [
        res(L({ en: 'IPLV (kW/RT)', zh: 'IPLV（kW/RT）' }), iplv, 'kW/RT', { digits: 3, big: true }),
        res('COP', 3.516 / iplv, '—', { digits: 2 }),
      ]);
    }
    draw(f.all());
  }, {
    formula: 'IPLV = 0.01·A + 0.42·B + 0.45·C + 0.12·D   (kW/RT), water-cooled; weights per AHRI 550/590-2023',
    src: 'AHRI 550/590-2023 (workbook 10.7×3.516 resolved: ft²→m² factor, not an efficiency constant)',
  }));

  // ---- MHI 2025 catalogue (from the local catalogue library) ----
  root.append(card('MHI Thermal Systems — Water-cooled Chillers (2025 catalogue)', '', (body) => {
    const tbl = h('table', { class: 'pipes-table' });
    tbl.append(h('tr', {}, h('th', {}, 'Series'), h('th', {}, 'Drive'), h('th', {}, 'Refrigerant'), h('th', {}, 'Range')));
    const rows = [
      ['ETI', 'VSD (built-in inverter)', 'HFC-134a', '250–2300 RT'],
      ['ETI-Z (Low GWP)', 'VSD', 'Low-GWP (R1234ze family)', 'approx. same range'],
      ['GART-P', 'Constant / Variable', 'HFC-134a', '250–2300 RT'],
      ['GART-R', 'Constant / Variable', 'HFC-134a', '250–2300 RT'],
    ];
    for (const r of rows) tbl.append(h('tr', {}, ...r.map((x) => h('td', {}, x))));
    body.append(tbl);
    body.append(h('div', { class: 'note' },
      L({ en: 'Verified from the 2025 MHI catalogue set (MTHSS007 rev. R3 + GART SERIES CATALOG 07/08): series ETI (VSD) / GART-P (variable) / GART-R (constant), 250–2300 RT, HFC-134a; model designations seen in the catalogue: GART-50R, 60R, 70R, 80P, 100R, 150P; GART ≈40%/30% smaller than previous AART (3.3→2.5 m, 1000 RT); projects: KLCC 13 units / 36,400 RT, Amari Watergate Bangkok 460 RT×2. Per-model RT/kW/COP tables were OCR-ed to text (tools/ocr_out/gart_p10_en.txt, p11_en.txt, 1251/1357 lines) — column-parsing to exact per-model values is the follow-up; digits extracted so far: 1058.4/1210.0/1512.0… (capacity/litre rows).', zh: '已核實（2025 MHI 目錄 MTHSS007 R3＋GART 手冊 07/08）：系列 ETI（VSD）／GART-P（變頻）／GART-R（定頻）、250–2300 RT、HFC-134a；型號命名見於目錄：GART-50R、60R、70R、80P、100R、150P；GART 較 AART 縮小 40%/30%（3.3→2.5 m、1000 RT）；項目：KLCC 13 台／36,400 RT、曼谷 460 RT×2。逐型號 RT/kW/COP 表已 OCR 存文（tools/ocr_out/gart_p10_en.txt、p11_en.txt，1251/1357 行）— 逐欄校驗為後續；目前抽得數值：1058.4/1210.0/1512.0…（容量／冷水量列）。' })));
  }, { src: 'G:\\我的雲端硬碟\\catalogue\\Mitsubishi heavy industries\\20250417\\Water-cooled Chiller' }));

  // ---- MHI GART verified catalogue rows (OCR) ----
  root.append(card('MHI GART — catalogue table (OCR-verified)', '', (body) => {
    const tbl = h('table', { class: 'pipes-table' });
    tbl.append(h('tr', {}, h('th', {}, 'RT'), h('th', {}, 'kW'), h('th', {}, 'Input kW'), h('th', {}, 'COP')));
    for (const g of GART_MODELS) tbl.append(h('tr', {}, ...[g.rt, g.kw, g.input, g.cop].map((x) => h('td', {}, String(x)))));
    body.append(tbl);
    body.append(h('div', { class: 'note' },
      GART_MODELS.length + ' rows from the GART SERIES CATALOG scans, each passing identity check kW = RT x 3.51685 (+/-0.5%) and COP = kW/input. Non-standard steps (739/796/991/1104 RT) as OCR-ed - verify with factory data.'));
  }, { src: 'GART SERIES CATALOG 07/08 · OCR p10/p11' }));
}

register({ id: 'chiller', icon: '❄️', group: 'equipment', title: I18N.title, desc: I18N.desc, src: 'AHRI 550/590-2023', render });
