# Frontend SFA - Documentation

## 🚀 Vue d'ensemble

Application React moderne avec TypeScript, Vite, TailwindCSS et Zustand pour la gestion d'état. Cette application frontend communique avec le backend NestJS pour gérer toutes les fonctionnalités d'authentification avancées.

## 📦 Technologies utilisées

- **React 19** - Framework UI
- **TypeScript** - Typage statique
- **Vite** - Build tool ultra-rapide
- **React Router DOM** - Routage
- **Zustand** - Gestion d'état globale (alternative légère à Redux)
- **Axios** - Client HTTP
- **TailwindCSS** - Framework CSS utility-first
- **QRCode.react** - Génération de QR codes pour 2FA

## 🏗️ Structure du projet

```
src/
├── components/          # Composants réutilisables
│   └── ProtectedRoute.tsx
├── contexts/           # Contextes React (deprecated, remplacé par Zustand)
├── pages/              # Pages de l'application
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   ├── ForgotPasswordPage.tsx
│   ├── ResetPasswordPage.tsx
│   ├── DashboardPage.tsx
│   ├── DashboardHome.tsx
│   ├── ProfilePage.tsx
│   ├── TwoFactorPage.tsx
│   └── SessionsPage.tsx
├── services/           # Services API
│   └── authService.ts
├── store/              # Zustand stores
│   └── authStore.ts
├── App.tsx             # Composant racine avec routage
└── main.tsx            # Point d'entrée
```

## 🎯 Fonctionnalités implémentées

### ✅ Authentification de base
- **Inscription** (`/register`) - Création de compte avec validation
- **Connexion** (`/login`) - Authentification avec email/mot de passe
- **Déconnexion** - Invalidation des tokens

### ✅ Récupération de mot de passe
- **Mot de passe oublié** (`/forgot-password`) - Demande de réinitialisation
- **Réinitialisation** (`/reset-password?token=xxx`) - Nouveau mot de passe avec token

### ✅ Authentification à deux facteurs (2FA)
- **Génération QR code** - Configuration 2FA avec Google Authenticator
- **Activation 2FA** - Vérification et activation
- **Connexion avec 2FA** - Support du code TOTP
- **Désactivation 2FA** - Retour à l'authentification simple

### ✅ Gestion des sessions
- **Déconnexion de tous les appareils** - Révocation de tous les refresh tokens
- **Refresh token automatique** - Renouvellement transparent des tokens expirés

### ✅ Tableau de bord
- **Profil utilisateur** - Affichage des informations
- **Navigation** - Routes protégées avec redirection automatique

## 🔧 Installation et configuration

### 1. Installer les dépendances

```bash
npm install
```

### 2. Configurer l'environnement

Créez un fichier `.env` à la racine du projet :

```bash
cp .env.example .env
```

Modifiez le fichier `.env` :

```env
VITE_API_URL=http://localhost:3000
```

### 3. Lancer l'application

```bash
# Mode développement
npm run dev

# Build production
npm run build

# Preview du build
npm run preview
```

L'application sera accessible sur `http://localhost:5173`

## 🗺️ Routes de l'application

### Routes publiques
- `/login` - Page de connexion
- `/register` - Page d'inscription
- `/forgot-password` - Demande de réinitialisation
- `/reset-password?token=xxx` - Réinitialisation avec token

### Routes protégées (nécessitent authentification)
- `/dashboard` - Tableau de bord principal
- `/dashboard/profile` - Profil utilisateur
- `/dashboard/2fa` - Configuration 2FA
- `/dashboard/sessions` - Gestion des sessions

## 🔐 Gestion de l'authentification avec Zustand

### Store d'authentification

Le store Zustand (`authStore.ts`) gère l'état global de l'authentification :

```typescript
import { useAuthStore } from './store/authStore';

// Dans un composant
function MyComponent() {
  const user = useAuthStore((state) => state.user);
  const login = useAuthStore((state) => state.login);
  const logout = useAuthStore((state) => state.logout);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  
  // Utilisation
  await login(email, password);
  await logout();
}
```

### Actions disponibles

