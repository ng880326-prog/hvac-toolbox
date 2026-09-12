// HVAC Toolbox — Psychrometric core (SI units)
// Sources (verified):
//  - ASHRAE Handbook—Fundamentals 2025, Ch.1 Psychrometrics (cited by the Excel workbook itself)
//  - Hyland, R.W. & Wexler, A. (1983) "Formulations for the Thermodynamic Properties of the
//    Saturated Phases of H2O from 173.15 K to 473.15 K", ASHRAE Transactions 89(2A)
//  - ASHRAE Fundamentals (SI) Ch.1 Psychrometrics — Hyland-Wexler coefficients C8..C13
// Notes: the workbook uses cpv = 1.805 kJ/kgK (1997 ASHRAE convention) instead of the
// 1.86 used in later editions; both retained below via constants.

export const CONST = {
  R_DA: 0.2871,     // kJ/(kg·K) dry air gas constant (ASHRAE 0.287042)
  RATIO: 0.62198,   // 18.01528 / 28.966 (Mw / Mda)
  CP_AIR: 1.006,    // kJ/(kg·K) dry air
  CP_VAP: 1.805,    // kJ/(kg·K) water vapour (ASHRAE F 2025 Ch.1; later eds. use 1.86)
  H_FG0: 2501,      // kJ/kg latent heat of vaporisation at 0 °C
  CP_W: 4.186,      // kJ/(kg·K) liquid water
  K2: 2.381,        // slope of hfg vs twb (ASHRAE F 2025 Ch.1; later eds. 2.326)
  P_STD: 101.325,   // kPa standard atmosphere
};

// Hyland–Wexler coefficients, ASHRAE Handbook—Fundamentals (2025) ch.1, T in K.
// Written in scientific notation on purpose: as long decimal strings (C6 = -0.0000000000009484024)
// a single miscounted zero shifted the whole ice branch by 1000x and produced pws(0) = 0.0031 kPa.
// Liquid water, 0…200 °C (ASHRAE eq. 6):
const C_LIQ = [-5.8002206e3, 1.3914993, -4.8640239e-2, 4.1764768e-5, -1.4452093e-8, 6.5459673];
// Ice, −100…0.01 °C (ASHRAE eq. 5):
const C_ICE = [-5.6745359e3, 6.3925247, -9.677843e-3, 6.2215701e-7, 2.0747825e-9, -9.484024e-13,
  4.1635019];

/** Saturation pressure of water vapour, kPa, for temperature T (°C). Range −100..200 °C. */
export function pws(T) {
  const K = T + 273.15;
  let ln;
  if (T >= 0.01) {
    ln = C_LIQ[0] / K + C_LIQ[1] + C_LIQ[2] * K + C_LIQ[3] * K * K + C_LIQ[4] * K * K * K + C_LIQ[5] * Math.log(K);
  } else {
    ln = C_ICE[0] / K + C_ICE[1] + C_ICE[2] * K + C_ICE[3] * K * K + C_ICE[4] * K * K * K +
      C_ICE[5] * K * K * K * K + C_ICE[6] * Math.log(K);
  }
  return Math.exp(ln) / 1000;
}

/** Dew-point temperature (°C) for a given vapour pressure pw (kPa). Inverts pws by bisection. */
export function tdpFromPw(pw) {
  let lo = -60, hi = 200;
  for (let i = 0; i < 80; i++) {
    const mid = (lo + hi) / 2;
    if (pws(mid) > pw) hi = mid; else lo = mid;
  }
  return (lo + hi) / 2;
}

/** Humidity ratio W (kg/kg) from vapour pressure pw (kPa) at total pressure p (kPa). */
export function WfromPw(pw, p = CONST.P_STD) { return CONST.RATIO * pw / (p - pw); }

/** Vapour pressure pw (kPa) from humidity ratio W (kg/kg). */
export function pwFromW(W, p = CONST.P_STD) { return p * W / (CONST.RATIO + W); }

/** Saturated humidity ratio Ws (kg/kg) at temperature T (°C). */
export function Ws(T, p = CONST.P_STD) { return WfromPw(pws(T), p); }

/** Specific enthalpy h (kJ/kg). h = 1.006·T + W·(2501 + 1.805·T) */
export function enthalpy(T, W) { return CONST.CP_AIR * T + W * (CONST.H_FG0 + CONST.CP_VAP * T); }

/** Specific volume v (m³/kg). v = 0.2871·(T+273.15)·(1+1.6078·W)/p */
export function specificVolume(T, W, p = CONST.P_STD) {
  return CONST.R_DA * (T + 273.15) * (1 + 1.6078 * W) / p;
}

/** Moist-air density ρ (kg/m³) — matches workbook (1+W)/v. */
export function density(T, W, p = CONST.P_STD) { return (1 + W) / specificVolume(T, W, p); }

/** Relative humidity % from dry-bulb T (°C) and vapour pressure pw (kPa). */
export function RHfromPw(T, pw) { return pw / pws(T) * 100; }

/** Vapour pressure (kPa) from dry-bulb T (°C) and relative humidity %. */
export function pwFromRH(T, rh) { return rh / 100 * pws(T); }

/** Degree of saturation µ = W / Ws. */
export function degSat(T, W, p = CONST.P_STD) { return W / Ws(T, p); }

