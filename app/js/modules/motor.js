// Module: Motor (馬達電力) — from 'Motor' sheet
import { register } from '../registry.js';
import { h, res, flag, card, form, results, seg } from '../ui.js';
import * as E from '../engine/electrical.js';

const I18N = {
  title: { en: 'Motor Electrical', zh: '馬達電力計算' },
  desc: { en: 'Full-load current (1Ø/3Ø), torque unit conversion, starter recommendation and China climate zone.', zh: '滿載電流（單相／三相）、扭矩換算、起動方式建議、中國氣候分區。' },
};

function render(root, { L }) {
  const T = (k) => L(I18N[k]);
  let phase = '3';
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
}

register({ id: 'motor', icon: '⚡', group: 'equipment', title: I18N.title, desc: I18N.desc, src: 'IEC power relations · GB 50176', render });
