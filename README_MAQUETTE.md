# 📱 Maquette SFA CRM - Progressive Web App

## 🎯 Vue d'ensemble

Maquette complète et interactive pour l'application **SFA CRM**, une Progressive Web App (PWA) de gestion de force de vente pour le secteur FMCG en Côte d'Ivoire.

## 👥 Types d'utilisateurs

L'application supporte 3 types d'utilisateurs avec des interfaces adaptées :

- **REP (Vendeurs terrain)** : Travaillent en mode offline, font des visites géolocalisées
- **ADMIN (Administrateurs)** : Gèrent le système, valident les données, créent les routes
- **SUP (Managers)** : Consultent les performances et analytics en lecture seule

## 🎨 Système de design

### Couleurs (inspirées du drapeau de Côte d'Ivoire)

```css
--primary: #FF7F32     /* Orange - CI flag */
--secondary: #00A86B   /* Vert tropical */
--accent: #2563EB      /* Bleu action */
--success: #10B981
--warning: #F59E0B
--danger: #EF4444
```

### Mobile-First
- Largeur : 375px (iPhone SE) à 428px (iPhone Pro Max)
- Bottom navigation fixe (60px hauteur)
- Safe area iOS (notch + home indicator)

## 📂 Structure des fichiers

```
src/
├── types/
│   └── index.ts                    # Types TypeScript globaux
├── components/
│   ├── BottomNavigation.tsx        # Navigation principale (5 onglets)
│   └── ui/
│       ├── Card.tsx                # Composant carte réutilisable
│       ├── Button.tsx              # Boutons avec variants
│       ├── Badge.tsx               # Badges de statut
│       └── KPICard.tsx             # Cartes KPI avec tendances
├── pages/
│   ├── MainLayout.tsx              # Layout avec Bottom Nav
│   ├── HomePage.tsx                # Router par rôle
│   ├── RoutePage.tsx               # Router par rôle
│   ├── VisitsPage.tsx              # Router par rôle
│   ├── DataPage.tsx                # Router par rôle
│   ├── ProfilePageNew.tsx          # Page profil complète (PRIORITÉ)
│   ├── home/
│   │   ├── HomeREP.tsx             # Accueil vendeur
│   │   ├── HomeADMIN.tsx           # Accueil admin
│   │   └── HomeSUP.tsx             # Accueil manager
│   ├── route/
│   │   ├── RouteREP.tsx            # Carte/Route vendeur
│   │   ├── RouteADMIN.tsx          # Gestion PDV admin
│   │   └── RouteSUP.tsx            # Analytics carte manager
│   ├── visits/
│   │   ├── VisitsREP.tsx           # Visites vendeur
│   │   └── VisitsADMIN.tsx         # Validation PDV admin
│   └── data/
│       ├── DataREP.tsx             # Commandes/Stock vendeur
│       ├── DataADMIN.tsx           # CRUD données admin
│       └── DataSUP.tsx             # Analytics détaillés manager
└── App.tsx                         # Configuration routing
```

## 🗺️ Navigation (Bottom Navigation - 5 onglets)

### 1. 🏠 ACCUEIL

**Pour REP :**
- Résumé de la journée (X PDV à visiter, Y commandes prises)
- Prochaine visite avec bouton CTA "Démarrer la route"
- Alertes/notifications importantes
- Météo et heure actuelle
- Statut synchronisation (online/offline)

**Pour ADMIN :**
- Statistiques système en temps réel
- Alertes critiques (PDV en attente de validation, tâches urgentes)
- Raccourcis actions fréquentes
- Activité récente du système

**Pour SUP :**
- Dashboard KPIs principaux (couverture, strike rate, ventes du jour)
- Graphiques performances
- Top/Flop vendeurs
- Filtres rapides (territoire, période)

### 2. 🗺️ ROUTE / CARTE

**Pour REP :**
- Carte interactive OpenStreetMap (placeholder)
- Itinéraire du jour avec arrêts numérotés
- PDV de mon territoire (cliquables)
- Bouton "Visite hors routing"
- Légende couleurs (planifié/visité/en cours)
- Estimation temps/distance restants

**Pour ADMIN :**
- Carte de tous les PDV
- Filtres : statut (pending/approved/rejected), canal, segment
- Markers colorés cliquables
- Panel latéral pour validation rapide
- Outils : créer PDV, créer route, affecter vendeur

**Pour SUP :**
- Carte avec positions vendeurs en temps réel (optionnel)
- Heatmap densité visites/ventes
- Clustering intelligent
- Filtres territoire/date
- Export carte en image

### 3. 📍 VISITES (uniquement REP et ADMIN)

**Pour REP :**
- Liste des visites du jour
- Statut de chaque visite (PLANNED/IN_PROGRESS/COMPLETED/SKIPPED)
- Bouton CHECK-IN géolocalisé (gros CTA vert)
- Formulaire visite :
  * Photos merchandising (galerie)
  * Checklist Perfect Store
  * Gestion stock (ajouter ruptures)
  * Prendre commande
  * Notes libres
- Bouton CHECK-OUT
- Historique visites

**Pour ADMIN :**
- Liste PDV proposés par REP (PENDING)
- Cartes de PDV avec photo, adresse, GPS
- Boutons VALIDER (vert) / REJETER (rouge)
- Champ commentaire obligatoire si rejet
- Filtres et recherche

### 4. 📊 DATA

**Pour REP :**
- **Commandes :**
  * Liste commandes (brouillon/confirmée/livrée)
  * Bouton "Nouvelle commande"
  * Recherche produits (autocomplete)
  * Panier avec calcul TTC automatique
  * Modes paiement
