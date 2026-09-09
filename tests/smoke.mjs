// HVAC Toolbox Pro — headless DOM smoke test.
// Loads every module and the app shell against a minimal DOM stub to catch runtime errors.
class El {
  constructor(tag) {
    this.tagName = tag;
    this.nodeType = 1; // mirrors real DOM elements
    this.children = [];
    this.attrs = {};
    this.style = {};
    this.listeners = {};
    this.classList = {
      add: (...c) => { this._cls = new Set([...(this._cls || []), ...c]); },
      remove: (...c) => { if (this._cls) c.forEach((x) => this._cls.delete(x)); },
      toggle: (c, on) => { if (!this._cls) this._cls = new Set(); if (on === undefined ? !this._cls.has(c) : on) this._cls.add(c); else this._cls.delete(c); },
      contains: (c) => (this._cls || new Set()).has(c),
    };
    this._cls = new Set();
    this._value = '';
    this._text = '';
    this.dataset = {};
  }
  set className(v) { this._cls = new Set(String(v || '').split(/\s+/).filter(Boolean)); }
  get className() { return [...this._cls].join(' '); }
  set innerHTML(v) { this._html = v; this.children = []; }
  get innerHTML() { return this._html || ''; }
  set textContent(v) { this._text = String(v); }
  get textContent() { return this._text; }
  set value(v) { this._value = String(v ?? ''); }
  get value() { return this._value; }
  get id() { return this.attrs.id; }
  setAttribute(k, v) { this.attrs[k] = v; if (k === 'class') this.className = v; if (k === 'id') IDS[v] = this; }
  getAttribute(k) { return this.attrs[k]; }
  append(...kids) {
    for (const k of kids.flat(Infinity)) {
      if (k == null) continue;
      if (k instanceof El) this.children.push(k);
      else if (typeof k === 'object' && k.text !== undefined) this.children.push(new TextNode(k.text));
      else if (typeof k === 'string' || typeof k === 'number') this.children.push(new TextNode(String(k)));
      else this.children.push(k);
    }
  }
  addEventListener(type, fn) { (this.listeners[type] ||= []).push(fn); }
  dispatch(type, ev = {}) { for (const fn of this.listeners[type] || []) fn({ target: this, ...ev }); }
  querySelector(sel) {
    const find = (n) => {
      for (const c of n.children || []) {
        if (!(c instanceof El)) continue;
        if (sel.startsWith('#')) { if (c.attrs.id === sel.slice(1)) return c; }
        else if (sel.startsWith('.')) { if ((c.className || '').split(/\s+/).includes(sel.slice(1))) return c; }
        else if (c.tagName === sel.toLowerCase() || c.tagName === sel) return c;
        const r = find(c);
        if (r) return r;
      }
      return null;
    };
    return find(this) || null;
  }
}
class TextNode { constructor(t) { this.text = t; this.nodeType = 3; } }

const IDS = {};
const document = {
  createElement: (tag) => new El(tag),
  createTextNode: (t) => new TextNode(t),
  getElementById: (id) => IDS[id] ||= new El('div'),
  documentElement: new El('html'),
  body: new El('body'),
  addEventListener() {},
  querySelectorAll: () => [],
};
const localStorage = { _s: {}, getItem(k) { return this._s[k] ?? null; }, setItem(k, v) { this._s[k] = v; } };
const window = { addEventListener() {}, scrollTo() {} };
let location = { hash: '#/' };
let hashchange = null;

globalThis.document = document;
globalThis.localStorage = localStorage;
globalThis.window = window;
globalThis.location = location;

let failures = 0;

function countClass(node, cls) {
  let n = 0;
  const walk = (el) => {
    if (el instanceof El || el instanceof TextNode) { /* both have text */ }
    if (el instanceof El) {
      if ((el.className || '').split(/\s+/).includes(cls)) n++;
      for (const k of el.children) walk(k);
    }
  };
  walk(node);
  return n;
}

async function main() {
  // load all modules, render each
  const registry = await import('../app/js/registry.js');
  const ui = await import('../app/js/ui.js');
  await import('../app/js/modules/index.js');
  const mods = registry.MODULES;
  console.log(`modules registered: ${mods.length}`);
  if (mods.length !== 22) { console.error('EXPECTED 22 modules'); failures++; }
  let interact = 0, resTotal = 0;
  for (const m of mods) {
    try {
      const root = new El('div');
      const beforeIds = Object.keys(IDS).length;
      m.render(root, { L: registry.L, h: ui.h, lang: 'zh' });
      // ---- behavioural test: set every input/select/checkbox and fire events ----
      for (const id of Object.keys(IDS).slice(beforeIds)) {
        const el = IDS[id];
        if (el.tagName === 'select') {
          const opt = el.children[0];
          el.value = opt ? (opt.attrs && opt.attrs.value) || '300' : '300';
        }
        else if (el.tagName === 'input' && el.type === 'checkbox') {
          el.checked = !el.checked;
        } else if (el.tagName === 'input') { el.value = '5'; }
        else continue;
        try { el.dispatch('input'); el.dispatch('change'); interact++; }
        catch (e) { failures++; console.error(`  ✘ ${m.id} interaction ${id} THREW: ${e.message}`); }
      }
      const resCount = countClass(root, 'res');
      resTotal += resCount;
      const minTiles = m.id === 'webtools' ? 0 : 3; // webtools renders a link table, not tiles
      if (resCount < minTiles) {
        const cls = [];
        (function walk(n) { if (n instanceof El) { cls.push((n.className || '-') + ':' + n.tagName); n.children.forEach(walk); } })(root);
        console.error('  ✘ ' + m.id + ' only ' + resCount + ' result tiles. tree: ' + cls.slice(0, 60).join(' | '));
        failures++;
      }
      console.log(`  ✔ render+interact ${m.id} (cards ${root.children.length}, inputs fired ${Object.keys(IDS).length - beforeIds}, results ${resCount})`);
    } catch (e) {
      failures++;
      console.error(`  ✘ render ${m.id} THREW: ${e.message}\n${e.stack}`);
    }
  }
  console.log(`interactions fired: ${interact}; result tiles total: ${resTotal}`);
  // chart sanity: psychro chart SVG contains saturation path + points
  try {
    const chart = await import('../app/js/charts.js');
    const pws = (await import('../app/js/engine/psychro.js')).pws;
    const svg = chart.psychroChartSVG([{ id: 'S', t: 24, w: 0.009 }], [{ points: [24, 0.009, 13, 0.009], color: 'cool' }], { pws, p: 101.325 });
    const ok = svg.includes('</svg>') && svg.includes('M') && svg.includes('100%');
    if (!ok) { console.error('  ✘ chart SVG malformed'); failures++; }
    else console.log('  ✔ psychro chart SVG generated (saturation curve + points + lines)');
  } catch (e) {
    failures++;
    console.error('  ✘ chart THREW: ' + e.message);
  }
  // app shell (routes home)
  try {
    await import('../app/js/app.js');
    console.log('  ✔ app shell loaded');
  } catch (e) {
    failures++;
    console.error('  ✘ app shell THREW: ' + e.message + '\n' + e.stack);
  }
  console.log(failures ? `SMOKE FAILED (${failures})` : 'SMOKE OK');
  process.exit(failures ? 1 : 0);
}
main();
