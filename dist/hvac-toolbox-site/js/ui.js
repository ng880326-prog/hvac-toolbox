// HVAC Toolbox Pro — UI helpers (no framework, plain DOM)
export function h(tag, attrs = {}, ...kids) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') el.className = v;
    else if (k === 'html') el.innerHTML = v;
    else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
    else if (v !== null && v !== undefined) el.setAttribute(k, v);
  }
  for (const kid of kids.flat()) {
    if (kid == null) continue;
    el.append(kid.nodeType ? kid : document.createTextNode(kid));
  }
  return el;
}

/** Number formatting: compact, locale-aware. */
export function fmt(x, digits = 2) {
  if (x == null || Number.isNaN(x) || !isFinite(x)) return '—';
  if (Math.abs(x) >= 1e6 || (Math.abs(x) < 1e-3 && x !== 0)) return x.toExponential(2);
  return x.toLocaleString(undefined, { maximumFractionDigits: digits, minimumFractionDigits: Math.min(digits, 2) });
}

export function parseNum(v) {
  const n = parseFloat(String(v).replace(/,/g, ''));
  return Number.isFinite(n) ? n : null;
}

/**
 * Input field builder.
 * spec: { key, label, unit, def, type='number', step, min, max, options:[{v,label}], onchange }
 */
export function field(spec, onChange) {
  const id = 'f-' + spec.key;
  const ctl = [];
  let input;
  if (spec.type === 'select' || spec.options) {
    input = h('select', { id });
    for (const o of spec.options) {
      const opt = h('option', { value: o.v }, o.label ?? o.v);
      if (String(o.v) === String(spec.def)) opt.selected = true;
      input.append(opt);
    }
  } else {
    input = h('input', {
      id, name: 'f-' + spec.key, autocomplete: 'off', type: spec.type ?? 'number',
      inputmode: spec.type === 'text' ? 'text' : 'decimal',
      step: spec.step ?? 'any',
      min: spec.min, max: spec.max,
      value: spec.def ?? '',
      placeholder: spec.placeholder ?? '',
    });
  }
  input.addEventListener('input', () => onChange(parseNum(input.value), input.value));
  ctl.push(input);
  if (spec.unit) ctl.push(h('span', { class: 'unit' }, spec.unit));
  return h('div', { class: 'field' }, h('label', { for: id }, spec.label), h('div', { class: 'ctl' }, ...ctl));
}

/** Segmented control. options: [{v,label}], current value, callback. */
export function seg(options, value, onChange) {
  const wrap = h('div', { class: 'seg' });
  const btns = options.map((o) => {
    const b = h('button', {
      type: 'button', class: String(o.v) === String(value) ? 'on' : '',
      onclick: () => { btns.forEach((x) => x.classList.toggle('on', x === b)); onChange(o.v); },
    }, o.label);
    return b;
  });
  wrap.append(...btns);
  return wrap;
}

/** Result tile. */
export function res(label, value, unit = '', opts = {}) {
  return h('div', { class: 'res' + (opts.big ? ' big' : '') + (opts.warn ? ' warn' : '') + (opts.err ? ' err' : '') },
    h('div', { class: 'lbl' }, label),
    h('div', { class: 'val' }, typeof value === 'number' ? fmt(value, opts.digits ?? 2) : value,
      unit ? h('small', {}, unit) : null));
}

/** Status flag. */
export function flag(text, kind = 'info') { return h('div', { class: 'flag ' + kind }, text); }

/** Card with title + subtitle + body builder. */
export function card(title, sub, buildBody, extra = {}) {
  const body = h('div');
  const c = h('div', { class: 'card' }, h('h3', {}, title), sub ? h('div', { class: 'sub' }, sub) : null, body);
  if (extra.formula) body.append(h('div', { class: 'formula' }, extra.formula));
  if (buildBody) buildBody(body);
  if (extra.note) body.append(h('div', { class: 'note' }, extra.note));
  if (extra.src) body.append(h('div', { class: 'note' }, h('span', {}, '出處：'), h('code', {}, extra.src)));
  if (extra.collapsed) {
    return fold(typeof title === 'string' ? title : (title.zh || title.en || ''), c);
  }
  return c;
}

/** Bind a set of field specs into a grid container; returns { get, set, onChange, grid }. */
export function form(specs, onChange, gridClass = 'grid2') {
  const grid = h('div', { class: gridClass });
  const state = {};
  const fire = () => onChange(state);
  for (const s of specs) {
    state[s.key] = parseNum(s.def) ?? (s.def ?? null);
    grid.append(field(s, (n, raw) => {
      state[s.key] = s.type === 'select' || s.options ? raw : n;
      fire();
    }));
    if (s.type === 'select' || s.options) state[s.key] = s.def;
  }
  return {
    grid,
    get: (k) => state[k],
    all: () => state,
    set: (k, v) => { state[k] = v; const inp = grid.querySelector('#f-' + k); if (inp && inp.tagName === 'INPUT') inp.value = v ?? ''; fire(); },
  };
}

/** Rebuild results area. */
/** Collapsible group — keeps secondary/advanced sections out of the way. */
export function fold(title, ...kids) {
  const body = h('div', { class: 'fold-body' });
  for (const k of kids) if (k) body.append(k);
  const d = h('details', { class: 'folded' }, h('summary', {}, title), body);
  return d;
}
export function results(parent, items) {
  parent.innerHTML = '';
  const grid = h('div', { class: 'results', 'aria-live': 'polite' });
  for (const it of items) grid.append(it);
  parent.append(grid);
}
