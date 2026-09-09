// HVAC Toolbox — Fluids & thermal core (SI)
// Sources (verified):
//  - Hazen–Williams SI: hf = 10.67·Q^1.852/(C^1.852·d^4.8704) m/m (Q m³/s, d m);
//    velocity form 6.82·(V/C)^1.852/d^1.166 equals the workbook constant 6.819
//    (10.67·(π/4)^1.852 ≈ 6.819). Workbook multiplies by 1000·9.81 → Pa/m. ✔
//  - CIBSE Guide C / ASHRAE Handbook—Fundamentals Ch.22: design limits
//    ~2.5 m/s and ≤400 Pa/m for closed hydronic systems (workbook defaults).
//  - LMTD: standard heat exchanger relation.
//  - NPSHa = Ha ± Hz − Hf − Hv (m), per pump/hydraulic texts (e.g. CIBSE, ASHRAE).
//  - Insulation: equivalent thickness eq. from ISO 12241 / GB 50264-2013.

export const WATER_RHO = 1000;    // kg/m³
export const G = 9.80665;         // m/s² (workbook uses 9.81/9.8 approximations)

// ---------------- Hazen–Williams ----------------

/**
 * Pressure drop per metre (Pa/m) by Hazen–Williams (SI).
 * @param {number} V   velocity m/s
 * @param {number} Dmm internal diameter mm
 * @param {number} C   roughness coefficient (140 closed steel/copper, 100 open)
 */
export function hazenWilliams(V, Dmm, C = 100) {
  return 6.819 * Math.pow(V / C, 1.852) / Math.pow(Dmm / 1000, 1.167) * 1000 * 9.81;
}

/** Velocity (m/s) for a given pressure-drop limit (Pa/m). Inverse of hazenWilliams. */
export function velocityForPd(pdPaPerM, Dmm, C = 100) {
  return C * Math.pow(pdPaPerM * Math.pow(Dmm / 1000, 1.167) / (6.819 * 1000 * 9.81), 1 / 1.852);
}

/** Flow (L/s) from velocity and diameter. */
export function flowFromVelocity(V, Dmm) { return V * Math.PI * Math.pow(Dmm / 2000, 2) * 1000; }

/** Velocity (m/s) from flow (L/s) and diameter (mm). */
export function velocityFromFlow(Lps, Dmm) { return (Lps / 1000) / (Math.PI * Math.pow(Dmm / 2000, 2)); }

/** Darcy–Weisbach friction factor (Haaland 1983). k and D in mm. */
export function haaland(Re, k, D) {
  const f = 1 / (-1.8 * Math.log10(6.9 / Re + Math.pow((k / D) / 3.71, 1.11)));
  return f * f;
}

/** Duct/pipe friction, Pa/m, from Darcy–Weisbach. Q in m³/s, D in mm, rho kg/m³. */
export function darcyFriction(f, rho, Q, Dmm) {
  const D = Dmm / 1000;
  return f * 0.5 * rho * 16 * Q * Q / (Math.PI * Math.PI * Math.pow(D, 5));
}

// ---------------- Unit conversions (chiller/boiler world) ----------------

export const CONV = {
  kW_PER_RT: 3.51685,        // 1 RT = 12000 Btu/h = 3.51685 kW (workbook rounds to 3.516/3.517)
  BTUH_PER_KW: 3412.14,      // workbook uses 3412
  KCAL_PER_KW: 860.421,      // workbook uses 860
  BTU_PER_RT: 12000,
  H_FG_WATER: 2257,          // kJ/kg at 100 °C
  H_FG_WATER_KCAL: 539,      // kcal/kg
};

export const kWtoRT = (kw) => kw / CONV.kW_PER_RT;
export const RTtokW = (rt) => rt * CONV.kW_PER_RT;
export const kWtoBtuH = (kw) => kw * CONV.BTUH_PER_KW;
export const kWtoKcalH = (kw) => kw * CONV.KCAL_PER_KW;

/** Water-side heat: kW = L/s · 4.1868 · ΔT. */
export function waterHeat(Lps, dT) { return Lps * 4.186789 * dT; }
/** Flow L/s for heat kW at ΔT. */
export function waterFlow(kW, dT) { return kW / (4.186789 * dT); }

/** Sensible heat of air: kW = V(m³/s) · ρ · cp · ΔT. */
export function sensibleAir(Vm3s, dT, rho = 1.2) { return Vm3s * rho * 1.006 * dT; }
/** Total heat of air: kW = V(m³/s) · ρ · Δh. */
export function totalAir(Vm3s, dh, rho = 1.2) { return Vm3s * rho * dh; }

// ---------------- Heat exchanger ----------------

/** Log-mean temperature difference; falls back to arithmetic mean when ΔT1 = ΔT2. */
export function lmtd(dT1, dT2) {
  if (Math.abs(dT1 - dT2) < 1e-9) return (dT1 + dT2) / 2;
  return (dT1 - dT2) / Math.log(dT1 / dT2);
}

/** Heat transfer Q = U·A·LMTD. */
export function hxHeat(U, A, dT1, dT2) { return U * A * lmtd(dT1, dT2) / 1000; } // kW

// ---------------- NPSH ----------------

/** NPSH available (m). ha = absolute pressure at suction surface (kPa),
 *  hz = elevation (+ above / − below pump centreline, m), hf = friction loss (m),
 *  hv = vapour pressure head (m). */
export function npsha(haKPa, hz, hf, hvKPa, rho = WATER_RHO) {
  return haKPa * 1000 / (rho * G) + hz - hf - hvKPa * 1000 / (rho * G);
}

// ---------------- Insulation (ISO 12241 / GB 50264) ----------------

/** Equivalent insulation thickness for a round pipe (m), on outer-surface basis.
 *  de = 0.5·(d+2t)·ln(1+2t/d) — matches workbook. */
export function equivalentThickness(d, t) { return 0.5 * (d + 2 * t) * Math.log(1 + 2 * t / d); }

/** Minimum insulation thickness (m) to prevent surface condensation (GB 50264-2013 §5.3.3).
 *  λ W/(m·K), α surface coefficient W/(m²·K), Ta ambient °C, Td dew point °C, Ts fluid °C. */
export function antiCondensationThickness(lambda, alpha, Ta, Td, Ts) {
  return lambda / alpha * (Td - Ts) / (Ta - Td);
}

// ---------------- Water saturation (for NPSH / boiler steam) ----------------
// Reuses the ASHRAE Hyland–Wexler pws from the psychro module; imported by callers.
