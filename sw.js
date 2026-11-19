// Offline cache. Bump VERSION whenever files change so phones get the update.
const VERSION = 'merhaba-v8';
const FILES = ['./', 'index.html', 'style.css', 'manifest.webmanifest',
  'js/kana.js', 'js/data-words.js', 'js/data-grammar.js', 'js/data-grammar2.js', 'js/data-daily.js', 'js/data-talk.js', 'js/data-talk-family.js', 'js/audio-keys.js', 'js/app.js',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png'];
const FONT_HOSTS = ['fonts.googleapis.com', 'fonts.gstatic.com'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION && k !== 'fonts' && k !== 'audio').map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  // Fonts: cache first (they never change)
  if (FONT_HOSTS.includes(url.hostname)) {
    e.respondWith(caches.open('fonts').then(c => c.match(e.request).then(hit => hit || fetch(e.request).then(r => { c.put(e.request, r.clone()); return r; }))));
    return;
  }
  if (url.origin !== location.origin) return;
  // Voice clips: cache first (content-addressed file names never change)
  if (url.pathname.includes('/audio/')) {
    e.respondWith(caches.open('audio').then(c => c.match(e.request).then(hit => hit || fetch(e.request).then(r => { if (r.ok) c.put(e.request, r.clone()); return r; }))));
    return;
  }
  // App files: network first so updates arrive, cache as offline fallback
  e.respondWith(
    fetch(e.request).then(r => {
      const copy = r.clone();
      caches.open(VERSION).then(c => c.put(e.request, copy));
      return r;
    }).catch(() => caches.match(e.request, { ignoreSearch: true }).then(r => r || caches.match('index.html')))
  );
});
