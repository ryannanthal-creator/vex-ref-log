// VEX Ref Log service worker: lets the app open with no signal.
// App files are network-first (so updates arrive as soon as you're online),
// falling back to the saved copy after a few seconds or when offline.
// Firebase libraries and fonts are versioned, so they're served from the cache.
const CACHE = 'reflog-v1';
const SHELL = ['./', './index.html', './config.js', './manifest.webmanifest', './icons/icon-192.png', './icons/apple-touch-icon.png'];
const LIBS = ['app', 'auth', 'firestore'].map(n => `https://www.gstatic.com/firebasejs/10.12.2/firebase-${n}.js`);

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL).then(() => Promise.allSettled(LIBS.map(u => c.add(u))))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
const save = (req, res) => { if (res && (res.ok || res.type === 'opaque')) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); } return res; };
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin === location.origin) {
    e.respondWith((async () => {
      const net = fetch(req).then(res => save(req, res));
      const slow = new Promise(r => setTimeout(r, 4000, null));
      let res = await Promise.race([net.catch(() => null), slow]);
      if (!res) res = await caches.match(req, { ignoreSearch: true });   // slow or offline: use the saved copy
      if (!res) res = await net.catch(() => null);                        // nothing saved yet: keep waiting
      if (!res && req.mode === 'navigate') res = await caches.match('./index.html');
      return res || Response.error();
    })());
    return;
  }
  if (url.host === 'www.gstatic.com' || url.host === 'fonts.googleapis.com' || url.host === 'fonts.gstatic.com') {
    e.respondWith(caches.match(req).then(m => m || fetch(req).then(res => save(req, res))));
  }
});
