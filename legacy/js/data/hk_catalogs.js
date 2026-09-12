// Real catalogue data extracted from G:\我的雲端硬碟\catalogue\
// Sources (local files, HK market):
//  - Carrier Hong Kong: 42CN series FCU capacity table (e-mail data for NWKR Site 1, 2020-04-29)
//  - Mitsubishi Electric: capacity info.xlsx (MSZ-GE/MUZ-GE & MXZ multi-split)
//  - Fujitsu General: AOHG18LAC2 Multi Split Cooling Capacity Table (SEER/EER, A++)
export const CARRIER_42CN = [
  { model: '42CN00430C', flow: 680, cool715: 2754, cool1016: 2192, chw: 4.9 },
  { model: '42CN00530C', flow: 850, cool715: 3135, cool1016: 2526, chw: 5.6 },
  { model: '42CN00630C', flow: 1020, cool715: 4100, cool1016: 3300, chw: 7.4 },
  { model: '42CN00830C', flow: 1360, cool715: 5286, cool1016: 4267, chw: 9.5 },
  { model: '42CN01030C', flow: 1700, cool715: 6503, cool1016: 5250, chw: 11.7 },
  { model: '42CN01230C', flow: 2040, cool715: 7621, cool1016: 6165, chw: 13.7 },
  { model: '42CN01430C', flow: 2380, cool715: 9139, cool1016: 7339, chw: 16.4 },
];

export const MITSUBISHI_SINGLE = [
  { hp: '1.5HP', kw: 3.5, cop: 4.05, model: 'MSZ-GE35VA / MUZ-GE35VA' },
  { hp: '2HP', kw: 5.0, cop: 3.30, model: 'MSZ-GE50VA / MUZ-GE50VA' },
  { hp: '2.5HP', kw: 6.0, cop: 3.40, model: 'MSZ-GE60VA / MUZ-GE60VA' },
  { hp: '3HP', kw: 7.1, cop: 3.33, model: 'MSZ-GE71VA / MUZ-GE71VA' },
];

export const MITSUBISHI_MULTI = [
  { config: '1.5HP+1.5HP', kw: 7.0, cop: 3.86, model: 'MXZ-4C80VA', derate: { pipe15: 0.97, temp: 0.94 } },
  { config: '1.5HP+2HP', kw: 8.5, cop: 3.21, model: 'MXZ-6C120VA', derate: { pipe15: 0.97, temp: 0.94 } },
];

export const FUJITSU_AOHG18 = [
  { combi: '7+7', tot: 4.20, input: 1.24, eer: 3.39, seer: 7.0, cls: 'A++' },
  { combi: '7+9', tot: 4.60, input: 1.26, eer: 3.65, seer: 6.8, cls: 'A++' },
  { combi: '7+12', tot: 5.00, input: 1.55, eer: 3.23, seer: 6.5, cls: 'A++' },
  { combi: '7+14', tot: 5.00, input: 1.55, eer: 3.23, seer: 6.5, cls: 'A++' },
  { combi: '9+9', tot: 5.00, input: 1.56, eer: 3.21, seer: 6.6, cls: 'A++' },
  { combi: '9+12', tot: 5.00, input: 1.55, eer: 3.23, seer: 6.5, cls: 'A++' },
];
