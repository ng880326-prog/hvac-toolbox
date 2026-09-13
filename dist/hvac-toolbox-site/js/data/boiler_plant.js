// Boiler plant reference data — extracted from the workbook 'Boiler' sheet (print area B2:AC47).
//
// Provenance (Excel cells in 00_HVAC Toolbox_R5.xlsm, sheet 'Boiler'):
//   STEAM_BOILERS      header AD31:AR31, data AD32:AR37   packaged steam boilers, 1…6 Ton/hr
//   HOT_WATER_BOILERS  header AD42:AR42, data AD43:AR51   packaged hot-water boilers, 0.7…3.5 MW
//   REFERENCES         G33:G37 / S43:S45                  GB 50041-2008 and the vendor datasheets
//   AUXILIARY_RULES    N16 / N22                          feed-pump and deaerator-pump flow rules
//
// NOT included: the workbook also carries a vendor comparison block at AD54:AN73 (Ebara WNS,
// Fulton FB-S, 江苏双良). It is not trustworthy — the weight column repeats the same six values for
// every vendor (9480/11354/14771/23148/28616/37699 kg, identical to STEAM_BOILERS) and Fulton's and
// 双良's dimensions are byte-identical to Ebara's, while Ebara's own rows 3/4/6 hold a second,
// conflicting set in AF:AI. Shipping it would present copy/paste artefacts as manufacturer data, so
// the page uses the two complete tables above instead and this note records why.

/**
 * Packaged steam boilers (workbook AD32:AR37). `gasDn` is the gas connection as printed ('13x2' means
 * two DN13 connections), `safetyValve`/`bleedOff`/`waterIn`/`steamOut` are connection sizes in mm,
 * `power` is the electrical load in kW and the last four fields are the shipping weight (kg) and the
 * length/width/height (mm) of one unit.
 */
export const STEAM_BOILERS = [
  { ton: 1, chimney: 300, diesel: 75, gasDn: '13x2', gas: 90, safetyValve: '40', bleedOff: '40', waterIn: 32, steamOut: 65, power: 4, weight: 9480, length: 3827, width: 2410, height: 2475 },
  { ton: 1.5, chimney: 350, diesel: 110, gasDn: '13x2', gas: 130, safetyValve: '50', bleedOff: '40', waterIn: 32, steamOut: 100, power: 5, weight: 11354, length: 4327, width: 2510, height: 2575 },
  { ton: 2, chimney: 400, diesel: 150, gasDn: '13x2', gas: 180, safetyValve: '80', bleedOff: '40', waterIn: 32, steamOut: 100, power: 7.5, weight: 14771, length: 4076, width: 2826, height: 3096 },
  { ton: 3, chimney: 450, diesel: 220, gasDn: '13x2', gas: 260, safetyValve: '50x2', bleedOff: '50', waterIn: 40, steamOut: 150, power: 9.5, weight: 23148, length: 5176, width: 2725, height: 3195 },
  { ton: 4, chimney: 500, diesel: 300, gasDn: '20x2', gas: 350, safetyValve: '50x2', bleedOff: '50', waterIn: 40, steamOut: 150, power: 13, weight: 28616, length: 5876, width: 3025, height: 3608 },
  { ton: 6, chimney: 600, diesel: 420, gasDn: '20x2', gas: 500, safetyValve: '80x2', bleedOff: '50x2', waterIn: 50, steamOut: 150, power: 20, weight: 37699, length: 7050, width: 3392, height: 3790 },
];

/**
 * Packaged hot-water boilers (workbook AD43:AR51). The rated MW values are the workbook's own
 * (0.6977 MW per Ton/hr of steam, i.e. 2257 kJ/kg at 90 % efficiency); they are kept as printed and
 * the page also shows the duty they imply.
 */
export const HOT_WATER_BOILERS = [
  { mw: 0.6976744186, chimney: 350, diesel: 58.9, gasDn: '50', gas: 74.2, safetyValve: 50, waterIn: 80, waterOut: 80, power: 2.2, bleedOff: 40, weight: 6180, length: 4654, width: 2000, height: 2100 },
  { mw: 0.8720930233, chimney: 350, diesel: 74.2, gasDn: '50', gas: 93.1, safetyValve: 50, waterIn: 80, waterOut: 80, power: 2.2, bleedOff: 40, weight: 6180, length: 4654, width: 2000, height: 2100 },
  { mw: 1.0465116279, chimney: 350, diesel: 89.7, gasDn: '65', gas: 112, safetyValve: 50, waterIn: 80, waterOut: 80, power: 3, bleedOff: 40, weight: 7640, length: 5154, width: 2000, height: 2100 },
  { mw: 1.3953488372, chimney: 350, diesel: 119, gasDn: '65', gas: 150, safetyValve: 50, waterIn: 100, waterOut: 100, power: 4, bleedOff: 40, weight: 10290, length: 5394, width: 2000, height: 2100 },
  { mw: 1.7441860465, chimney: 400, diesel: 150, gasDn: '65', gas: 188, safetyValve: 50, waterIn: 100, waterOut: 100, power: 5.5, bleedOff: 40, weight: 10630, length: 5545, width: 2000, height: 2100 },
  { mw: 2.0930232558, chimney: 450, diesel: 179, gasDn: '80', gas: 224, safetyValve: 65, waterIn: 125, waterOut: 125, power: 5.5, bleedOff: 40, weight: 11400, length: 5827, width: 2200, height: 2300 },
  { mw: 2.4418604651, chimney: 450, diesel: 209, gasDn: '80', gas: 262, safetyValve: 65, waterIn: 125, waterOut: 125, power: 7.5, bleedOff: 40, weight: 11800, length: 5163, width: 2200, height: 2300 },
  { mw: 2.7906976744, chimney: 500, diesel: 238, gasDn: '80', gas: 300, safetyValve: 65, waterIn: 150, waterOut: 150, power: 11, bleedOff: 40, weight: 13670, length: 5791, width: 2300, height: 2400 },
  { mw: 3.488372093, chimney: 550, diesel: 298, gasDn: '80', gas: 375, safetyValve: 65, waterIn: 150, waterOut: 150, power: 11, bleedOff: 40, weight: 13770, length: 5791, width: 2300, height: 2400 },
];

/** Sources printed on the sheet (G33:G37 for steam, S43:S45 for hot water). */
export const BOILER_REFERENCES = [
  { en: 'GB 50041-2008 锅炉房设计规范 (Boiler house design code)', zh: 'GB 50041-2008《锅炉房设计规范》' },
  { en: 'Vendor datasheet summaries: Ebara WNS, Fulton FB-S, Jiangsu Shuangliang WNS II (steam)', zh: '廠商技術資料匯總：荏原 WNS、富爾頓 FB-S、江蘇雙良 WNS II（蒸汽）' },
  { en: 'Fulton RB series hot-water boilers', zh: '富爾頓 RB 系列熱水鍋爐' },
];

/** Auxiliary sizing rules as written on the sheet (N16 and N22). */
export const AUXILIARY_RULES = {
  feedPumpMargin: 0.13,      // N16: flow = ton/hr × (1 + 0.13) × 1.1
  feedPumpFactor: 1.1,
  deaeratorPumpMin: 1.2,     // N22: deaerator pump flow = 1.2…1.5 × feed pump flow
  deaeratorPumpMax: 1.5,
};

/** Diesel and natural-gas energy content used only to show what the printed fuel rates imply. */
export const FUEL = { dieselMJperKg: 42.7, gasMJperNm3: 36.0, steamMJperTon: 2257 };
