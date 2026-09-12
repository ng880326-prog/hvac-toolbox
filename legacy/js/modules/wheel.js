// Module: Energy Recovery Wheel (轉輪熱回收) — upgraded from 'Wheel' sheet
import { register } from '../registry.js';
import { h, res, flag, card, form, results, seg } from '../ui.js';
import * as P from '../engine/psychro.js';

const I18N = {
  title: { en: 'Energy Recovery Wheel', zh: '轉輪熱回收' },
  desc: { en: 'Sensible / total effectiveness, off-wheel states and recovered energy with condensation warning.', zh: '顯熱／全熱效率、出轉輪狀態、回收能量與結露警告。' },
  supply: { en: 'Supply (OA) air', zh: '新風（供風側）' },
  exhaust: { en: 'Exhaust (RA) air', zh: '排風（回風側）' },
  flowS: { en: 'Supply flow V', zh: '新風量 V' },
  flowE: { en: 'Exhaust flow V', zh: '排風量 V' },
  effS: { en: 'Sensible effectiveness εs', zh: '顯熱效率 εs' },
  effL: { en: 'Latent effectiveness εl', zh: '潛熱效率 εl' },
  tOff: { en: 'Supply off-wheel T', zh: '新風出轉輪溫度' },
  wOff: { en: 'Supply off-wheel W', zh: '新風出轉輪含濕量' },
  hOff: { en: 'Supply off-wheel h', zh: '新風出轉輪焓值' },
  qs: { en: 'Recovered sensible', zh: '回收顯熱' },
  ql: { en: 'Recovered latent', zh: '回收潛熱' },
  qt: { en: 'Recovered total', zh: '回收全熱' },
  cond: { en: 'Condensation at exhaust outlet — exhaust side may frost/condense.', zh: '排風出口結露 — 排風側可能結露／結霜。' },
  modeNote: { en: 'Heating case shown: supply is colder than exhaust (winter recovery).', zh: '此例為冬季工況：新風較排風冷（加熱回收）。' },
};

function render(root, { L }) {
  const T = (k) => L(I18N[k]);
  root.append(card(T('title'), T('desc'), (body) => {
    const f = form([
      { key: 'ts', label: T('supply') + ' T', unit: '°C', def: 5 },
      { key: 'rhs', label: T('supply') + ' RH', unit: '%', def: 80 },
      { key: 'te', label: T('exhaust') + ' T', unit: '°C', def: 22 },
      { key: 'rhe', label: T('exhaust') + ' RH', unit: '%', def: 50 },
      { key: 'vs', label: T('flowS'), unit: 'm³/s', def: 1 },
      { key: 've', label: T('flowE'), unit: 'm³/s', def: 1 },
      { key: 'effS', label: T('effS'), unit: '—', def: 0.75 },
      { key: 'effL', label: T('effL'), unit: '—', def: 0.6 },
    ], draw, 'grid4');
    const box = h('div');
    let wType = 'enthalpy';
    const typeRow = h('div', { class: 'field' }, h('label', {}, L({ en: 'Wheel type', zh: '轉輪類型' })),
      seg([{ v: 'enthalpy', label: L({ en: 'Total (enthalpy)', zh: '全熱（焓）' }) }, { v: 'sensible', label: L({ en: 'Sensible only', zh: '僅顯熱' }) }], wType,
        (v) => { wType = v; draw(f.all()); }));
    body.append(f.grid, typeRow, box);
    function draw(st) {
      if ([st.ts, st.rhs, st.te, st.rhe, st.vs, st.ve, st.effS, st.effL].some((x) => x == null)) { results(box, []); return; }
      const sS = P.state({ t: st.ts, rh: st.rhs });
      const sE = P.state({ t: st.te, rh: st.rhe });
      if (!sS || !sE) { results(box, []); return; }
      const effL = wType === 'sensible' ? 0 : st.effL;
      const tOff = st.ts + st.effS * (st.te - st.ts);
      const wOff = sS.w + effL * (sE.w - sS.w);
      const hOff = P.enthalpy(tOff, wOff);
      const m = Math.min(st.vs, st.ve) * sS.rho;
      const qs = m * 1.006 * (tOff - st.ts);
      const ql = m * 2500 * (wOff - sS.w);
      // exhaust outlet state
      const tEOut = st.te - st.effS * (st.te - st.ts);
      const wEOut = sE.w - effL * (sE.w - sS.w);
      const tdpE = P.tdpFromPw(P.pwFromW(wEOut));
      const condWarn = tEOut < tdpE;
      const frostWarn = tEOut < 0;
      results(box, [
        res(T('tOff'), tOff, '°C', { digits: 2, big: true }),
        res(T('wOff'), wOff, 'kg/kg', { digits: 5 }),
        res(T('hOff'), hOff, 'kJ/kg', { digits: 2 }),
        res(T('qs'), qs, 'kW', { digits: 2 }),
        res(T('ql'), ql, 'kW', { digits: 2 }),
        res(T('qt'), qs + ql, 'kW', { digits: 2 }),
        res(L({ en: 'Exhaust out', zh: '排風出口' }), tEOut.toFixed(1) + '° / ' + wEOut.toFixed(5), '', { digits: 2 }),
      ]);
      if (frostWarn) box.append(flag(L({ en: 'Frost risk at exhaust outlet — preheat or frost-control required.', zh: '排風出口結霜風險 — 需預熱或防霜控制。' }), 'bad'));
      else if (condWarn) box.append(flag(T('cond'), 'bad'));
      box.append(h('div', { class: 'note' }, T('modeNote')));
    }
    draw(f.all());
  }, {
    formula: 't_off = t_s + εs·(t_e − t_s);  W_off = W_s + εl·(W_e − W_s);  Q = m·Δh',
    src: 'Effectiveness-NTU relations (workbook ' + 'Wheel' + ' sheet)',
  }));
}

register({ id: 'wheel', icon: '⚙️', group: 'air', title: I18N.title, desc: I18N.desc, src: 'Effectiveness-NTU', render });
