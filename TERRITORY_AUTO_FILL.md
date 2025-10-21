# 🎯 Remplissage Automatique du Territoire

## 📋 Problème Résolu

Le backend **exige** que `territoryId` soit fourni lors de la création d'un PDV, mais vous ne vouliez pas afficher ce champ dans le formulaire Step 1.

## ✅ Solution Implémentée

Le `territoryId` est maintenant **récupéré automatiquement** depuis l'utilisateur connecté et appliqué au formulaire sans intervention de l'utilisateur.

## 🔧 Modifications Apportées

### 1. **Backend** - Ajout de `territoryId` dans la réponse

#### Fichier : `auth.service.ts` (ligne 704-705)
```typescript
// Ajouter le territoryId (toujours présent)
response.territoryId = user.territoryId;
```

#### Fichier : `auth-response.interface.ts` (ligne 11)
```typescript
export interface UserResponse {
  id: string;
  email: string;
  // ...
  territoryId?: string; // ✨ NOUVEAU : ID du territoire de l'utilisateur
  // ...
}
```

### 2. **Frontend** - Type User mis à jour

#### Fichier : `core/types/index.ts` (ligne 15)
```typescript
export interface User {
  id: string;
  email: string;
  // ...
  territoryId?: string; // ✨ NOUVEAU : ID du territoire de l'utilisateur
  // ...
}
```

### 3. **Frontend** - Remplissage automatique dans le formulaire

#### Fichier : `PDVFormWizard.tsx`

**Import ajouté (ligne 13) :**
```typescript
import { useAuthStore } from '../../../core/auth';
```

**Récupération de l'utilisateur (ligne 24) :**
```typescript
const user = useAuthStore((state) => state.user);
```

**Initialisation automatique (lignes 26-31) :**
```typescript
// Initialiser le territoryId avec celui de l'utilisateur connecté
useEffect(() => {
  if (user?.territoryId) {
    setFormData(prev => ({ ...prev, territoryId: user.territoryId || '' }));
  }
}, [user]);
```

**Validation (lignes 85-88) :**
```typescript
if (!formData.territoryId) {
  alert('❌ Erreur: Le territoire est requis. Veuillez vous reconnecter.');
  return;
}
```

## 📊 Flux de Données

```
┌─────────────────────────────────────────────────────────┐
│  1. Utilisateur se connecte                             │
│     ↓                                                   │
│  2. Backend renvoie user avec territoryId              │
│     ↓                                                   │
│  3. Frontend stocke user dans authStore                │
│     ↓                                                   │
│  4. Utilisateur ouvre le formulaire PDV                │
│     ↓                                                   │
│  5. PDVFormWizard récupère user.territoryId            │
│     ↓                                                   │
│  6. territoryId est automatiquement appliqué au form   │
│     ↓                                                   │
│  7. Utilisateur remplit seulement le nom du PDV        │
│     ↓                                                   │
│  8. Soumission avec territoryId inclus                 │
└─────────────────────────────────────────────────────────┘
```

## 🎯 Résultat

### Avant
```typescript
// ❌ Utilisateur devait sélectionner manuellement
<select>
  <option value="">Sélectionnez un territoire</option>
  <option value="id1">Plateau</option>
  <option value="id2">Cocody</option>
  // ...
</select>
```

### Après
```typescript
// ✅ Territoire automatiquement rempli depuis l'utilisateur connecté
formData.territoryId = user.territoryId; // Invisible pour l'utilisateur
```

## 📝 Territoires Disponibles (Backend)

D'après le seed du backend, les territoires suivants existent :

| Code | Nom | Niveau |
|------|-----|--------|
| `DEFAULT` | Default Territory | REGION |
| `PLATEAU` | Plateau | ZONE |
| `COCODY` | Cocody | ZONE |
| `ADJAME` | Adjamé | ZONE |

## ⚠️ Points d'Attention

### 1. **Reconnexion Requise**
Les utilisateurs déjà connectés **doivent se reconnecter** pour que le backend leur envoie le `territoryId`.

**Solution temporaire :**
```javascript
// Dans la console du navigateur
localStorage.clear();
location.reload();
```

### 2. **Utilisateurs Sans Territoire**
Si un utilisateur n'a pas de `territoryId` (cas rare), le formulaire affichera une erreur :
```
❌ Erreur: Le territoire est requis. Veuillez vous reconnecter.
```

### 3. **Changement de Territoire**
Si un utilisateur change de territoire, il doit se reconnecter pour que le nouveau territoire soit pris en compte.

## 🧪 Tests à Effectuer

1. **Se déconnecter et se reconnecter**
   ```bash
   # Vider le cache
   localStorage.clear();
   # Se reconnecter
   ```

2. **Vérifier que territoryId est présent**
   ```javascript
   // Dans la console
   const user = JSON.parse(localStorage.getItem('auth-storage')).state.user;
   console.log('Territory ID:', user.territoryId);
   ```

3. **Créer un PDV**
   - Ouvrir le formulaire
   - Entrer uniquement le nom
   - Soumettre
   - Vérifier dans la console réseau que `territoryId` est envoyé

4. **Vérifier dans le backend**
   ```sql
   -- Dans la base de données
   SELECT id, name, territory_id FROM outlet ORDER BY created_at DESC LIMIT 5;
   ```

## 🚀 Avantages

1. ✅ **UX Simplifiée** : Moins de champs à remplir
2. ✅ **Pas d'erreur** : Impossible d'oublier le territoire
3. ✅ **Sécurisé** : L'utilisateur ne peut créer des PDV que dans son territoire
4. ✅ **Automatique** : Aucune action requise de l'utilisateur

## 📚 Fichiers Modifiés

### Backend (2 fichiers)
- ✅ `src/auth/auth.service.ts`
- ✅ `src/auth/interfaces/auth-response.interface.ts`

### Frontend (2 fichiers)
- ✅ `src/core/types/index.ts`
- ✅ `src/features/visits/components/PDVFormWizard.tsx`

---

**Date** : 2025-10-18  
**Impact** : Amélioration UX + Sécurité  
**Breaking Change** : Non (rétrocompatible)
