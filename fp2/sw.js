// オフライン対応。アプリのファイルはネットワーク優先（更新がすぐ届く）、取得できないときはキャッシュを使う。
// 起動時に全モジュール（問題データを含む）を読み込むため、一度開けば以後はオフラインでも動作する。
// ファイルを更新したら VERSION を上げること。
const VERSION = 'fp2-v1';
const CORE = ['./', 'index.html', 'manifest.webmanifest', 'css/app.css', 'icons/icon-192.png', 'icons/apple-touch-icon.png'];
const FONT_HOSTS = ['fonts.googleapis.com', 'fonts.gstatic.com'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((ks) => Promise.all(ks.filter((k) => k.startsWith('fp2-') && k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  // フォントは変わらないのでキャッシュ優先
  if (FONT_HOSTS.includes(url.hostname)) {
    e.respondWith(caches.open('fp2-fonts').then((c) => c.match(e.request).then((hit) => hit || fetch(e.request).then((r) => { c.put(e.request, r.clone()); return r; }))));
    return;
  }
  if (url.origin !== location.origin || !url.pathname.startsWith(new URL(self.registration.scope).pathname)) return;
  e.respondWith(
    fetch(e.request)
      .then((r) => {
        if (r.ok) { const copy = r.clone(); caches.open(VERSION).then((c) => c.put(e.request, copy)); }
        return r;
      })
      .catch(() => caches.match(e.request, { ignoreSearch: true }).then((r) => r || caches.match('index.html'))),
  );
});
