// ★★★ SERVICE WORKER - ATHOS MAPS ★★★
// Αυτό το αρχείο επιτρέπει στην εφαρμογή να λειτουργεί offline και να εγκαθίσταται

const CACHE_NAME = 'athos-maps-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  'https://unpkg.com/maplibre-gl@latest/dist/maplibre-gl.css',
  'https://unpkg.com/maplibre-gl@latest/dist/maplibre-gl.js'
];

// Εγκατάσταση - Κατεβάζει και αποθηκεύει τα βασικά αρχεία
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

// Ενεργοποίηση - Διαγράφει παλιά cache
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

// Fetch - Εξυπηρετεί αρχεία από το cache (offline λειτουργία)
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Αν το αρχείο υπάρχει στο cache, το σερβίρει
        if (response) {
          return response;
        }
        
        // Αλλιώς, το κατεβάζει από το διαδίκτυο
        return fetch(event.request)
          .then(response => {
            // Αποθηκεύει το αρχείο στο cache για μελλοντική offline χρήση
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
            // Offline fallback - μπορείς να προσθέσεις μια σελίδα offline.html
            return new Response('🌐 Δεν υπάρχει σύνδεση στο διαδίκτυο', {
              status: 503,
              statusText: 'Service Unavailable'
            });
          });
      })
  );
});
