// BEC insulation-table integrity checks (node tests/insulation_tables.mjs)
//
// These verify the published tables held in app/js/data/insulation_refs.js:
//   1. shape         — every row carries one value per column of its edition;
//   2. code equations — Equation (a)+(b) reproduces the tabulated values within rounding;
//   3. safety        — the tabulated value is never below the equation-derived one by more than the
//                      code's own whole-millimetre rounding, and commercial sizes never fall short;
//   4. monotonicity  — thickness grows with λ and falls with h, as the physics requires;
//   5. workbook      — the BEC 2012 tables equal the workbook's hidden source ranges.
import { BEC_2024, BEC_2012, BEC_EDITIONS } from '../app/js/data/insulation_refs.js';
import { provisionalThicknessMm, pipeThicknessFromEquivalentMm } from '../app/js/engine/fluids.js';

let pass = 0;
let fail = 0;
const failures = [];

function check(name, ok, detail = '') {
  if (ok) { pass += 1; console.log(`  ✔ ${name}${detail ? '  ' + detail : ''}`); }
  else { fail += 1; failures.push(name); console.log(`  ✘ ${name}  ${detail}`); }
}

function basisOf(ed, col) {
  if (col.exposure === 'void' && ed.voidSpace) return ed.voidSpace;
  return ed.outdoor;
}

for (const ed of BEC_EDITIONS) {
  console.log(`\n== BEC ${ed.id} ==`);
  const nCols = ed.columns.length;

  // 1. shape
  check('pipe rows carry every column', ed.pipe.every((r) => r.mm.length === nCols),
    `${ed.pipe.length} rows × ${nCols} columns`);
  check('duct rows carry every column', ed.duct.every((r) => r.mm.length === nCols));
  check('refrigerant rows carry 0/−10/−20 °C', ed.refrigerant.every((r) => [0, -10, -20].every((t) => Array.isArray(r.mm[t]) && r.mm[t].length === nCols)),
    `${ed.refrigerant.length} outer diameters × 3 line temperatures`);
  if (ed.commercial) {
    check('commercial rows carry every column', ed.commercial.every((r) => r.mm.length === nCols));
  }

  // 2. code equations vs the tables (conditioned-space columns follow ASHRAE 90.1 and are excluded)
  let worst = 0;
  let worstAt = '';
  let cells = 0;
  for (const row of ed.pipe) {
    ed.columns.forEach((col, i) => {
      if (col.h == null) return;
      const b = basisOf(ed, col);
      const c = provisionalThicknessMm(col.lambda, col.h, b.dewPoint, ed.pipeLineTemp, b.ambientDB);
      const la = pipeThicknessFromEquivalentMm(row.od, c);
      cells += 1;
      const d = la - row.mm[i];
      if (Math.abs(d) > Math.abs(worst)) { worst = d; worstAt = `od ${row.od} λ${col.lambda} h${col.h} tab ${row.mm[i]}`; }
    });
  }
  check(`Equations (a)+(b) reproduce Table 6.11a within 1.5 mm`, Math.abs(worst) <= 1.5,
    `${cells} cells, worst ${worst.toFixed(3)} mm at ${worstAt}`);

  // Ductwork/casing: Equation (a) is the basis, but the tabulated value is then lifted to the 13 mm
  // floor (TG §6.11.1(a)(vi)) and to commercial product sizes, so the table must never sit *below*
  // the equation and the excess must stay within a commercial-size step.
  let ductShort = 0;
  let ductShortAt = '';
  let ductExcess = 0;
  let ductExcessAt = '';
  for (const row of ed.duct) {
    ed.columns.forEach((col, i) => {
      if (col.h == null) return;
      const b = basisOf(ed, col);
      const c = provisionalThicknessMm(col.lambda, col.h, b.dewPoint, b.ambientDB - row.dT, b.ambientDB);
      const calc = Math.ceil(c - 1e-9);
      if (row.mm[i] < calc - 1) { ductShort += 1; ductShortAt = `ΔT ${row.dT} λ${col.lambda} h${col.h}: eq ${calc} > tab ${row.mm[i]}`; }
      if (row.mm[i] - calc > ductExcess) { ductExcess = row.mm[i] - calc; ductExcessAt = `ΔT ${row.dT} λ${col.lambda} h${col.h}: tab ${row.mm[i]} vs eq ${calc}`; }
    });
  }
  check('Table 6.11c never falls below Equation (a)', ductShort === 0, ductShort ? ductShortAt : '');
  check('Table 6.11c excess ≤ 12 mm (13 mm floor + commercial sizes)', ductExcess <= 12,
    `worst +${ductExcess} mm at ${ductExcessAt}`);

  // 3a. the tabulated value may round below the equation only by whole-millimetre rounding
  let short = 0;
  let shortAt = '';
  for (const row of ed.pipe) {
    ed.columns.forEach((col, i) => {
      if (col.h == null) return;
      const b = basisOf(ed, col);
      const c = provisionalThicknessMm(col.lambda, col.h, b.dewPoint, ed.pipeLineTemp, b.ambientDB);
      const la = pipeThicknessFromEquivalentMm(row.od, c);
      // Equation (b) is convex, so dLa/dc < 1: a 1 mm shortfall in the table costs < 1 mm of La.
      if (la - row.mm[i] > 1) { short += 1; shortAt = `od ${row.od} λ${col.lambda} h${col.h}: eq ${la.toFixed(2)} vs ${row.mm[i]}`; }
    });
  }
  check('no tabulated cell is more than 1 mm below the equation', short === 0, short ? shortAt : '');

  // 3b. commercial sizes never fall short of the code minimum
  if (ed.commercial) {
    let bad = 0;
    let badAt = '';
    for (const row of ed.commercial) {
      const pipe = ed.pipe.find((p) => p.dn === row.dn);
      if (!pipe) { bad += 1; badAt = `commercial DN${row.dn} has no pipework row`; continue; }
      row.mm.forEach((v, i) => {
        if (v < pipe.mm[i]) { bad += 1; badAt = `DN${row.dn} col ${i}: commercial ${v} < code ${pipe.mm[i]}`; }
      });
    }
    check('commercial size ≥ code minimum everywhere', bad === 0, bad ? badAt : '');
  }

  // 4. monotonicity: in a fixed exposure, more λ needs more thickness and more h needs less
  let mono = 0;
  let monoAt = '';
  for (const row of ed.pipe) {
    const byExposure = {};
    ed.columns.forEach((col, i) => { (byExposure[col.exposure] ||= []).push({ col, v: row.mm[i] }); });
    for (const [exposure, list] of Object.entries(byExposure)) {
      for (const a of list) {
        for (const b of list) {
          // Compare like with like: hold h fixed while varying λ, and λ fixed while varying h
          // (otherwise the surface-coefficient effect masks the conductivity effect).
          if (a.col.lambda < b.col.lambda && a.col.h === b.col.h && a.v > b.v) { mono += 1; monoAt = `${exposure} OD ${row.od}: λ ${a.col.lambda}→${b.col.lambda} at h=${a.col.h} but ${a.v}→${b.v}`; }
          if (a.col.h != null && b.col.h != null && a.col.h > b.col.h && a.col.lambda === b.col.lambda && a.v > b.v) { mono += 1; monoAt = `${exposure} OD ${row.od}: h ${a.col.h}→${b.col.h} at λ=${a.col.lambda} but ${a.v}→${b.v}`; }
        }
      }
    }
  }
  check('thickness grows with λ and falls with h', mono === 0, mono ? monoAt : '');

  // every value at least the 13 mm floor the codes apply to conditioned space
  const flat = ed.pipe.flatMap((r) => r.mm).concat(ed.duct.flatMap((r) => r.mm));
  check('every tabulated value ≥ 13 mm', flat.every((v) => v >= 13), `min ${Math.min(...flat)} mm`);
}

