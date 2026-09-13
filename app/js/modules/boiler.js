// Module: Boiler (鍋爐) — rebuilt from the workbook 'Boiler' sheet.
//
// Workbook layout being mirrored (print area 'Boiler'!$B$2:$AC$47):
//   B8:F16   Unit Conversion — one capacity value in Ton/hr, kg/hr, kW, HP, Btu/h, kcal/hr
//   G2:L30   Steam Boiler Plant — Nos. of boiler, capacity each (Ton/hr), total plant capacity,
//            physical facts (weight, L/W/H), chimney, fuel (diesel and gas, each and total) and the
//            other connections per boiler (diesel, safety vent, bleed off, water in, steam out, power)
//   M5:P25   auxiliaries — deaerator, condensate tank, and the two pump rules
//   S2:V45   Hot Water Boiler Plant — the same shape in MW plus supply/return/ΔT and
//            'Flow Rate per boiler = kW / 4.185 / ΔT'
//   Y2:AA11  Combined chimney — boilers 1…5 and the combined stack
//   AD31:AR51 the technical tables that drive both plant blocks (kept in data/boiler_plant.js)
//
// The workbook ships this page as a template: the labels and formulas are there but the value cells are
// empty, so everything below follows from choosing a boiler in the technical table. The vendor
// comparison block at AD54:AN73 is deliberately not shipped — data/boiler_plant.js records the measured
// reason (weights repeat across vendors, dimensions are duplicated).
import { register } from '../registry.js';
import { h, res, flag, card, form, results, seg, fold } from '../ui.js';
import { CONV, waterFlow, feedPumpFlowM3h } from '../engine/fluids.js';
import { tdpFromPw } from '../engine/psychro.js';
import {
  STEAM_BOILERS, HOT_WATER_BOILERS, BOILER_REFERENCES, AUXILIARY_RULES, FUEL,
} from '../data/boiler_plant.js';

