import io
root = r"C:\Users\Kyle Ng\OneDrive\Desktop\HVAC_Toolbox_Pro_App\HVAC Tool"
p = root + r"\app\sw.js"
c = io.open(p, encoding="utf-8").read()
# 1) bump cache version
c = c.replace("const CACHE = 'hvac-pro-v1';", "const CACHE = 'hvac-pro-v2';")
# 2) network-first for navigations (index.html always fresh), cache-first for assets
old = """self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then((hit) => hit || fetch(e.request).then((res) => {
      const copy = res.clone();
      caches.open(CACHE).then((c) => c.put(e.request, copy)).catch(() => {});
      return res;
    }).catch(() => caches.match('./index.html')))
  );
});"""
new = """self.addEventListener('fetch', (e) => {
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
});"""
assert old in c, "fetch handler not found"
c = c.replace(old, new, 1)
io.open(p, "w", encoding="utf-8").write(c)
print("sw v2 + navigate network-first:", "hvac-pro-v2" in c and "mode === 'navigate'" in c)
