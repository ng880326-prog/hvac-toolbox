// Module: Stairwell Pressurisation (梯間加壓送風) — upgraded from 'SPF(PRC)' sheet
// Dual standard: GB 51251-2017 (current, default) & GB 50045-95 (legacy, workbook parity)
import { register } from '../registry.js';
import { h, res, flag, card, form, results, seg } from '../ui.js';
import * as E from '../engine/electrical.js';

const I18N = {
  title: { en: 'Stairwell Pressurisation', zh: '梯間加壓送風估算' },
  desc: { en: 'Smoke-control pressurisation air volume. Defaults to the current GB 51251-2017 Table 3.4.2 (×1.2 design factor, §3.4.1); the legacy GB 50045-95 mode is kept for comparison with the workbook.', zh: '防煙加壓送風量估算。預設現行 GB 51251-2017 表 3.4.2（×1.2 設計係數，§3.4.1）；GB 50045-95 舊版模式保留作原檔對照。' },
  mode: { en: 'Standard', zh: '規範版本' },
  gb51251: { en: 'GB 51251-2017 (current)', zh: 'GB 51251-2017（現行）' },
  gb50045: { en: 'GB 50045-95 (legacy)', zh: 'GB 50045-95（舊版）' },
  height: { en: 'Building height h', zh: '建築高度 h' },
  floors: { en: 'Floors served', zh: '負擔樓層數' },
  type: { en: 'Stair type', zh: '梯間類型' },
  door: { en: 'Door', zh: '單／雙扇門' },
  single: { en: 'Single leaf (×0.75)', zh: '單扇（×0.75）' },
  double: { en: 'Double leaf (×1)', zh: '雙扇（×1）' },
  exits: { en: 'Number of exits (legacy mode only)', zh: '出入口數量（僅舊版模式）' },
  one: { en: '1 (×1)', zh: '1 個（×1）' },
  multi: { en: '>1 (×1.5)', zh: '多於 1 個（×1.5）' },
  refuge: { en: 'Refuge floor area (adds 30 m³/h·m²)', zh: '避難層淨面積（另加 30 m³/h·m²）' },
  base: { en: 'Base (table) flow', zh: '查表基本風量' },
  design: { en: 'Design flow (×1.2)', zh: '設計風量（×1.2）' },
  total: { en: 'Estimated fan flow', zh: '估算風機送風量' },
  doorF: { en: 'Door factor', zh: '單雙扇修正係數' },
  exitF: { en: 'Exit factor', zh: '出入口修正係數' },
  refugeAdd: { en: 'Refuge floor addition', zh: '避難層附加風量' },
  warnLegacy: { en: 'GB 50045-95 was superseded by GB 51251-2017 (in force 2018-08-01). Legacy values understate current requirements by 30–60%.', zh: 'GB 50045-95 已由 GB 51251-2017 取代（2018-08-01 實施）。舊表值比現行要求低 30–60%。' },
  noteCurrent: { en: 'Current standard: table 3.4.2 values interpolated by building height; design flow ≥ 1.2 × calculated flow (§3.4.1); single-leaf door ×0.75 per table note.', zh: '現行規範：表 3.4.2 按建築高度線性內插；設計風量 ≥ 1.2×計算風量（§3.4.1）；單扇門 ×0.75（表註）。' },
};

function render(root, { L }) {
  const T = (k) => L(I18N[k]);
  let mode = 'gb51251', door = 'single', exits = '1', type = 'A', f = null;

  root.append(card(T('title'), T('desc'), (body) => {
    const modeRow = h('div', { class: 'field' }, h('label', {}, T('mode')),
      seg([{ v: 'gb51251', label: T('gb51251') }, { v: 'gb50045', label: T('gb50045') }], mode,
        (v) => { mode = v; rebuild(); }));
    const typeRow = h('div', { class: 'field' }, h('label', {}, T('type')),
      seg(['A', 'B1', 'B2', 'C', 'D'].map((v) => ({ v, label: v })), 'A', (v) => { type = v; draw(); }));
    const doorRow = h('div', { class: 'field' }, h('label', {}, T('door')),
      seg([{ v: 'single', label: T('single') }, { v: 'double', label: T('double') }], door,
        (v) => { door = v; draw(); }));
    const exitRow = h('div', { class: 'field' }, h('label', {}, T('exits')),
      seg([{ v: '1', label: T('one') }, { v: '2', label: T('multi') }], exits,
        (v) => { exits = v; draw(); }));
    const inputs = h('div');
    const box = h('div');
    body.append(modeRow, typeRow, doorRow, exitRow, inputs, box);

    function rebuild() {
      inputs.innerHTML = '';
      exitRow.style.display = mode === 'gb50045' ? '' : 'none';
      f = form(mode === 'gb51251'
        ? [{ key: 'h', label: T('height'), unit: 'm', def: 40 }, { key: 'refuge', label: T('refuge'), unit: 'm²', def: '' }]
        : [{ key: 'floors', label: T('floors'), unit: '層', def: 12 }],
      () => draw(), 'grid2');
      inputs.append(f.grid);
      draw();
    }
    function draw() {
      box.innerHTML = '';
      if (!f) return;
      const st = f.all();
      if (mode === 'gb51251') {
        if (st.h == null || !type) return;
        const r = E.stairFlowGB(type, st.h, door, st.refuge || 0);
        results(box, [
          res(T('base'), r.base, 'm³/h', { digits: 0 }),
          res(T('design'), r.design, 'm³/h', { digits: 0 }),
          res(T('doorF'), r.doorF, '—', { digits: 2 }),
          res(T('refugeAdd'), r.refuge, 'm³/h', { digits: 0 }),
          res(T('total'), r.total, 'm³/h', { digits: 0, big: true }),
        ]);
        box.append(h('div', { class: 'note' }, T('noteCurrent')));
      } else {
        if (st.floors == null || !type) return;
        const r = E.stairFlow(type, st.floors, door, exits === '2' ? 2 : 1);
        if (!r) {
          box.append(flag(T('warnLegacy'), 'info'));
          return;
        }
        results(box, [
          res(T('base'), r.base, 'm³/h', { digits: 0 }),
          res(T('doorF'), r.doorF, '—', { digits: 2 }),
          res(T('exitF'), r.exitF, '—', { digits: 1 }),
          res(T('total'), r.total, 'm³/h', { digits: 0, big: true }),
        ]);
        box.append(flag(T('warnLegacy'), 'bad'));
      }
    }
    rebuild();
  }, {
    formula: 'GB 51251-2017: base = interp(table 3.4.2, h);  design = base × 1.2;  fan = design × door + 30·A_refuge',
    src: 'GB 51251-2017 §3.4 · Table 3.4.2 (current) / GB 50045-95 8.3 (superseded)',
  }));
}

register({ id: 'stairwell', icon: '🏢', group: 'special', title: I18N.title, desc: I18N.desc, src: 'GB 51251-2017 · GB 50045-95 (legacy)', render });
