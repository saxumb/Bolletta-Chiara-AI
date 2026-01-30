
const CACHE_NAME = 'bollettachiara-v10';
const ASSETS = [
  '/Bolletta-Chiara-AI/',
  '/Bolletta-Chiara-AI/index.html',
  '/Bolletta-Chiara-AI/manifest.json',
  '/Bolletta-Chiara-AI/assets/icon-bc-192.png',
  '/Bolletta-Chiara-AI/assets/icon-bc-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.allSettled(
        ASSETS.map(url => cache.add(url))
      ).then(() => console.log("Cache v10 inizializzata"));
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match('/Bolletta-Chiara-AI/index.html') || caches.match('/Bolletta-Chiara-AI/');
      })
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
