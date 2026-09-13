// Module: AHU / PAU selection (AHU／PAU 選型) — rebuilt from the workbook 'AHU' sheet.
//
// Workbook layout being mirrored (print area 'AHU'!$B$2:$AG$39):
//   B19:F27  Estimation of Supply Flow — served area, cooling-load density, assumed SHR, room and
//            supply temperatures; E24 sensible load = density × area × SHR / 1000 and
//            E27 supply flow = E24 / 1.23 / (room − supply) × 1000
//   B30:F40  the occupancy route — area, occupancy density → population, fresh-air requirement in
//            L/s per person *and* per m², total = area × L/s/m² + population × L/s/p (the workbook adds
//            the two; ASHRAE 62.1 takes the larger, so both are shown)
//   L2:U28   Trane CLCP quick selection — AHU supply flow at 2.5 m/s and PAU primary air at 2.3 m/s,
//            with the mm length of each component for the schematic
//   W2:AF28  Savier A1 series — the same two ratings plus casing L/W/H
//   L29/W29  '*150mm is added to the overall unit length for the frame of the equipment'
//
// The two catalogue blocks and the sheet's air constant (ρ·cp = 1.23) live in data/ahu_models.js.
import { register } from '../registry.js';
import { h, res, flag, card, form, results, seg, fold } from '../ui.js';
import { supplyFlowLps } from '../engine/fluids.js';
import {
  AHU_MODELS, SAVIER_MODELS, FRAME_ALLOWANCE_MM, WORKBOOK_RHOCP,
} from '../data/ahu_models.js';

