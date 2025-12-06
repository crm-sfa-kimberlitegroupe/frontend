# Guide du Mode Offline - PWA SFA

## Vue d'ensemble

L'application SFA est maintenant entièrement fonctionnelle en mode offline grâce à :
- **Service Worker avancé** avec stratégies de cache intelligentes
- **Queue de synchronisation** pour les requêtes offline
- **Détection réseau** en temps réel
- **Indicateurs visuels** du statut de connexion

## Architecture

### 1. Service Worker (`public/service-worker.js`)

#### Stratégies de cache

**Cache First (Images)**
- Les images sont servies depuis le cache en priorité
- Mise en cache automatique lors du premier chargement
- Durée : 7 jours

**Network First (API)**
- Essaie le réseau en premier
- Fallback sur le cache si offline
- Durée : 5 minutes
- Les requêtes POST/PUT/DELETE sont mises en queue si offline

**Cache First (Ressources statiques)**
- JS, CSS servis depuis le cache
- Mise à jour en arrière-plan
- Durée : 30 jours

**Network First (Documents HTML)**
- Pages HTML toujours à jour
- Fallback sur cache si offline

#### Queue de synchronisation

Les requêtes échouées (POST, PUT, DELETE, PATCH) sont :
1. Sauvegardées dans IndexedDB
2. Retentées automatiquement lors du retour en ligne
3. Supprimées de la queue après succès

### 2. Hook useNetworkStatus

```typescript
import { useNetworkStatus } from '@/core/hooks/useNetworkStatus';

function MyComponent() {
  const { isOnline, effectiveType, downlink, rtt } = useNetworkStatus();
  
  return (
    <div>
      {isOnline ? 'En ligne' : 'Hors ligne'}
      {effectiveType && `Connexion: ${effectiveType}`}
    </div>
  );
}
```

**Propriétés retournées :**
- `isOnline`: boolean - État de la connexion
- `effectiveType`: '4g' | '3g' | '2g' | 'slow-2g' - Type de connexion
- `downlink`: number - Vitesse de téléchargement (Mbps)
- `rtt`: number - Round-trip time (ms)
- `saveData`: boolean - Mode économie de données

### 3. Composant OfflineIndicator

Affiche automatiquement :
- **Bannière jaune** en haut quand offline
- **Badge de requêtes en attente** en bas à droite
- **Indicateur de qualité** de connexion (4G, 3G, etc.)

Déjà intégré dans `App.tsx`, aucune configuration nécessaire.

## Utilisation

### Pour les développeurs

#### Tester le mode offline

1. **Via DevTools Chrome :**
   - F12 → Network → Cocher "Offline"
   - Ou throttling : "Slow 3G", "Fast 3G"

2. **Via le navigateur :**
   - Désactiver le WiFi/Ethernet
   - Mode avion sur mobile

#### Vérifier le cache

```javascript
// Dans la console DevTools
caches.keys().then(console.log);

// Voir le contenu d'un cache
caches.open('sfa-rep-api-v1.0.0').then(cache => 
  cache.keys().then(console.log)
);
```

#### Vérifier la queue offline

```javascript
// Ouvrir IndexedDB dans DevTools → Application → IndexedDB
// Ou en code :
const request = indexedDB.open('SFA_OfflineDB', 1);
request.onsuccess = () => {
  const db = request.result;
  const transaction = db.transaction(['offlineQueue'], 'readonly');
  const store = transaction.objectStore('offlineQueue');
  store.getAll().onsuccess = (e) => console.log(e.target.result);
};
```

### Pour les utilisateurs (REP)

#### Fonctionnalités disponibles offline

✅ **Disponible :**
- Consulter les visites planifiées
- Voir la carte et la route
- Consulter le stock
- Voir les commandes passées
- Consulter les PDV
- Voir les statistiques

⏳ **Mise en queue (synchronisé au retour en ligne) :**
- Créer une visite
- Enregistrer une vente
- Faire un check-in/check-out
- Enregistrer du merchandising
- Créer un nouveau PDV

❌ **Non disponible :**
- Recherche en temps réel
- Données non mises en cache
- Upload de photos (mis en queue)

#### Indicateurs visuels

