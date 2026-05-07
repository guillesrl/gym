const CACHE_NAME = 'entreno-brutal-v4';
const APP_ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon.svg',
  // Imágenes animadas de ejercicios (CDN externo)
  'https://static.exercisedb.dev/media/SNFfUff.gif',
  'https://static.exercisedb.dev/media/ila4NZS.gif',
  'https://static.exercisedb.dev/media/qXTaZnJ.gif',
  'https://static.exercisedb.dev/media/CHpahtl.gif',
  'https://static.exercisedb.dev/media/Zg3XY7P.gif',
  'https://static.exercisedb.dev/media/Kpajagk.gif',
  'https://static.exercisedb.dev/media/eYnzaCm.gif',
  'https://static.exercisedb.dev/media/fUBheHs.gif',
  'https://static.exercisedb.dev/media/PskORrA.gif',
  'https://static.exercisedb.dev/media/DsgkuIt.gif',
  'https://static.exercisedb.dev/media/CggQhII.gif',
  'https://static.exercisedb.dev/media/VBAWRPG.gif',
  'https://static.exercisedb.dev/media/T0yTjgW.gif',
  'https://static.exercisedb.dev/media/xLYSdtg.gif',
  'https://static.exercisedb.dev/media/G08RZcQ.gif',
  'https://static.exercisedb.dev/media/3ZflifB.gif',
  'https://static.exercisedb.dev/media/Wgaz7pm.gif',
  'https://static.exercisedb.dev/media/rjiM4L3.gif',
  'https://static.exercisedb.dev/media/V07qpXy.gif',
  'https://static.exercisedb.dev/media/H1PESYI.gif',
  'https://static.exercisedb.dev/media/rjtuP6X.gif',
  'https://static.exercisedb.dev/media/NbVPDMW.gif',
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

  // Cache-first para assets del app y GIFs externos
  if (APP_ASSETS.includes(event.request.url)) {
    event.respondWith(
      caches.match(event.request).then(cached => {
        if (cached) return cached;
        return fetch(event.request).then(response => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
          return response;
        });
      })
    );
    return;
  }

  // Network-first para el resto
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
