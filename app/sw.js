// HVAC Toolbox Pro — service worker (offline-first, app-shell cache)
const CACHE = 'hvac-pro-v2';
const ASSETS = [
  './',
  './index.html',
  './privacy.html',
  './css/app.css',
  './manifest.webmanifest',
  './js/app.js',
  './js/ui.js',
  './js/registry.js',
  './js/charts.js',
  './js/engine/psychro.js',
  './js/engine/fluids.js',
  './js/engine/ducts.js',
  './js/engine/electrical.js',
  './js/data/pipes.js',
  './js/data/ahu_models.js',
  './js/data/fans.js',
  './js/data/suppliers.js',
  './js/data/hk_catalogs.js',
  './js/data/vrf_data.js',
  './js/data/vectors.js',
  './js/modules/index.js',
  './js/modules/psychro.js',
  './js/modules/ducts.js',
  './js/modules/pipes.js',
  './js/modules/coil.js',
  './js/modules/wheel.js',
  './js/modules/hx.js',
  './js/modules/chiller.js',
  './js/modules/boiler.js',
  './js/modules/motor.js',
  './js/modules/acoustics.js',
  './js/modules/npsh.js',
  './js/modules/insulation.js',
  './js/modules/stairwell.js',
  './js/modules/convert.js',
  './js/modules/ahu.js',
  './js/modules/fcu.js',
  './js/modules/sac.js',
  './js/modules/fan.js',
  './js/modules/pn.js',
  './js/modules/webtools.js',
  './icons/icon.svg',
  './icons/icon-192.png',
  './icons/icon-512.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  if (e.request.mode === 'navigate') {
    // network-first for pages: guarantees the app shell is always current
    e.respondWith(
      fetch(e.request).then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copy)).catch(() => {});
        return res;
      }).catch(() => caches.match(e.request).then((hit) => hit || caches.match('./index.html')))
    );
    return;
  }
  e.respondWith(
    caches.match(e.request).then((hit) => hit || fetch(e.request).then((res) => {
      const copy = res.clone();
      caches.open(CACHE).then((c) => c.put(e.request, copy)).catch(() => {});
      return res;
    }).catch(() => caches.match('./index.html')))
  );
});

[System]
