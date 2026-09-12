// Module: Motor (馬達電力) — from 'Motor' sheet
import { register } from '../registry.js';
import { h, res, flag, card, form, results, seg } from '../ui.js';
import * as E from '../engine/electrical.js';

const I18N = {
  title: { en: 'Motor Electrical', zh: '馬達電力計算' },
  desc: { en: 'Full-load current (1Ø/3Ø), torque unit conversion, starter recommendation and China climate zone.', zh: '滿載電流（單相／三相）、扭矩換算、起動方式建議、中國氣候分區。' },
  phase: { en: 'Phase', zh: '相數' },
  p: { en: 'Motor rating P', zh: '馬達功率 P' },
  v: { en: 'Voltage V', zh: '電壓 V' },
  pf: { en: 'Power factor', zh: '功率因數' },
  eff: { en: 'Efficiency η (Excel omits → 1)', zh: '效率 η（Excel 原版忽略→1）' },
  current: { en: 'Full-load current', zh: '滿載電流' },
  starter: { en: 'Recommended starter', zh: '建議起動方式' },
  torqueTitle: { en: 'Torque Conversion', zh: '扭矩換算' },
  nm: { en: 'Torque', zh: '扭矩' },
  kgfm: { en: 'Torque', zh: '扭矩' },
  climateTitle: { en: 'Climate Zone (GB 50176)', zh: '氣候分區（GB 50176）' },
  climate: { en: 'Climate zone', zh: '氣候分區' },
  noteEff: { en: 'The original workbook computes I = P/(V·pf) and ignores η; typical motors η ≈ 0.82–0.95. Set η to your motor nameplate for a safer cable size.', zh: '原 Excel 以 I=P/(V·pf) 計算、忽略 η；實際馬達 η≈0.82–0.95。請輸入銘牌 η 以得到更保守的電纜選型。' },
};

function render(root, { L }) {
  const T = (k) => L(I18N[k]);
  let phase = '3';
  root.append(card(T('title'), T('desc'), (body) => {
    const phRow = h('div', { class: 'field' }, h('label', {}, T('phase')),
      seg([{ v: '1', label: '1Ø' }, { v: '3', label: '3Ø' }], phase, (v) => { phase = v; draw(f.all()); }));
    const f = form([
      { key: 'p', label: T('p'), unit: 'kW', def: 5.5 },
      { key: 'v', label: T('v'), unit: 'V', def: phase === '3' ? 380 : 220 },
      { key: 'pf', label: T('pf'), unit: '—', def: 0.85 },
      { key: 'eff', label: T('eff'), unit: '—', def: 1 },
    ], (st) => draw(st), 'grid2');
    const box = h('div');
    body.append(phRow, f.grid, box);
    function draw(st) {
      if ([st.p, st.v, st.pf, st.eff].some((x) => x == null || x <= 0)) { results(box, []); return; }
      const i = phase === '3' ? E.current3Ph(st.p, st.v, st.pf, st.eff) : E.current1Ph(st.p, st.v, st.pf, st.eff);
      const starter = E.starterFor(st.p);
      results(box, [
        res(T('current'), i, 'A', { digits: 1, big: true }),
        res(T('starter'), starter === 'fuse' ? L({ en: 'Fuse / direct small', zh: '熔斷器／小型直起' }) : starter === 'DOL' ? 'DOL' : 'Auto-Tx (Y/Δ)', '', { digits: 0 }),
      ]);
      box.append(h('div', { class: 'note' }, T('noteEff')));
    }
    draw(f.all());
  }, { src: 'I = P/(V·pf·η) 1Ø; I = P/(√3·V·pf·η) 3Ø' }));

  root.append(card(T('torqueTitle'), '', (body) => {
    let box = null;
    const f = form([
      { key: 'kgfm', label: T('kgfm'), unit: 'kgf·m', def: 10 },
    ], (st) => {
      if (!box) return;
      results(box, [res(T('nm'), st.kgfm == null ? null : E.nm(st.kgfm), 'N·m', { digits: 2 })]);
    });
    box = h('div');
    body.append(f.grid, box);
    results(box, [res(T('nm'), E.nm(10), 'N·m', { digits: 2 })]);
  }, { formula: '1 kgf·m = 9.80665 N·m  (workbook used 9.804139432, −0.026%)' }));

  root.append(card(T('climateTitle'), '', (body) => {
    let box = null;
    const f = form([{
      key: 'z', label: T('climate'), def: 'SH', type: 'select',
      options: E.CN_CLIMATE.map((c) => ({ v: c.key, label: c.en + ' / ' + c.zh })),
    }], (st) => {
      if (!box) return;
      const z = E.CN_CLIMATE.find((c) => c.key === st.z);
      results(box, [res(T('climate'), z ? z.en + ' · ' + z.zh : '—', '', { digits: 0, big: true })]);
    });
    box = h('div');
    body.append(f.grid, box);
    const z0 = E.CN_CLIMATE.find((c) => c.key === 'SH');
    results(box, [res(T('climate'), z0.en + ' · ' + z0.zh, '', { digits: 0, big: true })]);
  }, { src: 'GB 50176 (workbook zone list)' }));

  // ---- ER limit (heat recovery efficiency) per climate zone ----
  root.append(card(L({ en: 'Heat Recovery ER Limits (GB 50189-2005 Tab. 5.3.27)', zh: '熱回收效率 ER 限值（GB 50189-2005 表 5.3.27）' }), '', (body) => {
    const rows = [
      ['嚴寒 Severe Cold', 0.00577], ['寒冷 Cold', 0.00433], ['夏熱冬冷 HSCW', 0.00865], ['夏熱冬暖 HSWW', 0.00673], ['溫和 Mild', 0.0241],
    ];
    const tbl = h('table', { class: 'pipes-table' });
    tbl.append(h('tr', {}, h('th', {}, 'Zone'), h('th', {}, 'ER limit')));
    for (const [z, v] of rows) tbl.append(h('tr', {}, h('td', {}, z), h('td', {}, String(v))));
    body.append(tbl);
    body.append(h('div', { class: 'note' },
      L({ en: 'Workbook formula: ER = 0.002342·H/(Δt·η) ≥ limit. ⚠ GB 50189-2005 superseded by GB 50189-2015 (EHR-h) and GB 50736-2012 (EC(H)R-a) — verify against the current code.', zh: '原檔公式：ER = 0.002342·H/(Δt·η) ≥ 限值。⚠ GB 50189-2005 已由 GB 50189-2015（EHR-h）與 GB 50736-2012（EC(H)R-a）取代 — 請按現行規範覆核。' })));
  }, { src: 'GB 50189-2005 (superseded) · GB 50189-2015' }));
}

register({ id: 'motor', icon: '⚡', group: 'equipment', title: I18N.title, desc: I18N.desc, src: 'IEC power relations · GB 50176', render });
