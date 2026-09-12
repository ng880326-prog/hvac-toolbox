// Editable design-condition presets (情境預設), stored in this browser.
//
// Presets used to be three hard-coded objects inside the coil module, so the only company-standard
// conditions the app could offer were the ones baked into the code, and the user could not add or
// keep their own. They are now a small versioned record in localStorage, seeded with factory values
// that the user can edit, rename, duplicate or reset.
//
// Everything here is defensive: localStorage can be unavailable (private windows, disabled storage),
// hold an older schema, or hold hand-edited junk — any of which falls back to the factory list rather
// than breaking a module at render time.

export const PRESET_STORE_KEY = 'hvac-toolbox-presets-v1';

/** Fields a preset may carry, in display order. `derived` values are shown but never stored. */
export const PRESET_FIELDS = [
  { key: 'oaSt', label: { en: 'OA summer DB', zh: '室外夏 乾球' }, unit: '°C' },
  { key: 'oaSwb', label: { en: 'OA summer WB', zh: '室外夏 濕球' }, unit: '°C' },
  { key: 'oaWt', label: { en: 'OA winter DB', zh: '室外冬 乾球' }, unit: '°C' },
  { key: 'oaWrh', label: { en: 'OA winter RH', zh: '室外冬 相對濕度' }, unit: '%' },
  { key: 'rat', label: { en: 'Return air DB', zh: '回風 乾球' }, unit: '°C' },
  { key: 'rarh', label: { en: 'Return air RH', zh: '回風 相對濕度' }, unit: '%' },
  { key: 'vs', label: { en: 'Supply flow', zh: '送風量' }, unit: 'm³/s' },
  { key: 'fra', label: { en: 'Fresh-air fraction', zh: '新風比例' }, unit: '0–1' },
  { key: 'ts', label: { en: 'Supply off-coil T', zh: '送風出盤 溫度' }, unit: '°C' },
  { key: 'rhs', label: { en: 'Supply off-coil RH', zh: '送風出盤 相對濕度' }, unit: '%' },
  { key: 'bf', label: { en: 'Bypass factor BF', zh: '旁通係數 BF' }, unit: '—' },
  { key: 'chws', label: { en: 'CHW supply', zh: '冷媒水 供水' }, unit: '°C' },
  { key: 'chwr', label: { en: 'CHW return', zh: '冷媒水 回水' }, unit: '°C' },
  { key: 'hws', label: { en: 'HWS supply', zh: '熱媒水 供水' }, unit: '°C' },
  { key: 'hwr', label: { en: 'HWS return', zh: '熱媒水 回水' }, unit: '°C' },
];

/** Values computed from a preset rather than stored, so they can never contradict the inputs. */
export const PRESET_DERIVED = [
  { key: 'chwDt', from: (v) => v.chwr - v.chws, label: { en: 'CHW ΔT', zh: '冷媒水溫差' }, unit: '°C' },
  { key: 'hwsDt', from: (v) => v.hws - v.hwr, label: { en: 'HWS ΔT', zh: '熱媒水溫差' }, unit: '°C' },
  { key: 'supDt', from: (v) => v.rat - v.ts, label: { en: 'Supply ΔT (room − supply)', zh: '送風溫差（室內−送風）' }, unit: '°C' },
];

const KNOWN = new Set(PRESET_FIELDS.map((f) => f.key));

/** Factory presets — the user replaces these numbers with their company standards whenever ready. */
export const FACTORY_PRESETS = [
  {
    id: 'ahu',
    name: { en: 'AHU standard', zh: 'AHU 標準工況' },
    values: {
      oaSt: 35, oaSwb: 28, oaWt: 7, oaWrh: 60, rat: 24, rarh: 50,
      vs: 2.5, fra: 0.25, ts: 13, rhs: 95, bf: 0.1,
      chws: 7, chwr: 12.5, hws: 60, hwr: 50,
    },
  },
  {
    id: 'pau',
    name: { en: 'PAU standard (100% OA)', zh: 'PAU 標準（全新風）' },
    values: {
      oaSt: 35, oaSwb: 28, oaWt: 7, oaWrh: 60, rat: 24, rarh: 50,
      vs: 1.2, fra: 1.0, ts: 17, rhs: 95, bf: 0.1,
      chws: 7, chwr: 12.5, hws: 60, hwr: 50,
    },
  },
  {
    id: 'winter',
    name: { en: 'Winter preheat', zh: '冬季預熱工況' },
    values: {
      oaSt: 35, oaSwb: 28, oaWt: 5, oaWrh: 70, rat: 22, rarh: 50,
      vs: 2.0, fra: 1.0, ts: 16, rhs: 60, bf: 0.1,
      chws: 7, chwr: 12.5, hws: 60, hwr: 50,
    },
  },
];

function clone(list) {
  return list.map((p) => ({
    id: p.id,
    name: typeof p.name === 'string' ? { en: p.name, zh: p.name } : { ...p.name },
    values: { ...p.values },
  }));
}

/** Keep only known numeric fields, filling anything missing from the factory preset of the same id. */
function sanitizeValues(values, fallback) {
  const out = {};
  for (const f of PRESET_FIELDS) {
    const v = Number(values?.[f.key]);
    const fb = Number(fallback?.[f.key]);
    out[f.key] = Number.isFinite(v) ? v : (Number.isFinite(fb) ? fb : 0);
  }
  return out;
}

function sanitizeList(raw) {
  if (!Array.isArray(raw) || !raw.length) return null;
  const out = [];
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue;
    const id = typeof item.id === 'string' && item.id ? item.id : 'p' + out.length;
    const factory = FACTORY_PRESETS.find((p) => p.id === id);
    const name = item.name;
    out.push({
      id,
      name: typeof name === 'string' ? { en: name, zh: name }
        : (name && typeof name === 'object' ? { en: String(name.en ?? name.zh ?? id), zh: String(name.zh ?? name.en ?? id) } : { en: id, zh: id }),
      values: sanitizeValues(item.values, factory?.values),
    });
    if (out.length >= 30) break;
  }
  return out.length ? out : null;
}

/** Read the stored presets, falling back to the factory list on any problem. */
export function loadPresets() {
  try {
    const raw = globalThis.localStorage?.getItem(PRESET_STORE_KEY);
    if (!raw) return clone(FACTORY_PRESETS);
    const stored = sanitizeList(JSON.parse(raw));
    return stored ?? clone(FACTORY_PRESETS);
  } catch {
    return clone(FACTORY_PRESETS);
  }
}

/** Persist the presets. Returns true when the write succeeded (false = storage unavailable). */
export function savePresets(list) {
  try {
    const clean = sanitizeList(list) ?? clone(FACTORY_PRESETS);
    globalThis.localStorage?.setItem(PRESET_STORE_KEY, JSON.stringify(clean));
    return true;
  } catch {
    return false;
  }
}

/** Drop the stored presets so the factory list applies again. */
export function resetPresets() {
  try {
    globalThis.localStorage?.removeItem(PRESET_STORE_KEY);
  } catch { /* storage unavailable — factory list still applies */ }
  return clone(FACTORY_PRESETS);
}

/** True when the browser is actually storing edits (used to warn the user when it cannot). */
export function storageAvailable() {
  try {
    const probe = '__hvac_probe__';
    globalThis.localStorage?.setItem(probe, '1');
    globalThis.localStorage?.removeItem(probe);
    return true;
  } catch {
    return false;
  }
}

export function newPresetId(existing = []) {
  let n = 1;
  while (existing.some((p) => p.id === 'p' + n)) n += 1;
  return 'p' + n;
}

export { KNOWN as PRESET_KNOWN_KEYS };
