
const CACHE_NAME = 'bollettachiara-v11';
const STATIC_ASSETS = [
  './',
  'index.html',
  'manifest.json',
  'index.tsx',
  'App.tsx'
];

const ALLOWED_HOSTS = [
  'cdn.tailwindcss.com',
  'fonts.googleapis.com',
  'fonts.gstatic.com',
  'esm.sh'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch(err => {
        console.warn('SW Install: Alcuni asset non trovati (non bloccante):', err);
      });
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Ignora le chiamate API
  if (url.pathname.includes('google') && url.pathname.includes('generateContent')) {
    return;
  }

  // Strategia Network First per la navigazione
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
          return response;
        })
        .catch(() => {
          return caches.match('index.html').then(res => res || caches.match('./'));
        })
    );
    return;
  }

  // Stale-While-Revalidate per asset statici e CDN
  const isAllowedHost = ALLOWED_HOSTS.some(host => url.hostname.includes(host));
  const isStaticAsset = url.pathname.match(/\.(png|jpg|jpeg|svg|json|css|js|tsx|jsx|woff2)$/);

  if (isAllowedHost || isStaticAsset) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cachedResponse = await cache.match(event.request);
        const fetchPromise = fetch(event.request).then((networkResponse) => {
          if (networkResponse.ok || networkResponse.type === 'opaque') {
             cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        }).catch(() => {});

        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request);
    })
  );
});