1. **Bannière jaune** : "Mode hors ligne"
   - Apparaît en haut de l'écran
   - Disparaît automatiquement au retour en ligne

2. **Badge bleu** : "X actions en attente"
   - En bas à droite
   - Indique le nombre de requêtes en queue
   - Disparaît après synchronisation

3. **Badge de qualité** : "4G", "3G", etc.
   - En haut à droite
   - Indique la qualité de connexion

## Configuration

### Modifier les durées de cache

Dans `public/service-worker.js` :

```javascript
const CACHE_DURATION = {
  API: 5 * 60 * 1000,        // 5 minutes
  IMAGES: 7 * 24 * 60 * 60 * 1000, // 7 jours
  STATIC: 30 * 24 * 60 * 60 * 1000, // 30 jours
};
```

### Ajouter des ressources au precache

```javascript
const PRECACHE_URLS = [
  '/',
  '/dashboard',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  // Ajouter vos ressources critiques ici
];
```

### Forcer la synchronisation

```javascript
if ('serviceWorker' in navigator && 'sync' in ServiceWorkerRegistration.prototype) {
  navigator.serviceWorker.ready.then((registration) => {
    return registration.sync.register('sync-offline-queue');
  });
}
```

## Debugging

### Logs du Service Worker

Tous les événements sont loggés dans la console :
- `[Service Worker] Installation...`
- `[Service Worker] Activation...`
- `[Service Worker] Réseau indisponible, utilisation du cache`
- `[Service Worker] Requête ajoutée à la queue`
- `[Service Worker] Synchronisation terminée`

### Vérifier l'enregistrement

```javascript
navigator.serviceWorker.getRegistration().then(reg => {
  console.log('Service Worker:', reg);
  console.log('Scope:', reg?.scope);
  console.log('Active:', reg?.active);
});
```

### Forcer la mise à jour

```javascript
navigator.serviceWorker.getRegistration().then(reg => {
  reg?.update();
});
```

## Bonnes pratiques

### 1. Gestion des erreurs

Toujours vérifier le statut réseau avant les opérations critiques :

```typescript
const { isOnline } = useNetworkStatus();

const handleSubmit = async () => {
  if (!isOnline) {
    alert('Cette action sera synchronisée au retour en ligne');
  }
  // Continuer l'opération
};
```

### 2. Feedback utilisateur

Informer l'utilisateur des actions mises en queue :

```typescript
if (response.status === 202 && response.data.offline) {
  toast.info('Action enregistrée, synchronisation en attente');
}
```

### 3. Optimisation des données

- Limiter la taille des requêtes API
- Compresser les images avant upload
- Utiliser la pagination pour les listes

### 4. Mise à jour du Service Worker

Après modification du Service Worker :
1. Incrémenter `CACHE_VERSION`
2. Rebuild l'application
3. Les utilisateurs recevront la mise à jour automatiquement

## Troubleshooting

### Le Service Worker ne s'enregistre pas

- Vérifier que l'app est servie en HTTPS (ou localhost)
- Vérifier que `service-worker.js` est à la racine
- Vérifier les logs de la console

### Le cache ne fonctionne pas

- Vérifier que les URLs sont correctes
- Vider le cache : DevTools → Application → Clear storage
- Vérifier que le Service Worker est actif

### La synchronisation ne fonctionne pas

- Vérifier que l'API est accessible
- Vérifier les logs du Service Worker
- Vérifier IndexedDB pour la queue

### Les données ne se mettent pas à jour

- Le cache API est de 5 minutes
- Forcer le refresh avec Ctrl+Shift+R
- Ou vider le cache manuellement

## Métriques et monitoring

### Événements à tracker

- Nombre de requêtes servies depuis le cache
- Nombre de requêtes mises en queue
- Taux de succès de synchronisation
- Temps moyen de synchronisation

### Exemple d'implémentation

```javascript
// Dans le Service Worker
self.addEventListener('fetch', (event) => {
  // Track cache hits
  caches.match(request).then(response => {
    if (response) {
      // Analytics: cache hit
    }
  });
});
```

## Ressources

- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Background Sync API](https://developer.mozilla.org/en-US/docs/Web/API/Background_Synchronization_API)
- [IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [Network Information API](https://developer.mozilla.org/en-US/docs/Web/API/Network_Information_API)
