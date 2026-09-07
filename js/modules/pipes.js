// Module: Pipe Sizing (水管管徑) — upgraded from 'Pipe Sizing' sheet
import { register } from '../registry.js';
import { h, res, flag, card, form, results, parseNum, seg } from '../ui.js';
import * as F from '../engine/fluids.js';
import { STEEL_PIPES, PIPE_DEFAULTS } from '../data/pipes.js';
import { tdpFromPw } from '../engine/psychro.js';

const I18N = {
  title: { en: 'Water Pipe Sizing', zh: '水管管徑計算' },
  desc: { en: 'Chilled/hot water pipe selection by Hazen–Williams with velocity & pressure-drop limits; heat load and tons from flow × ΔT.', zh: '冷／熱水管按 Hazen–Williams 及流速、比摩阻限值選管徑；由流量×溫差換算負荷與冷噸。' },
  system: { en: 'System type', zh: '系統類型' },
  closed: { en: 'Closed circuit (C=140)', zh: '閉式系統（C=140）' },
  open: { en: 'Open circuit (C=100)', zh: '開式系統（C=100）' },
  flow: { en: 'Flow rate Q', zh: '流量 Q' },
  dT: { en: 'Temperature difference ΔT', zh: '供回水溫差 ΔT' },
  vMax: { en: 'Velocity limit', zh: '流速限值' },
  pdMax: { en: 'Pressure-drop limit', zh: '比摩阻限值' },
  result: { en: 'Selected pipe', zh: '選定管徑' },
  dn: { en: 'Nominal DN', zh: '公稱直徑' },
  id: { en: 'Inside Ø', zh: '內徑' },
  vel: { en: 'Velocity', zh: '流速' },
  pd: { en: 'Pressure drop', zh: '比摩阻' },
  heat: { en: 'Heat load', zh: '熱負荷' },
  tons: { en: 'Refrigeration tons', zh: '冷噸' },
  okNote: { en: 'Within limits ✔', zh: '符合限值 ✔' },
  failNote: { en: 'No pipe meets both limits — increase size limit or relax limits.', zh: '沒有管徑同時符合兩項限值 — 請加大範圍或放寬限值。' },
  table: { en: 'All sizes (live)', zh: '全部尺寸（即時）' },
  tableDn: { en: 'DN', zh: 'DN' },
  tableV: { en: 'V (m/s)', zh: '流速 (m/s)' },
  tablePd: { en: 'ΔP (Pa/m)', zh: '比摩阻 (Pa/m)' },
  tableOk: { en: 'OK', zh: '合格' },
};

