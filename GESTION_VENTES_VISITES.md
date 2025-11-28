# Gestion des Ventes et Merchandising dans les Visites

## 📋 Vue d'ensemble

Le système permet maintenant de gérer **plusieurs ventes** et **plusieurs merchandising** pour une même visite, avec synchronisation automatique entre le store local et la base de données.

## 🏗️ Architecture

### Store Zustand (`useVisitsStore`)

#### Structure des données
```typescript
interface ActiveVisit {
  outletId: string;
  visitId: string;
  routeStopId: string;
  pdvName: string;
  address?: string;
  
  // Nouvelles propriétés (arrays)
  venteIds?: string[];    // Liste des IDs de ventes
  merchIds?: string[];    // Liste des IDs de merchandising
  
  status: 'IN_PROGRESS' | 'COMPLETED';
  // ... autres propriétés
}
```

### Méthodes disponibles

#### 1. **Gestion des ventes**

```typescript
// Ajouter une vente
addVenteId(outletId: string, venteId: string): void

// Supprimer une vente
removeVenteId(outletId: string, venteId: string): void

// Récupérer toutes les ventes
getVenteIds(outletId: string): string[]
```

#### 2. **Gestion du merchandising**

```typescript
// Ajouter un merchandising
addMerchId(outletId: string, merchId: string): void

// Supprimer un merchandising
removeMerchId(outletId: string, merchId: string): void

// Récupérer tous les merchandising
getMerchIds(outletId: string): string[]
```

## 🔄 Synchronisation avec la base de données

### Service API (`visitsService`)

#### Méthodes de ventes
```typescript
// Mettre à jour toutes les ventes d'une visite
updateVisitOrders(visitId: string, orderIds: string[]): Promise<Visit>

// Ajouter une vente
addOrderToVisit(visitId: string, orderId: string): Promise<Visit>

// Supprimer une vente
removeOrderFromVisit(visitId: string, orderId: string): Promise<Visit>
```

#### Méthodes de merchandising
```typescript
// Mettre à jour tous les merchandising
updateVisitMerchandising(visitId: string, merchIds: string[]): Promise<Visit>

// Ajouter un merchandising
addMerchandisingToVisit(visitId: string, merchId: string): Promise<Visit>

// Supprimer un merchandising
removeMerchandisingFromVisit(visitId: string, merchId: string): Promise<Visit>
```

## 💡 Exemples d'utilisation

### 1. Ajouter une vente à une visite

```typescript
import { useVisitsStore } from '@/features/visits/stores/visitsStore';
import { visitsService } from '@/features/visits/services/visits.service';

function CreateOrderPage() {
  const { addVenteId, getActiveVisit } = useVisitsStore();
  
  const handleCreateOrder = async (outletId: string, orderData: any) => {
    try {
      // 1. Créer la vente via l'API
      const order = await ordersService.createOrder(orderData);
      
      // 2. Récupérer la visite active
      const activeVisit = getActiveVisit(outletId);
      
      if (activeVisit?.visitId) {
        // 3. Ajouter la vente au store local
        addVenteId(outletId, order.id);
        
        // 4. Synchroniser avec la base de données
        await visitsService.addOrderToVisit(activeVisit.visitId, order.id);
        
        console.log('✅ Vente ajoutée et synchronisée');
      }
    } catch (error) {
      console.error('❌ Erreur:', error);
    }
  };
}
```

### 2. Vérifier si des ventes existent

```typescript
import { useVisitsStore } from '@/features/visits/stores/visitsStore';

function VisitDetailPage() {
  const { getVenteIds, getActiveVisit } = useVisitsStore();
  
  const checkVentes = (outletId: string) => {
    // Récupérer toutes les ventes
    const venteIds = getVenteIds(outletId);
    
    if (venteIds.length > 0) {
      console.log(`📦 ${venteIds.length} vente(s) enregistrée(s)`);
      console.log('IDs:', venteIds);
      return true;
    }
    
    console.log('❌ Aucune vente');
    return false;
  };
}
```

### 3. Supprimer une vente