const I18N = {
  title: { en: 'Boiler House', zh: '鍋爐房' },
  desc: {
    en: 'Boiler-house sizing from the workbook: pick a packaged boiler from the technical table and the plant capacity, fuel rates, connections, weight and dimensions follow — steam and hot water side by side.',
    zh: '照原檔做鍋爐房選型：由技術表揀一個成套鍋爐，全廠容量、燃料量、接口、重量與尺寸自動跟隨 —— 蒸汽與熱水兩邊並列。',
  },
  conv: { en: 'Unit Conversion', zh: '容量單位換算' },
  cap: { en: 'Capacity', zh: '容量' },
  steamPlant: { en: 'Steam Boiler Plant (Ton/hr)', zh: '蒸汽鍋爐房（Ton/hr）' },
  hotPlant: { en: 'Hot Water Boiler Plant (MW)', zh: '熱水鍋爐房（MW）' },
  plantSub: {
    en: 'Choose the unit capacity; the technical table supplies every other figure. "Nos." multiplies the plant totals.',
    zh: '揀單機容量，其餘數據由技術表提供；「台數」會乘算全廠總值。',
  },
  nos: { en: 'Nos. of boiler', zh: '鍋爐台數' },
  capEach: { en: 'Boiler capacity (each)', zh: '單機容量' },
  total: { en: 'Total plant capacity', zh: '全廠總容量' },
  waterTemp: { en: 'Water temperatures', zh: '水溫' },
  supply: { en: 'Supply', zh: '供水' },
  ret: { en: 'Return', zh: '回水' },
  dT: { en: 'ΔT', zh: '溫差 ΔT' },
  pumpFlow: { en: 'Boiler pump flow per boiler', zh: '單機鍋爐泵流量' },
  weight: { en: 'Weight (each)', zh: '單機重量' },
  dims: { en: 'L × W × H (each)', zh: '長 × 闊 × 高（單機）' },
  footprint: { en: 'Plant-room footprint', zh: '鍋爐房佔地' },
  chimney: { en: 'Chimney min. size', zh: '煙囪最小尺寸' },
  fuel: { en: 'Fuel', zh: '燃料' },
  diesel: { en: 'Diesel 輕油', zh: '輕油' },
  gas: { en: 'Natural gas', zh: '天然氣' },
  each: { en: 'Each', zh: '單機' },
  safetyVent: { en: 'Safety vent / valve', zh: '安全閥' },
  bleedOff: { en: 'Bleed off', zh: '排污' },
  waterIn: { en: 'Water in', zh: '進水' },
  waterOut: { en: 'Water / steam out', zh: '出水／出汽' },
  power: { en: 'Power', zh: '電功率' },
  aux: { en: 'Auxiliaries (deaerator · tank · pumps)', zh: '輔助設備（除氧器 · 水箱 · 水泵）' },
  auxSub: {
    en: 'The workbook sizes these from the steam rate: feed pump = ton/hr × 1.13 × 1.1, deaerator pump = 1.2–1.5 × that, and the vessels from their storage duration.',
    zh: '原檔按蒸汽量定尺寸：給水泵 ＝ ton/hr × 1.13 × 1.1，除氧水泵 ＝ 其 1.2–1.5 倍，容器則按儲存時間推算。',
  },
  deaerator: { en: 'Deaerator', zh: '除氧器' },
  storage: { en: 'Storage duration', zh: '儲存時間' },
  usage: { en: 'Continuous usage', zh: '連續使用率' },
  quantity: { en: 'Quantity', zh: '數量' },
  capEachKg: { en: 'Capacity (each)', zh: '容量（單台）' },
  condTank: { en: 'Condensate tank', zh: '凝結水箱' },
  feedPump: { en: 'Boiler feed pump', zh: '鍋爐給水泵' },
  deaPump: { en: 'Deaerator pump', zh: '除氧水泵' },
  flowRate: { en: 'Flow rate', zh: '流量' },
  combined: { en: 'Combined Chimney', zh: '併合煙囪' },
  combinedSub: {
    en: 'The workbook lists Boiler 1…5 and the combined stack. Individual stack sizes are added by area here — the equal-area equivalent-diameter relation used elsewhere in this app.',
    zh: '原檔列出鍋爐 1–5 與併合煙囪。此處按面積相加（等效直徑）計算併合煙囪，與本 App 其他部分一致。',
  },
  stackEach: { en: 'Stack per boiler', zh: '單機煙囪' },
  stackCombined: { en: 'Combined stack Ø', zh: '併合煙囪 Ø' },
  stackArea: { en: 'Stack area', zh: '煙囪截面積' },
  impliedEff: { en: 'Implied efficiency of the printed fuel rate', zh: '表列燃料量隱含效率' },
  effNote: {
    en: 'Computed from 2257 kJ/kg of steam against the printed diesel / gas rate. The table lands near 70 %, below a modern packaged boiler (88–92 % LHV), so treat the fuel columns as conservative.',
    zh: '按每公斤蒸汽 2257 kJ 與表列輕油／天然氣量計算。表列值約 70%，低於現今成套鍋爐（LHV 88–92%），故燃料欄宜視為保守值。',
  },
  effLow: { en: 'below modern practice — treat as conservative', zh: '低於現今水平 — 宜視為保守值' },
  table: { en: 'Technical table (workbook)', zh: '技術表（原檔）' },
  tableSub: {
    en: 'The full printed table; the row in use is highlighted. Cell ranges are shown in the source line.',
    zh: '原檔完整表格，使用中嘅行會高亮；儲存格範圍見下方出處。',
  },
  steam: { en: 'Steam', zh: '蒸汽' },
  hot: { en: 'Hot water', zh: '熱水' },
  steamExpansion: { en: 'Steam pressure & expansion tank', zh: '蒸汽壓力與膨脹水箱' },
  p: { en: 'Steam pressure', zh: '蒸汽壓力' },
  kwUseful: { en: 'Boiler useful output', zh: '鍋爐有效輸出' },
  vol: { en: 'System water volume', zh: '系統水容量' },
  tsat: { en: 'Saturation temperature', zh: '飽和溫度' },
  hfg: { en: 'Latent heat hfg', zh: '汽化熱 hfg' },
  expansion: { en: 'Expansion volume', zh: '膨脹容積' },
  steamRate: { en: 'Equivalent steam rate', zh: '等效蒸汽量' },
  addBoiler: { en: 'Add the selected steam boiler', zh: '加入所選蒸汽鍋爐' },
  clear: { en: 'Clear', zh: '清除' },
};

