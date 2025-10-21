# 🚀 Guide de Migration - Étape par Étape

## 📋 Vue d'ensemble

Ce guide vous accompagne pour migrer votre frontend de l'ancienne structure vers la nouvelle architecture feature-based.

**Durée estimée**: 30-45 minutes  
**Difficulté**: Facile (scripts automatisés)

---

## ✅ Pré-requis

Avant de commencer, assurez-vous que:

- [ ] Vous avez commit tous vos changements actuels
- [ ] Votre application fonctionne correctement
- [ ] Vous avez une sauvegarde (ou utilisez Git)

```powershell
# Créer une branche pour la migration
git checkout -b migration/feature-based-structure
git add .
git commit -m "Avant migration vers feature-based structure"
```

---

## 📦 ÉTAPE 1: Exécuter le Script de Migration (5 min)

### 1.1 Ouvrir PowerShell dans le dossier frontend

```powershell
cd C:\Users\OFFO ANGE EMMANUEL\Desktop\SFA\FrontendSFA\frontend
```

### 1.2 Exécuter le script de migration

```powershell
.\migrate-structure.ps1
```

### 1.3 Ce que fait le script

Le script va automatiquement:

✅ **Migrer les services**
- `services/dashboardService.ts` → `features/dashboard/services/`
- `services/outletsService.ts` → `features/pdv/services/`
- `services/routesService.ts` → `features/routes/services/`
- `services/territoriesService.ts` → `features/territories/services/`
- `services/usersService.ts` → `features/users/services/`
- `services/api.ts` → `core/api/`

✅ **Migrer les composants**
- `components/ProtectedRoute.tsx` → `core/components/`
- `components/BottomNavigation.tsx` → `core/components/`
- `components/Map.tsx` → `core/components/`

✅ **Migrer le store**
- `store/territoriesStore.ts` → `features/territories/store/`

✅ **Créer les fichiers index.ts manquants**

✅ **Supprimer les dossiers vides**

### 1.4 Vérifier les résultats

Après l'exécution, vous devriez voir:
- ✓ Messages en vert pour les fichiers déplacés
- ⚠ Messages en jaune pour les avertissements (normal)

---

## 🔄 ÉTAPE 2: Mettre à Jour les Imports (5 min)

### 2.1 Exécuter le script de mise à jour des imports

```powershell
.\update-imports.ps1
```

### 2.2 Ce que fait le script

Le script va automatiquement remplacer tous les imports relatifs par des imports avec path aliases:

**Avant:**
```typescript
import { authService } from '../services/authService';
import { User } from '../../types';
```

**Après:**
```typescript
import { authService } from '@/core/auth/authService';
import { User } from '@/core/types';
```

---

## 🔍 ÉTAPE 3: Vérifications Manuelles (10 min)

### 3.1 Vérifier App.tsx

Ouvrez `src/App.tsx` et vérifiez que les imports utilisent les path aliases:

```typescript
// ✅ BON
import { useAuthStore } from '@/core/auth';
import { ProtectedRoute } from '@/core/components';
import LoginPage from '@/features/auth/pages/LoginPage';

// ❌ MAUVAIS
import { useAuthStore } from './core/auth';
import { ProtectedRoute } from './components/ProtectedRoute';
```

### 3.2 Vérifier les Layouts

Vérifiez `src/layouts/MobileLayout.tsx` et `src/layouts/DesktopLayout.tsx`:

```typescript
// ✅ BON
import BottomNavigation from '@/core/components/BottomNavigation';

// ❌ MAUVAIS
import BottomNavigation from '../components/BottomNavigation';
```

### 3.3 Vérifier les fichiers de services

Ouvrez quelques services migrés et vérifiez les imports:

**Exemple: `features/dashboard/services/dashboardService.ts`**
```typescript
// ✅ BON
import { apiClient } from '@/core/api/client';
import type { User } from '@/core/types';

// ❌ MAUVAIS
import { apiClient } from '../../services/api';
```

---

## 🧪 ÉTAPE 4: Tester l'Application (10 min)

### 4.1 Compiler l'application

```powershell
npm run build
```

**Si des erreurs apparaissent:**
- Notez les fichiers concernés
- Vérifiez les imports dans ces fichiers
- Corrigez manuellement si nécessaire

### 4.2 Lancer l'application en mode dev

```powershell
npm run dev
```

### 4.3 Tester les fonctionnalités principales

- [ ] Login fonctionne
- [ ] Dashboard s'affiche
- [ ] Navigation fonctionne
- [ ] Les pages se chargent correctement
- [ ] Pas d'erreurs dans la console

---

## 🧹 ÉTAPE 5: Nettoyage (5 min)

### 5.1 Supprimer les fichiers backup (si tout fonctionne)

```powershell
# Lister les fichiers backup
Get-ChildItem -Path src -Recurse -Filter "*.backup"

# Supprimer tous les fichiers backup
Get-ChildItem -Path src -Recurse -Filter "*.backup" | Remove-Item
```

