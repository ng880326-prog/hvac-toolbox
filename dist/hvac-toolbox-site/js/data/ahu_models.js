// AHU/PAU catalogue extracted from the workbook 'AHU' sheet (print area B2:AG39).
//
//   AHU_MODELS      L7:U28   Trane CLCP — model, AHU supply flow at 2.5 m/s (CMH, L/s), PAU primary air
//                            at 2.3 m/s (CMH, L/s) and the mm length of each component for the schematic
//   SAVIER_MODELS   W7:AF28  Savier A1 series — model, the same two flow ratings, casing L/W/H in mm
//   FRAME_ALLOWANCE L29/W29  '*150mm is added to the overall unit length for the frame of the equipment'
//   WORKBOOK_RHOCP  E27      the workbook's air constant ρ·cp = 1.23 kJ/(m³·K) in its supply-flow rule
export const FRAME_ALLOWANCE_MM = 150;

/** The workbook's air constant in its estimation rule (E24/1.23/(E25−E26)); the app's engine uses ρ·cp ≈ 1.21. */
export const WORKBOOK_RHOCP = 1.23;

export const AHU_MODELS = [
  { id: '003', ahuCMH: 2070, ahuLs: 575, pauCMH: 1863, pauLs: 517.5, L: 150, W: 700, H: 850, comps: [310,155,620,310,310,465,620,310,700,775,300] },
  { id: '004', ahuCMH: 3600, ahuLs: 1000, pauCMH: 3240, pauLs: 900, L: 150, W: 1100, H: 850, comps: [310,155,620,310,310,465,620,310,700,930,300] },
  { id: '006', ahuCMH: 5040, ahuLs: 1400, pauCMH: 4536, pauLs: 1260, L: 150, W: 1350, H: 850, comps: [310,155,620,310,310,465,620,310,700,930,300] },
  { id: '008', ahuCMH: 6570, ahuLs: 1825, pauCMH: 5913, pauLs: 1642.5, L: 150, W: 1650, H: 850, comps: [465,155,620,310,310,465,620,310,700,930,300] },
  { id: '010', ahuCMH: 8010, ahuLs: 2225, pauCMH: 7209, pauLs: 2002.5, L: 150, W: 1350, H: 1150, comps: [465,155,620,310,310,465,620,310,700,1240,300] },
  { id: '012', ahuCMH: 10350, ahuLs: 2875, pauCMH: 9315, pauLs: 2587.5, L: 150, W: 1650, H: 1150, comps: [465,155,620,310,310,465,620,310,700,1240,300] },
  { id: '014', ahuCMH: 12780, ahuLs: 3550, pauCMH: 11502, pauLs: 3195, L: 150, W: 1950, H: 1150, comps: [465,155,620,310,310,465,620,310,700,1240,300] },
  { id: '016', ahuCMH: 14220, ahuLs: 3950, pauCMH: 12798, pauLs: 3555, L: 150, W: 1650, H: 1450, comps: [465,155,620,310,310,465,620,310,700,1395,300] },
  { id: '020', ahuCMH: 17460, ahuLs: 4850, pauCMH: 15714, pauLs: 4365, L: 150, W: 1950, H: 1450, comps: [465,155,620,310,310,465,620,310,700,1550,300] },
  { id: '025', ahuCMH: 20700, ahuLs: 5750, pauCMH: 18630, pauLs: 5175, L: 150, W: 1950, H: 1750, comps: [620,155,620,310,310,465,620,310,700,1550,300] },
  { id: '030', ahuCMH: 25740, ahuLs: 7150, pauCMH: 23166, pauLs: 6435, L: 150, W: 1950, H: 2100, comps: [620,155,620,310,310,465,620,310,700,1705,300] },
  { id: '035', ahuCMH: 30780, ahuLs: 8550, pauCMH: 27702, pauLs: 7695, L: 150, W: 2250, H: 2100, comps: [620,155,620,310,310,465,620,310,700,1860,300] },
  { id: '040', ahuCMH: 35550, ahuLs: 9875, pauCMH: 31995, pauLs: 8887.5, L: 150, W: 2600, H: 2100, comps: [620,155,620,310,310,465,620,310,700,1860,300] },
  { id: '045', ahuCMH: 40320, ahuLs: 11200, pauCMH: 36288, pauLs: 10080, L: 150, W: 2900, H: 2100, comps: [620,155,620,310,310,465,620,310,700,2015,300] },
  { id: '050', ahuCMH: 45090, ahuLs: 12525, pauCMH: 40581, pauLs: 11272.5, L: 150, W: 3200, H: 2100, comps: [930,155,620,310,465,465,620,310,700,2015,300] },
  { id: '060', ahuCMH: 53280, ahuLs: 14800, pauCMH: 47952, pauLs: 13320, L: 150, W: 3250, H: 2450, comps: [930,155,620,310,465,465,620,310,700,2015,300] },
  { id: '065', ahuCMH: 58950, ahuLs: 16375, pauCMH: 53055, pauLs: 14737.5, L: 150, W: 3550, H: 2450, comps: [1085,155,620,310,465,465,620,310,700,2015,300] },
  { id: '070', ahuCMH: 64620, ahuLs: 17950, pauCMH: 58158, pauLs: 16155, L: 150, W: 3850, H: 2450, comps: [1085,155,620,310,465,465,620,310,700,2015,300] },
  { id: '080', ahuCMH: 70290, ahuLs: 19525, pauCMH: 63261, pauLs: 17572.5, L: 150, W: 4200, H: 2450, comps: [1240,155,620,310,465,465,620,310,700,2015,300] },
  { id: '085', ahuCMH: 75960, ahuLs: 21100, pauCMH: 68364, pauLs: 18990, L: 150, W: 4500, H: 2450, comps: [1240,155,620,310,465,465,620,310,700,2015,300] },
  { id: '090', ahuCMH: 81630, ahuLs: 22675, pauCMH: 73467, pauLs: 20407.5, L: 150, W: 4800, H: 2450, comps: [1240,155,620,310,465,465,620,310,700,2015,300] },
  { id: '095', ahuCMH: 87300, ahuLs: 24250, pauCMH: 78570, pauLs: 21825, L: 150, W: 5100, H: 2450, comps: [,,,,,,,,,,] },
];

