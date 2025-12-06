# Guide de Synchronisation - PWA SFA

## Vue d'ensemble

Le système de synchronisation permet aux vendeurs REP de travailler en mode offline et de synchroniser leurs actions automatiquement ou manuellement.

## Architecture

```
┌─────────────────────────────────────────┐
│         Application React               │
│  ┌───────────────────────────────────┐  │
│  │   ProfilePage (REP)               │  │
│  │   - Bouton "Synchroniser"         │  │
│  │   - Bouton "Vider le cache"       │  │
│  │   - Affichage du statut           │  │
│  └───────────────────────────────────┘  │
│                   │                      │
│  ┌───────────────────────────────────┐  │
│  │   SyncService                     │  │
│  │   - getPendingCount()             │  │
│  │   - triggerSync()                 │  │
│  │   - clearAllCaches()              │  │
│  │   - getSyncStatus()               │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
                   │
                   ↓
┌─────────────────────────────────────────┐
│         Service Worker                  │
│  ┌───────────────────────────────────┐  │
│  │   Background Sync                 │  │
│  │   - Intercepte requêtes offline   │  │
│  │   - Stocke dans IndexedDB         │  │
│  │   - Synchronise au retour online  │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
                   │
                   ↓
┌─────────────────────────────────────────┐
│         IndexedDB                       │
│  Database: SFA_OfflineDB                │
│  Store: offlineQueue                    │
│  - url, method, headers, body           │
│  - timestamp                            │
└─────────────────────────────────────────┘
```

## Composants

### 1. SyncService (`src/core/services/syncService.ts`)

Service principal qui gère toute la logique de synchronisation.

#### Méthodes principales

**`getSyncStatus(): Promise<SyncStatus>`**
- Retourne le statut complet de synchronisation
- Nombre de requêtes en attente
- Espace de stockage utilisé
- Date de dernière synchronisation
- État de connexion

**`triggerSync(): Promise<SyncResult[]>`**
- Déclenche la synchronisation
- Utilise Background Sync si disponible
- Fallback sur synchronisation manuelle
- Retourne les résultats de chaque requête

**`getPendingCount(): Promise<number>`**
- Compte le nombre de requêtes en attente
- Utilisé pour afficher le badge

**`clearAllCaches(): Promise<void>`**
- Vide tous les caches du Service Worker
- Supprime les données en cache

**`clearAll(): Promise<void>`**
- Vide la queue ET les caches
- Réinitialise complètement le stockage offline

**`listenToServiceWorker(callback): () => void`**
- Écoute les messages du Service Worker
- Appelé quand la synchronisation est terminée
- Retourne une fonction de cleanup

### 2. ProfilePage (`src/features/profile/pages/ProfilePage.tsx`)

Page de profil pour les REP avec section de synchronisation.

#### États

```typescript
const [syncStatus, setSyncStatus] = useState<SyncStatus>({
  isOnline: navigator.onLine,
  lastSync: new Date(),
  pendingItems: 0,
  storageUsed: 0,
  isSyncing: false,
});
```

#### Handlers

**`handleSync()`**
- Déclenche la synchronisation
- Affiche l'état de chargement
- Affiche les résultats (succès/échecs)
- Recharge le statut après synchronisation

**`handleClearCache()`**
- Demande confirmation
- Vide tout le cache
- Recharge le statut

### 3. SyncSection (`src/features/profile/components/SyncSection.tsx`)

Composant UI pour afficher le statut et les actions de synchronisation.

#### Affichage

- **Statut connexion** : En ligne / Hors ligne (avec indicateur animé)
- **Dernière sync** : Date et heure de la dernière synchronisation
- **Données en attente** : Nombre de requêtes en queue (badge warning)
- **Stockage local** : Espace utilisé en MB

#### Boutons

- **Synchroniser maintenant** : Déclenche la synchronisation
  - Désactivé si offline ou en cours de sync
  - Icône animée pendant la synchronisation
  
- **Vider le cache** : Supprime tout le cache
  - Désactivé pendant la synchronisation
  - Demande confirmation

### 4. OfflineIndicator (`src/core/components/OfflineIndicator.tsx`)

Indicateur global visible sur toutes les pages.

