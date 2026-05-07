const CACHE_NAME = 'entreno-brutal-v6';
const APP_ASSETS = [
  './',
  './manifest.webmanifest',
  './icon.svg',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(APP_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = event.request.url;

  // 1. Cache-first: Archivos locales
  if (APP_ASSETS.includes(url)) {
    event.respondWith(caches.match(url));
    return;
  }

  // 2. Cache-first + Dynamic cache: GIFs de ejercicios
  if (url.includes('static.exercisedb.dev') && url.endsWith('.gif')) {
    event.respondWith(
      caches.match(url).then(cached => {
        if (cached) return cached;
        return fetch(url).then(response => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(url, copy));
          }
          return response;
        });
      })
    );
    return;
  }

  // 3. Network-first: Resto (ej. fuente de Google)
  event.respondWith(fetch(url).catch(() => caches.match(url)));
});
