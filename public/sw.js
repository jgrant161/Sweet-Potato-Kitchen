// Offline support: cache the game on first visit so it still opens with a weak signal.
// Network-first so updates arrive as soon as a device is online; falls back to the cache otherwise.
const CACHE = 'spk-v5';
const ASSETS = ['./', './index.html', './style.css', './game.js', './manifest.webmanifest', './icon.svg', './icon-192.png', './icon-512.png', './train/', './train/index.html', './music/', './music/index.html', './fish/', './fish/index.html'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy));
      return res;
    }).catch(() => caches.match(e.request).then(r => r || caches.match('./index.html')))
  );
});
