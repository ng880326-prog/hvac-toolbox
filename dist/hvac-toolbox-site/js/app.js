// HVAC Toolbox Pro — app shell: router, nav, theme, i18n chrome
import { h } from './ui.js';
import { MODULES, GROUPS, L, getLang, setLang } from './registry.js';
import './modules/index.js';

let theme = (() => {
  try {
    const stored = localStorage.getItem('hvac.theme');
    if (stored === 'dark' || stored === 'light') return stored;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  } catch { return 'light'; }
})();

function applyTheme() {
  document.documentElement.dataset.theme = theme;
  document.getElementById('themeToggle').textContent = theme === 'dark' ? '☀️' : '🌙';
  try { localStorage.setItem('hvac.theme', theme); } catch {}
}

function renderNav(filter = '') {
  const navGroups = document.getElementById('navGroups');
  navGroups.innerHTML = '';
  const q = filter.trim().toLowerCase();
  for (const g of GROUPS) {
    const mods = MODULES.filter((m) => m.group === g.key &&
      (!q || (m.title.en || '').toLowerCase().includes(q) || (m.title.zh || '').toLowerCase().includes(q)));
    if (!mods.length) continue;
    const wrap = h('div');
    wrap.append(h('div', { class: 'nav-group-title' }, L(g.label)));
    for (const m of mods) {
      wrap.append(h('a', {
        class: 'nav-item', href: '#m/' + m.id, 'data-nav': '',
      }, h('span', { class: 'ico' }, m.icon), L(m.title)));
    }
    navGroups.append(wrap);
  }
}

function renderTiles() {
  const tiles = document.getElementById('tiles');
  tiles.innerHTML = '';
  for (const m of MODULES) {
    tiles.append(h('a', { class: 'tile', href: '#m/' + m.id, 'data-nav': '' },
      h('span', { class: 'ico' }, m.icon),
      h('b', {}, L(m.title)),
      h('span', {}, L(m.desc)),
      m.src ? h('span', { class: 'src' }, m.src) : null));
  }
}

function showHome() {
  document.getElementById('homeScreen').hidden = false;
  document.getElementById('moduleScreen').hidden = true;
  document.getElementById('heroTitle').textContent = 'HVAC Toolbox — ' + L({ en: 'The Tool', zh: '工具箱' });
  document.getElementById('heroSub').textContent = L({
    en: 'A cross-platform HVAC engineering toolkit rebuilt from the original workbook — 20 modules covering every worksheet, with formulas audited against current standards (ASHRAE Fundamentals 2025, CIBSE, GB 51251-2017, IEC).',
    zh: '跨平台暖通空調工程計算工具箱，由原工作簿重建 — 20 個模組覆蓋全部工作表，全部公式對照現行標準（ASHRAE Fundamentals 2025、CIBSE、GB 51251-2017、IEC）檢驗。',
  });
  document.getElementById('aboutTitle').textContent = L({ en: 'Sheets & sources', zh: '工作表與出處' });
  document.getElementById('aboutText').textContent = L({
    en: 'All 30+ workbook sheets are represented: Home · Air-side · Coil (AHU/PAU) · Wheel · Psychrometric Chart · Pipe Sizing · Motor · Acoustics · Chiller · Boiler · Hx · AHU · Fan · FCU · SAC · Insulations · PN · NPSH · Pressurisation · Web tools. Sources: ASHRAE F Ch.1/6/21/22, CIBSE B2/B3/C, Haaland 1983, Hyland & Wexler 1983, ISO 12241/GB 50264, GB 51251-2017. Per-formula audit: docs/verification/.',
    zh: '原檔 30+ 張工作表全部有對應頁面：Home · Air-side · Coil (AHU/PAU) · Wheel · Psychrometric Chart · Pipe Sizing · Motor · Acoustics · Chiller · Boiler · Hx · AHU · Fan · FCU · SAC · Insulations · PN · NPSH · 梯間加壓 · 選型網站。出處：ASHRAE F 第 1/6/21/22 章、CIBSE B2/B3/C、Haaland 1983、Hyland & Wexler 1983、ISO 12241／GB 50264、GB 51251-2017。逐條檢驗：docs/verification/。',
  });
  document.getElementById('disclaimer').textContent = L({
    en: '⚠️ For engineering reference only. Final design must be checked by a registered professional engineer against the applicable codes.',
    zh: '⚠️ 本工具僅供工程參考，實際設計須由註冊專業工程師按適用規範覆核。',
  });
  document.getElementById('verLine').textContent = L({
    en: 'Version 1.0.0 · 21 calculation modules · offline-first PWA · formulas per ASHRAE 2025 / CIBSE / GB',
    zh: '版本 1.0.0 · 21 個計算模組 · 離線優先 PWA · 公式依 ASHRAE 2025／CIBSE／GB 檢驗',
  });
  document.getElementById('netWarn').textContent = L({
    en: 'Privacy & security: no account, no analytics, no data collection. Preferences (language/theme) stay in your browser (localStorage). Network is only used to load the app once for installation; all calculation runs offline. HTTPS-only.',
    zh: '隱私與安全：無帳戶、無分析、不收集任何資料。偏好設定（語言/主題）僅存於瀏覽器（localStorage）。網路僅在安裝時載入一次；所有計算離線執行。僅限 HTTPS。',
  });
  document.querySelectorAll('.nav-item').forEach((n) => n.classList.remove('active'));
}

let currentMod = null;

