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

/**
 * Plant cooling-load density (W/m²) from total capacity in RT and the air-conditioned area — the
 * relation the workbook's Chiller sheet uses on its reference rows (overall density column Y), with
 * its printed 3.517 kW/RT rather than the catalog 3.51685.
 */
export function plantDensityWm2(totalRT, acAreaM2) {
  if (!(totalRT > 0) || !(acAreaM2 > 0)) return null;
  return totalRT * 3.517 * 1000 / acAreaM2;
}

/** Water-side heat: kW = L/s · 4.1868 · ΔT. */
export function waterHeat(Lps, dT) { return Lps * 4.186789 * dT; }
/** Flow L/s for heat kW at ΔT. */
export function waterFlow(kW, dT) { return kW / (4.186789 * dT); }

/**
 * Boiler feed-pump duty per the workbook's rule (Boiler!N16): the steam rate in ton/hr raised by a
 * 13 % blowdown allowance and a 10 % margin, returned in m³/h. One ton of steam is counted as one m³ of
 * feedwater, which is the workbook's own simplification (real feedwater at 105 °C is ≈1.05 m³/t).
 */
export function feedPumpFlowM3h(tonPerHour, margin = 0.13, factor = 1.1) {
  if (!(tonPerHour > 0)) return NaN;
  return tonPerHour * (1 + margin) * factor;
}

/**
 * Supply air flow (L/s) from a sensible cooling load — the workbook's AHU rule (AHU!E27):
 * L/s = kW / ρcp / ΔT × 1000, with the sheet's own ρ·cp = 1.23 kJ/(m³·K). The physical value at 24 °C
 * is ≈1.21, so the workbook constant is the default and callers can show both (≈1.5 % apart).
 */
export function supplyFlowLps(kwSensible, dT, rhoCp = 1.23) {
  if (!(kwSensible > 0) || !(dT > 0)) return NaN;
  return kwSensible / rhoCp / dT * 1000;
}

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

/** BEC 2012 / TG §6.11.1(b) Equation (a) — provisional insulation thickness (mm).
 *  c = 1000·(λ/h)·{(θd − θl)/(θm − θd)}: λ W/(m·K), h W/(m²·K), θd dew point °C,
 *  θl cold-surface (line) temperature °C, θm ambient still-air temperature °C.
 *  Flat duct/AHU casing: the required thickness *is* c. */
export function provisionalThicknessMm(lambda, h, dewPoint, lineTemp, ambientTemp) {
  if (!(lambda > 0) || !(h > 0)) return NaN;
  const den = ambientTemp - dewPoint;
  if (!(den > 0)) return NaN;
  return 1000 * (lambda / h) * ((dewPoint - lineTemp) / den);
}

/** BEC 2012 Equation (b) — equivalent thickness (mm) of a cylindrical insulation layer of thickness
 *  La (mm) around a pipe of outer diameter do (mm):  c = 0.5·(do + 2·La)·ln(1 + 2·La/do). */
export function cylindricalEquivalentMm(doMm, laMm) {
  if (!(doMm > 0) || laMm < 0) return NaN;
  return 0.5 * (doMm + 2 * laMm) * Math.log(1 + 2 * laMm / doMm);
}

/** Invert Equation (b): the pipe insulation thickness La (mm) whose equivalent thickness equals c (mm).
 *  c(La) is monotonic and c(0) = 0, so a bracket-and-bisect solve is exact to machine precision.
 *  The workbook attempted this with a 5000-row trial table (AP4:AS5003) that returned #VALUE! for
 *  every row, so the sheet's La,min was never computed. */
export function pipeThicknessFromEquivalentMm(doMm, cMm) {
  if (!(doMm > 0) || !(cMm > 0)) return NaN;
  let hi = Math.max(cMm, 1e-3);
  let guard = 0;
  while (cylindricalEquivalentMm(doMm, hi) < cMm) {
    hi *= 2;
    if (++guard > 200) return NaN;
  }
  let lo = 0;
  for (let i = 0; i < 120; i += 1) {
    const mid = (lo + hi) / 2;
    if (cylindricalEquivalentMm(doMm, mid) < cMm) lo = mid; else hi = mid;
  }
  return (lo + hi) / 2;
}

// ---------------- Water saturation (for NPSH / boiler steam) ----------------
// Reuses the ASHRAE Hyland–Wexler pws from the psychro module; imported by callers.