/** Relative humidity % from degree of saturation µ (ASHRAE F09 eq. 24). */
export function RHfromMu(T, mu, p = CONST.P_STD) {
  const pw = pws(T);
  return mu / (1 - (1 - mu) * pw / p) * 100;
}

/** Degree of saturation from RH % (inverse of RHfromMu). μ = φ·(p−pws)/(p−φ·pws) */
export function muFromRH(T, rh, p = CONST.P_STD) {
  const phi = rh / 100, pw = pws(T);
  return phi * (p - pw) / (p - phi * pw);
}

/**
 * Wet-bulb temperature (°C) from T (°C) and W (kg/kg).
 * Iterates the ASHRAE F 2025 Ch.1 relation (same as workbook Supporting sheets):
 *   W = [ (2501 − 2.381·twb)·Ws(twb) − (T − twb) ] / [ 2501 + 1.805·T − 4.186·twb ]
 */
export function twbFromTW(T, W, p = CONST.P_STD) {
  const tdp = tdpFromPw(pwFromW(W, p));
  const f = (tw) => ((CONST.H_FG0 - CONST.K2 * tw) * Ws(tw, p) - (T - tw)) /
    (CONST.H_FG0 + CONST.CP_VAP * T - CONST.CP_W * tw);
  let lo = tdp, hi = T;
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    if (f(mid) > W) hi = mid; else lo = mid;
  }
  return (lo + hi) / 2;
}

/** Humidity ratio W (kg/kg) from T (°C) and wet-bulb Twb (°C) — closed form of the iteration equation. */
export function WfromTTwb(T, Twb, p = CONST.P_STD) {
  const num = (CONST.H_FG0 - CONST.K2 * Twb) * Ws(Twb, p) - (T - Twb);
  const den = CONST.H_FG0 + CONST.CP_VAP * T - CONST.CP_W * Twb;
  return num / den;
}

/**
 * Full psychrometric state from any pair of independent properties.
 * Inputs: { t?, twb?, tdp?, rh?, w?, h? } (rh in %, t in °C, w in kg/kg, h in kJ/kg, p in kPa optional)
 * Returns { t, twb, tdp, rh, w, h, v, rho, pw, mu } or null when the pair is invalid.
 */
export function state(inp) {
  const p = inp.p ?? CONST.P_STD;
  let t = inp.t, w = inp.w, pw = null;

  if (inp.t != null && inp.twb != null) {
    t = inp.t;
    w = WfromTTwb(inp.t, inp.twb, p);
    pw = pwFromW(w, p);
  } else if (inp.t != null && inp.tdp != null) {
    t = inp.t;
    pw = pws(inp.tdp);
    w = WfromPw(pw, p);
  } else if (inp.t != null && inp.rh != null) {
    t = inp.t;
    pw = pwFromRH(inp.t, inp.rh);
    w = WfromPw(pw, p);
  } else if (inp.t != null && inp.w != null) {
    t = inp.t;
    w = inp.w;
    pw = pwFromW(w, p);
  } else if (inp.t != null && inp.h != null) {
    t = inp.t;
    w = (inp.h - CONST.CP_AIR * t) / (CONST.H_FG0 + CONST.CP_VAP * t);
    pw = pwFromW(w, p);
  } else if (inp.twb != null && inp.rh != null) {
    // solve t such that twb(t, WfromRH(t,rh)) == twb
    let lo = inp.twb - 0.001, hi = inp.twb + 80;
    const target = inp.twb;
    const f = (tt) => {
      const ww = WfromPw(pwFromRH(tt, inp.rh), p);
      return twbFromTW(tt, ww, p) - target;
    };
    for (let i = 0; i < 60; i++) {
      const mid = (lo + hi) / 2;
      if (f(mid) < 0) lo = mid; else hi = mid;
    }
    t = (lo + hi) / 2;
    pw = pwFromRH(t, inp.rh);
    w = WfromPw(pw, p);
  } else if (inp.twb != null && inp.w != null) {
    // solve t such that twb(t,w) == twb
    let lo = inp.twb, hi = inp.twb + 100;
    for (let i = 0; i < 60; i++) {
      const mid = (lo + hi) / 2;
      if (twbFromTW(mid, inp.w, p) < inp.twb) lo = mid; else hi = mid;
    }
    t = (lo + hi) / 2;
    w = inp.w;
    pw = pwFromW(w, p);
  } else if (inp.tdp != null && inp.rh != null) {
    pw = pws(inp.tdp);
    t = tdpFromPw(pw / (inp.rh / 100));
    w = WfromPw(pw, p);
  } else {
    return null;
  }

  const twb = twbFromTW(t, w, p);
  const tdp = tdpFromPw(pw);
  const rh = RHfromPw(t, pw);
  const h = enthalpy(t, w);
  const v = specificVolume(t, w, p);
  const rho = (1 + w) / v;
  return { t, twb, tdp, rh, w, h, v, rho, pw, mu: w / Ws(t, p), p };
}

/** Adiabatic mixing of two air streams (mass flow ratio m1:m2). */
export function mix(s1, s2, m1, m2) {
  const mt = m1 + m2;
  const h = (s1.h * m1 + s2.h * m2) / mt;
  const w = (s1.w * m1 + s2.w * m2) / mt;
  const t = (h - w * CONST.H_FG0) / (CONST.CP_AIR + CONST.CP_VAP * w);
  return state({ t, w, p: s1.p ?? CONST.P_STD });
}
