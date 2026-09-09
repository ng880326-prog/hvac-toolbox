// Module: AHU / PAU Quick Selection (AHU/PAU 快速選型) — from 'AHU' sheet
// Brand models (Trane CLCP) with AHU(2.5 m/s)/PAU(2.3 m/s) flows, dims, and
// component-length calculator (checkboxes → machine length = 150 + Σ component).
import { register } from '../registry.js';
import { h, res, flag, card, form, results, seg } from '../ui.js';
import { AHU_MODELS } from '../data/ahu_models.js';

const I18N = {
  title: { en: 'AHU / PAU Quick Selection', zh: 'AHU／PAU 快速選型' },
  desc: { en: 'Model selection by air flow (AHU 2.5 m/s, PAU 2.3 m/s) with unit length built from selected components (mixing, filters, coil rows, fan, UV…).', zh: '按風量選型（AHU 2.5 m/s、PAU 2.3 m/s），機身長度由所選組件（混風段、過濾器、盤管排數、風機、紫外線…）累加。' },
  flow: { en: 'Required supply flow', zh: '所需送風量' },
  unit: { en: 'Unit type', zh: '設備類型' },
  ahu: { en: 'AHU', zh: 'AHU' },
  pau: { en: 'PAU', zh: 'PAU' },
  model: { en: 'Matched model', zh: '匹配型號' },
  flowT: { en: 'Rated flow', zh: '額定風量' },
  dims: { en: 'Dimensions L×W×H', zh: '尺寸 L×W×H' },
  comps: { en: 'Components', zh: '組件' },
  len: { en: 'Machine length', zh: '機身長度' },
  nocomp: { en: 'Select at least one component (base 150 mm).', zh: '請至少勾選一項組件（基礎 150 mm）。' },
  legend: { en: 'Component codes: MIX mixing · PF panel filter · BF bag filter · C1/2 / C4 / C6 / C8 coil rows · HC heating coil · HUM humidifier · FAN fan · UV ultraviolet', zh: '組件代碼：MIX 混風 · PF 板式過濾 · BF 袋式過濾 · C1/2、C4、C6、C8 盤管排數 · HC 加熱盤管 · HUM 加濕器 · FAN 風機 · UV 紫外線' },
  table: { en: 'All models — AHU (2.5 m/s) / PAU (2.3 m/s)', zh: '全部型號 — AHU（2.5 m/s）／PAU（2.3 m/s）' },
};

const COMP_KEYS = [
  ['mix', 'MIX'], ['pf', 'PF'], ['bf2', 'BF'], ['c12', 'C1/2'], ['c4', 'C4'],
  ['c6', 'C6'], ['c8', 'C8'], ['hc', 'HC'], ['hum', 'HUM'], ['fan', 'FAN'], ['uv', 'UV'],
];

function ahuSchematicSVG(model, sel) {
  const width = 760, height = 150, base = 150;
  const items = COMP_KEYS.map(([k, label]) => ({
    key: k, label, len: Number(model.comps[COMP_KEYS.findIndex((x) => x[0] === k)]) || 0,
    on: sel.has(k),
  }));
  const total = base + items.reduce((s, i) => s + (i.on ? i.len : 0), 0);
  const scale = (width - 60) / total;
  let x = 30, s = '';
  // duct body
  s += `<rect x="${30}" y="40" width="${total * scale}" height="58" fill="none" stroke="var(--line)" stroke-width="1.5" rx="10"/>`;
  for (const it of items) {
    const w = it.len * scale;
    if (w < 1) continue;
    const c = it.on ? 'linear-gradient' : '';
    const fill = it.on ? 'var(--brand-2)' : 'transparent';
    const stroke = it.on ? 'var(--brand)' : 'var(--line)';
    const dash = it.on ? '' : ' stroke-dasharray="4 4"';
    s += `<g class="comp">
      <rect x="${x + 3}" y="${44 + (it.on ? 0 : 4)}" width="${Math.max(w - 6, 14)}" height="${it.on ? 50 : 42}" rx="6"
        fill="${fill}" stroke="${stroke}" stroke-width="${it.on ? 2 : 1.4}"${dash} opacity="${it.on ? 1 : 0.55}"/>
      <text x="${x + Math.max(w, 20) / 2}" y="${76 + (it.on ? 0 : 6)}" text-anchor="middle"
        fill="${it.on ? '#fff' : 'var(--ink-soft)'}">${it.label}</text>
    </g>`;
    x += w;
  }
  // base 150 end piece
  s += `<g class="comp"><rect x="${x + 3}" y="44" width="${Math.max(base * scale - 6, 12)}" height="50" rx="6" fill="var(--ink-soft)" opacity="0.18" stroke="var(--ink-soft)" stroke-width="1.4"/>
    <text x="${x + base * scale / 2}" y="76" text-anchor="middle" fill="var(--ink-soft)">BASE</text></g>`;
  // airflow arrow
  s += `<path d="M 34 66 h 14 l -5 -5 m 5 5 l -5 5" stroke="var(--brand)" stroke-width="2" fill="none"/>
        <text x="26" y="100" font-size="10" fill="var(--brand)">AIR</text>`;
  // dimension line
  s += `<line class="dim-line" x1="30" y1="118" x2="${30 + total * scale}" y2="118"/>
        <text class="dim-text" x="${30 + total * scale / 2}" y="132" text-anchor="middle">L = ${total} mm (base 150 + Σ components)</text>`;
  return `<svg class="ahu-sch" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">${s}</svg>`;
}