```typescript
import { useVisitsStore } from '@/features/visits/stores/visitsStore';
import { visitsService } from '@/features/visits/services/visits.service';

function OrdersList() {
  const { removeVenteId, getActiveVisit } = useVisitsStore();
  
  const handleDeleteOrder = async (outletId: string, orderId: string) => {
    try {
      const activeVisit = getActiveVisit(outletId);
      
      if (activeVisit?.visitId) {
        // 1. Supprimer du store local
        removeVenteId(outletId, orderId);
        
        // 2. Synchroniser avec la base de données
        await visitsService.removeOrderFromVisit(activeVisit.visitId, orderId);
        
        console.log('✅ Vente supprimée');
      }
    } catch (error) {
      console.error('❌ Erreur:', error);
    }
  };
}
```

### 4. Mettre à jour toutes les ventes

```typescript
import { useVisitsStore } from '@/features/visits/stores/visitsStore';
import { visitsService } from '@/features/visits/services/visits.service';

function VisitCompletion() {
  const { getVenteIds, getActiveVisit } = useVisitsStore();
  
  const handleCompleteVisit = async (outletId: string) => {
    try {
      const activeVisit = getActiveVisit(outletId);
      const venteIds = getVenteIds(outletId);
      
      if (activeVisit?.visitId) {
        // Synchroniser toutes les ventes avec la base de données
        await visitsService.updateVisitOrders(activeVisit.visitId, venteIds);
        
        console.log(`✅ ${venteIds.length} vente(s) synchronisée(s)`);
      }
    } catch (error) {
      console.error('❌ Erreur:', error);
    }
  };
}
```

## 🔍 Flux complet

### Scénario : Vendeur fait plusieurs ventes durant une visite

```
1. Vendeur démarre visite
   ↓
   startVisit(visitData) → Store local créé
   
2. Vendeur crée vente #1
   ↓
   createOrder() → API
   ↓
   addVenteId(outletId, order1.id) → Store local
   ↓
   addOrderToVisit(visitId, order1.id) → API sync
   
3. Vendeur crée vente #2
   ↓
   createOrder() → API
   ↓
   addVenteId(outletId, order2.id) → Store local
   ↓
   addOrderToVisit(visitId, order2.id) → API sync
   
4. Vendeur termine visite
   ↓
   getVenteIds(outletId) → [order1.id, order2.id]
   ↓
   completeVisit() → API avec toutes les ventes
   ↓
   clearVisit(outletId) → Nettoyage store local
```

## ⚙️ Configuration

### Persistance automatique

Le store utilise `zustand/middleware/persist` pour sauvegarder automatiquement dans `localStorage` :

```typescript
{
  name: 'visits-storage',
  partialize: (state) => ({ 
    activeVisits: state.activeVisits 
  })
}
```

### Éviter les doublons

Les méthodes `addVenteId` et `addMerchId` vérifient automatiquement les doublons :

```typescript
if (currentVenteIds.includes(venteId)) return state;
```

## 🚀 Avantages

### 1. **Flexibilité**
- Plusieurs ventes par visite
- Plusieurs merchandising par visite
- Ajout/suppression dynamique

### 2. **Synchronisation**
- Store local pour performance
- API pour persistance
- Double sécurité

### 3. **Traçabilité**
- Historique complet des ventes
- Lien visite ↔ ventes
- Audit facilité

### 4. **Performance**
- Mise à jour locale instantanée
- Synchronisation en arrière-plan
- Pas de rechargement complet

## 📝 Notes importantes

1. **Toujours vérifier l'existence de la visite** avant d'ajouter des ventes
2. **Synchroniser avec l'API** après chaque modification
3. **Gérer les erreurs** de synchronisation
4. **Nettoyer le store** après completion de visite

## 🔧 Endpoints Backend requis

Les endpoints suivants doivent être implémentés côté backend :

```
PUT    /visits/:visitId/orders
POST   /visits/:visitId/orders/:orderId
DELETE /visits/:visitId/orders/:orderId

PUT    /visits/:visitId/merchandising
POST   /visits/:visitId/merchandising/:merchId
DELETE /visits/:visitId/merchandising/:merchId
```
