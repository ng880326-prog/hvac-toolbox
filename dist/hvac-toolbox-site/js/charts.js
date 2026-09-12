// HVAC Toolbox Pro — psychrometric chart renderer (SVG, no deps)
// Plot: dry-bulb X axis, humidity ratio Y axis; saturation curve, RH grid,
// constant-enthalpy lines, optional state points & process lines (coil).
// Model: S = supply(off-coil), O = outdoor, P = preheat(off), M = mixed(on-coil), H = room/return
const X0 = -10, X1 = 60;                 // tdb °C
const Y0 = 0, Y1 = 0.028;                // W kg/kg
const W_PAD = 120, H_PAD = 30;

export function psychroChartSVG(states, lines, opts = {}) {
  const { p = 101.325, width = 640 } = opts;
  const pws = opts.pws;   // required: pws(Tc) => kPa
  const height = 420;
  const plotW = width - W_PAD - 20, plotH = height - 40 - H_PAD;
  const sx = (x) => W_PAD + (x - X0) / (X1 - X0) * plotW;
  const sy = (y) => height - 40 - (y - Y0) / (Y1 - Y0) * plotH;

  let s = `<svg viewBox="0 0 ${width} ${height}" width="100%" xmlns="http://www.w3.org/2000/svg" style="background:transparent">`;
  // graticule + labels
  for (let t = X0; t <= X1; t += 10) {
    const x = sx(t);
    s += `<line x1="${x}" y1="${sy(Y0)}" x2="${x}" y2="${sy(Y1)}" stroke="var(--line)" stroke-width="1"/>`;
    s += `<text x="${x}" y="${height - 14}" font-size="11" fill="var(--ink-soft)" text-anchor="middle">${t}°</text>`;
  }
  for (let w = Y0; w <= Y1 + 1e-9; w += 0.005) {
    const y = sy(w);
    s += `<line x1="${sx(X0)}" y1="${y}" x2="${sx(X1)}" y2="${y}" stroke="var(--line)" stroke-width="1"/>`;
    s += `<text x="${W_PAD - 6}" y="${y + 4}" font-size="11" fill="var(--ink-soft)" text-anchor="end">${(w * 1000).toFixed(0)}</text>`;
  }
  s += `<text x="${W_PAD - 6}" y="${sy(Y1) - 4}" font-size="10" fill="var(--ink-soft)" text-anchor="end">W g/kg</text>`;

  // saturation curve + RH curves
  const curve = (Tmin, Tmax, f) => {
    let d = '';
    for (let t = Tmin; t <= Tmax; t += 0.5) {
      const y = f(t);
      d += (d ? 'L' : 'M') + sx(t).toFixed(1) + ' ' + sy(y).toFixed(1);
    }
    return d;
  };
  const pws2W = (pw, pp) => 0.62198 * pw / (pp - pw);
  for (const rh of [10, 20, 30, 40, 50, 60, 70, 80, 90]) {
    const path = curve(X0, X1, (t) => pws2W(rh / 100 * pws(t), p));
    s += `<path d="${path}" fill="none" stroke="var(--line)" stroke-dasharray="3 4" stroke-width="1"/>`;
  }
  const satPath = curve(X0, X1, (t) => pws2W(pws(t), p));
  s += `<path d="${satPath}" fill="none" stroke="var(--accent)" stroke-width="2"/>`;

  // constant h lines (slanted) — using h = 1.006t + W(2501+1.805t)
  const hPath = (hh) => {
    let d = '';
    for (let t = X0; t <= X1; t += 1) {
      const w = (hh - 1.006 * t) / (2501 + 1.805 * t);
      if (w < Y0 || w > Y1) continue;
      d += (d ? 'L' : 'M') + sx(t).toFixed(1) + ' ' + sy(w).toFixed(1);
    }
    return d;
  };
  for (const hh of [10, 20, 30, 40, 50, 60, 70, 80, 90]) {
    s += `<path d="${hPath(hh)}" fill="none" stroke="var(--line)" stroke-width="0.7" opacity="0.8"/>`;
  }

  // process lines — a non-finite endpoint would emit NaN into the SVG attributes, which browsers
  // report as parse errors and draws nothing, so those lines are skipped outright.
  const colors = { cool: 'var(--brand)', heat: 'var(--bad)', mix: 'var(--ok)', default: 'var(--accent)' };
  for (const ln of lines || []) {
    if (!(ln.points || []).every((v) => Number.isFinite(v))) continue;
    const c = colors[ln.color] || colors.default;
    const [x1, y1, x2, y2] = ln.points;
    s += `<line x1="${sx(x1)}" y1="${sy(y1)}" x2="${sx(x2)}" y2="${sy(y2)}" stroke="${c}" stroke-width="2.5" stroke-dasharray="${ln.dash ? '6 5' : ''}"/>`;
    if (ln.label) {
      s += `<text x="${sx((x1 + x2) / 2) + 6}" y="${sy((y1 + y2) / 2) - 4}" font-size="11" fill="${c}">${ln.label}</text>`;
    }
  }

  // state points
  const ptColors = { S: 'var(--brand)', O: 'var(--accent)', P: 'var(--bad)', M: 'var(--ok)', H: 'var(--ink-soft)' };
  const pts = (states || []).filter((st) => Number.isFinite(st?.t) && Number.isFinite(st?.w));
  for (const st of pts) {
    const x = sx(st.t), y = sy(st.w);
    const c = ptColors[st.id] || 'var(--accent)';
    s += `<circle cx="${x}" cy="${y}" r="5" fill="${c}" stroke="var(--card)" stroke-width="2"/>`;
    s += `<text x="${x + 8}" y="${y - 6}" font-size="12" font-weight="700" fill="${c}">${st.id}</text>`;
    if (st.show) s += `<text x="${x + 8}" y="${y + 12}" font-size="9.5" fill="var(--ink-soft)">${st.show}</text>`;
  }

  // legend (top-right) using the states actually plotted
  if (pts.length) {
    s += `<g class="legend">`;
    pts.forEach((st, i) => {
      const c = ptColors[st.id] || 'var(--accent)';
      const lx = width - 130, ly = 14 + i * 16;
      s += `<circle cx="${lx}" cy="${ly - 4}" r="4" fill="${c}"/>`;
      s += `<text x="${lx + 8}" y="${ly}" font-size="10.5" fill="var(--ink-soft)">${st.id}${st.name ? ' · ' + st.name : ''}</text>`;
    });
    s += `</g>`;
  }
  s += `<text x="${W_PAD}" y="${height - 2}" font-size="10" fill="var(--ink-soft)">Dry-bulb temp °C →</text>`;
  s += `</svg>`;
  return s;
}

export function chartFromStates(states) {
  // states: { id: 'S', t, w } etc — builds line segments between key points
  const ids = (states || []).map((x) => x.id);
  const lines = [];
  const byId = (id) => states.find((x) => x.id === id);
  if (byId('O') && byId('H')) lines.push({ points: [byId('O').t, byId('O').w, byId('H').t, byId('H').w], color: 'mix', label: 'M' });
  if (byId('M') && byId('S')) lines.push({ points: [byId('M').t, byId('M').w, byId('S').t, byId('S').w], color: 'cool', label: 'Cooling' });
  if (byId('P') && byId('S')) lines.push({ points: [byId('P').t, byId('P').w, byId('S').t, byId('S').w], color: 'heat', label: 'Heating' });
  if (byId('O') && byId('P')) lines.push({ points: [byId('O').t, byId('O').w, byId('P').t, byId('P').w], color: 'heat', label: 'Preheat' });
  return lines;
}