/**
 * Savier A1 series (workbook W7:AF28). Same flow ratings as the Trane block — AHU at 2.5 m/s and PAU
 * primary air at 2.3 m/s — plus the casing L/W/H in mm. `L` is the frame allowance printed on the sheet,
 * not the unit length. The model name carries its own H/W (e.g. A1-690H-1050W) which is close to but not
 * identical to the printed W/H columns, so both are shipped as printed.
 */
export const SAVIER_MODELS = [
  { id: 'A1-690H-1050W', ahuCMH: 2556, ahuLs: 710, pauCMH: 2300, pauLs: 638.8889, L: 150, W: 985, H: 680 },
  { id: 'A1-1010H-1050W', ahuCMH: 4428, ahuLs: 1230, pauCMH: 3985, pauLs: 1106.9444, L: 150, W: 985, H: 985 },
  { id: 'A1-1010H-1350W', ahuCMH: 6480, ahuLs: 1800, pauCMH: 5832, pauLs: 1620, L: 150, W: 1290, H: 985 },
  { id: 'A1-1010H-1650W', ahuCMH: 8532, ahuLs: 2370, pauCMH: 7678, pauLs: 2132.7778, L: 150, W: 1595, H: 985 },
  { id: 'A1-1330H-1650W', ahuCMH: 12132, ahuLs: 3370, pauCMH: 10919, pauLs: 3033.0556, L: 150, W: 1595, H: 1290 },
  { id: 'A1-1610H-1650W', ahuCMH: 15300, ahuLs: 4250, pauCMH: 13770, pauLs: 3825, L: 150, W: 1595, H: 1595 },
  { id: 'A1-1610H-1950W', ahuCMH: 18360, ahuLs: 5100, pauCMH: 16524, pauLs: 4590, L: 150, W: 1900, H: 1595 },
  { id: 'A1-1610H-2250W', ahuCMH: 22032, ahuLs: 6120, pauCMH: 19829, pauLs: 5508.0556, L: 150, W: 2205, H: 1595 },
  { id: 'A1-1930H-2250W', ahuCMH: 27216, ahuLs: 7560, pauCMH: 24494, pauLs: 6803.8889, L: 150, W: 2205, H: 1900 },
  { id: 'A1-2250H-2250W', ahuCMH: 32400, ahuLs: 9000, pauCMH: 29160, pauLs: 8100, L: 150, W: 2205, H: 2205 },
  { id: 'A1-2250H-2550W', ahuCMH: 37800, ahuLs: 10500, pauCMH: 34020, pauLs: 9450, L: 150, W: 2510, H: 2205 },
  { id: 'A1-2250H-2900W', ahuCMH: 43920, ahuLs: 12200, pauCMH: 39528, pauLs: 10980, L: 150, W: 2815, H: 2205 },
  { id: 'A1-2250H-3500W', ahuCMH: 54720, ahuLs: 15200, pauCMH: 49248, pauLs: 13680, L: 150, W: 3425, H: 2205 },
  { id: 'A1-2250H-4100W', ahuCMH: 65700, ahuLs: 18250, pauCMH: 63441, pauLs: 17622.5, L: 150, W: 4035, H: 2205 },
  { id: 'A1-2530H-4100W', ahuCMH: 74800, ahuLs: 20777.7778, pauCMH: 67320, pauLs: 18700, L: 150, W: 4035, H: 2510 },
  { id: 'A1-3200H-4100W', ahuCMH: 89200, ahuLs: 24777.7778, pauCMH: 80280, pauLs: 22300, L: 150, W: 4035, H: 3120 },
  { id: 'A1-3200H-4700W', ahuCMH: 104040, ahuLs: 28900, pauCMH: 93636, pauLs: 26010, L: 150, W: 4645, H: 3120 },
  { id: 'A1-3200H-5900W', ahuCMH: 124560, ahuLs: 34600, pauCMH: 112104, pauLs: 31140, L: 150, W: 5865, H: 3120 },
  { id: 'A1-3200H-6500W', ahuCMH: 139320, ahuLs: 38700, pauCMH: 125388, pauLs: 34830, L: 150, W: 6475, H: 3120 },
  { id: 'A1-3440H-6500W', ahuCMH: 151740, ahuLs: 42150, pauCMH: 136566, pauLs: 37935, L: 150, W: 6475, H: 3425 },
  { id: 'A1-3860H-6500W', ahuCMH: 172080, ahuLs: 47800, pauCMH: 154800, pauLs: 43000, L: 150, W: 6475, H: 3800 },
  { id: 'A1-4500H-6500W', ahuCMH: 205200, ahuLs: 57000, pauCMH: 183600, pauLs: 51000, L: 150, W: 6475, H: 4410 },
];
