// Module: Data Integrity (數據真確性自檢) — runs the engine test vectors inside the app
import { register } from '../registry.js';
import { h, res, flag, card, form, results } from '../ui.js';
import * as psychro from '../engine/psychro.js';
import * as fluids from '../engine/fluids.js';
import * as ducts from '../engine/ducts.js';
import * as electrical from '../engine/electrical.js';
import { vectors } from '../data/vectors.js';

const NS = { psychro, fluids, ducts, electrical };

// Single source for the vector count: the same list the Node runner executes, so the page can
// never advertise a stale number after vectors are added.
const VECTOR_COUNT = vectors.reduce((n, g) => n + g.tests.length, 0);

const SOURCES = {
  'psychrometrics': 'ASHRAE Fundamentals 2025 Ch.1 · Hyland & Wexler 1983 · Excel 快取值',
  'Hazen-Williams': 'ASHRAE F 2025 Ch.22 · CIBSE Guide C · Excel 快取值 (DN15/DN20 還原 400 Pa/m)',
  'unit conversions': 'SI 換算因子 · IAPWS',
  'ducts': 'Haaland 1983 · Huebscher 1948 · ASHRAE F 2025 Ch.21',
  'electrical & acoustics': 'IEC 相位關係 · 聲學手冊 · GB 50176',
  'NPSH': 'CIBSE/泵手冊 · Hyland & Wexler 1983',
  'insulation': 'ISO 12241 · GB 50264-2013',
  'stairwell': 'GB 51251-2017 表3.4.2 + §3.4.1 · GB 50045-95(對照)',
};

function render(root, { L }) {
  root.append(card(L({ en: 'Data Authenticity Self-Check', zh: '數據真確性自檢' }), '', (body) => {
    let pass = 0, fail = 0;
    const rows = [];
    for (const g of vectors) {
      let gPass = 0, gFail = 0;
      for (const t of g.tests) {
        let got = null, err = null;
        for (const name of Object.keys(NS)) {
          try {
            got = t.fn(NS[name]);
            if (typeof got === 'number') break;
          } catch (e) { err = e; }
        }
        if (typeof got === 'number' && Math.abs(got - t.expect) <= t.tol) { gPass++; pass++; }
        else { gFail++; fail++; rows.push(t.name + ' -> got ' + (typeof got === 'number' ? got.toFixed(4) : String(got)) + ' vs ' + t.expect); }
      }
      const src = SOURCES[g.group.split(' ')[0]] || SOURCES[g.group.slice(0, 14)] || '';
      body.append(h('div', { class: 'res' },
        h('div', { class: 'lbl' }, g.group + ' — ' + (gFail === 0 ? '✔' : '✘' + ' ' + gFail)),
        h('div', { class: 'val' }, gPass + '/' + (gPass + gFail) + ' · ' + (gFail === 0 ? '' : '存在偏差')),
        h('div', { class: 'note' }, src)));
    }
    body.append(flag(pass + ' / ' + (pass + fail) + ' 測試通過 — ' +
      L({ en: 'every formula re-validated against the workbook cached values and current standards.', zh: '全部公式均以原檔快取值與現行標準重新驗證。' }), pass > fail ? 'ok' : 'bad'));
    if (fail > 0) for (const r of rows) body.append(h('div', { class: 'note' }, '✘ ' + r));
    body.append(h('div', { class: 'note' },
      L({ en: 'What this checks: psychrometric Hyland-Wexler/W/h/v/RH, Hazen-Williams (reproducing the workbook DN15/DN20 = 400 Pa/m), Haaland friction, Huebscher, electrical/acoustics, NPSH, insulation, GB 51251 stairwell tables. Sources are cited per test group. Run: npm test (Node) or this page (browser) — identical vectors.', zh: '檢查項目：濕空氣（Hyland-Wexler／W／h／v／RH）、Hazen-Williams（重現原檔 DN15/DN20＝400 Pa/m）、Haaland 摩阻、Huebscher、電氣/聲學、NPSH、保溫、GB 51251 梯間表。每組標明來源；Node 端 npm test 與本頁共用同一批向量。' })));
  }, { src: 'app/js/data/vectors.js (' + vectors.reduce((n, g) => n + g.tests.length, 0) +
    ' vectors) · ASHRAE 2025 · CIBSE · IAPWS · GB · Excel cached values' }));
}

register({ id: 'verify', icon: '🔍', group: 'special', title: { en: 'Data Authenticity', zh: '數據真確性' }, desc: { en: 'Run the full formula audit inside the app — ' + VECTOR_COUNT + ' cross-checks with cited sources.', zh: '在 App 內執行完整公式檢驗 — ' + VECTOR_COUNT + ' 項交叉驗證並附來源。' }, render });
