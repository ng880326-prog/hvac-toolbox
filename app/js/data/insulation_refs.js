// Minimum insulation thickness reference data — HK EMSD "Code of Practice for Energy Efficiency of
// Building Services Installation" (BEC), clause 6.11, Tables 6.11a / 6.11b / 6.11c, plus the 10 °C
// supplement and the commercial-size table from the "Technical Guidelines" (TG-BEC).
//
// Two editions are carried because they differ:
//   BEC 2024  λ = 0.024 / 0.038 W/m·K, four ambient conditions (a new "ceiling void / void of
//             conditioned space" category joins outdoor / unconditioned / conditioned), supplanted by
//             ASHRAE 90.1-2019 for conditioned space.  Source: BEC_2024_ENG.pdf pp. 32–34
//             (Table 6.11a/6.11b/6.11c); TG-BEC_2024.pdf §6.11.1 Tables 6.11.1(a) and 6.11.1(e).
//   BEC 2012  λ = 0.024 / 0.04, three ambient conditions, ASHRAE 90.1-2007 for conditioned space.
//             Source: BEC_2012.pdf pp. 23–26; TG-BEC_2012 (Rev.1) §6.11.1 Table 6.11.1(a).
//
// Workbook traceability — sheet '29_Insulations' (blank BEC-2012 template):
//   AB10:AK25  chilled-water pipework thickness (16 outer diameters × the 10 BEC-2012 columns)
//   AB50:AK52  ductwork / AHU casing thickness (ΔT 10 / 15 / 20 °C × the same 10 columns)
//   K19:N31    refrigerant (suction) pipework block — pipe list and line temperatures only
//   AM13:AN45  pipe nominal → outside diameter lookup used by the sheet
//   AB3:AK8    column metadata (exposure index, λ, h) for the 10 BEC-2012 columns
//   The sheet's visible thickness cells all read "-": F18 =IF(SUM(AB27:AK27)=0,"-",…) sums rows that
//   hold zeros because the data sits 17 rows higher (AB10:AK25), and I18/L20 read AB54/AB100 — also
//   zero. The pipework data itself is identical to BEC 2012 Table 6.11a, cell for cell.
// Nothing here is invented: every number is a published BEC/TG value or the workbook cell that equals it.

/** Ambient / conductivity / surface-coefficient columns of BEC 2024 Tables 6.11a–6.11c, in order. */
export const COLUMNS_2024 = [
  { exposure: 'outdoor', lambda: 0.024, h: 9 },
  { exposure: 'outdoor', lambda: 0.024, h: 13.5 },
  { exposure: 'outdoor', lambda: 0.038, h: 9 },
  { exposure: 'outdoor', lambda: 0.038, h: 13.5 },
  { exposure: 'unconditioned', lambda: 0.024, h: 5.7 },
  { exposure: 'unconditioned', lambda: 0.024, h: 10 },
  { exposure: 'unconditioned', lambda: 0.038, h: 5.7 },
  { exposure: 'unconditioned', lambda: 0.038, h: 10 },
  { exposure: 'void', lambda: 0.024, h: 5.7 },
  { exposure: 'void', lambda: 0.024, h: 10 },
  { exposure: 'void', lambda: 0.038, h: 5.7 },
  { exposure: 'void', lambda: 0.038, h: 10 },
  { exposure: 'conditioned', lambda: 0.024, h: null },
  { exposure: 'conditioned', lambda: 0.038, h: null },
];

/** Ambient / conductivity / surface-coefficient columns of BEC 2012 Tables 6.11a–6.11c, in order. */
export const COLUMNS_2012 = [
  { exposure: 'outdoor', lambda: 0.024, h: 9 },
  { exposure: 'outdoor', lambda: 0.024, h: 13.5 },
  { exposure: 'outdoor', lambda: 0.04, h: 9 },
  { exposure: 'outdoor', lambda: 0.04, h: 13.5 },
  { exposure: 'unconditioned', lambda: 0.024, h: 5.7 },
  { exposure: 'unconditioned', lambda: 0.024, h: 10 },
  { exposure: 'unconditioned', lambda: 0.04, h: 5.7 },
  { exposure: 'unconditioned', lambda: 0.04, h: 10 },
  { exposure: 'conditioned', lambda: 0.024, h: null },
  { exposure: 'conditioned', lambda: 0.04, h: null },
];

