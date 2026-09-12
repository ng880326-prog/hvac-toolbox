// HVAC Toolbox — Air duct geometry & friction (SI)
// Sources:
//  - Haaland, S.E. (1983), "Simple and Explicit Formulas for the Friction Factor
//    in Turbulent Pipe Flow", J. Fluids Eng. — matches workbook formula.
//  - ASHRAE Handbook—Fundamentals, Ch.21 Duct Design — equivalent diameters,
//    roughness k = 0.09 mm galvanised (workbook default 0.1 mm).
//  - Huebscher, R.G. (1948), ASHVE Trans. — De = 1.30(ab)^0.625/(a+b)^0.25 (standard).
//  - Workbook legacy variant De = 1.453·A^0.6/P^0.2 (kept for parity; ≈Huebscher within ~1%).

export const AIR_MU = {
  13: 17.78e-6,   // Pa·s (workbook values)
  24: 18.312e-6,
  28: 18.474e-6,
  37: 18.474e-6,
};
export const ROUGHNESS_DUCT = 0.1; // mm galvanised steel (workbook default)

/** Reynolds number. rho kg/m³, v m/s, D m (or mm→m), mu Pa·s. */
export function reynolds(rho, v, D, mu) { return rho * v * D / mu; }

/** Air dynamic viscosity via Sutherland's law (Pa·s). μ0 = 1.716e-5 at 273.15 K, S = 110.4 K.
 *  Workbook used tabulated 17.78e-6 (13 °C) / 18.312e-6 (24 °C) / 18.474e-6 (28 & 37 °C — 37 °C is wrong there). */
export function sutherland(Tc) {
  const T = Tc + 273.15;
  return 1.716e-5 * Math.pow(T / 273.15, 1.5) * (273.15 + 110.4) / (T + 110.4);
}

/** Circular equivalent diameter, Huebscher (m). a, b in m. */
export function huebscher(a, b) { return 1.30 * Math.pow(a * b, 0.625) / Math.pow(a + b, 0.25); }

/** Rectangular dims (m) for a given friction-equivalent diameter De (m) at aspect ratio b/a.
 *  Solves the Huebscher relation numerically. Returns { a, b }. */
export function rectDimsForDe(De, ratio) {
  let lo = 1e-4, hi = De * 2;
  const f = (a) => huebscher(a, a * ratio) - De;
  for (let i = 0; i < 80; i++) {
    const mid = (lo + hi) / 2;
    if (f(mid) < 0) lo = mid; else hi = mid;
  }
  const a = (lo + hi) / 2;
  return { a, b: a * ratio };
}

/** CIBSE-type equivalent diameter De = 1.265·(ab)^0.6/(a+b)^0.2 (m) — the exact form behind the
 *  workbook's 1.453·A^0.6/P^0.2 (P = 2(a+b), 1.453/2^0.2 ≈ 1.265). */
export function deCibse(a, b) { return 1.265 * Math.pow(a * b, 0.6) / Math.pow(a + b, 0.2); }

/** Workbook legacy equivalent diameter (m). A m², P m. */
export function legacyDe(A, P) { return 1.265 * Math.pow(A, 0.6) / Math.pow(P, 0.2) * Math.pow(2, 0.2); }

/** Oval duct dims (m) for friction-equivalent diameter De at ratio b/a using the CIBSE-type relation. */
export function ovalDimsForDe(De, ratio) {
  let lo = 1e-4, hi = De * 3;
  const f = (a) => deCibse(a, a * ratio) - De;
  for (let i = 0; i < 80; i++) {
    const mid = (lo + hi) / 2;
    if (f(mid) < 0) lo = mid; else hi = mid;
  }
  const a = (lo + hi) / 2;
  return { a, b: a * ratio };
}

/** Oval duct area (m²). a = minor axis (m), b = major axis (m). */
export function ovalArea(a, b) { return Math.PI * (a / 2) * (a / 2) + (b - a) * a; }

/** Oval duct perimeter (m). */
export function ovalPerimeter(a, b) { return Math.PI * a + 2 * (b - a); }

/** Duct friction pressure drop Pa/m via Darcy–Weisbach + Haaland.
 *  Q m³/s, D mm (circular equivalent), k mm, rho kg/m³, mu Pa·s. */
export function ductFriction(Q, Dmm, rho, mu, k = ROUGHNESS_DUCT) {
  const D = Dmm / 1000;
  const A = Math.PI * D * D / 4;
  const v = Q / A;
  const Re = reynolds(rho, v, D, mu);
  if (Re <= 0) return { f: 0, pd: 0, v: 0, Re: 0 };
  const f = haalandLocal(Re, k, Dmm);
  const pd = f * 0.5 * rho * v * v / D;
  return { f, pd, v, Re };
}

function haalandLocal(Re, k, Dmm) {
  const f = 1 / (-1.8 * Math.log10(6.9 / Re + Math.pow((k / Dmm) / 3.71, 1.11)));
  return f * f;
}

/** Diameter (mm) for a given flow at target velocity. */
export function diaForVelocity(Q, v) { return Math.sqrt(4 * Q / (Math.PI * v)) * 1000; }

/** Velocity pressure 0.5·ρ·v² (Pa). */
export function velocityPressure(rho, v) { return 0.5 * rho * v * v; }

/** Round-duct velocity from Q (m³/s) and D (mm). */
export function velocityFromQD(Q, Dmm) { return Q / (Math.PI * Math.pow(Dmm / 2000, 2)); }
