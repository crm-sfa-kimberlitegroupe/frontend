const CACHE_VERSION = '1.0.0';
const CACHE_NAME = `sfa-rep-static-v${CACHE_VERSION}`;
const RUNTIME_CACHE = `sfa-rep-runtime-v${CACHE_VERSION}`;
const API_CACHE = `sfa-rep-api-v${CACHE_VERSION}`;
const IMAGE_CACHE = `sfa-rep-images-v${CACHE_VERSION}`;

// Ressources critiques à mettre en cache lors de l'installation
const PRECACHE_URLS = [
  '/',
  '/dashboard',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

// Configuration des durées de cache
const CACHE_DURATION = {
  API: 5 * 60 * 1000,        // 5 minutes pour les API
  IMAGES: 7 * 24 * 60 * 60 * 1000, // 7 jours pour les images
  STATIC: 30 * 24 * 60 * 60 * 1000, // 30 jours pour les ressources statiques
};

// Queue pour les requêtes offline
let offlineQueue = [];

// Installation du service worker
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installation...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Mise en cache des ressources critiques');
      return cache.addAll(PRECACHE_URLS).catch((error) => {
        console.error('[Service Worker] Erreur lors du precache:', error);
      });
    })
  );
  self.skipWaiting();
});

// Activation du service worker
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activation...');
  event.waitUntil(
    Promise.all([
      // Nettoyer les anciens caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              return ![
                CACHE_NAME,
                RUNTIME_CACHE,
                API_CACHE,
                IMAGE_CACHE
              ].includes(cacheName);
            })
            .map((cacheName) => {
              console.log('[Service Worker] Suppression ancien cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      }),
      // Prendre le contrôle immédiatement
      self.clients.claim()
    ])
  );
});

// Stratégies de cache intelligentes
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorer les requêtes non-HTTP
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Stratégie pour les requêtes API
  if (url.pathname.startsWith('/api')) {
    event.respondWith(handleAPIRequest(request));
    return;
  }

  // Stratégie pour les images
  if (request.destination === 'image') {
    event.respondWith(handleImageRequest(request));
    return;
  }

  // Stratégie pour les ressources statiques (JS, CSS)
  if (request.destination === 'script' || request.destination === 'style') {
    event.respondWith(handleStaticRequest(request));
    return;
  }

  // Stratégie par défaut pour les pages HTML
  event.respondWith(handleDocumentRequest(request));
});

// Gestion des requêtes API : Network First avec cache fallback
async function handleAPIRequest(request) {
  const cacheName = API_CACHE;
  
  try {
    // Essayer le réseau d'abord
    const networkResponse = await fetch(request);
    
    if (networkResponse && networkResponse.ok) {
      // Mettre en cache la réponse
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }
    
    // Si la réponse n'est pas OK, essayer le cache
    return await caches.match(request) || networkResponse;
  } catch (error) {
    console.log('[Service Worker] Réseau indisponible, utilisation du cache pour:', request.url);
    
    // Si offline, chercher dans le cache
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Si méthode POST/PUT/DELETE, ajouter à la queue
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
      await addToOfflineQueue(request);
      return new Response(
        JSON.stringify({ 
          offline: true, 
          message: 'Requête mise en file d\'attente pour synchronisation' 
        }),
        { 
          status: 202,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Retourner une erreur pour les GET
    return new Response(
      JSON.stringify({ error: 'Pas de connexion réseau' }),
      { 
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Gestion des images : Cache First avec network fallback
async function handleImageRequest(request) {
  const cache = await caches.open(IMAGE_CACHE);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('[Service Worker] Image non disponible:', request.url);
    // Retourner une image placeholder si disponible
    return caches.match('/icons/icon-192x192.png');
  }
}

// Gestion des ressources statiques : Cache First
async function handleStaticRequest(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.error('[Service Worker] Ressource statique non disponible:', request.url);
    throw error;
  }
}

// Gestion des documents HTML : Network First
async function handleDocumentRequest(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('[Service Worker] Mode offline, chargement depuis le cache');
    const cachedResponse = await caches.match(request);
    return cachedResponse || caches.match('/index.html');
  }
}

// Ajouter une requête à la queue offline
async function addToOfflineQueue(request) {
  const requestData = {
    url: request.url,
    method: request.method,
    headers: Object.fromEntries(request.headers.entries()),
    body: await request.text(),
    timestamp: Date.now()
  };
  
  offlineQueue.push(requestData);
  
  // Sauvegarder dans IndexedDB pour persistance
  await saveQueueToIndexedDB(offlineQueue);
  
  console.log('[Service Worker] Requête ajoutée à la queue:', requestData.url);
}

// Gestion de la synchronisation en arrière-plan
self.addEventListener('sync', (event) => {
  console.log('[Service Worker] Synchronisation en arrière-plan:', event.tag);
  
  if (event.tag === 'sync-offline-queue') {
    event.waitUntil(syncOfflineQueue());
  }
});

// Synchroniser la queue offline
async function syncOfflineQueue() {
  console.log('[Service Worker] Synchronisation de la queue offline...');
  
  // Charger la queue depuis IndexedDB
  const queue = await loadQueueFromIndexedDB();
  
  if (!queue || queue.length === 0) {
    console.log('[Service Worker] Aucune requête en attente');
    return;
  }
  
  const results = [];
  
  for (const requestData of queue) {
    try {
      const response = await fetch(requestData.url, {
        method: requestData.method,
        headers: requestData.headers,
        body: requestData.body || undefined
      });
      
      if (response.ok) {
        console.log('[Service Worker] Requête synchronisée:', requestData.url);
        results.push({ success: true, url: requestData.url });
      } else {
        console.error('[Service Worker] Échec de synchronisation:', requestData.url, response.status);
        results.push({ success: false, url: requestData.url, error: response.status });
      }
    } catch (error) {
      console.error('[Service Worker] Erreur de synchronisation:', requestData.url, error);
      results.push({ success: false, url: requestData.url, error: error.message });
    }
  }
  
  // Supprimer les requêtes réussies de la queue
  const remainingQueue = queue.filter((req, index) => !results[index].success);
  offlineQueue = remainingQueue;
  await saveQueueToIndexedDB(remainingQueue);
  
  // Notifier l'application
  const clients = await self.clients.matchAll();
  clients.forEach(client => {
    client.postMessage({
      type: 'SYNC_COMPLETE',
      results: results
    });
  });
  
  console.log('[Service Worker] Synchronisation terminée:', results);
}

// Gestion d'IndexedDB pour la persistance de la queue
function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('SFA_OfflineDB', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('offlineQueue')) {
        db.createObjectStore('offlineQueue', { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}

async function saveQueueToIndexedDB(queue) {
  try {
    const db = await openDatabase();
    const transaction = db.transaction(['offlineQueue'], 'readwrite');
    const store = transaction.objectStore('offlineQueue');
    
    // Vider le store
    await store.clear();
    
    // Ajouter tous les éléments
    for (const item of queue) {
      await store.add(item);
    }
    
    return true;
  } catch (error) {
    console.error('[Service Worker] Erreur sauvegarde IndexedDB:', error);
    return false;
  }
}

async function loadQueueFromIndexedDB() {
  try {
    const db = await openDatabase();
    const transaction = db.transaction(['offlineQueue'], 'readonly');
    const store = transaction.objectStore('offlineQueue');
    const request = store.getAll();
    
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('[Service Worker] Erreur chargement IndexedDB:', error);
    return [];
  }
}

// Gestion des notifications push
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Notification push reçue');
  
  const options = {
    body: event.data ? event.data.text() : 'Nouvelle notification',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
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