#### Affichage

- **Bannière jaune** (top) : Mode offline
- **Badge bleu** (bottom-right) : X actions en attente
- **Badge vert** (top-right) : Qualité de connexion (4G, 3G, etc.)

## Flux de synchronisation

### Scénario 1 : Synchronisation automatique

```
1. Utilisateur offline
   ↓
2. Crée une visite/vente
   ↓
3. Service Worker intercepte la requête POST
   ↓
4. Requête stockée dans IndexedDB
   ↓
5. Badge "1 action en attente" affiché
   ↓
6. Retour en ligne (détecté par useNetworkStatus)
   ↓
7. Background Sync déclenché automatiquement
   ↓
8. Service Worker envoie la requête au serveur
   ↓
9. Si succès : suppression de la queue
   ↓
10. Message "SYNC_COMPLETE" envoyé à l'app
   ↓
11. Badge disparaît
```

### Scénario 2 : Synchronisation manuelle

```
1. Utilisateur a des actions en attente
   ↓
2. Ouvre ProfilePage
   ↓
3. Voit "3 données en attente"
   ↓
4. Clique "Synchroniser maintenant"
   ↓
5. handleSync() appelé
   ↓
6. syncService.triggerSync() exécuté
   ↓
7. Si Background Sync disponible : utilisé
   Sinon : synchronisation manuelle
   ↓
8. Pour chaque requête en queue :
   - Tentative d'envoi au serveur
   - Si succès : suppression de la queue
   - Si échec : conservation dans la queue
   ↓
9. Résultats affichés : "2 réussis, 1 échec"
   ↓
10. Statut rechargé et affiché
```

### Scénario 3 : Vider le cache

```
1. Utilisateur clique "Vider le cache"
   ↓
2. Confirmation demandée
   ↓
3. Si confirmé : syncService.clearAll()
   ↓
4. Suppression de :
   - Queue IndexedDB
   - Tous les caches Service Worker
   - Date de dernière sync
   ↓
5. Statut rechargé : tout à 0
   ↓
6. Message "Cache vidé avec succès"
```

## Données stockées

### IndexedDB : SFA_OfflineDB

**Store : offlineQueue**
```typescript
{
  id: number (auto-increment),
  url: string,           // URL de l'API
  method: string,        // POST, PUT, DELETE, PATCH
  headers: object,       // Headers de la requête
  body: string,          // Corps de la requête (JSON stringifié)
  timestamp: number      // Date de création
}
```

### localStorage

**Clé : sfa_last_sync**
- Stocke la date de dernière synchronisation (ISO string)
- Utilisé pour afficher "Dernière sync"

### Cache Storage

**4 caches créés par le Service Worker :**
1. `sfa-rep-static-v1.0.0` : Ressources statiques
2. `sfa-rep-runtime-v1.0.0` : Runtime cache
3. `sfa-rep-api-v1.0.0` : Réponses API
4. `sfa-rep-images-v1.0.0` : Images

## API du Service Worker

### Messages envoyés à l'application

**SYNC_COMPLETE**
```typescript
{
  type: 'SYNC_COMPLETE',
  results: [
    { success: true, url: '/api/visits' },
    { success: false, url: '/api/orders', error: 404 }
  ]
}
```

### Background Sync

**Tag : sync-offline-queue**
- Enregistré automatiquement au retour en ligne
- Peut être déclenché manuellement
- Exécute la fonction `syncOfflineQueue()` du Service Worker

## Utilisation

### Pour les développeurs

#### Tester la synchronisation

```bash
# 1. Lancer l'app
npm run dev

# 2. Ouvrir DevTools (F12)
# 3. Network > Cocher "Offline"
# 4. Créer une visite/vente
# 5. Voir le badge "1 action en attente"
# 6. Network > Décocher "Offline"
# 7. Attendre la synchronisation automatique
# OU cliquer "Synchroniser maintenant"
```

#### Vérifier la queue

```javascript
// Dans la console DevTools
const db = await new Promise((resolve) => {
  const request = indexedDB.open('SFA_OfflineDB', 1);
  request.onsuccess = () => resolve(request.result);
});

const transaction = db.transaction(['offlineQueue'], 'readonly');
const store = transaction.objectStore('offlineQueue');
const request = store.getAll();
request.onsuccess = () => console.log(request.result);
```

