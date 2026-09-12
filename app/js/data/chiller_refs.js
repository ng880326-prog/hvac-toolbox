// Chiller-page reference data — extracted from the workbook 'Chiller' sheet (print area B2:AG41).
//
// Provenance (Excel cells in 00_HVAC Toolbox_R5.xlsm):
//   DESIGN_LOAD_INDEX   L5:N36   國內空調冷負荷設計指標的統計值 — 32 building types with a W/m² range
//   PLANT_REFERENCES    P6:Y13   eight real projects: GFA, room/unit count, AC area, total capacity (RT),
//                                chiller arrangement and the podium/tower/basement/overall densities.
//                                The project names in the workbook are client names, so they are
//                                replaced here by letters A–H; every number is unchanged.
//   IPLV_POINTS         AA14:AE17 loading schedule with weights and condensing-water temperatures
//   ELEC_HEAT           AG4:AG41  heat dissipation rules for transformers, switchgear, MCCs, starters,
//                                VFDs, bus ducts and capacitors
//
// The workbook's own relation for the overall density is  Overall = Total(RT) · 3.517 / AC area (m²),
// which is reproduced and tested rather than copied cell by cell.

/** 國內空調冷負荷設計指標 (W/m²). `min`/`max` bound the range printed in the workbook. */
export const DESIGN_LOAD_INDEX = [
  { no: 1, type: '旅遊旅館：客房（標準層）', min: 80, max: 110 },
  { no: 2, type: '酒吧、咖啡', min: 100, max: 180 },
  { no: 3, type: '西餐廳', min: 160, max: 200 },
  { no: 4, type: '中餐廳、宴會廳', min: 180, max: 350 },
  { no: 5, type: '商店、小賣部', min: 100, max: 160 },
  { no: 6, type: '中庭、接待', min: 90, max: 120 },
  { no: 7, type: '小會議室（允許少量吸煙）', min: 200, max: 300 },
  { no: 8, type: '大會議室（不許吸煙）', min: 180, max: 280 },
  { no: 9, type: '理髮、美容', min: 120, max: 180 },
  { no: 10, type: '健身房、保齡球', min: 100, max: 200 },
  { no: 11, type: '彈子房', min: 90, max: 120 },
  { no: 12, type: '室內游泳池', min: 200, max: 350 },
  { no: 13, type: '舞廳（交誼舞）', min: 200, max: 250 },
  { no: 14, type: '舞廳（迪斯可）', min: 250, max: 350 },
  { no: 15, type: '辦公', min: 90, max: 120 },
  { no: 16, type: '醫院：高級病房', min: 80, max: 110 },
  { no: 17, type: '一般手術室', min: 100, max: 150 },
  { no: 18, type: '潔淨手術室', min: 300, max: 500 },
  { no: 19, type: 'X光、CT、B超診斷', min: 120, max: 150 },
  { no: 20, type: '商場、百貨大樓：營業室', min: 150, max: 250 },
  { no: 21, type: '影劇院：觀眾席', min: 180, max: 350 },
  { no: 22, type: '休息廳（允許吸煙）', min: 300, max: 400 },
  { no: 23, type: '化粧室', min: 90, max: 120 },
  { no: 24, type: '體育館：比賽館', min: 120, max: 250 },
  { no: 25, type: '觀眾休息廳（允許吸煙）', min: 300, max: 400 },
  { no: 26, type: '貴賓室', min: 100, max: 120 },
  { no: 27, type: '展覽廳、陳列室', min: 130, max: 200 },
  { no: 28, type: '會堂、報告廳', min: 150, max: 200 },
  { no: 29, type: '圖書閱覽', min: 75, max: 100 },
  { no: 30, type: '科研、辦公', min: 90, max: 140 },
  { no: 31, type: '公寓、住宅', min: 80, max: 90 },
  { no: 32, type: '餐館', min: 200, max: 350 },
];

/**
 * Plant capacity references (workbook P6:Y13). Names anonymised to letters; `null` marks the cells the
 * workbook leaves blank ('-').
 */
