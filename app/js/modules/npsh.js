// Module: NPSH (泵氣蝕) — from 'NPSH' sheet
import { register } from '../registry.js';
import { h, res, flag, card, form, results } from '../ui.js';
import * as F from '../engine/fluids.js';
import { pws } from '../engine/psychro.js';

const I18N = {
  title: { en: 'Pump NPSH / Cavitation', zh: '泵 NPSH／氣蝕檢查' },
  desc: { en: 'NPSHa = Ha ± Hz − Hf − Hv. Vapour pressure computed from the ASHRAE Hyland–Wexler correlation (workbook used a 5 °C-step table).', zh: 'NPSHa = Ha ± Hz − Hf − Hv。飽和蒸氣壓以 Hyland–Wexler 公式計算（原檔用 5°C 間距查表）。' },
  ha: { en: 'Surface absolute pressure', zh: '液面絕對壓力' },
  h1: { en: 'Tank bottom level h1', zh: '水箱底標高 h1' },
  x: { en: 'Pump suction level x', zh: '泵吸水口標高 x' },
  h2: { en: 'Effective fluid level h2', zh: '有效液位 h2' },
  hz: { en: 'Static head Hz = (h1−x)+h2', zh: '靜壓頭 Hz＝(h1−x)＋h2' },
  tv: { en: 'Fluid temperature', zh: '流體溫度' },
  pv: { en: 'Vapour pressure at tv', zh: 'tv 時飽和蒸氣壓' },
  hf: { en: 'Friction & velocity loss Hf', zh: '摩阻與速度損失 Hf' },
  npshr: { en: 'Pump NPSHr', zh: '泵所需 NPSHr' },
  npsha: { en: 'NPSHa', zh: '有效 NPSHa' },
  margin: { en: 'NPSHa − NPSHr', zh: 'NPSHa − NPSHr' },
  ok: { en: 'NPSHa ≥ NPSHr — no cavitation ✔', zh: 'NPSHa ≥ NPSHr — 無氣蝕 ✔' },
  bad: { en: 'NPSHa < NPSHr — cavitation risk! Raise tank / lower pump / reduce loss.', zh: 'NPSHa < NPSHr — 有氣蝕風險！請抬高水箱、降低泵位或減損。' },
};

function render(root, { L }) {
  const T = (k) => L(I18N[k]);
  root.append(card(T('title'), T('desc'), (body) => {
    const f = form([
      { key: 'ha', label: T('ha'), unit: 'kPa', def: 101.325 },
      { key: 'h1', label: T('h1'), unit: 'm', def: 5 },
      { key: 'x', label: T('x'), unit: 'm', def: 1 },
      { key: 'h2', label: T('h2'), unit: 'm', def: 3 },
      { key: 'tv', label: T('tv'), unit: '°C', def: 30 },
      { key: 'hf', label: T('hf'), unit: 'm', def: 1.5 },
      { key: 'npshr', label: T('npshr'), unit: 'm', def: 2.5 },
    ], draw, 'grid3');
    const box = h('div');
    body.append(f.grid, box);
    function draw(st) {
      if ([st.ha, st.h1, st.x, st.h2, st.tv, st.hf, st.npshr].some((x) => x == null)) { results(box, []); return; }
      const hz = (st.h1 - st.x) + st.h2;
      const pv = pws(st.tv);
      const a = F.npsha(st.ha, hz, st.hf, pv);
      const margin = a - st.npshr;
      results(box, [
        res(T('hz'), hz, 'm', { digits: 2 }),
        res(T('pv'), pv, 'kPa', { digits: 3 }),
        res(T('npsha'), a, 'm', { digits: 2, big: true }),
        res(T('margin'), margin, 'm', { digits: 2 }),
      ]);
      box.append(flag(margin >= 0 ? T('ok') : T('bad'), margin >= 0 ? 'ok' : 'bad'));
    }
    draw(f.all());
  }, {
    formula: 'NPSHa = Ha ± Hz − Hf − Hv   (Ha, Hv in m of fluid; workbook used ÷9.8, app uses 9.80665)',
    src: 'CIBSE / pump handbooks; vapour pressure: Hyland & Wexler (1983)',
  }));
}

register({ id: 'npsh', icon: '🌀', group: 'water', title: I18N.title, desc: I18N.desc, src: 'Hyland & Wexler · pump handbooks', render });