function showModule(id) {
  const mod = MODULES.find((m) => m.id === id);
  if (!mod) { location.hash = '#/'; return; }
  currentMod = mod;
  document.getElementById('homeScreen').hidden = true;
  const screen = document.getElementById('moduleScreen');
  screen.hidden = false;
  const head = document.getElementById('moduleHead');
  head.innerHTML = '';
  head.append(
    h('div', { class: 'module-head' },
      h('div', { class: 'mico' }, mod.icon),
      h('div', {},
        h('h1', {}, L(mod.title)),
        h('p', {}, L(mod.desc)),
        mod.src ? h('div', { class: 'note' }, h('span', {}, L({ en: 'Source: ', zh: '出處：' })), h('code', {}, mod.src)) : null)));
  const body = document.getElementById('moduleBody');
  body.innerHTML = '';
  mod.render(body, { L, h, lang: getLang() });
  document.querySelectorAll('.nav-item').forEach((n) => n.classList.toggle('active', n.getAttribute('href') === '#m/' + id));
  window.scrollTo({ top: 0 });
}

function route() {
  const hash = location.hash || '#/';
  const m = hash.match(/^#m\/([\w-]+)/);
  if (m) showModule(m[1]); else showHome();
  document.body.classList.remove('nav-open');
}

window.addEventListener('hashchange', route);

document.getElementById('resetBtn').addEventListener('click', () => {
  if (!currentMod) return;
  const body = document.getElementById('moduleBody');
  body.innerHTML = '';
  currentMod.render(body, { L, h, lang: getLang() });
  window.scrollTo({ top: 0 });
});
const navSearch = document.getElementById('navSearch');
if (navSearch) navSearch.addEventListener('input', () => renderNav(navSearch.value));

// ---- copy results & export calculation summary ----
function gatherResults() {
  const tiles = document.querySelectorAll('#moduleBody .res, #moduleBody .pipes-table');
  return [...tiles].map((t) => t.textContent.trim()).filter(Boolean);
}
document.getElementById('copyBtn').addEventListener('click', async () => {
  const text = (currentMod ? (getLang() === 'zh' ? currentMod.title.zh : currentMod.title.en) + '\n' : '') + gatherResults().join('\n');
  try { await navigator.clipboard.writeText(text); flash('✔ 已複製 Copied'); }
  catch { flash('⚠ 複製失敗 手動選取'); }
});
document.getElementById('exportBtn').addEventListener('click', () => {
  const sheet = document.getElementById('printSheet');
  sheet.innerHTML = '';
  const head = document.querySelector('#moduleHead h1');
  sheet.append(h('h1', {}, head ? head.textContent : 'HVAC Toolbox'));
  const body = document.getElementById('moduleBody');
  for (const n of [...body.querySelectorAll('.card')]) sheet.append(n.cloneNode(true));
  window.print();
});

// ---- CSV export: result tiles + tables as a downloadable .csv ----
function csvEscape(v) { const s = String(v ?? ''); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; }
function tableToRows(tbl) {
  const rows = [];
  for (const tr of [...tbl.querySelectorAll('tr')]) {
    const cells = [...tr.children].map((c) => csvEscape(c.textContent.trim()));
    if (cells.some(Boolean)) rows.push(cells.join(' , '));
  }
  return rows;
}
document.getElementById('csvBtn').addEventListener('click', () => {
  const lines = [csvEscape((currentMod ? (getLang() === 'zh' ? currentMod.title.zh : currentMod.title.en) : 'HVAC Toolbox Pro'))];
  document.querySelectorAll('#moduleBody .card').forEach((cardEl) => {
    const h3 = cardEl.querySelector('h3'); if (h3) lines.push(''); lines.push(csvEscape(h3 ? h3.textContent : ''));
    for (const r of [...cardEl.querySelectorAll('.res')]) lines.push(csvEscape(r.querySelector('.lbl')?.textContent || '') + ' , ' + csvEscape(r.querySelector('.val')?.textContent || ''));
    for (const tbl of [...cardEl.querySelectorAll('.pipes-table')]) lines.push(...tableToRows(tbl));
  });
  const blob = new Blob(['\ufeff' + lines.join('\n')], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = (currentMod ? currentMod.id : 'hvac') + '_summary.csv';
  a.click();
  URL.revokeObjectURL(a.href);
  flash('✔ CSV 已匯出 Exported');
});
function flash(msg) { document.getElementById('flash').textContent = msg; document.getElementById('flash').classList.add('show'); setTimeout(() => document.getElementById('flash').classList.remove('show'), 1800); }

// ---- PWA install prompt ----
let deferredPrompt = null;
window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); deferredPrompt = e; document.getElementById('installBtn').hidden = false; });
document.getElementById('installBtn').addEventListener('click', async () => {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  await deferredPrompt.userChoice;
  deferredPrompt = null;
  document.getElementById('installBtn').hidden = true;
});
document.getElementById('navToggle').addEventListener('click', () => document.body.classList.toggle('nav-open'));
document.getElementById('scrim').addEventListener('click', () => document.body.classList.remove('nav-open'));
document.getElementById('backBtn').addEventListener('click', () => { location.hash = '#/'; });
document.getElementById('themeToggle').addEventListener('click', () => { theme = theme === 'dark' ? 'light' : 'dark'; applyTheme(); });
document.getElementById('langToggle').addEventListener('click', () => {
  const cur = getLang();
  setLang(cur === 'zh' ? 'en' : 'zh');
  document.getElementById('langToggle').textContent = getLang() === 'zh' ? 'EN' : '中';
  renderNav(); renderTiles(); route();
});

function initChrome() {
  document.getElementById('langToggle').textContent = getLang() === 'zh' ? 'EN' : '中';
  document.getElementById('brandSub').textContent = L({ en: 'HVAC engineering · cross-platform', zh: '暖通空調工程計算 · 跨平台版' });
  document.getElementById('backLabel').textContent = L({ en: 'Home', zh: '主頁' });
}

applyTheme();
initChrome();
renderNav();
renderTiles();
route();

// PWA: register service worker (offline support)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  });
}
