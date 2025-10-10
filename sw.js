// sw.js

const CACHE_NAME = 'lapkes-cache-v1';
// The app shell consists of the essential files needed to run the UI.
const APP_SHELL_URLS = [
  '/',
  '/index.html',
];

// On install, cache the app shell.
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching App Shell');
        return cache.addAll(APP_SHELL_URLS);
      })
      .catch(err => {
        console.error('Service Worker: Failed to cache app shell', err);
      })
  );
});

// On activate, clean up old caches to ensure the user gets the latest version.
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// On fetch, serve from cache first, then fall back to the network.
self.addEventListener('fetch', (event) => {
  // We only handle GET requests for caching.
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // If the request is in the cache, return it.
        if (response) {
          return response;
        }

        // Otherwise, fetch from the network.
        return fetch(event.request).then(
          (networkResponse) => {
            // Check for valid response to cache. Opaque responses are from cross-origin requests
            // that we can't inspect, so we pass them through without caching.
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type === 'opaque') {
                 return networkResponse;
            }

            // Clone the response because it's a one-time use stream.
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
            
            return networkResponse;
          }
        ).catch(() => {
            // If the network request fails (e.g., offline), and it's not in the cache,
            // the request will fail. This is the expected behavior for dynamic data
            // that hasn't been cached yet.
        });
      })
  );
});
