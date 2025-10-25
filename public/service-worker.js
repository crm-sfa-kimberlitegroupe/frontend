const CACHE_NAME = 'sfa-rep-v1';
const RUNTIME_CACHE = 'sfa-rep-runtime-v1';

// Ressources à mettre en cache lors de l'installation
const PRECACHE_URLS = [
  '/',
  '/dashboard',
  '/index.html',
  '/manifest.json',
];

// Installation du service worker
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installation...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Mise en cache des ressources');
      return cache.addAll(PRECACHE_URLS);
    })
  );
  self.skipWaiting();
});

// Activation du service worker
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activation...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => {
            return cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE;
          })
          .map((cacheName) => {
            console.log('[Service Worker] Suppression ancien cache:', cacheName);
            return caches.delete(cacheName);
          })
      );
    })
  );
  return self.clients.claim();
});

// Stratégie de cache : Network First avec fallback sur cache
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorer les requêtes non-HTTP
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Ignorer les requêtes vers l'API (toujours utiliser le réseau)
  if (url.pathname.startsWith('/api')) {
    return;
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      // Si en cache, retourner la réponse cachée tout en mettant à jour le cache
      if (cachedResponse) {
        // Network first pour garder les données à jour
        fetch(request)
          .then((response) => {
            if (response && response.status === 200) {
              const responseClone = response.clone();
              caches.open(RUNTIME_CACHE).then((cache) => {
                cache.put(request, responseClone);
              });
            }
          })
          .catch(() => {
            // En cas d'erreur réseau, on garde le cache
          });
        
        return cachedResponse;
      }

      // Si pas en cache, faire la requête réseau
      return fetch(request)
        .then((response) => {
          // Vérifier si la réponse est valide
          if (!response || response.status !== 200 || response.type === 'error') {
            return response;
          }

          // Cloner la réponse
          const responseClone = response.clone();

          // Mettre en cache pour les requêtes futures
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(request, responseClone);
          });

          return response;
        })
        .catch(() => {
          // En cas d'erreur réseau et pas de cache, retourner une page offline
          if (request.destination === 'document') {
            return caches.match('/index.html');
          }
        });
    })
  );
});

// Gestion de la synchronisation en arrière-plan
self.addEventListener('sync', (event) => {
  console.log('[Service Worker] Synchronisation en arrière-plan');
  if (event.tag === 'sync-data') {
    event.waitUntil(syncData());
  }
});

async function syncData() {
  // Logique de synchronisation des données
  // À implémenter selon vos besoins
  console.log('[Service Worker] Synchronisation des données...');
}

// Gestion des notifications push
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Notification push reçue');
  
  const options = {
    body: event.data ? event.data.text() : 'Nouvelle notification',
    icon: '/icons/icon-192x192.svg',
    badge: '/icons/icon-72x72.svg',
    vibrate: [200, 100, 200],
    tag: 'sfa-notification',
    requireInteraction: false,
  };

  event.waitUntil(
    self.registration.showNotification('SFA REP', options)
  );
});

// Gestion du clic sur les notifications
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Clic sur notification');
  event.notification.close();

  event.waitUntil(
    clients.openWindow('/dashboard')
  );
});
