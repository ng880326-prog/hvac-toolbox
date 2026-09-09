// HVAC Toolbox Pro — module registry & i18n (no imports → no cycles)
export const MODULES = [];
export const GROUPS = [
  { key: 'general', label: { en: 'General', zh: '通用' } },
  { key: 'air', label: { en: 'Air-side', zh: '空氣側' } },
  { key: 'water', label: { en: 'Water-side', zh: '水側' } },
  { key: 'equipment', label: { en: 'Equipment', zh: '設備' } },
  { key: 'special', label: { en: 'Special / Codes', zh: '專業／規範' } },
];

let lang = (() => {
  try {
    const stored = localStorage.getItem('hvac.lang');
    if (stored === 'zh' || stored === 'en') return stored;
    return (navigator.language || '').toLowerCase().startsWith('zh') ? 'zh' : 'en';
  } catch { return 'zh'; }
})();

export function register(mod) { MODULES.push(mod); }
export function getLang() { return lang; }
export function setLang(v) { lang = v; try { localStorage.setItem('hvac.lang', v); } catch {} }

/** Translate {en, zh} or passthrough plain strings. */
export function L(x) {
  if (x == null) return '';
  if (typeof x === 'string') return x;
  return x[lang] ?? x.en ?? '';
}