/** BEC 2024 Table 6.11a — chilled water pipework (steel pipes to BS EN 10255:2004 / EN 10220:2002, line 5 °C). */
export const PIPE_2024 = [
  { od: 21.3, dn: 15, mm: [20, 15, 29, 21, 29, 19, 41, 27, 20, 13, 28, 18, 13, 13] },
  { od: 26.9, dn: 20, mm: [21, 15, 30, 22, 31, 20, 43, 28, 21, 13, 30, 19, 13, 13] },
  { od: 33.7, dn: 25, mm: [22, 16, 32, 23, 32, 21, 45, 29, 22, 14, 31, 20, 13, 13] },
  { od: 42.4, dn: 32, mm: [23, 17, 33, 24, 34, 21, 48, 31, 22, 14, 33, 21, 13, 25] },
  { od: 48.3, dn: 40, mm: [24, 17, 34, 25, 35, 22, 49, 31, 23, 14, 33, 21, 13, 25] },
  { od: 60.3, dn: 50, mm: [25, 18, 36, 26, 36, 23, 52, 34, 24, 15, 35, 22, 13, 25] },
  { od: 76.1, dn: 65, mm: [26, 18, 37, 27, 38, 24, 54, 34, 25, 15, 36, 23, 14, 25] },
  { od: 88.9, dn: 80, mm: [26, 19, 38, 27, 39, 24, 56, 35, 25, 16, 37, 23, 14, 25] },
  { od: 114.3, dn: 100, mm: [27, 19, 40, 28, 41, 25, 58, 38, 26, 16, 39, 24, 14, 25] },
  { od: 139.7, dn: 125, mm: [28, 20, 41, 29, 42, 26, 61, 38, 27, 16, 40, 25, 14, 25] },
  { od: 168.3, dn: 150, mm: [29, 20, 42, 30, 43, 26, 63, 39, 28, 16, 41, 25, 14, 25] },
  { od: 219.1, dn: 200, mm: [29, 20, 44, 31, 44, 27, 65, 40, 28, 17, 43, 26, 15, 25] },
  { od: 273, dn: 250, mm: [30, 21, 45, 31, 45, 27, 67, 42, 29, 17, 44, 26, 15, 25] },
  { od: 323.9, dn: 300, mm: [30, 21, 46, 32, 46, 28, 69, 42, 29, 17, 44, 26, 15, 25] },
  { od: 355.6, dn: 350, mm: [31, 21, 46, 32, 47, 28, 69, 42, 29, 17, 45, 27, 15, 25] },
  { od: 406.4, dn: 400, mm: [31, 21, 47, 32, 47, 28, 70, 42, 30, 17, 45, 27, 15, 25] },
];

/** BEC 2012 Table 6.11a — as held by the workbook's AB10:AK25 range. */
export const PIPE_2012 = [
  { od: 21.3, dn: 15, mm: [20, 15, 30, 22, 29, 19, 43, 28, 13, 13] },
  { od: 26.9, dn: 20, mm: [21, 15, 32, 23, 31, 20, 46, 29, 13, 13] },
  { od: 33.7, dn: 25, mm: [22, 16, 34, 24, 32, 21, 48, 31, 13, 13] },
  { od: 42.4, dn: 32, mm: [23, 17, 35, 25, 34, 21, 50, 32, 13, 25] },
  { od: 48.3, dn: 40, mm: [24, 17, 36, 26, 35, 22, 52, 33, 13, 25] },
  { od: 60.3, dn: 50, mm: [25, 18, 38, 27, 36, 23, 54, 35, 13, 25] },
  { od: 76.1, dn: 65, mm: [26, 18, 40, 28, 38, 24, 57, 36, 14, 25] },
  { od: 88.9, dn: 80, mm: [26, 19, 41, 29, 39, 24, 59, 37, 14, 25] },
  { od: 114.3, dn: 100, mm: [27, 19, 42, 30, 41, 25, 62, 39, 14, 25] },
  { od: 139.7, dn: 125, mm: [28, 20, 44, 31, 42, 26, 64, 40, 14, 25] },
  { od: 168.3, dn: 150, mm: [29, 20, 45, 32, 43, 26, 66, 41, 14, 25] },
  { od: 219.1, dn: 200, mm: [29, 20, 47, 32, 44, 27, 69, 42, 15, 25] },
  { od: 273, dn: 250, mm: [30, 21, 48, 33, 45, 27, 71, 43, 15, 25] },
  { od: 323.9, dn: 300, mm: [30, 21, 49, 34, 46, 28, 73, 44, 15, 25] },
  { od: 355.6, dn: 350, mm: [31, 21, 49, 34, 47, 28, 74, 45, 15, 25] },
  { od: 406.4, dn: 400, mm: [31, 21, 50, 34, 47, 28, 75, 45, 15, 25] },
];

