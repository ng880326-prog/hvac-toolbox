// Steel pipe schedule extracted from the workbook 'Pipe Sizing' sheet (medium-grade steel, BS/ISO series)
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
];

export const PIPE_DEFAULTS = { vMax: 2.5, pdMax: 400, dT: 8 };
