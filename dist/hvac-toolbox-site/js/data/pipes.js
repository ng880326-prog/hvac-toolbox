// Steel pipe schedule and sizing lookups — all extracted from the workbook 'Pipe Sizing' sheet.
//
// Provenance (Excel cells in 00_HVAC Toolbox_R5.xlsm, sheet 'Pipe Sizing'):
//   STEEL_PIPES            I7:N30   Pipe Nominal / Outside / Internal / Thickness (DN15…DN800)
//   CONDENSATE_DRAIN       X7:AA15  Pipe Dia. vs Coil load (kW, RT) and slope 1:40 / 1:70
//   CONDENSATE_PIPE_KGHR   CA12:CB20 Condensate Pipe Ø vs kg/hr
//   HEADER_SIZES           CE12:CE24 Header Ø list (the workbook's kg/hr column CF is empty; it carries
//                                    the note '*Velocity = 10m/s', so capacity here is computed from the
//                                    steam properties at that velocity and labelled as computed.)
export const STEEL_PIPES = [
  { dn: 15, od: 21.4, t: 2.6, id: 16.2 },
  { dn: 20, od: 26.9, t: 2.6, id: 21.7 },
  { dn: 25, od: 33.8, t: 3.2, id: 27.4 },
  { dn: 32, od: 42.5, t: 3.2, id: 36.1 },
  { dn: 40, od: 48.4, t: 3.2, id: 42.0 },
  { dn: 50, od: 60.3, t: 3.6, id: 53.1 },
  { dn: 65, od: 76.0, t: 3.6, id: 68.8 },
  { dn: 80, od: 88.8, t: 4.0, id: 80.8 },
  { dn: 100, od: 114.1, t: 4.5, id: 105.1 },
  { dn: 125, od: 139.65, t: 5.0, id: 129.65 },
  { dn: 150, od: 165.1, t: 5.0, id: 155.1 },
  { dn: 200, od: 219.1, t: 6.3, id: 206.5 },
  { dn: 250, od: 273.0, t: 7.1, id: 258.8 },
  { dn: 300, od: 323.9, t: 7.1, id: 309.7 },
  { dn: 350, od: 355.6, t: 7.1, id: 341.4 },
  { dn: 400, od: 406.4, t: 8.0, id: 390.4 },
  { dn: 450, od: 457.0, t: 8.0, id: 441.0 },
  { dn: 500, od: 508.0, t: 8.8, id: 490.4 },
  { dn: 550, od: 559.0, t: 8.8, id: 541.4 },
  { dn: 600, od: 610.0, t: 8.8, id: 592.4 },
  { dn: 650, od: 660.0, t: 10.0, id: 640.0 },
  { dn: 700, od: 711.0, t: 10.0, id: 691.0 },
  { dn: 750, od: 762.0, t: 10.0, id: 742.0 },
  { dn: 800, od: 813.0, t: 10.0, id: 793.0 },
];

export const PIPE_DEFAULTS = { vMax: 2.5, pdMax: 400, dT: 8 };

/**
 * Condensate drain pipe selection table (workbook X7:AA15). The required slope changes above DN100:
 * 1:40 up to DN100, 1:70 for DN125 and DN150.
 */
export const CONDENSATE_DRAIN = [
  { dn: 25, kw: 17.6, rt: 5, slope: '1:40' },
  { dn: 32, kw: 101, rt: 28.7, slope: '1:40' },
  { dn: 40, kw: 176, rt: 50.1, slope: '1:40' },
  { dn: 50, kw: 598, rt: 170.1, slope: '1:40' },
  { dn: 65, kw: 800, rt: 227.5, slope: '1:40' },
  { dn: 80, kw: 1055, rt: 300.1, slope: '1:40' },
  { dn: 100, kw: 1512, rt: 430, slope: '1:40' },
  { dn: 125, kw: 2462, rt: 700.2, slope: '1:70' },
  { dn: 150, kw: 3500, rt: 995.4, slope: '1:70' },
];

/** Condensate pipe schedule (workbook CA12:CB20): Ø mm vs kg/hr of condensate. */
export const CONDENSATE_PIPE_KGHR = [
  { dn: 15, kgHr: 160 },
  { dn: 20, kgHr: 370 },
  { dn: 25, kgHr: 690 },
  { dn: 32, kgHr: 1600 },
  { dn: 40, kgHr: 2290 },
  { dn: 50, kgHr: 4390 },
  { dn: 65, kgHr: 8900 },
  { dn: 80, kgHr: 13800 },
  { dn: 100, kgHr: 28200 },
];

/**
 * Header sizes (workbook CE12:CE24). The workbook lists the diameters only, next to the note
 * '*Velocity = 10m/s'; the kg/hr column is empty there, so the app computes the capacity from the
 * steam properties at 10 m/s and labels it as computed rather than as workbook data.
 */
export const HEADER_SIZES = [
  { od: 159 }, { od: 219 }, { od: 273 }, { od: 325 }, { od: 377 }, { od: 426 }, { od: 500 },
  { od: 600 }, { od: 700 }, { od: 800 }, { od: 900 }, { od: 1000 },
];

export const STEAM_HEADER_VELOCITY = 10;   // m/s, workbook note at CE24