/** Line temperatures of the suction-refrigerant table (BEC 6.11b), in the order they are tabulated. */
export const LINE_TEMPS = [0, -10, -20];

/** BEC 2024 Table 6.11b — refrigerant suction pipework (copper to BS EN 1057:2006 + A1:2010). */
export const REFRIGERANT_2024 = [
  { od: 6, mm: { 0: [18, 13, 25, 18, 25, 17, 36, 23, 17, 13, 25, 16, 13, 13], '-10': [23, 17, 32, 24, 33, 21, 46, 30, 22, 14, 32, 21, 13, 13], '-20': [28, 20, 39, 28, 39, 25, 56, 36, 27, 18, 39, 25, 13, 13] } },
  { od: 8, mm: { 0: [19, 14, 27, 20, 27, 18, 38, 25, 19, 13, 26, 17, 13, 13], '-10': [24, 18, 34, 25, 35, 23, 49, 32, 24, 15, 34, 22, 13, 13], '-20': [29, 21, 41, 30, 42, 27, 59, 38, 29, 19, 41, 27, 13, 13] } },
  { od: 10, mm: { 0: [20, 15, 28, 21, 29, 19, 40, 26, 20, 13, 28, 18, 13, 13], '-10': [26, 19, 36, 26, 37, 24, 52, 33, 25, 16, 36, 23, 13, 13], '-20': [31, 23, 44, 32, 44, 28, 62, 40, 30, 20, 43, 28, 13, 13] } },
  { od: 12, mm: { 0: [21, 15, 30, 22, 30, 19, 42, 27, 20, 13, 29, 19, 13, 13], '-10': [27, 20, 38, 28, 38, 25, 54, 35, 26, 17, 37, 24, 13, 13], '-20': [32, 24, 45, 33, 46, 30, 65, 42, 32, 21, 45, 29, 13, 13] } },
  { od: 15, mm: { 0: [22, 16, 31, 23, 31, 20, 44, 29, 21, 14, 31, 20, 13, 13], '-10': [28, 21, 40, 29, 40, 26, 56, 37, 28, 18, 39, 25, 13, 13], '-20': [34, 25, 48, 35, 48, 31, 68, 44, 33, 22, 47, 31, 13, 13] } },
  { od: 22, mm: { 0: [24, 18, 34, 25, 34, 22, 48, 31, 23, 15, 33, 22, 13, 13], '-10': [31, 22, 43, 32, 44, 28, 62, 40, 30, 19, 43, 28, 13, 13], '-20': [37, 27, 52, 38, 53, 34, 74, 48, 36, 23, 52, 34, 13, 13] } },
  { od: 28, mm: { 0: [25, 18, 36, 26, 36, 23, 51, 33, 25, 16, 35, 25, 13, 25], '-10': [32, 24, 46, 33, 46, 30, 65, 42, 32, 20, 45, 29, 13, 25], '-20': [39, 28, 55, 40, 56, 36, 78, 51, 38, 25, 55, 35, 13, 25] } },
  { od: 35, mm: { 0: [27, 19, 38, 27, 38, 24, 54, 35, 26, 16, 37, 25, 13, 25], '-10': [34, 25, 48, 35, 49, 31, 69, 44, 33, 21, 48, 31, 13, 25], '-20': [41, 30, 58, 42, 59, 38, 82, 53, 40, 26, 58, 37, 13, 25] } },
  { od: 42, mm: { 0: [28, 20, 39, 28, 40, 25, 56, 36, 27, 17, 38, 25, 13, 25], '-10': [35, 26, 50, 36, 51, 33, 71, 46, 35, 22, 50, 32, 13, 25], '-20': [43, 31, 60, 44, 61, 39, 86, 56, 42, 27, 60, 39, 13, 25] } },
  { od: 54, mm: { 0: [29, 21, 41, 30, 42, 27, 59, 38, 28, 18, 41, 26, 13, 25], '-10': [37, 27, 53, 38, 54, 34, 76, 49, 36, 23, 52, 34, 13, 25], '-20': [45, 33, 64, 46, 64, 41, 91, 59, 44, 28, 64, 41, 13, 25] } },
  { od: 76.1, mm: { 0: [31, 22, 44, 32, 45, 28, 64, 41, 30, 18, 43, 27, 14, 25], '-10': [40, 28, 57, 41, 57, 36, 82, 52, 39, 24, 56, 36, 14, 25], '-20': [48, 35, 69, 50, 69, 44, 98, 63, 47, 30, 68, 44, 14, 25] } },
];

