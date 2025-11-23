# 🔧 Correction du système de visites

## 🚨 Problème identifié

Le système de visites récupérait **TOUS les PDV du secteur** au lieu des **PDV de la route planifiée**.

### Ancien système (incorrect)
```typescript
// useVendorOutlets.ts
const result = await territoriesService.getVendorOutlets(user.id);
// → Récupère TOUS les PDV du secteur assigné
// → Convertit tous ces PDV en "visites" virtuelles
```

### Nouveau système (correct)
```typescript
// useRouteVisits.ts
const todayRoute = await routesService.getTodayRoute();
// → Récupère la route planifiée du jour
// → Seuls les PDV de cette route deviennent des visites
```

## ✅ Solution implémentée

### 1. Nouveau hook `useRouteVisits`
**Fichier** : `src/features/visits/hooks/useRouteVisits.ts`

**Fonctionnalités** :
- Récupère la route planifiée du jour via `routesService.getTodayRoute()`
- Convertit les `RouteStop[]` en visites avec statuts corrects
- Gère l'ordre des visites selon la séquence (`seq`)
- Détermine automatiquement le statut :
  - `COMPLETED` : Si `RouteStop.status === 'VISITED'`
  - `IN_PROGRESS` : Premier PDV non visité si route commencée
  - `PLANNED` : Autres PDV non visités

### 2. Modification de VisitsREP
**Fichier** : `src/features/visits/pages/VisitsREP.tsx`

**Changements** :
- Remplacement de `useVendorOutlets` + `useVisitStatus` par `useRouteVisits`
- Suppression de la logique complexe de conversion PDV → visites
- Utilisation directe des données de la route planifiée

## 🎯 Flux corrigé

### Avant (incorrect)
1. Récupérer **TOUS** les PDV du secteur
2. Convertir chaque PDV en "visite virtuelle"
3. Afficher tous les PDV comme visites possibles

### Après (correct)
1. Récupérer la **route planifiée du jour**
2. Extraire les PDV de cette route (`RouteStop.outletId`)
3. Afficher **uniquement** ces PDV comme visites

## 📊 Structure des données

### RouteStop → Visit
```typescript
// RouteStop (backend)
{
  id: string;
  outletId: string;
  seq: number;
  status: 'PLANNED' | 'VISITED' | 'SKIPPED';
  eta?: string;
  outlet?: {
    name: string;
    address?: string;
  }
}

// Visit (frontend)
{
  id: string;           // = outletId
  pdvName: string;      // = outlet.name
  outletId: string;     // = outletId
  status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED';
  scheduledTime: string; // = eta formaté
  sequence: number;     // = seq
  address?: string;     // = outlet.address
}
```

## 🔄 Gestion des statuts

### Logique de conversion
```typescript
if (stop.status === 'VISITED') {
  visitStatus = 'COMPLETED';
} else if (stop.status === 'PLANNED') {
  const hasStarted = todayRoute.status === 'IN_PROGRESS';
  const isFirstUnvisited = /* logique pour trouver le premier non visité */;
  
  if (hasStarted && isFirstUnvisited) {
    visitStatus = 'IN_PROGRESS';
  } else {
    visitStatus = 'PLANNED';
  }
}
```

## 🎉 Avantages de la correction

### ✅ Conformité métier
- Affiche uniquement les PDV de la route planifiée
- Respecte l'ordre de visite défini par l'algorithme d'optimisation
- Statuts cohérents avec l'avancement de la route

### ✅ Performance
- Moins de données à traiter (route vs secteur complet)
- Pas de conversion complexe PDV → visites
- Logique simplifiée et plus maintenable

### ✅ UX améliorée
- Vendeur voit exactement ce qu'il doit faire
- Ordre logique des visites
- Pas de confusion avec des PDV non planifiés

## 🚀 Prochaines étapes

1. **Tester** le nouveau système avec une route planifiée
2. **Vérifier** que les statuts se mettent à jour correctement
3. **Ajouter** la gestion des routes multi-jours si nécessaire
4. **Optimiser** le rechargement des données après actions

## 📝 Notes techniques

- Le hook utilise `useCallback` pour optimiser les re-renders
- Gestion d'erreur si aucune route planifiée pour le jour
- Fallback vers les infos du secteur pour l'affichage
- Compatible avec l'architecture existante (services, types)
