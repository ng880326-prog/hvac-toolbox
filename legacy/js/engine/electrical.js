// HVAC Toolbox — Electrical & acoustics core
// Sources:
//  - Motor current: I1φ = P/(V·pf·η), I3φ = P/(√3·V·pf·η) — standard power relation
//    (workbook uses pf = 0.85, η tiers <1 / 1–2 / >2 kW).
//  - Torque: 1 kgf·m = 9.80665 N·m (workbook 9.804139432 ≈ 0.9997×).
//  - Acoustics: SPLr = SWL − 10·log(4πr²) + 10·log(Qθ); dB addition
//    10·log(Σ10^(Li/10)) — standard handbook relations.
//  - Starters: DOL / Y-Δ / auto-transformer selection by rating (typical IEC practice;
//    workbook table: fuse ≤, DOL mid, Auto-Tx large).

export const G_STD = 9.80665;
export const NMS_PER_KGFM = 9.80665;  // workbook: 9.804139432

/** Single-phase motor current (A). P kW, V volts, pf power factor, eff efficiency. */
export function current1Ph(PkW, V, pf = 0.85, eff = 1) { return PkW * 1000 / (V * pf * eff); }

/** Three-phase motor current (A). */
export function current3Ph(PkW, V, pf = 0.85, eff = 1) {
  return PkW * 1000 / (Math.sqrt(3) * V * pf * eff);
}

/** Input power from shaft power and efficiency (kW). */
export function inputPower(shaftKW, eff) { return shaftKW / eff; }

export const kgf_m = (nm) => nm / NMS_PER_KGFM;
export const nm = (kgfm) => kgfm * NMS_PER_KGFM;

/** Sound pressure level at distance r (m) from a source of power level SWL (dB) with directivity Qθ. */
export function splFromSwl(swl, r, Q) { return swl - 10 * Math.log10(4 * Math.PI * r * r) + 10 * Math.log10(Q); }

/** Sound power level from SPL measured at distance r (m), directivity Qθ. */
export function swlFromSpl(spl, r, Q) { return spl + 10 * Math.log10(4 * Math.PI * r * r) - 10 * Math.log10(Q); }

/** Energetic addition of sound levels (dB). */
export function addDb(levels) {
  const sum = levels.reduce((s, l) => s + Math.pow(10, 0.1 * l), 0);
  return 10 * Math.log10(sum);
}

/** Directivity factor lookup (workbook table). */
export const DIRECTIVITY = [
  { Q: 1, label: 'Free propagation (no rebound)' },
  { Q: 2, label: 'Rebounded by a wall or floor (1-face)' },
  { Q: 4, label: 'Rebounded by 2 walls or a wall & floor (2-face)' },
  { Q: 8, label: 'Rebounded by 2 walls & a floor (3-face)' },
];

/** Starter selection by motor rating (workbook logic). */
export function starterFor(kW, d1 = 4, d2 = 15) {
  if (kW <= d1) return 'fuse';
  if (kW <= d2) return 'DOL';
  return 'Auto-Tx';
}

/** China climate zones (GB 50176). */
export const CN_CLIMATE = [
  { key: 'SH', en: 'Severe Cold', zh: '嚴寒' },
  { key: 'C', en: 'Cold', zh: '寒冷' },
  { key: 'HSCW', en: 'Hot Summer Cold Winter', zh: '夏熱冬冷' },
  { key: 'HSWW', en: 'Hot Summer Warm Winter', zh: '夏熱冬暖' },
  { key: 'M', en: 'Mild', zh: '溫和' },
];

/** GB 50045-95 (2005 ed.) stairwell pressurisation base air volumes, m³/h.
 *  Superseded by GB 51251-2017 — retained for parity; see verification report. */
export const STAIR_PRESS = {
  A: { lt20: [25000, 30000], g20_32: [35000, 40000], label: '防煙樓梯間(前室不送風)' },
  B1: { lt20: [16000, 20000], g20_32: [20000, 25000], label: '防煙樓梯間及合用前室(防煙梯間)' },
  B2: { lt20: [12000, 16000], g20_32: [18000, 22000], label: '防煙樓梯間及合用前室(合用前室)' },
  C: { lt20: [15000, 20000], g20_32: [22000, 27000], label: '消防電梯間前室' },
  D: null, // natural smoke extraction: N/A in legacy table
};

/**
 * GB 51251-2017 Table 3.4.2 (current standard), m³/h.
 * hi = building height 24<h≤50 m, hi2 = 50<h≤100 m; linear interpolation per §3.4.2.
 * Design factor 1.2 per §3.4.1 applied separately.
 */
export const STAIR_PRESS_GB51251 = {
  A: { h: [36100, 39200], h2: [39600, 45800], label: '前室不送風，樓梯間加壓（表3.4.2-3）' },
  B1: { h: [25300, 27500], h2: [27800, 32200], label: '樓梯間＋前室分別加壓 — 樓梯間（表3.4.2-4）' },
  B2: { h: [24800, 25800], h2: [26000, 28100], label: '樓梯間＋前室分別加壓 — 前室（表3.4.2-4）' },
  C: { h: [35400, 36900], h2: [37100, 40200], label: '消防電梯前室加壓（表3.4.2-1）' },
  D: { h: [42400, 44700], h2: [45000, 48600], label: '樓梯間自然通風，前室／合用前室加壓（表3.4.2-2）' },
};

export const STAIR_DESIGN_FACTOR = 1.2; // GB 51251-2017 §3.4.1
export const REFUGE_FLOOR_RATE = 30;   // m³/(h·m²) refuge floor (GB 51251-2017 §3.4.3)

/** GB 51251-2017 base flow (m³/h) by building height h (m), linear interpolation, table 3.4.2. */
export function stairBaseFlowGB(type, h) {
  const s = STAIR_PRESS_GB51251[type];
  if (!s) return null;
  if (h <= 24) return s.h[0];
  if (h <= 50) return s.h[0] + (s.h[1] - s.h[0]) * (h - 24) / 26;
  if (h <= 100) return s.h2[0] + (s.h2[1] - s.h2[0]) * (h - 50) / 50;
  return s.h2[1];
}

/** Legacy GB 50045-95 base flow by floors. */
export function stairBaseFlow(type, floors) {
  const s = STAIR_PRESS[type];
  if (!s) return null;
  if (floors < 20) {
    return s.lt20[0] + (s.lt20[1] - s.lt20[0]) * (floors - 1) / (19 - 1);
  }
  return s.g20_32[0] + (s.g20_32[1] - s.g20_32[0]) * (floors - 20) / (32 - 20);
}

/** Legacy GB 50045-95 final flow: base × door factor (0.75 single / 1 double) × exits (>1 → 1.5). */
export function stairFlow(type, floors, door, exits) {
  const base = stairBaseFlow(type, floors);
  if (base == null) return null;
  const doorF = door === 'single' ? 0.75 : 1;
  const exitF = exits > 1 ? 1.5 : 1;
  return { base, total: base * doorF * exitF, doorF, exitF };
}

/** GB 51251-2017 design flow: base(h) × 1.2 × door factor (0.75 single, table note). */
export function stairFlowGB(type, h, door, refugeArea = 0) {
  const base = stairBaseFlowGB(type, h);
  if (base == null) return null;
  const doorF = door === 'single' ? 0.75 : 1;
  const refuge = refugeArea > 0 ? refugeArea * REFUGE_FLOOR_RATE : 0;
  const total = base * STAIR_DESIGN_FACTOR * doorF + refuge;
  return { base, design: base * STAIR_DESIGN_FACTOR, doorF, refuge, total };
}