/** BEC 2012 Table 6.11b — the workbook's K19:N31 block names these diameters and line temperatures. */
export const REFRIGERANT_2012 = [
  { od: 6, mm: { 0: [18, 13, 27, 19, 25, 17, 38, 25, 13, 13], '-10': [23, 17, 34, 25, 33, 21, 49, 31, 13, 13], '-20': [28, 20, 41, 30, 39, 25, 59, 38, 13, 13] } },
  { od: 8, mm: { 0: [19, 14, 28, 21, 27, 18, 40, 26, 13, 13], '-10': [24, 18, 36, 26, 35, 23, 52, 33, 13, 13], '-20': [29, 21, 44, 32, 42, 27, 62, 40, 13, 13] } },
  { od: 10, mm: { 0: [20, 15, 30, 22, 29, 19, 43, 28, 13, 13], '-10': [26, 19, 38, 28, 37, 24, 54, 35, 13, 13], '-20': [31, 23, 46, 33, 44, 28, 65, 42, 13, 13] } },
  { od: 12, mm: { 0: [21, 15, 31, 23, 30, 19, 44, 29, 13, 13], '-10': [27, 20, 40, 29, 38, 25, 57, 37, 13, 13], '-20': [32, 24, 48, 35, 46, 30, 68, 44, 13, 13] } },
  { od: 15, mm: { 0: [22, 16, 33, 24, 31, 20, 47, 30, 13, 13], '-10': [28, 21, 42, 31, 40, 26, 59, 39, 13, 13], '-20': [34, 25, 50, 37, 48, 31, 72, 46, 13, 13] } },
  { od: 22, mm: { 0: [24, 18, 36, 26, 34, 22, 51, 33, 13, 13], '-10': [31, 22, 46, 33, 44, 28, 65, 42, 13, 13], '-20': [37, 27, 55, 40, 53, 34, 78, 51, 13, 13] } },
  { od: 28, mm: { 0: [25, 18, 38, 28, 36, 23, 54, 35, 13, 25], '-10': [32, 24, 48, 35, 46, 30, 69, 44, 13, 25], '-20': [39, 28, 58, 42, 56, 36, 82, 53, 13, 25] } },
  { od: 35, mm: { 0: [27, 19, 40, 29, 38, 24, 57, 37, 13, 25], '-10': [34, 25, 51, 37, 49, 31, 72, 47, 13, 25], '-20': [41, 30, 61, 45, 59, 38, 87, 56, 13, 25] } },
  { od: 42, mm: { 0: [28, 20, 41, 30, 40, 25, 59, 38, 13, 25], '-10': [35, 26, 53, 38, 51, 33, 75, 49, 13, 25], '-20': [43, 31, 64, 46, 61, 39, 90, 59, 13, 25] } },
  { od: 54, mm: { 0: [29, 21, 44, 31, 42, 27, 62, 40, 13, 25], '-10': [37, 27, 56, 40, 54, 34, 80, 51, 13, 25], '-20': [45, 33, 67, 49, 64, 41, 96, 62, 13, 25] } },
  { od: 76.1, mm: { 0: [31, 22, 47, 33, 45, 28, 67, 43, 14, 25], '-10': [40, 28, 60, 43, 57, 36, 86, 55, 14, 25], '-20': [48, 35, 72, 53, 69, 44, 104, 67, 14, 25] } },
];

