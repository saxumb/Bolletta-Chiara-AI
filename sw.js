
const CACHE_NAME = 'bollettachiara-v10'; // Incrementato versione
const STATIC_ASSETS = [
  './',
  'index.html',
  'manifest.json',
  'index.css' // Se esiste, altrimenti verrà ignorato
];

// Domini permessi per il caching runtime (CDN essenziali per la tua app)
const ALLOWED_HOSTS = [
  'cdn.tailwindcss.com',
  'fonts.googleapis.com',
  'fonts.gstatic.com',
  'esm.sh',
  'images.unsplash.com' // Per le immagini demo
];

self.addEventListener('install', (event) => {
  self.skipWaiting(); // Forza l'attivazione immediata del nuovo SW
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Proviamo a cacheare gli asset statici core
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
  self.clients.claim(); // Prende il controllo immediato delle pagine aperte
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // 1. Ignora API AI o Analytics
  if (url.pathname.includes('google') && url.pathname.includes('generateContent')) {
    return;
  }

  // 2. Gestione Navigazione (HTML) -> Network First, fallback Cache
  // Questo assicura che l'utente veda sempre l'ultima versione dell'app se online
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Se la rete risponde, aggiorniamo la cache dell'HTML e restituiamo la pagina
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
          return response;
        })
        .catch(() => {
          // Se offline, restituiamo l'index dalla cache
          return caches.match('index.html').then(res => res || caches.match('./'));
        })
    );
    return;
  }

  // 3. Gestione Asset Esterni (CDN) e Statici -> Stale-While-Revalidate
  // Restituisce subito dalla cache (veloce), poi aggiorna in background
  const isAllowedHost = ALLOWED_HOSTS.some(host => url.hostname.includes(host));
  const isStaticAsset = url.pathname.match(/\.(png|jpg|jpeg|svg|json|css|js|woff2)$/);

  if (isAllowedHost || isStaticAsset) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cachedResponse = await cache.match(event.request);
        
        // Logica Stale-While-Revalidate
        const fetchPromise = fetch(event.request).then((networkResponse) => {
          // Cacheiamo solo risposte valide (200) o opaque (0, per CDN cors mode 'no-cors')
          if (networkResponse.ok || networkResponse.type === 'opaque') {
             cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        }).catch(err => {
          // Network fallito, non facciamo nulla (abbiamo la cache)
          // console.log('SW: Network fetch failed for', url.href);
        });

        // Se c'è in cache, lo restituiamo SUBITO, mentre la fetch aggiorna dietro le quinte
        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // 4. Default -> Cache First, Network Fallback per tutto il resto
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request);
    })
  );
});