const I18N = {
  title: { en: 'AHU / PAU Selection', zh: 'AHU／PAU 選型' },
  desc: {
    en: 'Workbook page rebuilt: estimate the supply and fresh-air flow, then pick a Trane CLCP or Savier A1 unit and lay out its component sections.',
    zh: '照原檔重建：先估算送風量與新風量，再由 Trane CLCP 或 Savier A1 選機，並排出各功能段長度。',
  },
  estFlow: { en: 'Estimation of Supply Flow (by area)', zh: '送風量估算（按面積）' },
  estFlowSub: {
    en: 'Cooling load = area × density; the sensible part is that × SHR, and the flow follows from the room-to-supply temperature difference.',
    zh: '冷負荷 ＝ 面積 × 密度；顯熱部分再乘 SHR，流量由其餘的室溫與送風溫差決定。',
  },
  area: { en: 'Served area', zh: '服務面積' },
  density: { en: 'Cooling load density', zh: '冷負荷密度' },
  shr: { en: 'Assumed SHR', zh: '假設 SHR' },
  roomT: { en: 'Room temperature', zh: '室內溫度' },
  supplyT: { en: 'Supply temperature', zh: '送風溫度' },
  coolingLoad: { en: 'Cooling load', zh: '冷負荷' },
  sensibleLoad: { en: 'Sensible cooling load', zh: '顯熱冷負荷' },
  supplyFlow: { en: 'Supply air flow', zh: '送風量' },
  estFresh: { en: 'Estimation of Fresh Air (by occupancy)', zh: '新風量估算（按人數）' },
  estFreshSub: {
    en: 'Population = area ÷ occupancy density. The workbook adds the per-person and per-area requirements; ASHRAE 62.1 takes the larger of the two, so both figures are shown.',
    zh: '人數 ＝ 面積 ÷ 人均面積。原檔把「按人」與「按面積」兩項相加；ASHRAE 62.1 取兩者較大，故兩者都列出。',
  },
  occDensity: { en: 'Occupancy density', zh: '人均面積' },
  population: { en: 'Population', zh: '人數' },
  perPerson: { en: 'Fresh air per person', zh: '每人新風量' },
  perSqm: { en: 'Fresh air per m²', zh: '每平方米新風量' },
  totalFresh: { en: 'Total fresh air flow', zh: '總新風量' },
  wbSum: { en: 'workbook: sum of both', zh: '原檔：兩項相加' },
  maxRule: { en: 'ASHRAE 62.1: larger of the two', zh: 'ASHRAE 62.1：取較大者' },
  wbNote: {
    en: 'The workbook rule uses ρ·cp = 1.23 kJ/(m³·K); the engine value at 24 °C is ≈1.21, so this page shows both flows (≈1.5 % apart).',
    zh: '原檔規則用 ρ·cp ＝ 1.23 kJ/(m³·K)；引擎在 24 °C 約 1.21，故本頁同時列出兩個流量（相差約 1.5%）。',
  },
  quick: { en: 'Quick Selection', zh: '快速選型' },
  quickSub: {
    en: 'Pick a brand and a flow; the smallest unit that covers it is selected at the catalogue’s face velocities (AHU 2.5 m/s, PAU 2.3 m/s).',
    zh: '揀廠牌與風量，選出最細而足夠嘅機型（目錄面風速：AHU 2.5 m/s、PAU 2.3 m/s）。',
  },
  brand: { en: 'Brand', zh: '廠牌' },
  unit: { en: 'Application', zh: '用途' },
  ahu: { en: 'AHU (supply air)', zh: 'AHU（送風）' },
  pau: { en: 'PAU (primary air)', zh: 'PAU（新風）' },
  flow: { en: 'Design flow', zh: '設計風量' },
  flowUnit: { en: 'Flow unit', zh: '風量單位' },
  model: { en: 'Model', zh: '型號' },
  flowT: { en: 'Catalogue flow', zh: '目錄風量' },
  dims: { en: 'Casing L × W × H', zh: '機殼 長×闊×高' },
  len: { en: 'Unit length with selected sections', zh: '所選功能段總長' },
  useEst: { en: 'Use the estimated flow', zh: '採用估算風量' },
  sections: { en: 'Select AHU/PAU components', zh: '選擇 AHU／PAU 功能段' },
  sectionsSub: {
    en: 'Each section adds its printed length; the 150 mm frame allowance is always included.',
    zh: '每個功能段按其長度累加；150 mm 框架長度必定計入。',
  },
  nocomp: { en: 'Select at least one component (base 150 mm).', zh: '請至少勾選一項功能段（基礎 150 mm）。' },
  legend: { en: 'Component codes: MIX mixing · PF panel filter · BF bag filter · C1/2 / C4 / C6 / C8 coil rows · HC heating coil · HUM humidifier · FAN fan · UV ultraviolet', zh: '功能段代碼：MIX 混風 · PF 板式過濾 · BF 袋式過濾 · C1/2、C4、C6、C8 盤管排數 · HC 加熱盤管 · HUM 加濕器 · FAN 風機 · UV 紫外線' },
  table: { en: 'Catalogue tables', zh: '目錄表' },
  frameNote: {
    en: 'Workbook note: 150 mm is added to the overall unit length for the equipment frame.',
    zh: '原檔註明：設備框架另加 150 mm 至機組總長。',
  },
  noModel: { en: 'No catalogue model covers this flow', zh: '目錄內沒有型號覆蓋此風量' },
  wbParity: { en: 'workbook ρ·cp = 1.23', zh: '原檔 ρ·cp ＝ 1.23' },
  engineParity: { en: 'engine ρ·cp = 1.213', zh: '引擎 ρ·cp ＝ 1.213' },
};

const COMP_KEYS = [
  ['mix', 'MIX'], ['pf', 'PF'], ['bf2', 'BF'], ['c12', 'C1/2'], ['c4', 'C4'],
  ['c6', 'C6'], ['c8', 'C8'], ['hc', 'HC'], ['hum', 'HUM'], ['fan', 'FAN'], ['uv', 'UV'],
];