/**
 * Ductwork / AHU casing thickness, indexed by the temperature difference between the air inside the
 * duct or casing and its surroundings. BEC 2024 Table 6.11c holds 15 and 20 °C; the 10 °C row
 * (typically return air) comes from TG-BEC §6.11.1 Table 6.11.1(a) — BEC 2012 carries the same 10 °C
 * supplement, which is the row the workbook's I18 shows.
 */
export const DUCT_2024 = [
  { dT: 10, mm: [13, 13, 21, 14, 20, 13, 33, 19, 13, 13, 19, 13, 13, 18] },
  { dT: 15, mm: [20, 13, 31, 21, 31, 18, 49, 28, 19, 15, 30, 25, 15, 25] },
  { dT: 20, mm: [27, 18, 43, 29, 43, 25, 68, 39, 26, 15, 41, 25, 15, 25] },
];

export const DUCT_2012 = [
  { dT: 10, mm: [13, 13, 21, 14, 20, 13, 33, 19, 13, 18] },
  { dT: 15, mm: [20, 13, 33, 22, 31, 18, 52, 30, 15, 25] },
  { dT: 20, mm: [27, 18, 46, 30, 43, 25, 72, 41, 15, 25] },
];

/**
 * TG-BEC 2024 Table 6.11.1(e) — insulation thickness in commercial (market product) sizes for chilled
 * water pipework, for reference only. These are the thicknesses to write in a specification when the
 * tabulated minimum falls between available product sizes (TG §6.11.1(a)(iii) notes the applied
 * insulation is commonly slightly thicker than the tabulated value).
 */
export const COMMERCIAL_2024 = [
  { od: 21.3, dn: 15, mm: [25, 19, 32, 25, 32, 19, 50, 32, 25, 19, 32, 19, 19, 19] },
  { od: 26.9, dn: 20, mm: [25, 19, 32, 25, 32, 25, 50, 32, 25, 19, 32, 19, 19, 19] },
  { od: 33.7, dn: 25, mm: [25, 19, 32, 25, 32, 25, 50, 32, 25, 19, 32, 25, 19, 19] },
  { od: 42.4, dn: 32, mm: [25, 19, 40, 25, 40, 25, 50, 32, 25, 19, 40, 25, 19, 25] },
  { od: 48.3, dn: 40, mm: [25, 19, 40, 25, 40, 25, 50, 32, 25, 19, 40, 25, 19, 25] },
  { od: 60.3, dn: 50, mm: [25, 19, 40, 32, 40, 25, 59, 40, 25, 19, 40, 25, 19, 25] },
  { od: 76.1, dn: 65, mm: [32, 19, 40, 32, 40, 25, 59, 40, 25, 19, 40, 25, 19, 25] },
  { od: 88.9, dn: 80, mm: [32, 19, 40, 32, 40, 25, 59, 40, 25, 19, 40, 25, 19, 25] },
  { od: 114.3, dn: 100, mm: [32, 19, 40, 32, 50, 25, 59, 40, 32, 19, 40, 25, 19, 25] },
  { od: 139.7, dn: 125, mm: [32, 25, 50, 32, 50, 32, 65, 40, 32, 19, 40, 25, 19, 25] },
  { od: 168.3, dn: 150, mm: [32, 25, 50, 32, 50, 32, 65, 40, 32, 19, 50, 25, 19, 25] },
  { od: 219.1, dn: 200, mm: [32, 25, 50, 32, 50, 32, 65, 40, 32, 19, 50, 32, 19, 25] },
  { od: 273, dn: 250, mm: [32, 25, 50, 32, 50, 32, 69, 50, 32, 19, 50, 32, 19, 25] },
  { od: 323.9, dn: 300, mm: [32, 25, 50, 32, 50, 32, 69, 50, 32, 19, 50, 32, 19, 25] },
  { od: 355.6, dn: 350, mm: [32, 25, 50, 32, 50, 32, 69, 50, 32, 19, 50, 32, 19, 25] },
  { od: 406.4, dn: 400, mm: [32, 25, 50, 32, 50, 32, 75, 50, 32, 19, 50, 32, 19, 25] },
];

