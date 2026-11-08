/* Service worker: guarda o app para funcionar offline depois da primeira visita. */
const V = 'bcsim-3.2.0', FILES = ['./', 'index.html', 'manifest.webmanifest', 'icon-256.png', 'lang.js', 'platform.js', 'config.js', 'dsge.js', 'dsge-models.js', 'research.js', 'chaos.js', 'chaos-ui.js', 'frbus.js', 'frbus-model.js', 'frbus-data.js', 'frbus-ui.js', 'levels.js'];
self.addEventListener('install', e => { e.waitUntil(caches.open(V).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(fetch(e.request).then(r => { if (r.ok && new URL(e.request.url).origin === location.origin) { const cp = r.clone(); caches.open(V).then(c => c.put(e.request, cp)); } return r; }).catch(() => caches.match(e.request)));
});
