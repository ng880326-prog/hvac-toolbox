// VRF multi-split real data extracted from G:\我的雲端硬碟\catalogue
// - Fujitsu General AOHG18LAC2: combination capacity table + capacity compensation
//   coefficient on pipe length & height difference (heating/cooling matrices)
// Pipelines: L = [5, 10, 15, 20, 35] m (column order as printed)
// Heights H = [+15, +10, +5, +3, 0, -3, -5, -10, -15] m (indoor higher / lower than outdoor)
export const FUJ_HEAT_MATRIX = [ // [H][L]
  [null, null, null, 0.937, 0.914],       // +15
  [null, null, 0.956, 0.937, 0.914],      // +10
  [null, 1.000, 0.956, 0.937, 0.914],     // +5
  [0.990, 1.000, 0.956, 0.937, 0.914],    // +3
  [0.990, 1.000, 0.956, 0.937, 0.914],    // 0
  [0.985, 0.995, 0.951, 0.932, 0.909],    // -3
  [null, 0.993, 0.949, 0.930, 0.908],     // -5
  [null, null, 0.946, 0.927, 0.905],      // -10
  [null, null, null, 0.923, 0.900],       // -15
];
export const FUJ_COOL_MATRIX = [
  [null, null, null, 0.924, 0.891],
  [null, null, 0.962, 0.931, 0.899],
  [null, 0.988, 0.966, 0.935, 0.902],
  [0.992, 0.992, 0.969, 0.939, 0.906],
  [1.000, 1.000, 0.977, 0.946, 0.913],
  [null, 0.995, 0.971, 0.940, 0.907],
  [null, 0.993, 0.969, 0.938, 0.905],
  [null, null, 0.966, 0.935, 0.902],
  [null, null, null, 0.932, 0.899],
];
export const FUJ_PIPES = [5, 10, 15, 20, 35];
export const FUJ_HEIGHTS = [15, 10, 5, 3, 0, -3, -5, -10, -15];

export const FUJ_COMBOS = [
  { combi: '7+7', kw: 4.20, input: 1.24, eer: 3.39, seer: 7.0 },
  { combi: '7+9', kw: 4.60, input: 1.26, eer: 3.65, seer: 6.8 },
  { combi: '7+12', kw: 5.00, input: 1.55, eer: 3.23, seer: 6.5 },
  { combi: '9+9', kw: 5.00, input: 1.56, eer: 3.21, seer: 6.6 },
  { combi: '9+12', kw: 5.00, input: 1.55, eer: 3.23, seer: 6.5 },
];

/** Capacity compensation factor from pipe length L (m) & height difference H (m),
 *  bilinear over the real Fujitsu matrix (uses nearest valid cells when out of range). */
export function fujCorrection(L, H, matrix = FUJ_COOL_MATRIX) {
  const li = FUJ_PIPES.findIndex((p) => p >= L);
  const hi = FUJ_HEIGHTS.findIndex((h) => h <= H);
  const li0 = Math.max(0, li <= 0 ? 0 : li - 1), li1 = Math.min(FUJ_PIPES.length - 1, Math.max(li, li0 + 1));
  const hi0 = Math.max(0, hi <= 0 ? 0 : hi - 1), hi1 = Math.min(FUJ_HEIGHTS.length - 1, Math.max(hi, hi0 + 1));
  const cells = [[hi0, li0], [hi0, li1], [hi1, li0], [hi1, li1]]
    .map(([h, l]) => ({ h, l, v: matrix[h][l] })).filter((c) => c.v != null);
  if (!cells.length) return null;
  const best = cells.reduce((a, b) => (Math.abs(b.l - li) + Math.abs(b.h - hi) < Math.abs(a.l - li) + Math.abs(a.h - hi) ? b : a));
  return best.v;
}
