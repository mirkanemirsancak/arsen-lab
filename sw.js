// Arşen Process — service worker for PWA install + always-fresh app shell.
// Strategy: HTML/navigation is fetched network-first with no HTTP cache, so the
// installed app always loads the latest index.html when online (falls back to
// cache only when offline). The page auto-reloads when a new worker activates.
const CACHE = 'arsen-v2';
const SHELL = ['./', './index.html', './assets/icon-192.png', './assets/icon-512.png', './assets/arsen-process-mark.png'];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL).catch(() => {})));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Let the page promote a waiting worker immediately (used for auto-update).
self.addEventListener('message', e => { if (e.data === 'SKIP_WAITING') self.skipWaiting(); });

function isHTML(req) {
  return req.mode === 'navigate' || (req.headers.get('accept') || '').includes('text/html');
}

self.addEventListener('fetch', e => {
  const req = e.request;
  const url = req.url;
  if (req.method !== 'GET' || url.includes('script.google.com') || url.includes('googleusercontent.com')) return;

  // HTML / navigation: always hit the network (bypassing the HTTP cache) so updates land.
  if (isHTML(req)) {
    e.respondWith(
      fetch(req, { cache: 'no-store' }).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put('./index.html', copy).catch(() => {}));
        return res;
      }).catch(() => caches.match(req).then(m => m || caches.match('./index.html')))
    );
    return;
  }

  // Other assets: network-first, fall back to cache when offline.
  e.respondWith(
    fetch(req).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(req, copy).catch(() => {}));
      return res;
    }).catch(() => caches.match(req))
  );
});

// Lets a tab focus when a notification is clicked.
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(self.clients.matchAll({ type: 'window' }).then(list => {
    for (const c of list) { if ('focus' in c) return c.focus(); }
    if (self.clients.openWindow) return self.clients.openWindow('./index.html');
  }));
});
