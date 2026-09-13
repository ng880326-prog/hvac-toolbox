// Motor / electrical reference data — extracted from the workbook 'Motor' sheet (print area B2:BL39).
//
// Provenance (Excel cells in 00_HVAC Toolbox_R5.xlsm, sheet 'Motor'):
//   MOTOR_RATINGS      X6:AC26   kW rating vs running current, phase, starting method, starting current
//                                and MCB rating — the sheet computes the currents as
//                                A = kW·1000 / (√3 · 380 · pf) for 3Ø and A = kW·1000 / (220 · pf) for 1Ø
//                                with pf = 0.85 implied by the printed numbers
//   ISOLATOR_SIZES     AE4:AE23  isolator rating list in A
//   START_METHODS      B26:C30   starting-current multipliers: DOL 6, Υ/Δ 2.5, Auto-Tx 1.5, VSD 1.3
//   VOLTAGES           B17:C18   1Ø 220 V, 3Ø 380 V
//   EFFICIENCY_BY_FLOW B21:C24   motor efficiency vs air-flow band (<1000 L/s 0.65, 1000–2000 0.7, >2000 0.75)
//   SIZING_DEFAULTS    AG12:AL19 fan: motor 0.7 / fan 0.7 / SF 1.2;  pump: motor 0.8 / SF 1.5
//   PRESSURE_UNITS     B9:D15    kPa ↔ m / bar / kPa / MPa
//   ER_RULE            AW9       ER = 0.002342 · H / (Δt · η)   (GB 50189-2005 §5.3.27)

export const VOLTAGES = { single: 220, three: 380 };

export const START_METHODS = [
  { method: 'DOL', factor: 6, zh: '直接起動' },
  { method: 'Υ/Δ', factor: 2.5, zh: '星三角' },
  { method: 'Auto-Tx', factor: 1.5, zh: '自耦變壓器' },
  { method: 'VSD', factor: 1.3, zh: '變頻' },
];

export const EFFICIENCY_BY_FLOW = [
  { label: '<1000 L/s', min: 0, max: 1000, eff: 0.65 },
  { label: '1000~2000 L/s', min: 1000, max: 2000, eff: 0.7 },
  { label: '>2000 L/s', min: 2000, max: Infinity, eff: 0.75 },
];

export const ISOLATOR_SIZES = [16, 40, 63, 80, 100, 125, 160, 200, 250, 315, 400, 630, 800, 1000, 1250, 1600, 2000, 2500, 3150];

/** Rating table (workbook X6:AC26). Currents are as printed; pf = 0.85 reproduces them. */
export const MOTOR_RATINGS = [
  { kW: 0.2, amp: 1.0695, phase: '1Ø', method: 'fuse', startA: 6.4171, mcb: 20, isolator: 16 },
  { kW: 0.25, amp: 1.3369, phase: '1Ø', method: 'fuse', startA: 8.0214, mcb: 20, isolator: 40 },
  { kW: 0.37, amp: 1.9786, phase: '1Ø', method: 'fuse', startA: 11.8717, mcb: 20, isolator: 63 },
  { kW: 0.55, amp: 2.9412, phase: '1Ø', method: 'fuse', startA: 17.6471, mcb: 20, isolator: 80 },
  { kW: 0.75, amp: 4.0107, phase: '1Ø', method: 'fuse', startA: 24.0642, mcb: 20, isolator: 100 },
  { kW: 1.1, amp: 5.8824, phase: '1Ø', method: 'fuse', startA: 35.2941, mcb: 20, isolator: 125 },
  { kW: 1.5, amp: 8.0214, phase: '1Ø', method: 'fuse', startA: 48.1283, mcb: 20, isolator: 160 },
  { kW: 2.2, amp: 11.7647, phase: '1Ø', method: 'fuse', startA: 70.5882, mcb: 30, isolator: 200 },
  { kW: 3, amp: 5.3624, phase: '3Ø', method: 'DOL', startA: 32.1743, mcb: 20, isolator: 250 },
  { kW: 3.7, amp: 6.6136, phase: '3Ø', method: 'Υ/Δ', startA: 16.5340, mcb: 20, isolator: 315 },
  { kW: 4, amp: 7.1498, phase: '3Ø', method: 'Υ/Δ', startA: 17.8746, mcb: 20, isolator: 400 },
  { kW: 5.5, amp: 9.8310, phase: '3Ø', method: 'Υ/Δ', startA: 24.5776, mcb: 20, isolator: 630 },
  { kW: 7.5, amp: 13.4060, phase: '3Ø', method: 'Υ/Δ', startA: 33.5149, mcb: 30, isolator: 800 },
  { kW: 9, amp: 16.0872, phase: '3Ø', method: 'Υ/Δ', startA: 40.2179, mcb: 40, isolator: 1000 },
  { kW: 11, amp: 19.6621, phase: '3Ø', method: 'Υ/Δ', startA: 49.1552, mcb: 40, isolator: 1250 },
  { kW: 15, amp: 26.8119, phase: '3Ø', method: 'Υ/Δ', startA: 67.0298, mcb: 50, isolator: 1600 },
  { kW: 18.5, amp: 33.0680, phase: '3Ø', method: 'Υ/Δ', startA: 82.6701, mcb: 80, isolator: 2000 },
  { kW: 22, amp: 39.3242, phase: '3Ø', method: 'Υ/Δ', startA: 98.3104, mcb: 80, isolator: 2500 },
  { kW: 25, amp: 44.6866, phase: '3Ø', method: 'Υ/Δ', startA: 111.7164, mcb: 100, isolator: 3150 },
  { kW: 30, amp: 53.6239, phase: '3Ø', method: 'Υ/Δ', startA: 134.0597, mcb: 100, isolator: null },
  { kW: 33, amp: 58.9863, phase: '3Ø', method: 'Υ/Δ', startA: 147.4656, mcb: 150, isolator: null },
];

/** Sizing defaults printed on the sheet (AG/AL blocks). */
export const SIZING_DEFAULTS = {
  fanMotorEff: 0.7, fanEff: 0.7, fanSF: 1.2,
  pumpMotorEff: 0.8, pumpSF: 1.5,
};

/** Pressure unit conversion factors against 1 kPa (workbook B9:D15). */
export const PRESSURE_UNITS = [
  { unit: 'kPa', perKPa: 1 },
  { unit: 'bar', perKPa: 0.01 },
  { unit: 'MPa', perKPa: 0.001 },
  { unit: 'm H₂O', perKPa: 0.10197 },
];

/** Pump-head defaults (workbook N9/N13/N15). */
export const PUMP_DEFAULTS = { pdPerM: 300, terminalCoil: 30000, hxCoil: 80000, safety: 1.2 };