export const PLANT_REFERENCES = [
  { id: 'A', gfa: 79000, rooms: 357, acArea: 39500, totalRT: 2180, chillers: '3 × 850 RT', densPodium: 323, densTower: 88.4, densBasement: 177.7, densOverall: 194 },
  { id: 'B', gfa: 77100, rooms: 480, acArea: null, totalRT: 2217, chillers: '3 × 700 RT', densPodium: null, densTower: null, densBasement: null, densOverall: null },
  { id: 'C', gfa: 66901, rooms: 352, acArea: 32130, totalRT: 2344, chillers: '3 × 800 RT', densPodium: null, densTower: null, densBasement: null, densOverall: 256.6 },
  { id: 'D', gfa: 81260, rooms: 420, acArea: 41000, totalRT: 2050, chillers: '3 × 850 RT', densPodium: 333, densTower: 98.6, densBasement: 155.6, densOverall: 175.5 },
  { id: 'E', gfa: 71898, rooms: 486, acArea: 42800, totalRT: 1900, chillers: '3 × 700 RT', densPodium: 293, densTower: 78, densBasement: 224, densOverall: 156 },
  { id: 'F', gfa: null, rooms: 472, acArea: 52763, totalRT: 2100, chillers: '3 × 800 RT', densPodium: 233.35336210192821, densTower: 90.39326657959657, densBasement: null, densOverall: 139.97877300380949 },
  { id: 'G', gfa: null, rooms: 350, acArea: 32969, totalRT: 1244, chillers: '3 × 500 RT', densPodium: 171.63608562691132, densTower: 83.992903930131007, densBasement: null, densOverall: 132.70490460735843 },
  { id: 'H', gfa: null, rooms: null, acArea: null, totalRT: null, chillers: null, densPodium: 312, densTower: 92, densBasement: null, densOverall: null },
];

/** AHRI 550/590 loading schedule as listed in the workbook (AA14:AE17). */
export const IPLV_POINTS = [
  { load: 1, weight: 0.01, condWater: 29.4 },
  { load: 0.75, weight: 0.42, condWater: 23.9 },
  { load: 0.5, weight: 0.45, condWater: 18.3 },
  { load: 0.25, weight: 0.12, condWater: 18.3 },
];

/** COP definition printed in the workbook: COP = 3.516 / (ikW/RT). */
export const COP_RT_CONSTANT = 3.516;

/** Heat dissipation from electrical equipment (workbook AG4:AG41) — reference values, unchanged. */
export const ELEC_HEAT = {
  transformers: [
    { range: '≤ 150 kVA', value: 50, unit: 'W/kVA' },
    { range: '150–500 kVA', value: 30, unit: 'W/kVA' },
    { range: '500–1000 kVA', value: 25, unit: 'W/kVA' },
    { range: '1000–2500 kVA', value: 20, unit: 'W/kVA' },
    { range: '> 2500 kVA', value: 15, unit: 'W/kVA' },
  ],
  switchgear: [
    { range: 'LV breaker 0–40 A', value: 10 },
    { range: 'LV breaker 50–100 A', value: 20 },
    { range: 'LV breaker 225 A', value: 60 },
    { range: 'LV breaker 400 A', value: 100 },
    { range: 'LV breaker 600 A', value: 130 },
    { range: 'LV breaker 800 A', value: 170 },
    { range: 'LV breaker 1600 A', value: 460 },
    { range: 'LV breaker 2000 A', value: 600 },
    { range: 'LV breaker 3000 A', value: 1100 },
    { range: 'LV breaker 4000 A', value: 1500 },
    { range: 'MV breaker/switch 600 A', value: 1000 },
    { range: 'MV breaker/switch 1200 A', value: 1500 },
    { range: 'MV breaker/switch 2000 A', value: 2000 },
    { range: 'MV breaker/switch 2500 A', value: 2500 },
  ],
  mcc: [
    { range: 'MCC section', value: 500 },
    { range: 'LV starter size 00', value: 50 },
    { range: 'LV starter size 0', value: 50 },
    { range: 'LV starter size 1', value: 50 },
    { range: 'LV starter size 2', value: 100 },
    { range: 'LV starter size 3', value: 130 },
    { range: 'LV starter size 4', value: 200 },
    { range: 'LV starter size 5', value: 300 },
    { range: 'LV starter size 6', value: 650 },
    { range: 'MV starter 200 A', value: 400 },
    { range: 'MV starter 400 A', value: 1300 },
    { range: 'MV starter 700 A', value: 1700 },
  ],
  notes: [
    { en: 'Variable frequency drive: 2–6 % of kVA rating', zh: '變頻器：kVA 額定值嘅 2–6%' },
    { en: 'Bus duct: 0.015 W per ft·A', zh: '母線槽：0.015 W／ft·A' },
    { en: 'Capacitors: 2 W per kVAR', zh: '電容器：2 W／kVAR' },
  ],
};