// 5. workbook parity: BEC 2012 Table 6.11a is exactly the workbook's AB10:AK25 range.
console.log('\n== workbook parity (29_Insulations) ==');
const WORKBOOK_AB10_AK25 = [
  [20, 15, 30, 22, 29, 19, 43, 28, 13, 13], [21, 15, 32, 23, 31, 20, 46, 29, 13, 13],
  [22, 16, 34, 24, 32, 21, 48, 31, 13, 13], [23, 17, 35, 25, 34, 21, 50, 32, 13, 25],
  [24, 17, 36, 26, 35, 22, 52, 33, 13, 25], [25, 18, 38, 27, 36, 23, 54, 35, 13, 25],
  [26, 18, 40, 28, 38, 24, 57, 36, 14, 25], [26, 19, 41, 29, 39, 24, 59, 37, 14, 25],
  [27, 19, 42, 30, 41, 25, 62, 39, 14, 25], [28, 20, 44, 31, 42, 26, 64, 40, 14, 25],
  [29, 20, 45, 32, 43, 26, 66, 41, 14, 25], [29, 20, 47, 32, 44, 27, 69, 42, 15, 25],
  [30, 21, 48, 33, 45, 27, 71, 43, 15, 25], [30, 21, 49, 34, 46, 28, 73, 44, 15, 25],
  [31, 21, 49, 34, 47, 28, 74, 45, 15, 25], [31, 21, 50, 34, 47, 28, 75, 45, 15, 25],
];
check('BEC 2012 Table 6.11a === workbook AB10:AK25',
  BEC_2012.pipe.every((r, i) => r.mm.every((v, j) => v === WORKBOOK_AB10_AK25[i][j])));

const WORKBOOK_AB50_AK52 = [
  [13, 13, 21, 14, 20, 13, 33, 19, 13, 18],
  [20, 13, 33, 22, 31, 18, 52, 30, 15, 25],
  [27, 18, 46, 30, 43, 25, 72, 41, 15, 25],
];
check('BEC 2012 Table 6.11c + TG 10 °C === workbook AB50:AK52',
  BEC_2012.duct.every((r, i) => r.mm.every((v, j) => v === WORKBOOK_AB50_AK52[i][j])));

// 6. edition differences that a HK submission must know about
console.log('\n== BEC 2021 → 2024 changes ==');
check('2024 adds the ceiling-void ambient condition', BEC_2024.columns.some((c) => c.exposure === 'void')
  && !BEC_2012.columns.some((c) => c.exposure === 'void'));
check('2024 rates λ at 0.038 (2012: 0.04)', BEC_2024.columns.some((c) => c.lambda === 0.038)
  && BEC_2012.columns.some((c) => c.lambda === 0.04));
check('2024 carries a commercial-size table', Array.isArray(BEC_2024.commercial) && BEC_2024.commercial.length === 16);
check('2024 pipework thinner than 2012 at equal λ/h',
  BEC_2024.pipe[0].mm[2] <= BEC_2012.pipe[0].mm[2],
  `DN15 λ0.038/0.04 h9: ${BEC_2024.pipe[0].mm[2]} vs ${BEC_2012.pipe[0].mm[2]}`);

console.log(`\n${fail === 0 ? 'BEC TABLES OK' : 'BEC TABLES FAILED'} — pass ${pass} / ${pass + fail}`);
if (fail) { console.log('failures:\n  ' + failures.join('\n  ')); process.exitCode = 1; }