- **Stock :**
  * Alertes ruptures
  * Inventaire par PDV visité
  * Seuils d'alerte

**Pour ADMIN :**
- **Onglets horizontaux :**
  * Catalogue produits (CRUD)
  * Utilisateurs (CRUD)
  * Tâches & formulaires
  * Territoires
- Recherche et filtres avancés
- Import CSV
- Activation/désactivation en masse

**Pour SUP :**
- **Analytics détaillés :**
  * Graphiques interactifs (courbes, barres, camemberts)
  * Filtres multiples (territoire, vendeur, période, produit)
  * Tableaux de données
  * KPIs secondaires (DN/DW, OSA, Perfect Store)
  * Comparaisons période N vs N-1
  * Bouton export Excel/CSV

### 5. 👤 PROFIL (TOUS - PRIORITÉ MAXIMALE)

**Structure commune avec 8 sections :**

#### Section 1 : En-tête
- Photo de profil (ronde, cliquable pour changer)
- Nom complet (éditable)
- Rôle (REP/ADMIN/SUP) - badge coloré
- Email (éditable)
- Téléphone (éditable)

#### Section 2 : Informations professionnelles
- Territoire affecté (dropdown si ADMIN)
- Matricule employé (lecture seule)
- Date d'embauche
- Manager/Superviseur
- Statut (Actif/Inactif) - toggle si ADMIN

#### Section 3 : Performances (si REP ou SUP)
- **KPIs personnels (cards)** :
  * Taux de couverture (jauge circulaire)
  * Strike rate (jauge)
  * Nombre de visites ce mois
  * CA généré ce mois
  * Perfect Store score moyen
- Graphique évolution mensuelle
- Badges/achievements (gamification future)

#### Section 4 : Paramètres
- **Langue** : Dropdown (Français, Anglais)
- **Notifications** : Toggles (Push, Email, SMS)
- **Mode sombre** : Toggle
- **Synchronisation auto** : Toggle
- **Géolocalisation** : Toggle (toujours activé pour REP)
- **Qualité photos** : Radio (Haute/Moyenne/Basse)

#### Section 5 : Synchronisation (si REP)
- Statut connexion (Online/Offline) - indicateur coloré
- Dernière sync : Date et heure
- **Données en attente** : Badge nombre
- Bouton "Synchroniser maintenant" (CTA bleu)
- Espace stockage local utilisé
- Bouton "Vider cache"

#### Section 6 : Sécurité
- Changer mot de passe (modal)
- Activer authentification biométrique (si dispo)
- Sessions actives (liste appareils)
- Déconnexion autres sessions

#### Section 7 : Support & Légal
- Tutoriels / Guide utilisateur
- Contacter support (WhatsApp, Email)
- CGU / Politique confidentialité
- Version app (ex: v1.2.3)

#### Section 8 : Actions
- **Bouton "Déconnexion"** (rouge, outline)
- Supprimer compte (danger zone, confirmations multiples)

## 🚀 Démarrage rapide

### Installation

```bash
cd FrontendSFA/frontend
npm install
```

### Lancer en développement

```bash
npm run dev
```

L'application sera accessible sur `http://localhost:5173`

### Changer le rôle utilisateur

Pour tester les différentes vues, modifiez le rôle dans :
- `src/App.tsx` ligne 35 : `const userRole: UserRole = 'REP';`
- Changez en `'ADMIN'` ou `'SUP'` pour voir les autres interfaces

### Build production

```bash
npm run build
```

## 🎯 Fonctionnalités implémentées

### ✅ Complété
- [x] Système de design avec couleurs CI
- [x] Bottom Navigation responsive
- [x] 5 pages principales (Accueil, Route, Visites, Data, Profil)
- [x] Vues spécifiques par rôle (REP, ADMIN, SUP)
- [x] Composants UI réutilisables (Card, Button, Badge, KPICard)
- [x] Page Profil complète avec toutes les sections
- [x] Routing configuré
- [x] Design mobile-first
- [x] Safe area iOS

### 🔄 À implémenter (backend requis)
- [ ] Intégration API backend
- [ ] Authentification réelle
- [ ] Géolocalisation réelle
- [ ] Carte OpenStreetMap interactive
- [ ] Upload de photos
- [ ] Mode offline avec IndexedDB
- [ ] Synchronisation données
- [ ] Notifications push
- [ ] Graphiques interactifs (Chart.js / Recharts)
- [ ] Export Excel/CSV

## 📝 Notes importantes

### Mock Data
Toutes les données sont actuellement en dur (mock data). Pour connecter au backend :
1. Remplacer `const userRole: UserRole = 'REP'` par `user?.role` dans les composants
2. Créer les services API dans `src/services/`
3. Utiliser les stores Zustand pour la gestion d'état
4. Implémenter les appels API

### Types TypeScript
Tous les types sont définis dans `src/types/index.ts` :
- `UserRole` : 'REP' | 'ADMIN' | 'SUP'
- `User`, `Visit`, `PDV`, `Order`, `Product`, etc.

### Responsive
L'application est optimisée pour mobile (375px - 428px) mais fonctionne aussi sur tablette et desktop.

## 🐛 Problèmes connus

1. **Lints TypeScript** : Quelques warnings mineurs sur les types `any` dans les settings - à corriger quand le backend sera prêt
2. **Carte interactive** : Placeholder pour l'instant - nécessite intégration Leaflet/OpenStreetMap
3. **Graphiques** : Placeholders - nécessite Chart.js ou Recharts

## 📞 Support

Pour toute question sur la maquette, contactez l'équipe de développement.

## 📄 Licence

Propriété de SFA CRM - Tous droits réservés