function render(root, { L }) {
  const T = (k) => L(I18N[k]);
  let unit = 'AHU';
  const sel = new Set(['mix', 'c8', 'hc', 'fan']);

  root.append(card(T('title'), T('desc'), (body) => {
    const unitRow = h('div', { class: 'field' }, h('label', {}, T('unit')),
      seg([{ v: 'AHU', label: T('ahu') }, { v: 'PAU', label: T('pau') }], unit, (v) => { unit = v; draw(f.all()); }));
    const f = form([
      { key: 'flow', label: T('flow'), unit: 'L/s', def: 575 },
    ], (st) => draw(st), 'grid1');
    const box = h('div');
    const schBox = h('div', { class: 'chart-box' });
    body.append(unitRow, f.grid, box, schBox);

    // component checkboxes
    const compWrap = h('div', { class: 'grid3' });
    for (const [key, label] of COMP_KEYS) {
      const cb = h('input', { type: 'checkbox' });
      cb.checked = sel.has(key);
      cb.addEventListener('change', () => {
        if (cb.checked) sel.add(key); else sel.delete(key);
        draw(f.all());
      });
      compWrap.append(h('label', { class: 'check' }, cb, label));
    }
    body.append(compWrap, h('div', { class: 'note' }, T('legend')));

    function draw(st) {
      if (st.flow == null || st.flow <= 0) { results(box, []); schBox.innerHTML = ''; return; }
      const pick = AHU_MODELS.find((m) => (unit === 'AHU' ? m.ahuLs : m.pauLs) >= st.flow);
      if (pick) {
        const len = 150 + COMP_KEYS.reduce((s, [k]) => s + (sel.has(k) ? Number(pick.comps[COMP_KEYS.findIndex((x) => x[0] === k)]) || 0 : 0), 0);
        results(box, [
          res(T('model'), pick.id, '', { digits: 0, big: true }),
          res(T('flowT'), unit === 'AHU' ? pick.ahuCMH : pick.pauCMH, 'CMH', { digits: 0 }),
          res(T('dims'), `${pick.L} × ${pick.W} × ${pick.H}`, 'mm', { digits: 0 }),
          res(T('len'), len, 'mm', { digits: 0 }),
        ]);
        schBox.innerHTML = ahuSchematicSVG(pick, sel);
      } else {
        results(box, [res(L({ en: 'No model covers this flow', zh: '無型號覆蓋此風量' }), '—', '', { digits: 0, err: true })]);
        schBox.innerHTML = '';
      }
    }
    draw(f.all());

    // full model table
    const tbl = h('table', { class: 'pipes-table' });
    tbl.append(h('tr', {}, h('th', {}, 'Model'), h('th', {}, 'AHU CMH'), h('th', {}, 'AHU L/s'), h('th', {}, 'PAU CMH'), h('th', {}, 'PAU L/s'), h('th', {}, 'L×W×H mm')));
    for (const m of AHU_MODELS) {
      tbl.append(h('tr', {}, h('td', {}, m.id), h('td', {}, String(m.ahuCMH)), h('td', {}, String(m.ahuLs)), h('td', {}, String(m.pauCMH)), h('td', {}, String(m.pauLs)), h('td', {}, `${m.L}x${m.W}x${m.H}`)));
    }
    body.append(h('div', { class: 'note' }, h('b', {}, T('table'))), tbl);
  }, {
    src: 'AHU sheet (workbook) — Trane CLCP; verified against Trane Hong Kong CLCP/CLCH catalogue (PRC010C-EN, 2024-10): https://www.tranehk.com/tc/products/Air_Handling_Systems_CLCP.aspx',
  }));
}

register({ id: 'ahu', icon: '🏗️', group: 'equipment', title: I18N.title, desc: I18N.desc, src: 'Trane HK CLCP catalogue 2024', render });
