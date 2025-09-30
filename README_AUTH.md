# Frontend - Système d'Authentification

## 🚀 Démarrage

```bash
npm run dev
```

Le frontend sera accessible sur : **http://localhost:5173**

## 📁 Structure du projet

```
src/
├── pages/
│   ├── Login.tsx          # Page de connexion
│   ├── Register.tsx       # Page d'inscription
│   └── Dashboard.tsx      # Page après connexion
├── services/
│   └── api.ts            # Service API pour communiquer avec le backend
├── App.tsx               # Composant principal avec gestion de navigation
└── main.tsx              # Point d'entrée
```

## 🎨 Pages disponibles

### 1. **Page de Connexion** (`Login.tsx`)
- Formulaire avec email et mot de passe
- Validation côté client
- Gestion des erreurs
- Lien vers la page d'inscription

### 2. **Page d'Inscription** (`Register.tsx`)
- Formulaire complet (prénom, nom, email, mot de passe)
- Validation des champs
- Redirection automatique après inscription
- Lien vers la page de connexion

### 3. **Dashboard** (`Dashboard.tsx`)
- Affichage des informations utilisateur
- Bouton de déconnexion
- Interface moderne avec cartes

## 🔌 Communication avec le Backend

Le fichier `src/services/api.ts` contient toutes les fonctions pour communiquer avec le backend :

```typescript
// Connexion
authApi.login({ email, password })

// Inscription
authApi.register({ email, password, firstName, lastName })

// Récupérer le profil (avec token)
authApi.getProfile(token)
```

## 🔐 Gestion de l'authentification

- Le **token JWT** est stocké dans `localStorage`
- Les informations utilisateur sont également sauvegardées
- La session persiste même après rechargement de la page
- La déconnexion supprime toutes les données

## 🎯 Flux d'authentification

1. **Inscription** :
   - Utilisateur remplit le formulaire
   - Données envoyées au backend (`POST /api/auth/register`)
   - Backend retourne un token JWT
   - Redirection vers le Dashboard

2. **Connexion** :
   - Utilisateur entre email/mot de passe
   - Données envoyées au backend (`POST /api/auth/login`)
   - Backend valide et retourne un token
   - Redirection vers le Dashboard

3. **Déconnexion** :
   - Suppression du token et des données utilisateur
   - Redirection vers la page de connexion

## 🎨 Design

- **TailwindCSS** pour le styling
- Design moderne et responsive
- Gradients et animations
- Messages d'erreur clairs
- États de chargement

## ⚙️ Configuration

L'URL du backend est définie dans `src/services/api.ts` :

```typescript
const API_URL = 'http://localhost:3000/api';
```

Modifiez cette URL si votre backend tourne sur un autre port.

## 🔧 Prochaines étapes

Pour améliorer le système :

1. Ajouter React Router pour une vraie navigation
2. Implémenter un système de refresh token
3. Ajouter la validation "Mot de passe oublié"
4. Créer plus de pages protégées
5. Ajouter des tests unitaires
