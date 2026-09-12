// HVAC Toolbox — engine test vectors.
// Source of truth: cached values extracted from 00_HVAC Toolbox_R5.xlsm (see analysis/),
// plus independent checks against standard reference values.

export const vectors = [
  {
    group: 'psychrometrics — Excel Psychrometric Chart sheet',
    tests: [
      // Air1: Tdb=24.6, Twb=19.2, p=101.325 kPa
      // Tdp: Excel = 16.4974 via 0.05°C-grid interpolation; engine = exact Hyland-Wexler inversion (16.4733).
      { name: 'Air1 Tdp (Excel 16.4974, grid-interp ±0.05)', fn: (E) => E.tdpFromPw(E.pwFromW(E.WfromTTwb(24.6, 19.2), 101.325)), expect: 16.4974, tol: 0.05 },
      { name: 'Air1 W (Excel 0.011721)', fn: (E) => E.WfromTTwb(24.6, 19.2, 101.325), expect: 0.0117213, tol: 2e-5 },
      { name: 'Air1 RH (Excel 60.566%)', fn: (E) => E.RHfromPw(24.6, E.pwFromW(E.WfromTTwb(24.6, 19.2), 101.325)), expect: 60.5661, tol: 0.05 },
      { name: 'Air1 h (Excel 54.583 kJ/kg)', fn: (E) => E.enthalpy(24.6, E.WfromTTwb(24.6, 19.2)), expect: 54.5832, tol: 0.01 },
      { name: 'Air1 v (Excel 0.85956 m³/kg)', fn: (E) => E.specificVolume(24.6, E.WfromTTwb(24.6, 19.2), 101.325), expect: 0.859561, tol: 2e-4 },
      // ρ: engine uses moist-air ρ=(1+W)/v = 1.1770; workbook Psychro sheet shows 1/v = 1.1634 (inconsistency —
      // the Air-side sheet itself uses (1+W)/v for friction). See verification report.
      { name: 'Air1 ρ (moist, (1+W)/v = 1.1770)', fn: (E) => E.density(24.6, E.WfromTTwb(24.6, 19.2), 101.325), expect: 1.1770, tol: 2e-4 },
      { name: 'Air1 ρ Excel-parity (1/v = 1.1634)', fn: (E) => 1 / E.specificVolume(24.6, E.WfromTTwb(24.6, 19.2), 101.325), expect: 1.163385, tol: 2e-4 },
      // Air2: Tdb=10, Twb=9.6
      { name: 'Air2 Tdp (Excel 9.30359, grid-interp ±0.05)', fn: (E) => E.tdpFromPw(E.pwFromW(E.WfromTTwb(10, 9.6), 101.325)), expect: 9.30359, tol: 0.05 },
      { name: 'Air2 W (Excel 0.0072624)', fn: (E) => E.WfromTTwb(10, 9.6, 101.325), expect: 0.00726245, tol: 2e-5 },
      { name: 'Air2 h (Excel 28.3545)', fn: (E) => E.enthalpy(10, E.WfromTTwb(10, 9.6)), expect: 28.3545, tol: 0.01 },
      // Air2 RH input (40%) conflicts with Tdb/Twb pair: computed RH ≈ 95.2%. Workbook echoes the input — flagged UX issue.
      { name: 'Air2 computed RH from T/Twb (workbook echoes 40)', fn: (E) => E.RHfromPw(10, E.pwFromW(E.WfromTTwb(10, 9.6), 101.325)), expect: 95.23, tol: 0.05 },
      // State solver round-trips
      { name: 'state(T,RH) -> Tdb', fn: (E) => E.state({ t: 24, rh: 50 }).t, expect: 24, tol: 1e-9 },
      { name: 'state(T,RH) -> W', fn: (E) => E.state({ t: 24, rh: 50 }).w, expect: 0.009299, tol: 1e-4 },
      { name: 'state(T,Twb) -> RH', fn: (E) => E.state({ t: 24.6, twb: 19.2 }).rh, expect: 60.566, tol: 0.05 },
      { name: 'state(T,Tdp) -> RH', fn: (E) => E.state({ t: 24.6, tdp: 16.4974 }).rh, expect: 60.566, tol: 0.1 },
      { name: 'pws(100) = 101.325 kPa', fn: (E) => E.pws(100), expect: 101.325, tol: 0.15 },
      { name: 'pws(0.01) ≈ 0.6117 kPa (triple pt)', fn: (E) => E.pws(0.01), expect: 0.6117, tol: 1e-3 },
      // Ice branch (T < 0.01 °C), ASHRAE over-ice saturation table. These lock coefficient C6:
      // a miscounted zero once made it 1e-10 instead of 1e-13, so the whole ice branch read 1000x low
      // (pws(0) = 0.0031 kPa instead of 0.6112) with every other test still green.
      { name: 'pws(-40) = 0.01285 kPa (ice table)', fn: (E) => E.pws(-40), expect: 0.01285, tol: 6e-6 },
      { name: 'pws(-20) = 0.10326 kPa (ice table)', fn: (E) => E.pws(-20), expect: 0.10326, tol: 5e-5 },
      { name: 'pws(-10) = 0.25990 kPa (ice table)', fn: (E) => E.pws(-10), expect: 0.25990, tol: 5e-5 },
      { name: 'pws(0) = 0.61115 kPa (ice table)', fn: (E) => E.pws(0), expect: 0.61115, tol: 5e-5 },
      { name: 'pws ice→liquid continuity across 0.01 °C', fn: (E) => E.pws(0.009) / E.pws(0.01), expect: 1, tol: 2e-3 },
      // WfromEnthalpyT — the inverse the Wheel sheet needs (total effectiveness fixes the off-wheel
      // enthalpy, and the moisture content is then looked up from that (h, T) pair). Values below are
      // the wheel page's own summer case: t2 = 26.75 °C, h2 = 60.902650 kJ/kg, w2 = 0.013334.
      { name: 'WfromEnthalpyT(h2, t2) inverts enthalpy()', fn: (E) => E.WfromEnthalpyT(60.902650, 26.75), expect: 0.013334, tol: 1e-6 },
      { name: 'enthalpy(26.75, 0.013334) = 60.9027 (Wheel 夏出口 h2)', fn: (E) => E.enthalpy(26.75, 0.013334), expect: 60.9027, tol: 5e-4 },
      // AHU/PAU design conditions from the Coil sheet (Summer OA 35 DB / 28 WB)
      { name: 'Coil design OA summer: h (Excel 89.396)', fn: (E) => E.state({ t: 35, twb: 28 }).h, expect: 89.396, tol: 0.02 },
      { name: 'Coil design OA summer: W (Excel 0.021132)', fn: (E) => E.state({ t: 35, twb: 28 }).w, expect: 0.021131, tol: 2e-5 },
      { name: 'Coil design OA summer: Tdp (Excel 25.826)', fn: (E) => E.state({ t: 35, twb: 28 }).tdp, expect: 25.826, tol: 0.05 },
      { name: 'Coil design OA summer: RH (Excel 59.16%)', fn: (E) => E.state({ t: 35, twb: 28 }).rh, expect: 59.16, tol: 0.05 },
      { name: 'Coil design mix: mass-weighted h consistency', fn: (E) => { const a = E.state({ t: 35, twb: 28 }); const b = E.state({ t: 24, rh: 55 }); const m = E.mix(a, b, 1, 2); return m.h - ((a.h * 1 + b.h * 2) / 3); }, expect: 0, tol: 0.05 },
    ],
  },
  {
    group: 'Hazen-Williams — Excel Pipe Sizing sheet (C=140)',
    tests: [
      { name: 'DN15 V=0.65673 → 400 Pa/m', fn: (F) => F.hazenWilliams(0.65673243386529834, 16.2, 140), expect: 400, tol: 0.6 },
      { name: 'DN20 V=0.78955 → 400 Pa/m', fn: (F) => F.hazenWilliams(0.78955082030053658, 21.7, 140), expect: 400, tol: 0.6 },
      { name: 'DN15 V=2.5 → 4756 Pa/m (Excel AG7)', fn: (F) => F.hazenWilliams(2.5, 16.2, 140), expect: 4755.996, tol: 0.5 },
      { name: 'velocityForPd(400, 16.2, 140) ≈ 0.6567', fn: (F) => F.velocityForPd(400, 16.2, 140), expect: 0.65673, tol: 2e-4 },
      { name: 'flow DN20 @0.78955 m/s = 0.292 L/s (Excel M8)', fn: (F) => F.flowFromVelocity(0.78955082030053658, 21.7), expect: 0.292004, tol: 5e-4 },
      { name: 'kW = L/s·4.186789·ΔT (Excel R7: 0.13537 L/s ΔT8 → 4.534)', fn: (F) => F.waterHeat(0.13536561965600805, 8), expect: 4.53398, tol: 1e-3 },
      { name: 'RT = kW/3.517 (Excel S7 → 1.28916)', fn: (F) => F.waterHeat(0.13536561965600805, 8) / 3.517, expect: 1.28916, tol: 1e-3 },
    ],
  },
  {
    group: 'unit conversions',
    tests: [
      { name: 'RT→kW (3.51685)', fn: (F) => F.RTtokW(100), expect: 351.685, tol: 0.01 },
      { name: 'kW→RT', fn: (F) => F.kWtoRT(351.685), expect: 100, tol: 0.001 },
      { name: 'kW→Btu/h (3412.14, Excel 3412)', fn: (F) => F.kWtoBtuH(10), expect: 34121.4, tol: 0.5 },
      { name: 'kW→kcal/h (860.42, Excel 860)', fn: (F) => F.kWtoKcalH(10), expect: 8604.21, tol: 0.5 },
      { name: 'LMTD 6/2 → 3.641', fn: (F) => F.lmtd(6, 2), expect: 3.64096, tol: 1e-3 },
      { name: 'LMTD equal → arithmetic', fn: (F) => F.lmtd(5, 5), expect: 5, tol: 1e-9 },
    ],
  },
  {
    group: 'ducts (Darcy–Weisbach + Haaland)',
    tests: [
      { name: 'Haaland Re=1e5 k=0.1 D=300 → f≈0.0193', fn: () => 1 / Math.pow(-1.8 * Math.log10(6.9 / 1e5 + Math.pow((0.1 / 300) / 3.71, 1.11)), 2), expect: 0.01934, tol: 1e-4 },
      { name: 'Huebscher 1.0×0.5 m → 0.7615 m', fn: (D) => D.huebscher(1.0, 0.5), expect: 0.76151, tol: 1e-3 },
      { name: 'legacy De ≈ Huebscher (1.0×0.5)', fn: (D) => D.legacyDe(0.5, 3.0), expect: 0.7695, tol: 2e-3 },
      { name: 'oval area a=0.3 b=0.6 → 0.1607 m²', fn: (D) => D.ovalArea(0.3, 0.6), expect: 0.16069, tol: 1e-3 },
      { name: 'oval perimeter a=0.3 b=0.6 → 1.5425 m', fn: (D) => D.ovalPerimeter(0.3, 0.6), expect: 1.54248, tol: 1e-3 },
      { name: 'duct friction 1 m³/s 300mm std air ≈ 6.8 Pa/m', fn: (D) => D.ductFriction(1, 300, 1.1811, 18.312e-6, 0.1).pd, expect: 6.8, tol: 0.5 },
      { name: 'Sutherland μ(24 °C) ≈ 18.37e-6 (Excel 18.312e-6)', fn: (D) => D.sutherland(24), expect: 18.37e-6, tol: 0.3e-6 },
      { name: 'Sutherland μ(37 °C) ≈ 18.94e-6 (Excel wrongly used 18.474e-6)', fn: (D) => D.sutherland(37), expect: 18.94e-6, tol: 0.3e-6 },
      { name: 'rectDimsForDe(0.7615, ratio 1) → a≈0.6966', fn: (D) => D.rectDimsForDe(0.7615, 1).a, expect: 0.6966, tol: 2e-3 },
      { name: 'rectDimsForDe round-trip huebscher = De', fn: (D) => { const d = D.rectDimsForDe(0.7615, 1); return D.huebscher(d.a, d.b); }, expect: 0.7615, tol: 1e-4 },
      { name: 'ovalDimsForDe(0.5, ratio 2) → a≈0.3249', fn: (D) => D.ovalDimsForDe(0.5, 2).a, expect: 0.3249, tol: 3e-3 },
    ],
  },
  {
    group: 'electrical & acoustics',
    tests: [
      { name: '3Ø 5.5kW 380V pf0.85 → 9.83 A', fn: (X) => X.current3Ph(5.5, 380, 0.85), expect: 9.829, tol: 0.01 },
      { name: '1Ø 5.5kW 220V pf0.85 → 29.4 A', fn: (X) => X.current1Ph(5.5, 220, 0.85), expect: 29.412, tol: 0.01 },
      { name: 'kgf·m → N·m (9.80665)', fn: (X) => X.nm(10), expect: 98.0665, tol: 1e-6 },
      { name: 'N·m → kgf·m', fn: (X) => X.kgf_m(98.0665), expect: 10, tol: 1e-6 },
      { name: 'SPLr = SWL − 10log(4πr²) + 10log(Q): 80dB@5m Q=2 → 58.04', fn: (X) => X.splFromSwl(80, 5, 2), expect: 58.038, tol: 0.01 },
      { name: 'SWL from SPL (inverse)', fn: (X) => X.swlFromSpl(X.splFromSwl(80, 5, 2), 5, 2), expect: 80, tol: 1e-9 },
      { name: 'dB addition 80+80 → 83.01', fn: (X) => X.addDb([80, 80]), expect: 83.010, tol: 1e-3 },
      { name: 'dB addition 70+73+78 → 79.69', fn: (X) => X.addDb([70, 73, 78]), expect: 79.687, tol: 1e-2 },
    ],
  },
  {
    group: 'NPSH & insulation & stairwell',
    tests: [
      { name: 'NPSHa: 101.325kPa, Hz=+2, Hf=1, 80°C water → 6.50 m (Excel uses g=9.8)', fn: (F) => F.npsha(101.325, 2, 1, 47.39), expect: 6.5007, tol: 0.01 },
      { name: 'NPSHa Excel-parity (g=9.8): 6.5033', fn: (F) => (101.325 - 47.39) / 9.8 + 2 - 1, expect: 6.5033, tol: 1e-3 },
      { name: 'eq thickness d=0.1 t=0.05 → 0.0693 m', fn: (F) => F.equivalentThickness(0.1, 0.05), expect: 0.069315, tol: 1e-5 },
      { name: 'stair base A floors=1 → 25000', fn: (X) => X.stairBaseFlow('A', 1), expect: 25000, tol: 1e-9 },
      { name: 'stair base A floors=19 → 30000', fn: (X) => X.stairBaseFlow('A', 19), expect: 30000, tol: 1e-6 },
      { name: 'stair base A floors=20 → 35000', fn: (X) => X.stairBaseFlow('A', 20), expect: 35000, tol: 1e-6 },
      { name: 'stair base A floors=32 → 40000', fn: (X) => X.stairBaseFlow('A', 32), expect: 40000, tol: 1e-6 },
      { name: 'stair total: 19 floors A single door 2 exits → 30000·0.75·1.5', fn: (X) => X.stairFlow('A', 19, 'single', 2).total, expect: 33750, tol: 1e-6 },
      // GB 51251-2017 table 3.4.2 (current standard)
      { name: 'GB51251 A h=40 → 38008', fn: (X) => X.stairBaseFlowGB('A', 40), expect: 38008, tol: 1 },
      { name: 'GB51251 A h=60 → 40840', fn: (X) => X.stairBaseFlowGB('A', 60), expect: 40840, tol: 1 },
      { name: 'GB51251 B1 h=40 → 26654', fn: (X) => X.stairBaseFlowGB('B1', 40), expect: 26654, tol: 1 },
      { name: 'GB51251 C h=40 → 36323', fn: (X) => X.stairBaseFlowGB('C', 40), expect: 36323, tol: 1 },
      { name: 'GB51251 D h=40 → 43815', fn: (X) => X.stairBaseFlowGB('D', 40), expect: 43815, tol: 1 },
      { name: 'GB51251 design = base×1.2: A h=40 → 45610', fn: (X) => X.stairFlowGB('A', 40, 'double').design, expect: 45609.6, tol: 1 },
      { name: 'GB51251 total = design×0.75 single door: A h=40 → 34207', fn: (X) => X.stairFlowGB('A', 40, 'single').total, expect: 34207.2, tol: 1 },
    ],
  },
];
