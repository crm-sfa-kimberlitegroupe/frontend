# Architecture du Projet SFA - Feature-Based

## 📁 Structure des Dossiers

```
src/
├── core/                           # Infrastructure et code partagé
│   ├── api/                        # Configuration API de base
│   │   ├── client.ts              # Client API générique
│   │   └── index.ts
│   ├── auth/                       # Authentification globale
│   │   ├── authService.ts         # Service d'authentification
│   │   ├── authStore.ts           # Store Zustand pour l'auth
│   │   └── index.ts
│   ├── components/                 # Composants UI réutilisables
│   │   ├── ProtectedRoute.tsx    # Route protégée
│   │   ├── BottomNavigation.tsx  # Navigation mobile
│   │   └── index.ts
│   ├── types/                      # Types TypeScript globaux
│   │   └── index.ts               # User, KPI, Visit, PDV, etc.
│   └── index.ts                    # Export central du core
│
├── features/                       # Modules métier (features)
│   ├── auth/                       # Feature: Authentification
│   │   ├── pages/
│   │   │   ├── LoginPage.tsx
│   │   │   ├── RegisterPage.tsx
│   │   │   ├── ForgotPasswordPage.tsx
│   │   │   └── ResetPasswordPage.tsx
│   │   └── index.ts
│   │
│   ├── dashboard/                  # Feature: Tableau de bord
│   │   ├── components/
│   │   ├── pages/
│   │   │   ├── HomePage.tsx
│   │   │   ├── DashboardREP.tsx
│   │   │   ├── DashboardADMIN.tsx
│   │   │   └── DashboardSUP.tsx
│   │   ├── services/
│   │   │   └── dashboardService.ts
│   │   └── index.ts
│   │
│   ├── visits/                     # Feature: Visites
│   │   ├── pages/
│   │   │   ├── VisitsPage.tsx     # Router par rôle
│   │   │   ├── VisitsREP.tsx
│   │   │   └── VisitsADMIN.tsx
│   │   ├── components/             # Composants spécifiques aux visites
│   │   ├── types/                  # Types spécifiques
│   │   └── index.ts
│   │
│   ├── routes/                     # Feature: Itinéraires
│   │   ├── pages/
│   │   │   ├── RouteREP.tsx
│   │   │   ├── RouteADMIN.tsx
│   │   │   └── RouteSUP.tsx
│   │   └── index.ts
│   │
│   ├── data/                       # Feature: Données/Analytics
│   │   ├── pages/
│   │   │   ├── DataPage.tsx
│   │   │   ├── DataREP.tsx
│   │   │   ├── DataADMIN.tsx
│   │   │   └── DataSUP.tsx
│   │   └── index.ts
│   │
│   ├── profile/                    # Feature: Profil utilisateur
│   │   ├── pages/
│   │   │   └── ProfilePage.tsx
│   │   ├── components/
│   │   └── index.ts
│   │
│   ├── team/                       # Feature: Gestion d'équipe
│   │   ├── pages/
│   │   │   └── TeamPage.tsx
│   │   └── index.ts
│   │
│   └── territories/                # Feature: Territoires
│       ├── services/
│       │   └── territoriesService.ts
│       ├── store/
│       │   └── territoriesStore.ts
│       └── index.ts
│
├── layouts/                        # Layouts de l'application
│   ├── LayoutRouter.tsx
│   ├── MobileLayout.tsx
│   └── DesktopLayout.tsx
│
├── assets/                         # Ressources statiques
│
├── App.tsx                         # Point d'entrée de l'app
├── main.tsx                        # Point d'entrée React
└── index.css                       # Styles globaux
```

## 🎯 Principes de l'Architecture

### 1. **Séparation Core / Features**
- **core/** : Code partagé, infrastructure, utilitaires
- **features/** : Modules métier isolés et autonomes

### 2. **Feature-Based Organization**
Chaque feature contient :
- `pages/` : Composants de page
- `components/` : Composants UI spécifiques à la feature
- `services/` : Logique métier et appels API
- `types/` : Types TypeScript spécifiques
- `hooks/` : Hooks React personnalisés
- `store/` : State management local (si nécessaire)
- `index.ts` : Exports publics de la feature

### 3. **Path Aliases**
Utilisation d'alias pour des imports propres :
```typescript
import { useAuthStore } from '@/core/auth';
import { VisitsPage } from '@/features/visits';
import { MobileLayout } from '@/layouts';
```

### 4. **Isolation des Features**
- Chaque feature est **autonome** et peut être développée indépendamment
- Les features ne doivent **jamais** importer directement d'autres features
- Communication entre features via le **core** ou via **props/events**

### 5. **Types Partagés**
- Types globaux dans `core/types/`
- Types spécifiques à une feature dans `features/[feature]/types/`

## 📦 Imports Recommandés

### ✅ Bon
```typescript
// Dans une feature
import { User, UserRole } from '@/core/types';
import { useAuthStore } from '@/core/auth';
import { apiClient } from '@/core/api';

// Export depuis une feature
export { VisitsPage } from './pages/VisitsPage';
```

### ❌ Mauvais
```typescript
// Ne pas importer directement d'autres features
import { TeamPage } from '@/features/team'; // ❌

// Ne pas utiliser des chemins relatifs profonds
import { User } from '../../../core/types'; // ❌
```

## 🔄 Migration depuis l'Ancienne Structure

### Avant
```
src/
├── pages/
├── components/
├── services/
├── store/
└── types/
```

### Après
```
src/
├── core/
│   ├── api/
│   ├── auth/
│   ├── components/
│   └── types/
└── features/
    ├── auth/
    ├── visits/
    ├── routes/
    └── ...
```

## 🚀 Avantages

1. **Scalabilité** : Facile d'ajouter de nouvelles features
2. **Maintenabilité** : Code organisé par domaine métier
3. **Collaboration** : Équipes peuvent travailler sur des features séparées
4. **Testabilité** : Features isolées = tests plus simples
5. **Réutilisabilité** : Core partagé entre toutes les features
6. **Performance** : Lazy loading possible par feature

## 📝 Conventions de Nommage

- **Fichiers** : PascalCase pour les composants (`LoginPage.tsx`)
- **Dossiers** : kebab-case ou camelCase (`auth/`, `territories/`)
- **Exports** : Named exports préférés, default export pour les pages
- **Types** : PascalCase (`User`, `UserRole`)
- **Services** : camelCase avec suffix Service (`authService`)
- **Stores** : camelCase avec prefix use (`useAuthStore`)

## 🔧 Configuration

### tsconfig.app.json
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/core/*": ["src/core/*"],
      "@/features/*": ["src/features/*"],
      "@/assets/*": ["src/assets/*"],
      "@/layouts/*": ["src/layouts/*"]
    }
  }
}
```

### vite.config.ts
```typescript
export default defineConfig({
  resolve: {
    alias: {
      '@/core': path.resolve(__dirname, './src/core'),
      '@/features': path.resolve(__dirname, './src/features'),
      '@/assets': path.resolve(__dirname, './src/assets'),
      '@/layouts': path.resolve(__dirname, './src/layouts'),
    },
  },
});
```

## 📚 Ressources

- [Feature-Sliced Design](https://feature-sliced.design/)
- [React Architecture Best Practices](https://react.dev/)
- [TypeScript Path Mapping](https://www.typescriptlang.org/docs/handbook/module-resolution.html)