/** Design basis of the tabulated values, per edition (BEC remarks to Tables 6.11a–6.11c). */
export const BEC_2024 = {
  id: '2024',
  label: { en: 'BEC 2024', zh: 'BEC 2024（現行）' },
  columns: COLUMNS_2024,
  pipe: PIPE_2024,
  refrigerant: REFRIGERANT_2024,
  duct: DUCT_2024,
  commercial: COMMERCIAL_2024,
  pipeLineTemp: 5,
  outdoor: { dewPoint: 27, ambientDB: 28.8, rh: 90, ashrae: '2021' },
  voidSpace: { dewPoint: 26, ambientDB: 28.8, rh: 85 },
  conditioned: { std: 'ASHRAE 90.1-2019', minMm: 13 },
  h: { outdoor: [9, 13.5], indoor: [5.7, 10] },
  vapourBarrier: 'BEC 6.11.2 — water-vapour-retardant (closed cell) insulation outdoors and in unconditioned space.',
  source: 'BEC 2024 Tables 6.11a/6.11b/6.11c (pp. 32–34) · TG-BEC 2024 §6.11.1 Tables 6.11.1(a) & 6.11.1(e)',
};

export const BEC_2012 = {
  id: '2012',
  label: { en: 'BEC 2012', zh: 'BEC 2012' },
  columns: COLUMNS_2012,
  pipe: PIPE_2012,
  refrigerant: REFRIGERANT_2012,
  duct: DUCT_2012,
  commercial: null,
  pipeLineTemp: 5,
  outdoor: { dewPoint: 27, ambientDB: 28.8, rh: 90, ashrae: '2009' },
  voidSpace: null,
  conditioned: { std: 'ASHRAE 90.1-2007', minMm: 13 },
  h: { outdoor: [9, 13.5], indoor: [5.7, 10] },
  vapourBarrier: 'BEC 6.11.2 — outdoor / unconditioned insulation shall be water-vapour-retardant.',
  source: 'BEC 2012 Tables 6.11a/6.11b/6.11c (pp. 23–26) · TG-BEC 2012 (Rev.1) §6.11.1 Table 6.11.1(a)',
  workbook: "workbook sheet '29_Insulations' AB10:AK25 · AB50:AK52 · K19:N31",
};

export const BEC_EDITIONS = [BEC_2024, BEC_2012];
export const BEC_CURRENT = BEC_2024;

/** Insulation-material presets with λ at 20 °C mean (the codes rate λ at 20 °C mean). */
export const INSULATION_MATERIALS = [
  { name: { en: 'Phenolic (Kooltherm K8)', zh: '酚醛（Kooltherm K8）' }, lambda: 0.022 },
  { name: { en: 'PU foam', zh: '聚氨酯泡沫' }, lambda: 0.024 },
  { name: { en: 'XPS', zh: '擠塑聚苯板 XPS' }, lambda: 0.03 },
  { name: { en: 'Elastomeric (K-Flex EC)', zh: '橡塑（K-Flex EC）' }, lambda: 0.034 },
  { name: { en: 'Mineral wool 0.038', zh: '玻璃棉／岩棉 0.038' }, lambda: 0.038 },
  { name: { en: 'Rubber foam', zh: '橡塑泡棉' }, lambda: 0.04 },
  { name: { en: 'Rock wool 0.044', zh: '岩棉 0.044' }, lambda: 0.044 },
];