### 5.2 Supprimer AuthContext (si vous utilisez authStore)

Si votre application utilise `authStore.ts` et non `AuthContext.tsx`:

```powershell
# Vérifier que authStore est utilisé partout
# Puis supprimer AuthContext
Remove-Item src\contexts\AuthContext.tsx
Remove-Item src\contexts -Recurse -Force  # Si le dossier est vide
```

### 5.3 Vérifier les dossiers vides

```powershell
# Supprimer les dossiers vides restants
$emptyDirs = @("src\services", "src\components", "src\store", "src\types", "src\contexts")
foreach ($dir in $emptyDirs) {
    if (Test-Path $dir) {
        $items = Get-ChildItem $dir
        if ($items.Count -eq 0) {
            Remove-Item $dir -Recurse -Force
            Write-Host "✓ Supprimé: $dir"
        }
    }
}
```

---

## 📊 ÉTAPE 6: Vérification Finale (5 min)

### 6.1 Vérifier la structure finale

Votre structure devrait ressembler à:

```
src/
├── core/
│   ├── api/
│   │   ├── client.ts
│   │   ├── api.ts          ← Nouveau
│   │   └── index.ts
│   ├── auth/
│   │   ├── authService.ts
│   │   ├── authStore.ts
│   │   └── index.ts
│   ├── components/
│   │   ├── BottomNavigation.tsx
│   │   ├── ProtectedRoute.tsx
│   │   ├── Map.tsx         ← Nouveau
│   │   └── index.ts
│   └── types/
│       └── index.ts
├── features/
│   ├── dashboard/
│   │   └── services/
│   │       ├── dashboardService.ts  ← Nouveau
│   │       └── index.ts             ← Nouveau
│   ├── pdv/
│   │   └── services/
│   │       ├── outletsService.ts    ← Nouveau
│   │       └── index.ts             ← Nouveau
│   ├── routes/
│   │   └── services/
│   │       ├── routesService.ts     ← Nouveau
│   │       └── index.ts             ← Nouveau
│   ├── territories/
│   │   ├── services/
│   │   │   ├── territoriesService.ts ← Nouveau
│   │   │   └── index.ts              ← Nouveau
│   │   └── store/
│   │       └── territoriesStore.ts   ← Nouveau
│   └── users/
│       └── services/
│           ├── usersService.ts       ← Nouveau
│           └── index.ts              ← Nouveau
└── layouts/
```

### 6.2 Vérifier qu'il n'y a plus de:

- [ ] Dossier `src/services/`
- [ ] Dossier `src/components/` (sauf si vous avez d'autres composants)
- [ ] Dossier `src/store/`
- [ ] Dossier `src/contexts/` (si vous utilisez authStore)
- [ ] Imports relatifs avec `../` ou `../../`

### 6.3 Commit final

```powershell
git add .
git commit -m "Migration vers architecture feature-based terminée"
```

---

## 🎯 Résultat Final

### Avant (Note: 6.5/10)
```
src/
├── components/      ← Mélangé
├── services/        ← Tout au même endroit
├── store/           ← Fragmenté
├── types/           ← Dupliqué
└── core/            ← Partiellement utilisé
```

### Après (Note: 8/10)
```
src/
├── core/            ← Infrastructure centralisée
│   ├── api/
│   ├── auth/
│   ├── components/
│   └── types/
└── features/        ← Modules métier isolés
    ├── dashboard/
    ├── pdv/
    ├── routes/
    ├── territories/
    └── users/
```

---

## 🆘 En Cas de Problème

### Problème: Erreurs de compilation après migration

**Solution:**
```powershell
# Nettoyer le cache
rm -r node_modules/.vite
npm run dev
```

### Problème: Imports non trouvés

**Solution:**
1. Vérifiez que `tsconfig.app.json` contient les path aliases
2. Redémarrez VSCode
3. Vérifiez l'import exact dans le fichier source

### Problème: L'application ne démarre pas

**Solution:**
```powershell
# Annuler la migration
git reset --hard HEAD~1

# Ou restaurer les fichiers backup
Get-ChildItem -Path src -Recurse -Filter "*.backup" | ForEach-Object {
    $original = $_.FullName -replace '\.backup$', ''
    Move-Item $_.FullName $original -Force
}
```

---

## 📞 Support

Si vous rencontrez des problèmes:

1. Vérifiez les logs du script
2. Consultez les fichiers `.backup` créés
3. Vérifiez que tous les path aliases sont configurés dans `tsconfig.app.json`

---

## 🎉 Félicitations !

Vous avez migré avec succès vers une architecture feature-based scalable !

**Prochaines étapes recommandées:**
1. Ajouter des tests unitaires
2. Implémenter le lazy loading
3. Créer un ErrorBoundary
4. Documenter les nouvelles features

**Note de scalabilité:** 8/10 → Vous pouvez maintenant gérer 20-30 features facilement ! 🚀