- `login(email, password, twoFactorCode?)` - Connexion
- `register(email, password, firstName, lastName)` - Inscription
- `logout()` - Déconnexion
- `loadUser()` - Charger l'utilisateur depuis le backend
- `setUser(user)` - Définir l'utilisateur manuellement
- `setLoading(loading)` - Gérer l'état de chargement

### Persistance

Le store utilise `zustand/middleware/persist` pour sauvegarder l'utilisateur dans le localStorage.

## 📡 Service API

Le service `authService.ts` gère toutes les communications avec le backend :

### Intercepteurs Axios

- **Request interceptor** : Ajoute automatiquement le token JWT à chaque requête
- **Response interceptor** : Gère le refresh automatique des tokens expirés

### Méthodes disponibles

```typescript
import { authService } from './services/authService';

// Authentification
await authService.register(email, password, firstName, lastName);
await authService.login(email, password, twoFactorCode?);
await authService.logout();
await authService.logoutAll();

// Récupération de mot de passe
await authService.forgotPassword(email);
await authService.resetPassword(token, newPassword);

// 2FA
await authService.generate2FA();
await authService.enable2FA(code);
await authService.verify2FA(code);
await authService.disable2FA();

// Profil
await authService.getProfile();

// Utilitaires
authService.isAuthenticated();
authService.getCurrentUser();
```

## 🎨 Composants UI

### ProtectedRoute

Composant pour protéger les routes nécessitant une authentification :

```tsx
<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <DashboardPage />
    </ProtectedRoute>
  }
/>
```

Fonctionnalités :
- Affiche un loader pendant la vérification
- Redirige vers `/login` si non authentifié
- Affiche le contenu si authentifié

## 🔄 Flux d'authentification

### 1. Connexion simple

```
User → LoginPage → authStore.login() → authService.login() → Backend
                                                              ↓
User ← Dashboard ← Navigate ← Set user in store ← Response ←
```

### 2. Connexion avec 2FA

```
User → LoginPage → authStore.login() → authService.login() → Backend
                                                              ↓
                                        requiresTwoFactor ←
                                                ↓
User → Enter 2FA code → authStore.login(with code) → Backend
                                                        ↓
User ← Dashboard ← Navigate ← Set user in store ← Response ←
```

### 3. Refresh token automatique

```
API Request → 401 Unauthorized → Interceptor → Refresh token API
                                                      ↓
                                    New tokens ← Response
                                         ↓
                        Retry original request with new token
```

## 🧪 Tests et développement

### Linting

```bash
npm run lint
```

### Build

```bash
npm run build
```

### Type checking

```bash
npx tsc --noEmit
```

## 🚀 Déploiement

### Variables d'environnement en production

Assurez-vous de configurer `VITE_API_URL` avec l'URL de votre backend en production.

### Build optimisé

```bash
npm run build
```

Les fichiers de production seront dans le dossier `dist/`.

## 📝 Notes importantes

1. **Tokens** : Les tokens JWT sont stockés dans le localStorage
2. **Sécurité** : Les routes protégées vérifient l'authentification avant le rendu
3. **Refresh automatique** : Les tokens expirés sont automatiquement renouvelés
4. **2FA** : Le QR code est généré côté backend et affiché dans une image base64
5. **Zustand** : Plus léger et performant que Redux, pas de boilerplate

## 🐛 Dépannage

### Le frontend ne se connecte pas au backend

Vérifiez que :
- Le backend est démarré sur le port 3000
- `VITE_API_URL` est correctement configuré dans `.env`
- CORS est activé sur le backend

### Erreur 401 persistante

- Vérifiez que les tokens sont bien stockés dans le localStorage
- Essayez de vous déconnecter et reconnecter
- Vérifiez que le JWT_SECRET du backend n'a pas changé

### Le 2FA ne fonctionne pas

- Assurez-vous que l'horloge de votre serveur est synchronisée
- Vérifiez que le code TOTP est valide (fenêtre de 30 secondes)
- Testez avec Google Authenticator ou Authy

## 📚 Ressources

- [React Documentation](https://react.dev/)
- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [React Router](https://reactrouter.com/)
- [TailwindCSS](https://tailwindcss.com/)
- [Vite](https://vitejs.dev/)
