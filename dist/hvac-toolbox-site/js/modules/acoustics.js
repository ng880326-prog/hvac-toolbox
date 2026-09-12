// Module: Acoustics (聲學) — from 'Acoustics' sheet
import { register } from '../registry.js';
import { h, res, card, form, results } from '../ui.js';
import * as E from '../engine/electrical.js';

const I18N = {
  title: { en: 'Acoustics', zh: '聲學計算' },
  desc: { en: 'Sound power ⇄ pressure level at distance with directivity, and energetic addition of sources.', zh: '聲功率⇄距離處聲壓級（含指向因數）換算、多聲源疊加。' },
  splTitle: { en: 'SPL at a Distance', zh: '距離 r 處聲壓級' },
  splSub: { en: 'SPLr = SWL − 10·log(4πr²) + 10·log(Qθ)', zh: 'SPLr = SWL − 10·log(4πr²) + 10·log(Qθ)' },
  swlTitle: { en: 'SWL of the Source', zh: '聲源聲功率級' },
  swlSub: { en: 'SWL = SPLr + 10·log(4πr²) − 10·log(Qθ)', zh: 'SWL = SPLr + 10·log(4πr²) − 10·log(Qθ)' },
  addTitle: { en: 'Combination of Sound Levels', zh: '多聲源疊加' },
  addSub: { en: 'SL = 10·log(Σ 10^(0.1·SLi))', zh: 'SL = 10·log(Σ 10^(0.1·SLi))' },
  swl: { en: 'Sound power level SWL', zh: '聲功率級 SWL' },
  spl: { en: 'Sound pressure level SPLr', zh: '聲壓級 SPLr' },
  r: { en: 'Distance r', zh: '距離 r' },
  q: { en: 'Directivity factor Qθ', zh: '指向因數 Qθ' },
  sl1: { en: 'Source 1', zh: '聲源 1' },
  sl2: { en: 'Source 2', zh: '聲源 2' },
  sl3: { en: 'Source 3', zh: '聲源 3' },
  sl4: { en: 'Source 4', zh: '聲源 4' },
  result: { en: 'Resultant level', zh: '合成聲級' },
};

function render(root, { L }) {
  const T = (k) => L(I18N[k]);
  const QOPTS = E.DIRECTIVITY.map((d) => ({ v: d.Q, label: L(d.label) ?? d.label }));

  root.append(card(T('splTitle'), T('splSub'), (body) => {
    const f = form([
      { key: 'swl', label: T('swl'), unit: 'dB(A)', def: 80 },
      { key: 'r', label: T('r'), unit: 'm', def: 5 },
      { key: 'q', label: T('q'), unit: '—', def: 2, type: 'select', options: QOPTS },
    ], draw, 'grid3');
    const box = h('div');
    body.append(f.grid, box);
    function draw(st) {
      if ([st.swl, st.r, st.q].some((x) => x == null || x <= 0)) { results(box, []); return; }
      results(box, [res(T('spl'), E.splFromSwl(st.swl, st.r, st.q), 'dB(A)', { digits: 1, big: true })]);
    }
    draw(f.all());
  }, { src: 'Standard handbook relation (workbook sheet matches exactly)' }));

  root.append(card(T('swlTitle'), T('swlSub'), (body) => {
    const f = form([
      { key: 'spl', label: T('spl'), unit: 'dB(A)', def: 58 },
      { key: 'r', label: T('r'), unit: 'm', def: 5 },
      { key: 'q', label: T('q'), unit: '—', def: 2, type: 'select', options: QOPTS },
    ], draw, 'grid3', 'swl-');
    const box = h('div');
    body.append(f.grid, box);
    function draw(st) {
      if ([st.spl, st.r, st.q].some((x) => x == null || x <= 0)) { results(box, []); return; }
      results(box, [res(T('swl'), E.swlFromSpl(st.spl, st.r, st.q), 'dB(A)', { digits: 1, big: true })]);
    }
    draw(f.all());
  }));

  root.append(card(T('addTitle'), T('addSub'), (body) => {
    const f = form([
      { key: 's1', label: T('sl1'), unit: 'dB(A)', def: 80 },
      { key: 's2', label: T('sl2'), unit: 'dB(A)', def: 80 },
      { key: 's3', label: T('sl3'), unit: 'dB(A)', def: '' },
      { key: 's4', label: T('sl4'), unit: 'dB(A)', def: '' },
    ], draw, 'grid4');
    const box = h('div');
    body.append(f.grid, box);
    function draw(st) {
      const lv = [st.s1, st.s2, st.s3, st.s4].filter((x) => x != null && x > 0);
      if (!lv.length) { results(box, []); return; }
      results(box, [res(T('result'), E.addDb(lv), 'dB(A)', { digits: 1, big: true })]);
    }
    draw(f.all());
  }));
}

register({ id: 'acoustics', icon: '🔊', group: 'special', title: I18N.title, desc: I18N.desc, src: 'Standard acoustics handbook relations', render });