/** Steam duty of one ton/hour (2257 kJ/kg) in kW — the workbook's own conversion. */
const TON_KW = 627.0;

function render(root, { L }) {
  const T = (k) => L(I18N[k]);
  const S = {
    capTon: 1,
    steam: { nos: 2, ton: 2 },
    hot: { nos: 2, mw: 1.7441860465, supply: 90, ret: 70 },
    aux: { storage: 20, usage: 1.0, quantity: 1, condStorage: 20 },
  };
  const stacks = [];
  let which = 'steam';
  const redraws = [];
  const notify = () => { for (const fn of redraws) fn(); };

  const steamRow = () => STEAM_BOILERS.find((b) => b.ton === S.steam.ton) ?? STEAM_BOILERS[0];
  const hotRow = () => HOT_WATER_BOILERS.find((b) => Math.abs(b.mw - S.hot.mw) < 1e-6) ?? HOT_WATER_BOILERS[0];

  // ---- 1) Unit conversion (workbook B8:F16) ----
  root.append(card(T('conv'), '', (body) => {
    const f = form([
      { key: 'capTon', label: T('cap') + ' (Ton/hr)', def: S.capTon },
    ], (a) => { S.capTon = a.capTon; notify(); }, 'grid2', 'bcv-');
    const box = h('div');
    body.append(f.grid, box);
    redraws.push(() => {
      const ton = S.capTon;
      if (!(ton > 0)) { results(box, []); return; }
      results(box, [
        res(T('cap'), ton, 'Ton/hr', { digits: 3, big: true }),
        res(T('cap'), ton * 1000, 'kg/hr', { digits: 0, big: true }),
        res(T('cap'), ton * TON_KW, 'kW', { digits: 1 }),
        res(T('cap'), ton * TON_KW * CONV.KCAL_PER_KW, 'kcal/h', { digits: 0 }),
        res(T('cap'), ton * TON_KW * CONV.BTUH_PER_KW, 'Btu/h', { digits: 0 }),
        res(T('cap'), ton * TON_KW / 0.7457, 'HP', { digits: 1 }),
      ]);
      box.append(h('div', { class: 'note' }, L({
        en: 'One ton of steam per hour counts as 627 kW (2257 kJ/kg) — the workbook’s own convention (its hot-water table uses 0.6977 MW per Ton/hr, the same duty at 90 % efficiency).',
        zh: '每小時 1 噸蒸汽按 627 kW 計（2257 kJ/kg），與原檔一致（原檔熱水表用 0.6977 MW per Ton/hr，即同負荷之 90% 效率值）。',
      })));
    });
  }, { src: 'Boiler!B8:F16', formula: '1 Ton/hr = 1000 kg/hr = 627 kW (2257 kJ/kg)' }));

  // ---- 2) Plant blocks, steam | hot water side by side (G2:L30 and S2:V45) ----
  const steamBox = h('div');
  const hotBox = h('div');
  root.append(card(T('steamPlant') + ' ｜ ' + T('hotPlant'), T('plantSub'), (body) => {
    const grid = h('div', { class: 'grid2' });

    const steamCol = h('div', { class: 'panel-col' });
    steamCol.append(h('div', { class: 'panel-col-head' }, T('steamPlant')));
    const steamForm = form([
      { key: 'nos', label: T('nos'), unit: 'nos.', def: S.steam.nos, step: '1' },
      { key: 'ton', label: T('capEach') + ' (Ton/hr)', def: S.steam.ton, step: '0.5' },
    ], (a) => { S.steam.nos = a.nos; S.steam.ton = a.ton; notify(); }, 'grid2', 'sb-');
    steamCol.append(steamForm.grid, steamBox);

    const hotCol = h('div', { class: 'panel-col' });
    hotCol.append(h('div', { class: 'panel-col-head' }, T('hotPlant')));
    const hotForm = form([
      { key: 'nos', label: T('nos'), unit: 'nos.', def: S.hot.nos, step: '1' },
      { key: 'supply', label: T('supply'), unit: '°C', def: S.hot.supply },
      { key: 'ret', label: T('ret'), unit: '°C', def: S.hot.ret },
      { key: 'mw', label: T('capEach') + ' (MW)', def: S.hot.mw, step: '0.05' },
    ], (a) => { S.hot.nos = a.nos; S.hot.supply = a.supply; S.hot.ret = a.ret; S.hot.mw = a.mw; notify(); }, 'grid2', 'hb-');
    hotCol.append(hotForm.grid, hotBox);

    grid.append(steamCol, hotCol);
    body.append(grid);

    redraws.push(() => {
      // --- steam plant ---
      const b = steamRow();
      const nos = Math.max(1, Math.round(S.steam.nos) || 1);
      const totalTon = b.ton * nos;
      const effSteam = (b.ton * FUEL.steamMJperTon) / (b.diesel * FUEL.dieselMJperKg);
      results(steamBox, [
        res(T('capEach'), b.ton, 'Ton/hr', { digits: 2 }),
        res(T('total'), totalTon, 'Ton/hr', { digits: 2, big: true }),
        res(T('total'), totalTon * TON_KW, 'kW', { digits: 0 }),
        res(L({ en: 'Steam duty', zh: '蒸汽熱量' }), totalTon * TON_KW / 1000, 'MW', { digits: 2 }),
        res(T('nos'), nos, 'nos.', { digits: 0 }),
        res(T('chimney'), b.chimney, 'mm ⌀', { digits: 0 }),
        res(T('diesel') + ' · ' + T('each'), b.diesel, 'kg/hr', { digits: 1 }),
        res(T('diesel') + ' · ' + T('total'), b.diesel * nos, 'kg/hr', { digits: 1, big: true }),
        res(T('gas') + ' · ' + T('each'), b.gas, 'Nm³/hr', { digits: 0 }),
        res(T('gas') + ' · ' + T('total'), b.gas * nos, 'Nm³/hr', { digits: 0, big: true }),
        res(T('weight'), b.weight, 'kg', { digits: 0 }),
        res(T('weight') + ' · ' + T('total'), b.weight * nos, 'kg', { digits: 0 }),
        res(T('dims'), b.length + ' × ' + b.width + ' × ' + b.height, 'mm', { digits: 0 }),
        res(T('footprint'), (b.length * b.width * nos / 1e6), 'm²', { digits: 1 }),
        res(T('safetyVent'), b.safetyValve, 'DN', { digits: 0 }),
        res(T('bleedOff'), b.bleedOff, 'DN', { digits: 0 }),
        res(T('waterIn'), b.waterIn, 'DN', { digits: 0 }),
        res(L({ en: 'Steam out', zh: '出汽' }), b.steamOut, 'DN', { digits: 0 }),
        res(T('power') + ' · ' + T('each'), b.power, 'kW', { digits: 1 }),
        res(T('power') + ' · ' + T('total'), b.power * nos, 'kW', { digits: 1 }),
        res(L({ en: 'Gas connection', zh: '燃氣接口' }), b.gasDn, 'DN', { digits: 0 }),
        res(T('impliedEff'), effSteam * 100, '%', { digits: 1, warn: effSteam < 0.85 }),
      ]);
      if (effSteam < 0.85) steamBox.append(flag(T('effLow'), 'warn'));
      steamBox.append(h('div', { class: 'note' }, T('effNote')));

      // --- hot water plant ---
      const w = hotRow();
      const wnos = Math.max(1, Math.round(S.hot.nos) || 1);
      const dT = S.hot.supply - S.hot.ret;
      const kWEach = w.mw * 1000;
      const flowEach = waterFlow(kWEach, dT);
      const effHot = (w.mw * 1000 * 3600 / 1000) / (w.diesel * FUEL.dieselMJperKg);
      results(hotBox, [
        res(T('capEach'), w.mw, 'MW', { digits: 3 }),
        res(T('total'), w.mw * wnos, 'MW', { digits: 3, big: true }),
        res(T('total'), w.mw * wnos * 1000 / TON_KW, 'Ton/hr', { digits: 2 }),
        res(T('dT'), dT, '°C', { digits: 1, warn: !(dT > 0) }),
        res(T('pumpFlow'), flowEach, 'L/s', { digits: 2, big: true }),
        res(T('pumpFlow'), flowEach * 3.6, 'm³/hr', { digits: 2 }),
        res(T('nos'), wnos, 'nos.', { digits: 0 }),
        res(T('chimney'), w.chimney, 'mm ⌀', { digits: 0 }),
        res(T('diesel') + ' · ' + T('each'), w.diesel, 'kg/hr', { digits: 1 }),
        res(T('diesel') + ' · ' + T('total'), w.diesel * wnos, 'kg/hr', { digits: 1, big: true }),
        res(T('gas') + ' · ' + T('each'), w.gas, 'Nm³/hr', { digits: 0 }),
        res(T('gas') + ' · ' + T('total'), w.gas * wnos, 'Nm³/hr', { digits: 0, big: true }),
        res(T('weight'), w.weight, 'kg', { digits: 0 }),
        res(T('dims'), w.length + ' × ' + w.width + ' × ' + w.height, 'mm', { digits: 0 }),
        res(T('footprint'), (w.length * w.width * wnos / 1e6), 'm²', { digits: 1 }),
        res(T('waterIn'), w.waterIn, 'DN', { digits: 0 }),
        res(L({ en: 'Water out', zh: '出水' }), w.waterOut, 'DN', { digits: 0 }),
        res(T('safetyVent'), w.safetyValve, 'DN', { digits: 0 }),
        res(T('bleedOff'), w.bleedOff, 'DN', { digits: 0 }),
        res(T('power') + ' · ' + T('each'), w.power, 'kW', { digits: 1 }),
        res(T('power') + ' · ' + T('total'), w.power * wnos, 'kW', { digits: 1 }),
        res(T('impliedEff'), effHot * 100, '%', { digits: 1, warn: effHot < 0.85 }),
      ]);
      if (dT <= 0) hotBox.append(flag(L({ en: 'Supply must be above return.', zh: '供水溫度必須高於回水。' }), 'bad'));
      hotBox.append(h('div', { class: 'note' }, L({
        en: 'Pump flow = kW / 4.186789 / ΔT = ' + flowEach.toFixed(2) + ' L/s (the workbook writes the constant as 4.185 — 0.04 % apart).',
        zh: '水泵流量 ＝ kW ÷ 4.186789 ÷ ΔT ＝ ' + flowEach.toFixed(2) + ' L/s（原檔常數寫 4.185，相差 0.04%）。',
      })));
    });
  }, { src: 'Boiler!G2:L30 (steam) · S2:V45 (hot water) · tables AD32:AR37 / AD43:AR51',
    formula: 'pump L/s = kW / (4.186789 · ΔT);  1 Ton/hr steam = 627 kW' }));

  // ---- 3) Auxiliaries (workbook M5:P25) ----
  root.append(card(T('aux'), T('auxSub'), (body) => {
    const f = form([
      { key: 'storage', label: T('deaerator') + ' ' + T('storage'), unit: 'min', def: S.aux.storage },
      { key: 'usage', label: T('usage'), unit: '0–1', def: S.aux.usage },
      { key: 'quantity', label: T('deaerator') + ' ' + T('quantity'), unit: 'nos.', def: S.aux.quantity, step: '1' },
      { key: 'condStorage', label: T('condTank') + ' ' + T('storage'), unit: 'min', def: S.aux.condStorage },
    ], (a) => { Object.assign(S.aux, a); notify(); }, 'grid4', 'aux-');
    const box = h('div');
    body.append(f.grid, box);
    redraws.push(() => {
      const ton = steamRow().ton * Math.max(1, Math.round(S.steam.nos) || 1);
      const feedM3h = feedPumpFlowM3h(ton, AUXILIARY_RULES.feedPumpMargin, AUXILIARY_RULES.feedPumpFactor);
      const feedLps = feedM3h / 3.6;
      const usage = S.aux.usage ?? 1;
      results(box, [
        res(T('feedPump') + ' ' + T('flowRate'), feedM3h, 'm³/hr', { digits: 2, big: true }),
        res(T('feedPump') + ' ' + T('flowRate'), feedLps, 'L/s', { digits: 2 }),
        res(T('deaPump') + ' (min)', feedM3h * AUXILIARY_RULES.deaeratorPumpMin, 'm³/hr', { digits: 2 }),
        res(T('deaPump') + ' (max)', feedM3h * AUXILIARY_RULES.deaeratorPumpMax, 'm³/hr', { digits: 2 }),
        res(T('deaerator') + ' ' + T('quantity'), S.aux.quantity, 'nos.', { digits: 0 }),
        res(T('deaerator') + ' ' + T('capEachKg'), S.aux.quantity > 0 ? ton * 1000 * (S.aux.storage / 60) * usage / S.aux.quantity : NaN, 'kg', { digits: 0 }),
        res(T('condTank') + ' ' + T('capEachKg'), ton * 1000 * (S.aux.condStorage / 60) * usage, 'kg', { digits: 0 }),
        res(L({ en: 'Steam rate used', zh: '採用蒸汽量' }), ton, 'Ton/hr', { digits: 2 }),
      ]);
      box.append(h('div', { class: 'note' },
        L({ en: 'Feed pump = ', zh: '給水泵 ＝ ' }) + ton.toFixed(2) + ' Ton/hr × (1 + 0.13) × 1.1 = ' +
        feedM3h.toFixed(2) + ' m³/hr · ' + L({ en: 'deaerator pump = 1.2–1.5 × that (workbook N16 / N22)', zh: '除氧水泵 ＝ 其 1.2–1.5 倍（原檔 N16／N22）' })));
    });
  }, { src: 'Boiler!M5:P25 · N16 feed pump · N22 deaerator pump' }));

  // ---- 4) Combined chimney (workbook Y2:AA11) ----
  root.append(card(T('combined'), T('combinedSub'), (body) => {
    const btnRow = h('div', { class: 'preset-actions' },
      h('button', { type: 'button', class: 'btn', onclick: () => { stacks.push(steamRow().chimney); notify(); } }, T('addBoiler')),
      h('button', { type: 'button', class: 'btn', onclick: () => { stacks.length = 0; notify(); } }, T('clear')));
    const box = h('div');
    body.append(btnRow, box);
    redraws.push(() => {
      const each = stacks.length ? stacks : [steamRow().chimney];
      const dia = Math.sqrt(each.reduce((s, d) => s + d * d, 0));
      results(box, [
        res(T('nos'), each.length, 'nos.', { digits: 0 }),
        res(T('stackEach'), each.join(' + ') + ' mm ⌀', '', { digits: 0 }),
        res(T('stackCombined'), dia, 'mm ⌀', { digits: 0, big: true }),
        res(T('stackArea'), Math.PI * Math.pow(dia / 2000, 2), 'm²', { digits: 3 }),
      ]);
      box.append(h('div', { class: 'note' }, L({
        en: 'Combined Ø = √(Σd²) — equal-area addition. The workbook leaves this column empty, so the relation used is stated rather than copied.',
        zh: '併合 Ø ＝ √(Σd²) —— 按面積相加。原檔此欄為空，故列明所用關係而非照抄。',
      })));
    });
  }, { src: 'Boiler!Y2:AA11 (boilers 1–5, combined stack)' }));

  // ---- 5) Technical table (workbook AD31:AR51) ----
  root.append(card(T('table'), T('tableSub'), (body) => {
    const holder = h('div');
    const segRow = h('div', { class: 'field' }, h('label', {}, T('table')),
      seg([{ v: 'steam', label: T('steam') + ' (Ton/hr)' }, { v: 'hot', label: T('hot') + ' (MW)' }],
        which, (v) => { which = v; notify(); }));
    body.append(segRow, holder);
    redraws.push(() => {
      holder.innerHTML = '';
      const tbl = h('table', { class: 'pipes-table boiler-table' });
      const head = which === 'steam'
        ? ['Ton/hr', T('chimney'), 'Diesel kg/hr', 'Gas Nm³/hr', T('safetyVent'), T('bleedOff'),
          T('waterIn'), L({ en: 'Steam out', zh: '出汽' }), T('power') + ' kW', 'kg', 'L', 'W', 'H']
        : ['MW', T('chimney'), 'Diesel kg/hr', 'Gas Nm³/hr', T('waterIn'), L({ en: 'Water out', zh: '出水' }),
          T('power') + ' kW', T('safetyVent'), T('bleedOff'), 'kg', 'L', 'W', 'H'];
      tbl.append(h('thead', {}, h('tr', {}, ...head.map((x) => h('th', {}, x)))));
      const tb = h('tbody');
      if (which === 'steam') {
        for (const b of STEAM_BOILERS) {
          tb.append(h('tr', { class: b.ton === S.steam.ton ? 'sel' : '' },
            ...[b.ton, b.chimney, b.diesel, b.gas, b.safetyValve, b.bleedOff, b.waterIn, b.steamOut,
              b.power, b.weight, b.length, b.width, b.height].map((x) => h('td', { class: 'num' }, String(x)))));
        }
      } else {
        for (const b of HOT_WATER_BOILERS) {
          const on = Math.abs(b.mw - S.hot.mw) < 1e-6;
          tb.append(h('tr', { class: on ? 'sel' : '' },
            ...[b.mw.toFixed(3), b.chimney, b.diesel, b.gas, b.waterIn, b.waterOut, b.power,
              b.safetyValve, b.bleedOff, b.weight, b.length, b.width, b.height]
              .map((x) => h('td', { class: 'num' }, String(x)))));
        }
      }
      tbl.append(tb);
      holder.append(h('div', { class: 'table-scroll' }, tbl));
      for (const r of BOILER_REFERENCES) holder.append(h('div', { class: 'note' }, '· ' + L(r)));
      holder.append(h('div', { class: 'note' }, L({
        en: 'The workbook also carries an Ebara / Fulton / Shuangliang comparison whose weights repeat across vendors and whose dimensions are duplicated — not shipped; see data/boiler_plant.js.',
        zh: '原檔另有荏原／富爾頓／雙良比較表，但其重量在各廠之間重複、尺寸亦被複製 —— 故不收錄，詳見 data/boiler_plant.js。',
      })));
    });
  }, { src: 'Boiler!AD31:AR37 (steam) · AD42:AR51 (hot water) · references G33:G37 / S43:S45' }));

  // ---- 6) Steam pressure & expansion (kept from the earlier build, folded) ----
  root.append(fold(T('steamExpansion'), card(T('steamExpansion'), '', (body) => {
    const f = form([
      { key: 'p', label: T('p'), unit: 'bar', def: 5 },
      { key: 'kw', label: T('kwUseful'), unit: 'kW', def: 900 },
      { key: 'vol', label: T('vol'), unit: 'm³', def: 5 },
    ], draw, 'grid3', 'bse-');
    const box = h('div');
    body.append(f.grid, box);
    function draw(a) {
      if ([a.p, a.kw, a.vol].some((x) => x == null || x <= 0)) { results(box, []); return; }
      const tsat = tdpFromPw(a.p * 100);
      const hfg = 2257 * Math.pow((1 - tsat / 374.15) / (1 - 100 / 374.15), 0.38);
      results(box, [
        res(T('tsat'), tsat, '°C', { digits: 1 }),
        res(T('hfg'), hfg, 'kJ/kg', { digits: 0 }),
        res(T('steamRate'), a.kw * 3600 / hfg, 'kg/hr', { digits: 0, big: true }),
        res(T('expansion'), a.vol * 0.04, 'm³', { digits: 3 }),
      ]);
    }
    draw(f.all());
  }, { formula: 'Tsat = pws⁻¹(p);  hfg (Watson);  ṁ = Q/hfg;  expansion ≈ 4 % of system volume',
    src: 'IAPWS IF-97 · CIBSE expansion guidance' })));

  notify();
}

register({
  id: 'boiler', icon: '🔥', group: 'equipment', title: I18N.title, desc: I18N.desc,
  src: 'GB 50041-2008 · workbook Boiler sheet (vendor technical tables)',
  render,
});
