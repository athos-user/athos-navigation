// ★★★ SERVICE WORKER - ATHOS MAPS ★★★
const CACHE_NAME = 'athos-maps-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  'https://unpkg.com/maplibre-gl@latest/dist/maplibre-gl.css',
  'https://unpkg.com/maplibre-gl@latest/dist/maplibre-gl.js'
];

// Εγκατάσταση
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('📦 Cache ανοίγει');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Ενεργοποίηση
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('🗑️ Παλιό cache διαγράφηκε:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

// Fetch - εξυπηρέτηση offline
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request)
          .then(response => {
            if (!response || response.status !== 200) {
              return response;
            }
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
            return response;
          });
      })
  );
});