function render(root, { L }) {
  const T = (k) => L(I18N[k]);
  root.append(card(T('title'), T('desc'), (body) => {
    let sys = 'closed';
    const sysRow = h('div', { class: 'field' }, h('label', {}, T('system')),
      seg([{ v: 'closed', label: T('closed') }, { v: 'open', label: T('open') }], sys, (v) => { sys = v; draw(f.all()); }));
    const f = form([
      { key: 'q', label: T('flow'), unit: 'L/s', def: 5 },
      { key: 'dT', label: T('dT'), unit: '°C', def: PIPE_DEFAULTS.dT },
      { key: 'vMax', label: T('vMax'), unit: 'm/s', def: PIPE_DEFAULTS.vMax },
      { key: 'pdMax', label: T('pdMax'), unit: 'Pa/m', def: PIPE_DEFAULTS.pdMax },
    ], (st) => draw(st), 'grid2');
    const box = h('div');
    body.append(sysRow, f.grid, box);

    function draw(st) {
      const C = sys === 'closed' ? 140 : 100;
      box.innerHTML = '';
      if ([st.q, st.dT, st.vMax, st.pdMax].some((x) => x == null || x <= 0)) return;
      const rows = STEEL_PIPES.map((p) => {
        const v = F.velocityFromFlow(st.q, p.id);
        const pd = F.hazenWilliams(v, p.id, C);
        return { p, v, pd, ok: v <= st.vMax && pd <= st.pdMax };
      });
      const pick = rows.find((r) => r.ok);
      if (pick) {
        results(box, [
          res(T('dn'), 'DN' + pick.p.dn, '', { digits: 0, big: true }),
          res(T('id'), pick.p.id, 'mm', { digits: 1 }),
          res(T('vel'), pick.v, 'm/s', { digits: 2 }),
          res(T('pd'), pick.pd, 'Pa/m', { digits: 0 }),
          res(T('heat'), F.waterHeat(st.q, st.dT), 'kW', { digits: 1 }),
          res(T('tons'), F.waterHeat(st.q, st.dT) / 3.517, 'RT', { digits: 2 }),
        ]);
        box.append(flag(T('okNote'), 'ok'));
      } else {
        box.append(flag(T('failNote'), 'bad'));
      }

      // live table
      const table = h('div', { class: 'note' }, h('b', {}, T('table')));
      const tbl = h('table', { class: 'pipes-table' });
      const head = h('tr', {}, h('th', {}, T('tableDn')), h('th', {}, T('tableV')), h('th', {}, T('tablePd')), h('th', {}, T('tableOk')));
      tbl.append(head);
      for (const r of rows.slice(0, 14)) {
        tbl.append(h('tr', {
          class: pick && pick.p.dn === r.p.dn ? 'sel' : r.ok ? 'okrow' : '',
          style: 'cursor:default',
        },
          h('td', {}, 'DN' + r.p.dn),
          h('td', {}, r.v.toFixed(2)),
          h('td', {}, String(Math.round(r.pd))),
          h('td', {}, r.ok ? '✔' : '—')));
      }
      table.append(tbl);
      box.append(table);
    }
    draw(f.all());
  }, {
    formula: 'Hazen–Williams (SI):  ΔP/L = 6.819·(V/C)^1.852 / d^1.167 · 9810  Pa/m   (V m/s, d m)',
    src: 'ASHRAE Fundamentals 2025 Ch.22; CIBSE Guide C limits 2.5 m/s / 400 Pa/m',
  }));

  // ---- Steam pipe sizing ----
  root.append(card(L({ en: 'Steam Pipe Sizing (saturated)', zh: '蒸汽管選徑（飽和蒸汽）' }), '', (body) => {
    const f = form([
      { key: 'm', label: L({ en: 'Steam flow', zh: '蒸汽流量' }), unit: 'kg/h', def: 500 },
      { key: 'p', label: L({ en: 'Pressure', zh: '壓力' }), unit: 'bar', def: 5 },
      { key: 'vMax', label: L({ en: 'Velocity limit', zh: '流速限值' }), unit: 'm/s', def: 30 },
    ], (st) => draw(st), 'grid3');
    const box = h('div');
    body.append(f.grid, box);
    function draw(st) {
      if ([st.m, st.p, st.vMax].some((x) => x == null || x <= 0)) { results(box, []); return; }
      const tsat = tdpFromPw(st.p * 100);
      const hfg = 2257 * Math.pow((1 - tsat / 374.15) / (1 - 100 / 374.15), 0.38);
      const rho = (st.p * 100 * 18.02) / (8.314 * (tsat + 273.15)); // ideal-gas approx, saturated steam
      const kw = st.m * hfg / 3600;
      const pick = STEEL_PIPES.find((pp) => {
        const A = Math.PI * Math.pow(pp.id / 2000, 2);
        return (st.m / 3600 / rho) / A <= st.vMax;
      });
      results(box, [
        res(L({ en: 'Saturation temp', zh: '飽和溫度' }), tsat, '°C', { digits: 1 }),
        res(L({ en: 'hfg', zh: '汽化熱' }), hfg, 'kJ/kg', { digits: 0 }),
        res(L({ en: 'Steam capacity', zh: '蒸汽容量' }), kw, 'kW', { digits: 1 }),
        res(L({ en: 'Selected DN', zh: '選定管徑' }), pick ? 'DN' + pick.dn : L({ en: 'exceeds table', zh: '超出表列' }), '', { digits: 0, big: true }),
      ]);
      if (pick) {
        const A = Math.PI * Math.pow(pick.id / 2000, 2);
        const v = (st.m / 3600 / rho) / A;
        box.append(h('div', { class: 'note' }, 'ρₛ ≈ ' + rho.toFixed(2) + ' kg/m³ · V = ' + v.toFixed(1) + ' m/s (limit ' + st.vMax + ')'));
      }
    }
    draw(f.all());
  }, { formula: 'Tsat = pws⁻¹(p);  hfg (Watson);  V = ṁ/(ρA);  ρₛ ≈ p·M/(R·T)', src: 'IAPWS IF-97 · ideal-gas ρ approx (±5%)' }));

  // ---- Condensate (from the workbook tables) ----
  root.append(card(L({ en: 'Condensate Drain (workbook tables)', zh: '凝水管（原檔兩表）' }), '', (body) => {
    const CONDS = [
      { dn: 25, kw: 17.6 }, { dn: 32, kw: 101 }, { dn: 40, kw: 176 }, { dn: 50, kw: 598 },
      { dn: 65, kw: 800 }, { dn: 80, kw: 1055 }, { dn: 100, kw: 1512 }, { dn: 125, kw: 2462 }, { dn: 150, kw: 3500 },
    ];
    const DRAIN = [
      { dn: 50, stack: 1.1, horiz: 1.0, v: 0.72 }, { dn: 65, stack: 2.2, horiz: 2.0, v: 0.85 },
      { dn: 80, stack: 3.8, horiz: 3.5, v: 0.98 }, { dn: 100, stack: 6.9, horiz: 6.3, v: 1.14 },
      { dn: 150, stack: 20.3, horiz: 14.1, v: 1.12 }, { dn: 200, stack: 43.8, horiz: 26.8, v: 1.2 },
      { dn: 225, stack: 59.9, horiz: 34.8, v: 1.23 }, { dn: 250, stack: 79.4, horiz: 42.3, v: 1.21 },
    ];
    const f = form([
      { key: 'kw', label: L({ en: 'Coil load (method 1)', zh: '盤管負荷（方式 1）' }), unit: 'kW', def: 500 },
      { key: 'lps', label: L({ en: 'Condensate flow (method 2)', zh: '凝水量（方式 2）' }), unit: 'L/s', def: 10 },
    ], (st) => draw(st), 'grid2');
    const box = h('div');
    body.append(f.grid, box);
    function draw(st) {
      const out = [];
      if (st.kw > 0) {
        const c = CONDS.find((x) => x.kw >= st.kw) || CONDS[CONDS.length - 1];
        out.push(res(L({ en: 'By coil load', zh: '按盤管負荷' }), 'DN' + c.dn, 'mm (slope 1:' + (c.dn >= 125 ? '70' : '40') + ')', { digits: 0, big: true }));
      }
      if (st.lps > 0) {
        const d = DRAIN.find((x) => x.stack >= st.lps) || DRAIN[DRAIN.length - 1];
        out.push(res(L({ en: 'By flow (stack/horiz)', zh: '按流量（立管/水平）' }), 'DN' + d.dn, ' · 立 ' + d.stack + ' · 橫 ' + d.horiz + ' L/s', { digits: 0 }));
      }
      results(box, out);
    }
    draw(f.all());
  }, {
    formula: 'Table 1 (drain by coil load, 1:40 → 1:70) & Table 2 (by flow, from workbook Pipe Sizing sheet), condensate from coil module',
    src: 'Pipe Sizing sheet (workbook) — condensate tables',
  }));
}

register({ id: 'pipes', icon: '🚿', group: 'water', title: I18N.title, desc: I18N.desc, src: 'ASHRAE F. Ch.22 · Hazen–Williams', render });
