// HVAC Toolbox — engine test runner (node tests/run_tests.mjs)
import * as psychro from '../app/js/engine/psychro.js';
import * as fluids from '../app/js/engine/fluids.js';
import * as ducts from '../app/js/engine/ducts.js';
import * as electrical from '../app/js/engine/electrical.js';
import { vectors } from './vectors.js';

// Map group prefixes to modules: tests call fn(module). The module picker inspects the fn signature
// via a marker field on each test, defaulting to a combined namespace lookup.
const NS = { psychro, fluids, ducts, electrical };

let pass = 0, fail = 0;
const failures = [];

for (const group of vectors) {
  console.log(`\n== ${group.group} ==`);
  for (const t of group.tests) {
    let got, ok = false, err = null;
    try {
      // try each namespace; use the first module for which fn returns a finite number without throwing
      for (const name of Object.keys(NS)) {
        try {
          got = t.fn(NS[name]);
          if (typeof got === 'number') break;
        } catch (e) {
          err = e;
        }
      }
      if (typeof got !== 'number') throw err ?? new Error('no numeric result');
      ok = Math.abs(got - t.expect) <= t.tol;
      if (ok) { pass++; console.log(`  ✔ ${t.name}  (${fmt(got)} vs ${fmt(t.expect)} ±${t.tol})`); }
      else {
        fail++; failures.push({ group: group.group, name: t.name, got, expect: t.expect, tol: t.tol });
        console.log(`  ✘ ${t.name}  (${fmt(got)} vs ${fmt(t.expect)} ±${t.tol})`);
      }
    } catch (e) {
      fail++; failures.push({ group: group.group, name: t.name, error: String(e && e.message || e) });
      console.log(`  ✘ ${t.name}  THREW: ${e && e.message}`);
    }
  }
}

console.log(`\n================`);
console.log(`PASS ${pass} / ${pass + fail}`);
if (failures.length) {
  console.log('FAILURES:');
  for (const f of failures) console.log('  -', JSON.stringify(f));
  process.exit(1);
}

function fmt(x) {
  if (typeof x !== 'number') return String(x);
  if (Math.abs(x) >= 1e4 || (Math.abs(x) < 1e-3 && x !== 0)) return x.toExponential(4);
  return x.toFixed(4);
}
