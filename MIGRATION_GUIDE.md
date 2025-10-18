# Guide de Migration - Architecture Feature-Based

## ✅ Étapes Complétées

### 1. Structure Core Créée
- ✅ `core/api/` - Client API générique
- ✅ `core/auth/` - Service et store d'authentification
- ✅ `core/components/` - Composants partagés (ProtectedRoute, BottomNavigation)
- ✅ `core/types/` - Types TypeScript globaux

### 2. Configuration
- ✅ Path aliases configurés dans `tsconfig.app.json`
- ✅ Alias Vite configurés dans `vite.config.ts`
- ✅ Documentation architecture créée (`ARCHITECTURE.md`)

### 3. Structure Features Initialisée
- ✅ `features/auth/` - Pages d'authentification
- ✅ `features/visits/` - Structure créée
- ✅ Fichiers index.ts pour exports

## 🔄 Étapes Restantes

### Phase 1: Copier les Pages Existantes

#### Features Auth
```bash
# Déjà fait:
- features/auth/pages/LoginPage.tsx ✅

# À faire:
- Copier RegisterPage.tsx
- Copier ForgotPasswordPage.tsx  
- Copier ResetPasswordPage.tsx
```

#### Features Visits
```bash
# À copier depuis src/pages/visits/
- VisitsREP.tsx → features/visits/pages/VisitsREP.tsx
- VisitsADMIN.tsx → features/visits/pages/VisitsADMIN.tsx
- VisitsPage.tsx → features/visits/pages/VisitsPage.tsx
```

#### Features Routes
```bash
# À copier depuis src/pages/route/
- RouteREP.tsx → features/routes/pages/RouteREP.tsx
- RouteADMIN.tsx → features/routes/pages/RouteADMIN.tsx
- RouteSUP.tsx → features/routes/pages/RouteSUP.tsx
```

#### Features Data
```bash
# À copier depuis src/pages/data/
- DataREP.tsx → features/data/pages/DataREP.tsx
- DataADMIN.tsx → features/data/pages/DataADMIN.tsx
- DataSUP.tsx → features/data/pages/DataSUP.tsx
- DataPage.tsx → features/data/pages/DataPage.tsx
```

#### Features Profile
```bash
# À copier depuis src/pages/profile/
- ProfilePageNew.tsx → features/profile/pages/ProfilePage.tsx
- components/ → features/profile/components/
```

#### Features Dashboard
```bash
# À copier depuis src/pages/
- HomePage.tsx → features/dashboard/pages/HomePage.tsx
- DashboardHome.tsx → features/dashboard/pages/DashboardHome.tsx
- home/ → features/dashboard/components/
```

#### Features Team
```bash
# À copier depuis src/pages/desktop/
- TeamPage.tsx → features/team/pages/TeamPage.tsx
```

### Phase 2: Migrer les Services

```bash
# Services à migrer:
- dashboardService.ts → features/dashboard/services/
- territoriesService.ts → features/territories/services/
- usersService.ts → features/team/services/ ou core/services/
```

### Phase 3: Migrer les Stores

```bash
# Stores à migrer:
- territoriesStore.ts → features/territories/store/
```

### Phase 4: Copier les Layouts

```bash
# À copier depuis src/layouts/
- LayoutRouter.tsx → layouts/LayoutRouter.tsx
- MobileLayout.tsx → layouts/MobileLayout.tsx (si existe)
- DesktopLayout.tsx → layouts/DesktopLayout.tsx (si existe)
```

### Phase 5: Mettre à Jour App.tsx

Remplacer les imports:
```typescript
// Ancien
import { useAuthStore } from './store/authStore';
import LoginPage from './pages/LoginPage';

// Nouveau
import { useAuthStore } from '@/core/auth';
import { LoginPage } from '@/features/auth';
```

### Phase 6: Mettre à Jour les Imports dans Tous les Fichiers

Pattern de remplacement:
```typescript
// Remplacer
import { User } from '../types';
import { useAuthStore } from '../store/authStore';
import { authService } from '../services/authService';

// Par
import { User } from '@/core/types';
import { useAuthStore } from '@/core/auth';
import { authService } from '@/core/auth';
```

## 📋 Checklist de Migration

### Core
- [x] core/api/client.ts
- [x] core/auth/authService.ts
- [x] core/auth/authStore.ts
- [x] core/components/ProtectedRoute.tsx
- [x] core/components/BottomNavigation.tsx
- [x] core/types/index.ts

### Features - Auth
- [x] features/auth/pages/LoginPage.tsx
- [ ] features/auth/pages/RegisterPage.tsx
- [ ] features/auth/pages/ForgotPasswordPage.tsx
- [ ] features/auth/pages/ResetPasswordPage.tsx

### Features - Visits
- [ ] features/visits/pages/VisitsPage.tsx
- [ ] features/visits/pages/VisitsREP.tsx
- [ ] features/visits/pages/VisitsADMIN.tsx

### Features - Routes
- [ ] features/routes/pages/RouteREP.tsx
- [ ] features/routes/pages/RouteADMIN.tsx
- [ ] features/routes/pages/RouteSUP.tsx

### Features - Data
- [ ] features/data/pages/DataPage.tsx
- [ ] features/data/pages/DataREP.tsx
- [ ] features/data/pages/DataADMIN.tsx
- [ ] features/data/pages/DataSUP.tsx

### Features - Profile
- [ ] features/profile/pages/ProfilePage.tsx
- [ ] features/profile/components/

### Features - Dashboard
- [ ] features/dashboard/pages/HomePage.tsx
- [ ] features/dashboard/services/dashboardService.ts

### Features - Team
- [ ] features/team/pages/TeamPage.tsx

### Features - Territories
- [ ] features/territories/services/territoriesService.ts
- [ ] features/territories/store/territoriesStore.ts

### Layouts
- [ ] layouts/LayoutRouter.tsx

### App
- [ ] App.tsx - Mettre à jour les imports

## 🔧 Commandes Utiles

### Rechercher tous les imports à mettre à jour
```bash
# Chercher les imports relatifs
grep -r "from '\.\." src/features/

# Chercher les imports de types
grep -r "from.*types" src/features/

# Chercher les imports d'auth
grep -r "from.*authStore" src/
```

### Tester après migration
```bash
npm run dev
npm run build
npm run lint
```

## ⚠️ Points d'Attention

1. **Imports Circulaires** : Éviter que core importe depuis features
2. **Path Aliases** : Toujours utiliser `@/core` et `@/features`
3. **Types** : Vérifier que tous les types sont bien exportés
4. **Services** : S'assurer que les services sont correctement réexportés
5. **Layouts** : Vérifier les imports dans LayoutRouter

## 🎯 Prochaines Étapes Immédiates

1. Copier toutes les pages manquantes dans features/
2. Mettre à jour tous les imports pour utiliser les path aliases
3. Tester chaque feature individuellement
4. Mettre à jour App.tsx avec les nouveaux imports
5. Supprimer les anciens fichiers après validation

## 📞 Support

En cas de problème :
- Vérifier ARCHITECTURE.md pour les conventions
- Vérifier que les path aliases sont bien configurés
- Vérifier les exports dans les fichiers index.ts
