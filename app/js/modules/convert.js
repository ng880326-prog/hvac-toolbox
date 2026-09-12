// Module: Unit Converter (單位換算) — utility
import { register } from '../registry.js';
import { h, res, card, form, results } from '../ui.js';

const I18N = {
  title: { en: 'Unit Converter', zh: '單位換算' },
  desc: { en: 'Common HVAC unit conversions: capacity, flow, pressure, temperature, torque.', zh: '暖通常用單位換算：冷量、風量、壓力、溫度、扭矩。' },
  kw: { en: 'Power', zh: '功率' },
  rt: { en: 'Refrigeration tons', zh: '冷噸' },
  btuh: { en: 'Btu/h', zh: 'Btu/h' },
  kcalh: { en: 'kcal/h', zh: 'kcal/h' },
  flow: { en: 'Air flow', zh: '風量' },
  m3s: { en: 'm³/s', zh: 'm³/s' },
  lps: { en: 'L/s', zh: 'L/s' },
  cfm: { en: 'CFM', zh: 'CFM' },
  m3h: { en: 'm³/h', zh: 'm³/h' },
  press: { en: 'Pressure', zh: '壓力' },
  pa: { en: 'Pa', zh: 'Pa' },
  inwg: { en: 'in.wg', zh: 'in.wg' },
  mh2o: { en: 'm H₂O', zh: 'm H₂O' },
  bar: { en: 'bar', zh: 'bar' },
  temp: { en: 'Temperature', zh: '溫度' },
  c: { en: '°C', zh: '°C' },
  f: { en: '°F', zh: '°F' },
  nm: { en: 'Torque', zh: '扭矩' },
  kgfm: { en: 'kgf·m', zh: 'kgf·m' },
};

function render(root, { L }) {
  const T = (k) => L(I18N[k]);
  const INWG = 249.089; // Pa per in.wg

  // Every conversion card reuses the key 'x', so each one gets its own DOM id namespace — otherwise
  // several cards would emit the same id and their labels would all point at the first input.
  let convSeq = 0;

  function convCard(title, srcKey, unit, outs) {
    convSeq += 1;
    return card(title, '', (body) => {
      let box = null;
      const f = form([{ key: 'x', label: T(srcKey), unit, def: 1 }], (st) => {
        if (!box) return;
        if (st.x == null) { results(box, []); return; }
        results(box, outs(st.x).map((o) => res(o.label, o.val, o.unit, { digits: o.digits ?? 3 })));
      }, 'grid1', 'conv' + convSeq + '-');
      box = h('div');
      body.append(f.grid, box);
      results(box, outs(1).map((o) => res(o.label, o.val, o.unit, { digits: o.digits ?? 3 })));
    });
  }

  root.append(convCard(T('kw'), 'kw', 'kW', (x) => [
    { label: T('rt'), val: x / 3.51685, unit: 'RT' },
    { label: T('btuh'), val: x * 3412.14, unit: 'Btu/h', digits: 0 },
    { label: T('kcalh'), val: x * 860.421, unit: 'kcal/h', digits: 0 },
  ]));

  root.append(convCard(T('m3s'), 'm3s', 'm³/s', (x) => [
    { label: T('lps'), val: x * 1000, unit: 'L/s' },
    { label: T('m3h'), val: x * 3600, unit: 'm³/h' },
    { label: T('cfm'), val: x * 3600 / 0.472 / 1000, unit: 'CFM', digits: 0 },
  ]));

  root.append(convCard(T('pa'), 'pa', 'Pa', (x) => [
    { label: T('inwg'), val: x / INWG, unit: 'in.wg', digits: 4 },
    { label: T('mh2o'), val: x / 9806.65, unit: 'm H₂O', digits: 4 },
    { label: T('bar'), val: x / 1e5, unit: 'bar', digits: 5 },
  ]));

  root.append(card(T('temp'), '', (body) => {
    let box = null;
    const f = form([{ key: 'c', label: T('c'), unit: '°C', def: 24 }], (st) => {
      if (!box) return;
      if (st.c == null) { results(box, []); return; }
      results(box, [res(T('f'), st.c * 9 / 5 + 32, '°F', { digits: 1 })]);
    }, 'grid1');
    box = h('div');
    body.append(f.grid, box);
    results(box, [res(T('f'), 24 * 9 / 5 + 32, '°F', { digits: 1 })]);
  }));

  root.append(card(T('nm'), '', (body) => {
    let box = null;
    const f = form([{ key: 'kgfm', label: T('kgfm'), unit: 'kgf·m', def: 10 }], (st) => {
      if (!box) return;
      if (st.kgfm == null) { results(box, []); return; }
      results(box, [res(T('nm'), st.kgfm * 9.80665, 'N·m', { digits: 2 })]);
    }, 'grid1');
    box = h('div');
    body.append(f.grid, box);
    results(box, [res(T('nm'), 10 * 9.80665, 'N·m', { digits: 2 })]);
  }));
}

register({ id: 'convert', icon: '🔁', group: 'general', title: I18N.title, desc: I18N.desc, src: 'SI conversion factors', render });
