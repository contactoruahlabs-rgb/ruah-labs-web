const CACHE = 'ruah-mv1jjjxe';

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/api/') || url.pathname === '/admin-auth') return;
  // HTML y rutas SPA: siempre desde red (no-cache en Cloudflare Worker)
  if (url.pathname === '/' || url.pathname.endsWith('.html') || !url.pathname.includes('.')) return;
  // Bundle con hash: cache-first (inmutable, hash cambia con cada deploy)
  if (/\/bundle\.[a-z0-9]+\.js$/.test(url.pathname)) {
    e.respondWith(
      caches.match(e.request).then(cached => cached || fetch(e.request).then(r => {
        if (r.ok) caches.open(CACHE).then(cache => cache.put(e.request, r.clone()));
        return r;
      }))
    );
  }
});
