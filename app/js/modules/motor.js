// Module: Motor (馬達電力) — from 'Motor' sheet
import { register } from '../registry.js';
import { h, res, flag, card, form, results, seg, fold } from '../ui.js';
import * as E from '../engine/electrical.js';
import {
  MOTOR_RATINGS, ISOLATOR_SIZES, START_METHODS, EFFICIENCY_BY_FLOW, VOLTAGES,
  SIZING_DEFAULTS, PRESSURE_UNITS, PUMP_DEFAULTS,
} from '../data/motor_ratings.js';

const I18N = {
  title: { en: 'Motor Electrical', zh: '馬達電力計算' },
  desc: { en: 'Full-load current (1Ø/3Ø), torque unit conversion, starter recommendation and China climate zone.', zh: '滿載電流（單相／三相）、扭矩換算、起動方式建議、中國氣候分區。' },
};

function render(root, { L }) {
  const T = (k) => L(I18N[k]);
  let phase = '3';
  // Workbook-block state, declared before the cards that read it (a card's body runs immediately).
  let pickKw = 5.5;
  const sizeIn = { fanV: 1, fanPd: 1000, fanEffM: 0.7, fanEffF: 0.7, fanSF: 1.2, pumpV: 0.01, pumpH: 30, pumpEff: 0.8, pumpSF: 1.5 };
  const estIn = { compPa: 400, path: 40, pdPerM: 300, sf: 1.2, internal: 0, terminal: 30000, hx: 80000, height: 0 };
  const erIn = { H: 30, dt: 10, eta: 0.7, limit: 0.00865 };
  root.append(card(T('title'), T('desc'), (body) => {
    const phRow = h('div', { class: 'field' }, h('label', {}, L({ en: 'Phase', zh: '相數' })),
      seg([{ v: '1', label: '1Ø' }, { v: '3', label: '3Ø' }], phase, (v) => { phase = v; draw(f.all()); }));
    const f = form([
      { key: 'p', label: L({ en: 'Motor rating P', zh: '馬達功率 P' }), unit: 'kW', def: 5.5 },
      { key: 'v', label: L({ en: 'Voltage V', zh: '電壓 V' }), unit: 'V', def: 380 },
      { key: 'pf', label: L({ en: 'Power factor', zh: '功率因數' }), unit: '—', def: 0.85 },
      { key: 'eff', label: L({ en: 'Efficiency η', zh: '效率 η' }), unit: '—', def: 1 },
    ], (st) => draw(st), 'grid2');
    const box = h('div');
    body.append(phRow, f.grid, box);
    function draw(st) {
      if ([st.p, st.v, st.pf, st.eff].some((x) => x == null || x <= 0)) { results(box, []); return; }
      const i = phase === '3' ? E.current3Ph(st.p, st.v, st.pf, st.eff) : E.current1Ph(st.p, st.v, st.pf, st.eff);
      results(box, [
        res(L({ en: 'Full-load current', zh: '滿載電流' }), i, 'A', { digits: 1, big: true }),
        res(L({ en: 'Recommended starter', zh: '建議起動方式' }), E.starterFor(st.p), '', { digits: 0 }),
      ]);
      box.append(h('div', { class: 'note' },
        L({ en: 'Workbook parity: η = 1 (omits efficiency); typical motors η ≈ 0.82–0.95 — set nameplate η for safer cable sizing.', zh: '原檔相容：η＝1（忽略效率）；典型馬達 η≈0.82–0.95 — 輸入銘牌 η 可得更保守電纜選型。' })));
    }
    draw(f.all());
  }, { src: 'I = P/(V·pf·η) 1Ø; I = P/(√3·V·pf·η) 3Ø' }));

  root.append(card(L({ en: 'Torque Conversion', zh: '扭矩換算' }), '', (body) => {
    let box = null;
    const f = form([{ key: 'kgfm', label: L({ en: 'Torque', zh: '扭矩' }), unit: 'kgf·m', def: 10 }], (st) => {
      if (!box) return;
      results(box, [res(L({ en: 'Torque', zh: '扭矩' }), st.kgfm == null ? null : E.nm(st.kgfm), 'N·m', { digits: 2 })]);
    }, 'grid1');
    box = h('div');
    body.append(f.grid, box);
    results(box, [res(L({ en: 'Torque', zh: '扭矩' }), E.nm(10), 'N·m', { digits: 2 })]);
  }, { formula: '1 kgf·m = 9.80665 N·m (workbook used 9.804139432, −0.026%)' }));

  root.append(card(L({ en: 'Climate Zone (GB 50176)', zh: '氣候分區（GB 50176）' }), '', (body) => {
    let box = null;
    const f = form([{
      key: 'z', label: L({ en: 'Climate zone', zh: '氣候分區' }), def: 'SH', type: 'select',
      options: E.CN_CLIMATE.map((c) => ({ v: c.key, label: c.en + ' / ' + c.zh })),
    }], (st) => {
      if (!box) return;
      const z = E.CN_CLIMATE.find((c) => c.key === st.z);
      results(box, [res(L({ en: 'Climate zone', zh: '氣候分區' }), z ? z.en + ' · ' + z.zh : '—', '', { digits: 0, big: true })]);
    });
    box = h('div');
    body.append(f.grid, box);
    const z0 = E.CN_CLIMATE.find((c) => c.key === 'SH');
    results(box, [res(L({ en: 'Climate zone', zh: '氣候分區' }), z0.en + ' · ' + z0.zh, '', { digits: 0, big: true })]);
  }, { src: 'GB 50176 (workbook zone list)' }));

  root.append(card(L({ en: 'Heat Recovery ER Limits (GB 50189-2005 Tab. 5.3.27)', zh: '熱回收效率 ER 限值（GB 50189-2005 表 5.3.27）' }), '', (body) => {
    const rows = [
      ['嚴寒 Severe Cold', 0.00577], ['寒冷 Cold', 0.00433], ['夏熱冬冷 HSCW', 0.00865], ['夏熱冬暖 HSWW', 0.00673], ['溫和 Mild', 0.0241],
    ];
    const tbl = h('table', { class: 'pipes-table' });
    tbl.append(h('tr', {}, h('th', {}, 'Zone'), h('th', {}, 'ER limit')));
    for (const [z, v] of rows) tbl.append(h('tr', {}, h('td', {}, z), h('td', {}, String(v))));
    body.append(tbl);
    body.append(h('div', { class: 'note' },
      L({ en: 'Workbook formula: ER = 0.002342·H/(Δt·η) ≥ limit. GB 50189-2005 superseded by GB 50189-2015 (EHR-h) and GB 50736-2012 (EC(H)R-a) — verify current code.', zh: '原檔公式：ER = 0.002342·H/(Δt·η) ≥ 限值。GB 50189-2005 已由 GB 50189-2015（EHR-h）與 GB 50736-2012（EC(H)R-a）取代—請按現行規範覆核。' })));
  }, { src: 'GB 50189-2005 (superseded) · GB 50189-2015', collapsed: true }));

  // ================= workbook 'Motor' sheet blocks (B2:BL39) =================

  // ---- Motor rating schedule (workbook X4:AC26 + AE) ----
  const ratingBox = h('div');
  root.append(card(L({ en: 'Motor Rating Schedule (workbook)', zh: '馬達選型表（原檔）' }),
    L({ en: 'Printed kW ratings with their running current, starting method/current, MCB and isolator — the sheet computes A = kW·1000 / (√3·380·pf) at pf = 0.85 for 3Ø and / (220·pf) for 1Ø.', zh: '原檔列出的 kW 級距及其運行電流、起動方式／電流、MCB 與隔離開關 —— 原表以 pf＝0.85、三相 380 V／單相 220 V 計算。' }),
    (body) => {
      const f = form([
        { key: 'kW', label: L({ en: 'Motor rating', zh: '馬達功率' }), unit: 'kW', def: 5.5, step: '0.01' },
      ], (a) => { pickKw = a.kW; drawRating(); }, 'grid2', 'mr-');
      body.append(f.grid, ratingBox);
      function drawRating() {
        const kw = pickKw;
        if (!(kw > 0)) { results(ratingBox, []); return; }
        const row = MOTOR_RATINGS.find((r) => Math.abs(r.kW - kw) < 0.005)
          || MOTOR_RATINGS.find((r) => r.kW >= kw) || MOTOR_RATINGS[MOTOR_RATINGS.length - 1];
        const pfHint = row.phase === '3Ø'
          ? row.kW * 1000 / (Math.sqrt(3) * VOLTAGES.three * 0.85)
          : row.kW * 1000 / (VOLTAGES.single * 0.85);
        results(ratingBox, [
          res(L({ en: 'Rating', zh: '功率' }), row.kW, 'kW', { digits: 2, big: true }),
          res(L({ en: 'Phase', zh: '相數' }), row.phase, ''),
          res(L({ en: 'Running current (workbook)', zh: '運行電流（原檔）' }), row.amp, 'A', { digits: 2, big: true }),
          res(L({ en: 'Recomputed at pf 0.85', zh: '以 pf 0.85 重算' }), pfHint, 'A', { digits: 2 }),
          res(L({ en: 'Starting method', zh: '起動方式' }), row.method, ''),
          res(L({ en: 'Starting current', zh: '起動電流' }), row.startA, 'A', { digits: 2 }),
          res('MCB', row.mcb, 'A', { digits: 0 }),
          res(L({ en: 'Isolator', zh: '隔離開關' }), row.isolator, 'A', { digits: 0 }),
        ]);
        // starting-current multipliers printed on the sheet
        const m = START_METHODS.find((s) => s.method === row.method) || START_METHODS[0];
        ratingBox.append(h('div', { class: 'note' },
          L({ en: 'Printed starting multipliers: ', zh: '原檔起動倍數：' }) +
          START_METHODS.map((s) => s.method + ' ×' + s.factor).join(' · ') +
          L({ en: ' — this row uses ' + m.method + ' ×' + m.factor, zh: ' —— 本行為 ' + m.method + ' ×' + m.factor })));
      }
      drawRating();
      const tbl = h('table', { class: 'pipes-table' });
      tbl.append(h('thead', {}, h('tr', {}, h('th', {}, 'kW'), h('th', {}, 'A'), h('th', {}, 'Ø'),
        h('th', {}, L({ en: 'Start', zh: '起動' })), h('th', {}, 'A'), h('th', {}, 'MCB'), h('th', {}, L({ en: 'Isolator', zh: '隔離' })))));
      const tb = h('tbody');
      for (const r of MOTOR_RATINGS) {
        tb.append(h('tr', { class: Math.abs(r.kW - pickKw) < 0.005 ? 'sel' : '' },
          h('td', { class: 'num' }, String(r.kW)), h('td', { class: 'num' }, r.amp.toFixed(2)),
          h('td', { class: 'num' }, r.phase), h('td', {}, r.method),
          h('td', { class: 'num' }, r.startA.toFixed(1)), h('td', { class: 'num' }, String(r.mcb)),
          h('td', { class: 'num' }, r.isolator == null ? '—' : String(r.isolator))));
      }
      tbl.append(tb);
      body.append(fold(L({ en: 'Full schedule (' + MOTOR_RATINGS.length + ' ratings)', zh: '完整選型表（' + MOTOR_RATINGS.length + ' 級）' }),
        card(L({ en: 'Motor rating schedule', zh: '馬達選型表' }), '', (b2) => {
          b2.append(h('div', { class: 'table-scroll' }, tbl));
          b2.append(h('div', { class: 'note' }, L({ en: 'Isolator sizes available: ', zh: '隔離開關可選：' }) + ISOLATOR_SIZES.join(' · ') + ' A'));
        }, { src: 'Motor!X6:AC26 · AE4:AE23', collapsed: true })));
    }, { src: 'Motor!X6:AC26 · B17:C30', formula: '3Ø: A = kW·1000/(√3·380·pf);  1Ø: A = kW·1000/(220·pf);  start A = A × multiplier' }));

  // ---- Fan / pump motor sizing (workbook AG/AL blocks) ----
  const sizeBox = h('div');
  root.append(card(L({ en: 'Fan & Pump Motor Power (workbook)', zh: '風機／水泵馬達功率（原檔）' }),
    L({ en: 'Fan: V̇ · ΔP / η_motor / η_fan × S.F.  ·  Pump: V̇ · H · 9.8 / η_motor × S.F. — the sheet’s own relations with its default efficiencies.', zh: '風機：V̇ · ΔP ÷ η馬達 ÷ η風機 × 安全係數；水泵：V̇ · H · 9.8 ÷ η馬達 × 安全係數 —— 原檔關係與其預設效率。' }),
    (body) => {
      const f = form([
        { key: 'fanV', label: L({ en: 'Fan air flow', zh: '風量' }), unit: 'm³/s', def: 1 },
        { key: 'fanPd', label: L({ en: 'Total static', zh: '總靜壓' }), unit: 'Pa', def: 1000 },
        { key: 'fanEffM', label: L({ en: 'Motor η', zh: '馬達效率' }), def: SIZING_DEFAULTS.fanMotorEff, step: '0.01' },
        { key: 'fanEffF', label: L({ en: 'Fan η', zh: '風機效率' }), def: SIZING_DEFAULTS.fanEff, step: '0.01' },
        { key: 'fanSF', label: L({ en: 'Safety factor', zh: '安全係數' }), def: SIZING_DEFAULTS.fanSF, step: '0.05' },
        { key: 'pumpV', label: L({ en: 'Pump water flow', zh: '水量' }), unit: 'm³/s', def: 0.01 },
        { key: 'pumpH', label: L({ en: 'Pressure head', zh: '揚程' }), unit: 'm', def: 30 },
        { key: 'pumpEff', label: L({ en: 'Motor η', zh: '馬達效率' }), def: SIZING_DEFAULTS.pumpMotorEff, step: '0.01' },
        { key: 'pumpSF', label: L({ en: 'Safety factor', zh: '安全係數' }), def: SIZING_DEFAULTS.pumpSF, step: '0.05' },
      ], (a) => { Object.assign(sizeIn, a); drawSize(); }, 'grid3', 'sz-');
      body.append(f.grid, sizeBox);
      function drawSize() {
        const s = sizeIn;
        if (!(s.fanV > 0) || !(s.fanPd > 0) || !(s.fanEffM > 0) || !(s.fanEffF > 0)) { results(sizeBox, []); return; }
        const fanKw = s.fanV * s.fanPd / s.fanEffM / s.fanEffF * s.fanSF / 1000;
        const pumpKw = s.pumpV * s.pumpH * 9.8 / s.pumpEff * s.pumpSF;
        const feed = (pf) => (fanKw * 1000) / (Math.sqrt(3) * VOLTAGES.three * pf);
        const pfeed = (pf) => (pumpKw * 1000) / (Math.sqrt(3) * VOLTAGES.three * pf);
        results(sizeBox, [
          res(L({ en: 'Fan power', zh: '風機功率' }), fanKw, 'kW', { digits: 3, big: true }),
          res(L({ en: 'Fan running current', zh: '風機運行電流' }), feed(0.85), 'A', { digits: 2 }),
          res(L({ en: 'Pump power', zh: '水泵功率' }), pumpKw, 'kW', { digits: 3, big: true }),
          res(L({ en: 'Pump running current', zh: '水泵運行電流' }), pfeed(0.85), 'A', { digits: 2 }),
          res(L({ en: 'Efficiency from the flow band', zh: '按風量帶的效率' }), EFFICIENCY_BY_FLOW.find((b) => s.fanV * 1000 >= b.min && s.fanV * 1000 < b.max)?.eff, '—', { digits: 2 }),
        ]);
        sizeBox.append(h('div', { class: 'note' },
          'Fan = ' + s.fanV + ' m³/s × ' + s.fanPd + ' Pa ÷ ' + s.fanEffM + ' ÷ ' + s.fanEffF + ' × ' + s.fanSF + ' = ' + fanKw.toFixed(3) + ' kW · ' +
          'Pump = ' + s.pumpV + ' m³/s × ' + s.pumpH + ' m × 9.8 ÷ ' + s.pumpEff + ' × ' + s.pumpSF + ' = ' + pumpKw.toFixed(3) + ' kW'));
      }
      drawSize();
      // pressure unit conversion (workbook B9:D15)
      const convBox = h('div');
      const cf = form([{ key: 'kpa', label: L({ en: 'Pressure', zh: '壓力' }), unit: 'kPa', def: 100 }],
        (a) => {
          if (!(a.kpa > 0)) { results(convBox, []); return; }
          results(convBox, PRESSURE_UNITS.filter((u) => u.unit !== 'kPa').map((u) =>
            res(u.unit, a.kpa * u.perKPa, u.unit, { digits: u.perKPa < 0.01 ? 4 : 3 })));
        }, 'grid2', 'pu-');
      body.append(h('div', { class: 'note' }, L({ en: 'Pressure unit conversion (workbook B9:D15)', zh: '壓力單位換算（原檔 B9:D15）' })), cf.grid, convBox);
      results(convBox, PRESSURE_UNITS.filter((u) => u.unit !== 'kPa').map((u) =>
        res(u.unit, 100 * u.perKPa, u.unit, { digits: u.perKPa < 0.01 ? 4 : 3 })));
    }, { src: 'Motor!AG6:AN24 · B9:D15', formula: 'Fan kW = V̇(m³/s)·ΔP(Pa)/η_m/η_f·SF/1000;  Pump kW = V̇·H·9.8/η_m·SF' }));

  // ---- Static / pump-head estimation (workbook H, N, S blocks) ----
  const staticBox = h('div');
  root.append(card(L({ en: 'Fan Static & Pump Head Estimation (workbook)', zh: '風管靜壓與水泵揚程估算（原檔）' }),
    L({ en: 'Fan: component static losses + critical path × friction rate, with a safety factor. Pump: critical path (vertical + horizontal) × 300 Pa/m + terminal coil + HX coil (+ height difference for open loops).', zh: '風機：各組件靜壓損失 ＋ 臨界路徑 × 比摩阻，再乘安全係數。水泵：臨界路徑（垂直＋水平）× 300 Pa/m ＋ 末端盤管 ＋ 換熱器盤管（開式系統另加高差）。' }),
    (body) => {
      const f = form([
        { key: 'compPa', label: L({ en: 'Component static losses (sum)', zh: '組件靜壓損失（合計）' }), unit: 'Pa', def: 400 },
        { key: 'path', label: L({ en: 'Critical path length', zh: '臨界路徑長度' }), unit: 'm', def: 40 },
        { key: 'pdPerM', label: L({ en: 'Friction rate', zh: '比摩阻' }), unit: 'Pa/m', def: PUMP_DEFAULTS.pdPerM },
        { key: 'sf', label: L({ en: 'Safety factor', zh: '安全係數' }), def: PUMP_DEFAULTS.safety, step: '0.05' },
        { key: 'internal', label: L({ en: 'Internal static (AHU/FCU)', zh: '機組內部靜壓（AHU／FCU）' }), unit: 'Pa', def: 0 },
        { key: 'terminal', label: L({ en: 'Terminal unit coil loss', zh: '末端盤管損失' }), unit: 'Pa', def: PUMP_DEFAULTS.terminalCoil },
        { key: 'hx', label: L({ en: 'Evaporator / HX coil loss', zh: '蒸發器／換熱器盤管損失' }), unit: 'Pa', def: PUMP_DEFAULTS.hxCoil },
        { key: 'height', label: L({ en: 'Height difference (open loop)', zh: '高差（開式系統）' }), unit: 'm', def: 0 },
      ], (a) => { Object.assign(estIn, a); drawEst(); }, 'grid4', 'est2-');
      body.append(f.grid, staticBox);
      function drawEst() {
        const s = estIn;
        const friction = s.path * s.pdPerM;
        const extStatic = (s.compPa + friction) * s.sf;
        const totalStatic = extStatic + s.internal;
        const pumpPa = (s.path * s.pdPerM) * s.sf + s.terminal + s.hx;
        const pumpHead = pumpPa / 9810;
        const openPa = pumpPa + s.height * 9810;
        results(staticBox, [
          res(L({ en: 'Friction loss', zh: '摩擦損失' }), friction, 'Pa', { digits: 0 }),
          res(L({ en: 'External static loss', zh: '外部靜壓損失' }), extStatic, 'Pa', { digits: 0, big: true }),
          res(L({ en: 'Total static loss', zh: '總靜壓損失' }), totalStatic, 'Pa', { digits: 0, big: true }),
          res(L({ en: 'Total static loss', zh: '總靜壓損失' }), totalStatic / 9.81, 'mm H₂O', { digits: 0 }),
          res(L({ en: 'Pump total pressure loss', zh: '水泵總壓損失' }), pumpPa, 'Pa', { digits: 0, big: true }),
          res(L({ en: 'Pump head (closed loop)', zh: '水泵揚程（閉式）' }), pumpHead, 'm', { digits: 2, big: true }),
          res(L({ en: 'Pump head (open loop)', zh: '水泵揚程（開式）' }), openPa / 9810, 'm', { digits: 2 }),
          res(L({ en: 'Closed-loop share of coil losses', zh: '盤管損失佔比' }), (s.terminal + s.hx) / pumpPa * 100, '%', { digits: 0 }),
        ]);
      }
      drawEst();
    }, { src: 'Motor!H2:K32 · N2:P19 · S2:U21', formula: 'fan: (Σ component + path·Pa/m)·SF + internal;  pump: path·Pa/m·SF + 30000 + 80000 → head = Pa/9810' }));

  // ---- Transport energy ratio ER (workbook AW block) ----
  const erBox = h('div');
  root.append(card(L({ en: 'Transport Energy Ratio ER (GB 50189-2005)', zh: '輸送能效比 ER（GB 50189-2005）' }),
    L({ en: 'Workbook rule ER = 0.002342 · H / (Δt · η) for the selected pipe/duct system, compared with the zone limit.', zh: '原檔規則 ER ＝ 0.002342 · H ÷（Δt · η），並與所在地區限值比較。' }),
    (body) => {
      const f = form([
        { key: 'H', label: L({ en: 'Design head H', zh: '設計揚程 H' }), unit: 'm', def: 30 },
        { key: 'dt', label: L({ en: 'Supply-return Δt', zh: '供回水溫差 Δt' }), unit: '°C', def: 10 },
        { key: 'eta', label: L({ en: 'Design point efficiency η', zh: '設計工作點效率 η' }), def: 0.7, step: '0.01' },
        { key: 'limit', label: L({ en: 'Zone ER limit', zh: '地區 ER 限值' }), def: 0.00865, step: '0.00001' },
      ], (a) => { Object.assign(erIn, a); drawEr(); }, 'grid4', 'er-');
      body.append(f.grid, erBox);
      function drawEr() {
        const s = erIn;
        if (!(s.H > 0) || !(s.dt > 0) || !(s.eta > 0)) { results(erBox, []); return; }
        const er = 0.002342 * s.H / (s.dt * s.eta);
        const pass = er <= s.limit;
        results(erBox, [
          res('ER', er, '—', { digits: 5, big: true }),
          res(L({ en: 'Zone limit', zh: '地區限值' }), s.limit, '—', { digits: 5 }),
          res(L({ en: 'Margin', zh: '餘量' }), (s.limit / er - 1) * 100, '%', { digits: 1 }),
        ]);
        erBox.append(flag(pass
          ? L({ en: 'Within the printed limit.', zh: '符合原檔限值。' })
          : L({ en: 'Above the printed limit — increase Δt/η or reduce the head.', zh: '超出原檔限值 —— 請提高 Δt／η 或降低揚程。' }), pass ? 'ok' : 'warn'));
      }
      drawEr();
    }, { src: 'Motor!AW9:AW15 · GB 50189-2005 §5.3.27 (superseded by GB 50189-2015 / GB 50736-2012)',
    formula: 'ER = 0.002342 · H / (Δt · η)' }));
}

register({ id: 'motor', icon: '⚡', group: 'equipment', title: I18N.title, desc: I18N.desc, src: 'IEC power relations · GB 50176', render });
