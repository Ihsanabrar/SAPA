// ============================================================
// SAPA - Service Worker (Offline support + cache)
// ============================================================

const CACHE_NAME = 'sapa-v1.0.0';
const PRECACHE = [
  './',
  './index.html',
  './layanan.html',
  './profil.html',
  './pesanan.html',
  './pengaturan.html',
  './offline.html',
  './css/style.css',
  './css/components.css',
  './css/pages.css',
  './js/data.js',
  './js/app.js',
  './js/enhance.js',
  './js/pages.js',
  './manifest.json',
  './logo.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
      .catch(err => console.warn('Precache failed:', err))
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  if (e.request.url.includes('chrome-extension')) return;

  e.respondWith(
    caches.match(e.request).then(cached => {
      const fetchPromise = fetch(e.request).then(response => {
        if (response && response.status === 200 && response.type === 'basic') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        }
        return response;
      }).catch(() => {
        if (e.request.mode === 'navigate') return caches.match('./offline.html');
        return cached;
      });
      return cached || fetchPromise;
    })
  );
});