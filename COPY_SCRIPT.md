# Script de Copie des Fichiers

## ✅ Fichiers Déjà Migrés

### Core
- [x] core/api/client.ts
- [x] core/auth/authService.ts
- [x] core/auth/authStore.ts  
- [x] core/components/ProtectedRoute.tsx
- [x] core/components/BottomNavigation.tsx
- [x] core/types/index.ts

### Features - Auth
- [x] features/auth/pages/LoginPage.tsx
- [x] features/auth/pages/RegisterPage.tsx
- [x] features/auth/pages/ForgotPasswordPage.tsx
- [x] features/auth/pages/ResetPasswordPage.tsx

### Features - Visits
- [x] features/visits/pages/VisitsPage.tsx

## 📋 Fichiers à Copier Manuellement

### Étape 1: Copier les fichiers de pages/visits vers features/visits/pages

```bash
# Copier VisitsREP.tsx
src/pages/visits/VisitsREP.tsx → src/features/visits/pages/VisitsREP.tsx

# Copier VisitsADMIN.tsx  
src/pages/visits/VisitsADMIN.tsx → src/features/visits/pages/VisitsADMIN.tsx
```

**Modifications à faire dans ces fichiers:**
- Remplacer `from '../types'` par `from '@/core/types'`
- Remplacer `from '../../components/...'` par les bons chemins
- Vérifier tous les imports relatifs

### Étape 2: Copier les fichiers de pages/route vers features/routes/pages

```bash
src/pages/route/RouteREP.tsx → src/features/routes/pages/RouteREP.tsx
src/pages/route/RouteADMIN.tsx → src/features/routes/pages/RouteADMIN.tsx
src/pages/route/RouteSUP.tsx → src/features/routes/pages/RouteSUP.tsx
```

### Étape 3: Copier les fichiers de pages/data vers features/data/pages

```bash
src/pages/data/DataREP.tsx → src/features/data/pages/DataREP.tsx
src/pages/data/DataADMIN.tsx → src/features/data/pages/DataADMIN.tsx
src/pages/data/DataSUP.tsx → src/features/data/pages/DataSUP.tsx
src/pages/DataPage.tsx → src/features/data/pages/DataPage.tsx
```

### Étape 4: Copier les fichiers de pages/profile vers features/profile

```bash
src/pages/profile/ProfilePageNew.tsx → src/features/profile/pages/ProfilePage.tsx
src/pages/profile/components/ → src/features/profile/components/
```

### Étape 5: Copier les fichiers de pages/home et dashboard vers features/dashboard

```bash
src/pages/HomePage.tsx → src/features/dashboard/pages/HomePage.tsx
src/pages/DashboardHome.tsx → src/features/dashboard/pages/DashboardHome.tsx
src/pages/home/ → src/features/dashboard/components/
```

### Étape 6: Copier les fichiers desktop vers features/team

```bash
src/pages/desktop/TeamPage.tsx → src/features/team/pages/TeamPage.tsx
```

### Étape 7: Copier les services

```bash
src/services/dashboardService.ts → src/features/dashboard/services/dashboardService.ts
src/services/territoriesService.ts → src/features/territories/services/territoriesService.ts
src/services/usersService.ts → src/core/services/usersService.ts (ou features/team/services/)
```

### Étape 8: Copier les stores

```bash
src/store/territoriesStore.ts → src/features/territories/store/territoriesStore.ts
```

### Étape 9: Copier les layouts

```bash
src/layouts/ → layouts/
```

## 🔧 Commandes PowerShell pour Copier

```powershell
# Depuis le dossier frontend/

# Visits
Copy-Item "src/pages/visits/VisitsREP.tsx" "src/features/visits/pages/VisitsREP.tsx"
Copy-Item "src/pages/visits/VisitsADMIN.tsx" "src/features/visits/pages/VisitsADMIN.tsx"

# Routes
New-Item -ItemType Directory -Force -Path "src/features/routes/pages"
Copy-Item "src/pages/route/RouteREP.tsx" "src/features/routes/pages/RouteREP.tsx"
Copy-Item "src/pages/route/RouteADMIN.tsx" "src/features/routes/pages/RouteADMIN.tsx"
Copy-Item "src/pages/route/RouteSUP.tsx" "src/features/routes/pages/RouteSUP.tsx"

# Data
New-Item -ItemType Directory -Force -Path "src/features/data/pages"
Copy-Item "src/pages/data/DataREP.tsx" "src/features/data/pages/DataREP.tsx"
Copy-Item "src/pages/data/DataADMIN.tsx" "src/features/data/pages/DataADMIN.tsx"
Copy-Item "src/pages/data/DataSUP.tsx" "src/features/data/pages/DataSUP.tsx"
Copy-Item "src/pages/DataPage.tsx" "src/features/data/pages/DataPage.tsx"

# Profile
New-Item -ItemType Directory -Force -Path "src/features/profile/pages"
New-Item -ItemType Directory -Force -Path "src/features/profile/components"
Copy-Item "src/pages/profile/ProfilePageNew.tsx" "src/features/profile/pages/ProfilePage.tsx"
Copy-Item "src/pages/profile/components/*" "src/features/profile/components/" -Recurse

# Dashboard
New-Item -ItemType Directory -Force -Path "src/features/dashboard/pages"
New-Item -ItemType Directory -Force -Path "src/features/dashboard/components"
New-Item -ItemType Directory -Force -Path "src/features/dashboard/services"
Copy-Item "src/pages/HomePage.tsx" "src/features/dashboard/pages/HomePage.tsx"
Copy-Item "src/pages/DashboardHome.tsx" "src/features/dashboard/pages/DashboardHome.tsx"
Copy-Item "src/pages/home/*" "src/features/dashboard/components/" -Recurse -ErrorAction SilentlyContinue
Copy-Item "src/services/dashboardService.ts" "src/features/dashboard/services/dashboardService.ts"

# Team
New-Item -ItemType Directory -Force -Path "src/features/team/pages"
Copy-Item "src/pages/desktop/TeamPage.tsx" "src/features/team/pages/TeamPage.tsx" -ErrorAction SilentlyContinue

# Territories
New-Item -ItemType Directory -Force -Path "src/features/territories/services"
New-Item -ItemType Directory -Force -Path "src/features/territories/store"
Copy-Item "src/services/territoriesService.ts" "src/features/territories/services/territoriesService.ts"
Copy-Item "src/store/territoriesStore.ts" "src/features/territories/store/territoriesStore.ts"

# Layouts (copier dans le dossier racine layouts/)
New-Item -ItemType Directory -Force -Path "layouts"
Copy-Item "src/layouts/*" "layouts/" -Recurse
```

## 📝 Après la Copie

1. **Mettre à jour tous les imports** dans les fichiers copiés
2. **Créer les fichiers index.ts** pour chaque feature
3. **Mettre à jour App.tsx** avec les nouveaux imports
4. **Tester** que tout fonctionne
5. **Supprimer** les anciens fichiers après validation

## ⚠️ Important

- Ne pas supprimer les anciens fichiers avant d'avoir testé
- Vérifier que tous les imports sont corrects
- S'assurer que les path aliases fonctionnent
- Tester chaque feature individuellement