#### Déclencher la synchronisation manuellement

```javascript
// Dans la console DevTools
import { syncService } from './src/core/services/syncService';
const results = await syncService.triggerSync();
console.log(results);
```

### Pour les utilisateurs (REP)

#### Voir le statut de synchronisation

1. Ouvrir le menu
2. Aller dans "Profil"
3. Scroller jusqu'à "Synchronisation"
4. Voir :
   - Statut connexion (En ligne / Hors ligne)
   - Dernière synchronisation
   - Données en attente
   - Stockage utilisé

#### Synchroniser manuellement

1. Dans la section "Synchronisation"
2. Cliquer "Synchroniser maintenant"
3. Attendre le message de confirmation
4. Vérifier que "Données en attente" = 0

#### Vider le cache

1. Dans la section "Synchronisation"
2. Cliquer "Vider le cache"
3. Confirmer l'action
4. **ATTENTION** : Les données non synchronisées seront perdues

## Debugging

### Logs du Service Worker

Tous les événements sont loggés :
```
[Service Worker] Installation...
[Service Worker] Activation...
[Service Worker] Requête ajoutée à la queue: /api/visits
[Service Worker] Synchronisation de la queue offline...
[Service Worker] Requête synchronisée: /api/visits
[Service Worker] Synchronisation terminée
```

### Logs du SyncService

```
[SyncService] Déclenchement de la synchronisation...
[SyncService] Background Sync déclenché
[SyncService] Synchronisation manuelle...
[SyncService] Requête synchronisée: /api/visits
[SyncService] Synchronisation terminée: [...]
```

### Logs de ProfilePage

```
[ProfilePage] Erreur sync: ...
[ProfilePage] Erreur clear cache: ...
```

### Logs de OfflineIndicator

```
[OfflineIndicator] 2 requêtes synchronisées avec succès
```

## Troubleshooting

### La synchronisation ne fonctionne pas

1. Vérifier que le Service Worker est actif
   - DevTools > Application > Service Workers
   
2. Vérifier la queue IndexedDB
   - DevTools > Application > IndexedDB > SFA_OfflineDB
   
3. Vérifier les logs de la console
   - Rechercher "[SyncService]" ou "[Service Worker]"

### Le badge ne se met pas à jour

1. Vérifier que le Service Worker envoie les messages
   - Logs : "SYNC_COMPLETE"
   
2. Vérifier que l'app écoute les messages
   - `syncService.listenToServiceWorker()` doit être appelé

### Le cache ne se vide pas

1. Vérifier les permissions
2. Vider manuellement via DevTools
   - Application > Clear storage

## Bonnes pratiques

### Pour les développeurs

1. **Toujours tester en mode offline**
   - Vérifier que les actions sont mises en queue
   - Vérifier la synchronisation au retour en ligne

2. **Gérer les erreurs de synchronisation**
   - Afficher des messages clairs à l'utilisateur
   - Logger les erreurs pour debugging

3. **Limiter la taille de la queue**
   - Ne pas stocker de gros fichiers
   - Compresser les données si possible

4. **Nettoyer régulièrement**
   - Supprimer les vieilles requêtes
   - Limiter la durée de vie du cache

### Pour les utilisateurs

1. **Synchroniser régulièrement**
   - Au moins une fois par jour
   - Avant de fermer l'application

2. **Vérifier les données en attente**
   - Avant de vider le cache
   - Avant de se déconnecter

3. **Ne pas vider le cache sans raison**
   - Risque de perte de données
   - Ralentit l'application

## Métriques

### À surveiller

- **Taux de succès de synchronisation** : > 95%
- **Temps moyen de synchronisation** : < 2s
- **Taille moyenne de la queue** : < 10 requêtes
- **Espace de stockage utilisé** : < 100 MB

### Alertes

- Si taux de succès < 90% : Problème serveur ou réseau
- Si queue > 50 requêtes : Problème de synchronisation
- Si stockage > 200 MB : Nettoyer le cache

---

**Version** : 1.0.0
**Dernière mise à jour** : Décembre 2024
