// ★★★ SERVICE WORKER - ATHOS MAPS ★★★
const CACHE_NAME = 'athos-maps-v1';
const STATIC_ASSETS = [
  '/athos-navigation/',
  '/athos-navigation/index.html',
  '/athos-navigation/manifest.json',
  '/athos-navigation/assets/logo.png'
];

// Εγκατάσταση
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('📦 Service Worker: Cache ανοίγει');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('✅ Service Worker: Εγκατάσταση ολοκληρώθηκε');
        return self.skipWaiting();
      })
  );
});

// Ενεργοποίηση
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('🗑️ Service Worker: Παλιό cache διαγράφηκε:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

// Fetch - Εξυπηρετεί αρχεία από το cache
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request)
          .then(response => {
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
            return response;
          })
          .catch(() => {
            return new Response('🌐 Δεν υπάρχει σύνδεση στο διαδίκτυο', {
              status: 503,
              statusText: 'Service Unavailable'
            });
          });
      })
  );
});
