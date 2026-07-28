const CACHE_NAME = 'entreno-brutal-v49';
const STATIC_ASSETS = [
  './manifest.webmanifest',
  './icon.svg'
];

self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  // Limpiar TODAS las cachés antiguas
  event.waitUntil(
    caches.keys().then(keys => 
      Promise.all(keys.map(key => caches.delete(key)))
    )
  );
  self.clients.claim();
});

// DESACTIVADO: No interceptar fetch, dejar que todo vaya a red
// Esto evita problemas de caché en móviles
self.addEventListener('fetch', event => {
  // No hacer nada, dejar que el navegador maneje la petición normalmente
  return;
});