/** Section layout of one unit: lengths come from the catalogue, the 150 mm frame is always present. */
function ahuSchematicSVG(model, sel) {
  const width = 760, height = 150, base = FRAME_ALLOWANCE_MM;
  const items = COMP_KEYS.map(([k, label]) => ({
    key: k, label, len: Number(model.comps ? model.comps[COMP_KEYS.findIndex((x) => x[0] === k)] : 0) || 0,
    on: sel.has(k),
  }));
  const total = base + items.reduce((s, i) => s + (i.on ? i.len : 0), 0);
  const scale = (width - 60) / Math.max(total, 1);
  let x = 30, s = '';
  s += `<rect x="30" y="40" width="${total * scale}" height="58" fill="none" stroke="var(--line)" stroke-width="1.5" rx="10"/>`;
  for (const it of items) {
    const w = it.len * scale;
    if (w < 1) continue;
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
  s += `<g class="comp"><rect x="${x + 3}" y="44" width="${Math.max(base * scale - 6, 12)}" height="50" rx="6"
      fill="var(--ink-soft)" opacity="0.18" stroke="var(--ink-soft)" stroke-width="1.4"/>
    <text x="${x + base * scale / 2}" y="76" text-anchor="middle" fill="var(--ink-soft)">FRAME</text></g>`;
  s += `<path d="M 34 66 h 14 l -5 -5 m 5 5 l -5 5" stroke="var(--brand)" stroke-width="2" fill="none"/>
        <text x="26" y="100" font-size="11" fill="var(--brand)">AIR</text>`;
  s += `<line class="dim-line" x1="30" y1="118" x2="${30 + total * scale}" y2="118"/>
        <text class="dim-text" x="${30 + total * scale / 2}" y="132" text-anchor="middle">L = ${total} mm (frame ${base} + Σ sections)</text>`;
  return `<svg class="ahu-sch" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">${s}</svg>`;
}

function render(root, { L }) {
  const T = (k) => L(I18N[k]);
  const S = {
    area: 100, density: 120, shr: 0.75, roomT: 24, supplyT: 12,
    occArea: 100, occDensity: 5, perPerson: 10, perSqm: 0.3,
    brand: 'trane', unit: 'AHU', flowUnit: 'L/s', flow: 575,
  };
  const sel = new Set(['mix', 'c8', 'hc', 'fan']);
  const redraws = [];
  const notify = () => { for (const fn of redraws) fn(); };
  const models = () => (S.brand === 'savier' ? SAVIER_MODELS : AHU_MODELS);
  const flowLps = () => (S.flowUnit === 'L/s' ? S.flow : S.flow / 3.6);

  // ---- 1) Supply-flow estimation (workbook B19:F27) ----
  const estBox = h('div');
  root.append(card(T('estFlow'), T('estFlowSub'), (body) => {
    const f = form([
      { key: 'area', label: T('area'), unit: 'm²', def: S.area },
      { key: 'density', label: T('density'), unit: 'W/m²', def: S.density },
      { key: 'shr', label: T('shr'), unit: '0–1', def: S.shr, step: '0.01' },
      { key: 'roomT', label: T('roomT'), unit: '°C', def: S.roomT },
      { key: 'supplyT', label: T('supplyT'), unit: '°C', def: S.supplyT },
    ], (a) => { Object.assign(S, a); notify(); }, 'grid4', 'est-');
    body.append(f.grid, estBox);
    redraws.push(() => {
      const loadKw = S.area > 0 && S.density > 0 ? S.area * S.density / 1000 : null;
      const sensKw = loadKw != null ? loadKw * S.shr : null;
      const dT = S.roomT - S.supplyT;
      const lpsWb = sensKw != null ? supplyFlowLps(sensKw, dT, WORKBOOK_RHOCP) : null;
      const lpsEngine = sensKw != null ? supplyFlowLps(sensKw, dT, 1.213) : null;
      if (loadKw == null || !(dT > 0)) {
        results(estBox, []);
        if (loadKw != null && !(dT > 0)) estBox.append(flag(L({ en: 'Room temperature must exceed supply temperature.', zh: '室內溫度必須高於送風溫度。' }), 'bad'));
        return;
      }
      results(estBox, [
        res(T('coolingLoad'), loadKw, 'kW', { digits: 1 }),
        res(T('sensibleLoad'), sensKw, 'kW', { digits: 1, big: true }),
        res(T('supplyFlow'), lpsWb, 'L/s', { digits: 1, big: true }),
        res(T('supplyFlow'), lpsWb * 3.6, 'CMH', { digits: 0 }),
        res(T('wbParity'), lpsWb, 'L/s', { digits: 1 }),
        res(T('engineParity'), lpsEngine, 'L/s', { digits: 1 }),
      ]);
      estBox.append(h('div', { class: 'note' },
        T('supplyFlow') + ' = ' + sensKw.toFixed(2) + ' kW ÷ 1.23 ÷ ' + dT.toFixed(1) + ' K × 1000 = ' +
        lpsWb.toFixed(1) + ' L/s'));
      estBox.append(h('div', { class: 'note' }, T('wbNote')));
    });
  }, { src: 'AHU!B19:F27', formula: 'Qs = density·area·SHR/1000;  L/s = Qs / ρcp / (t_room − t_supply) × 1000' }));

  // ---- 2) Fresh-air estimation (workbook B30:F40) ----
  const freshBox = h('div');
  root.append(card(T('estFresh'), T('estFreshSub'), (body) => {
    const f = form([
      { key: 'occArea', label: T('area'), unit: 'm²', def: S.occArea },
      { key: 'occDensity', label: T('occDensity'), unit: 'm²/person', def: S.occDensity },
      { key: 'perPerson', label: T('perPerson'), unit: 'L/s·p', def: S.perPerson },
      { key: 'perSqm', label: T('perSqm'), unit: 'L/s·m²', def: S.perSqm, step: '0.01' },
    ], (a) => { Object.assign(S, a); notify(); }, 'grid4', 'fr-');
    body.append(f.grid, freshBox);
    redraws.push(() => {
      const pop = S.occDensity > 0 ? S.occArea / S.occDensity : null;
      if (pop == null || !(S.occArea > 0)) { results(freshBox, []); return; }
      const byPerson = pop * S.perPerson;
      const byArea = S.occArea * S.perSqm;
      results(freshBox, [
        res(T('population'), pop, 'people', { digits: 0, big: true }),
        res(T('totalFresh') + ' · ' + T('wbSum'), byPerson + byArea, 'L/s', { digits: 1, big: true }),
        res(T('totalFresh') + ' · ' + T('maxRule'), Math.max(byPerson, byArea), 'L/s', { digits: 1 }),
        res(L({ en: 'By people', zh: '按人數' }), byPerson, 'L/s', { digits: 1 }),
        res(L({ en: 'By area', zh: '按面積' }), byArea, 'L/s', { digits: 1 }),
        res(T('totalFresh'), (byPerson + byArea) * 3.6, 'CMH', { digits: 0 }),
      ]);
      freshBox.append(h('div', { class: 'note' },
        pop.toFixed(0) + ' people × ' + S.perPerson + ' + ' + S.occArea + ' m² × ' + S.perSqm +
        ' = ' + (byPerson + byArea).toFixed(1) + ' L/s' +
        L({ en: ' (workbook adds both requirements)', zh: '（原檔把兩項相加）' })));
    });
  }, { src: 'AHU!B30:F40', formula: 'population = area / occupancy density;  total = area·L/s·m² + population·L/s·p' }));

  // ---- 3) Quick selection (workbook L2:U28 and W2:AF28) ----
  const pickBox = h('div');
  root.append(card(T('quick'), T('quickSub'), (body) => {
    const brandRow = h('div', { class: 'grid3' },
      h('div', { class: 'field' }, h('label', {}, T('brand')),
        seg([{ v: 'trane', label: 'Trane CLCP' }, { v: 'savier', label: 'Savier A1' }], S.brand,
          (v) => { S.brand = v; notify(); })),
      h('div', { class: 'field' }, h('label', {}, T('unit')),
        seg([{ v: 'AHU', label: T('ahu') }, { v: 'PAU', label: T('pau') }], S.unit,
          (v) => { S.unit = v; notify(); })),
      h('div', { class: 'field' }, h('label', {}, T('flowUnit')),
        seg([{ v: 'L/s', label: 'L/s' }, { v: 'CMH', label: 'CMH' }], S.flowUnit,
          (v) => { S.flowUnit = v; notify(); })));
    const f = form([
      { key: 'flow', label: T('flow'), unit: S.flowUnit, def: S.flow },
    ], (a) => { S.flow = a.flow; notify(); }, 'grid2', 'sel-');
    const selForm = f;
    const useBtn = h('button', {
      type: 'button', class: 'btn',
      onclick: () => {
        // Pull the flow estimated in card 1 (workbook E27) into the selection. form.set() is used so the
        // visible input follows the state — writing S directly left the field showing the old number.
        const loadKw = S.area * S.density / 1000;
        const lps = supplyFlowLps(loadKw * S.shr, S.roomT - S.supplyT, WORKBOOK_RHOCP);
        S.flowUnit = 'L/s';
        S.flow = +lps.toFixed(1);
        selForm.set('flow', S.flow);
      },
    }, T('useEst'));
    const schBox = h('div', { class: 'chart-box' });
    body.append(brandRow, f.grid, h('div', { class: 'preset-actions' }, useBtn), pickBox, schBox);
    redraws.push(() => {
      const need = flowLps();
      const key = S.unit === 'AHU' ? 'ahuLs' : 'pauLs';
      const cmhKey = S.unit === 'AHU' ? 'ahuCMH' : 'pauCMH';
      const pick = models().find((m) => m[key] >= need);
      if (!(need > 0)) { results(pickBox, []); schBox.innerHTML = ''; return; }
      if (!pick) {
        results(pickBox, [res(T('noModel'), '—', '', { err: true })]);
        schBox.innerHTML = '';
        return;
      }
      const len = FRAME_ALLOWANCE_MM + COMP_KEYS.reduce((s, [k]) => {
        if (!sel.has(k)) return s;
        const idx = COMP_KEYS.findIndex((x) => x[0] === k);
        return s + (Number(pick.comps ? pick.comps[idx] : 0) || 0);
      }, 0);
      results(pickBox, [
        res(T('model'), pick.id, '', { big: true }),
        res(T('flowT'), pick[cmhKey], 'CMH', { digits: 0 }),
        res(T('flowT'), pick[key], 'L/s', { digits: 1 }),
        res(T('dims'), pick.L + ' × ' + pick.W + ' × ' + pick.H, 'mm'),
        res(T('len'), len, 'mm', { digits: 0, big: true }),
        res(L({ en: 'Headroom over the design flow', zh: '相對設計風量餘量' }), (pick[key] / need - 1) * 100, '%', { digits: 1 }),
      ]);
      if (!pick.comps || !pick.comps.some((v) => v)) {
        pickBox.append(flag(L({ en: 'This model has no section lengths in the workbook, so the schematic shows the frame only.', zh: '原檔此型號未列功能段長度，示意圖只顯示框架。' }), 'info'));
      }
      schBox.innerHTML = ahuSchematicSVG(pick, sel);
      pickBox.append(h('div', { class: 'note' }, T('frameNote')));
    });
  }, { src: 'AHU!L2:U28 (Trane CLCP) · W2:AF28 (Savier A1) · frame note L29/W29' }));

  // ---- 4) Component selection + schematic (workbook B2:H18) ----
  root.append(card(T('sections'), T('sectionsSub'), (body) => {
    const compWrap = h('div', { class: 'grid3' });
    for (const [key, label] of COMP_KEYS) {
      const cb = h('input', { type: 'checkbox' });
      cb.checked = sel.has(key);
      cb.addEventListener('change', () => {
        if (cb.checked) sel.add(key); else sel.delete(key);
        notify();
      });
      compWrap.append(h('label', { class: 'check' }, cb, label));
    }
    body.append(compWrap, h('div', { class: 'note' }, T('legend')));
  }, { src: 'AHU!B2:H18 (Select AHU/PAU Components)' }));

  // ---- 5) Catalogue tables (folded) ----
  const mkTable = (list, title) => {
    const tbl = h('table', { class: 'pipes-table' });
    tbl.append(h('thead', {}, h('tr', {},
      h('th', {}, 'Model'), h('th', {}, 'AHU CMH'), h('th', {}, 'AHU L/s'),
      h('th', {}, 'PAU CMH'), h('th', {}, 'PAU L/s'), h('th', {}, 'L×W×H mm'))));
    const tb = h('tbody');
    for (const m of list) {
      tb.append(h('tr', {},
        h('td', {}, m.id), h('td', { class: 'num' }, String(m.ahuCMH)), h('td', { class: 'num' }, String(m.ahuLs)),
        h('td', { class: 'num' }, String(m.pauCMH)), h('td', { class: 'num' }, String(m.pauLs)),
        h('td', { class: 'num' }, m.L + '×' + m.W + '×' + m.H)));
    }
    tbl.append(tb);
    return fold(title + ' — ' + list.length, card(title, '', (body2) => {
      body2.append(h('div', { class: 'table-scroll' }, tbl));
      body2.append(h('div', { class: 'note' }, T('frameNote')));
    }, { src: title === 'Trane CLCP' ? 'AHU!L7:U28' : 'AHU!W7:AF28', collapsed: true }));
  };
  root.append(mkTable(AHU_MODELS, 'Trane CLCP'));
  root.append(mkTable(SAVIER_MODELS, 'Savier A1'));

  notify();
}

register({
  id: 'ahu', icon: '🏗️', group: 'equipment', title: I18N.title, desc: I18N.desc,
  src: 'Trane HK CLCP · Savier A1 · workbook AHU sheet',
  render,
});
