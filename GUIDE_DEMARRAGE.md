# 🚀 Guide de démarrage - Maquette SFA CRM

## ⚡ Démarrage rapide (5 minutes)

### 1. Installation des dépendances

```bash
cd FrontendSFA/frontend
npm install
```

### 2. Lancer l'application

```bash
npm run dev
```

L'application sera accessible sur **http://localhost:5173**

### 3. Se connecter

Utilisez les identifiants de test existants ou créez un nouveau compte.

## 🎭 Tester les différents rôles

Pour voir les interfaces spécifiques à chaque rôle, modifiez le fichier :

**`src/App.tsx` - ligne 35**

```typescript
// Pour tester le rôle VENDEUR (REP)
const userRole: UserRole = 'REP';

// Pour tester le rôle ADMINISTRATEUR
const userRole: UserRole = 'ADMIN';

// Pour tester le rôle MANAGER (SUP)
const userRole: UserRole = 'SUP';
```

Ou modifiez **`src/pages/MainLayout.tsx` - ligne 7**

## 📱 Navigation dans l'application

### Bottom Navigation (5 onglets)

1. **🏠 Accueil** - `/dashboard`
   - Vue d'ensemble adaptée au rôle
   - KPIs et statistiques

2. **🗺️ Route** - `/dashboard/route`
   - Carte interactive (placeholder)
   - Gestion des itinéraires

3. **📍 Visites** - `/dashboard/visits`
   - Formulaire de visite (REP)
   - Validation PDV (ADMIN)
   - Non accessible pour SUP

4. **📊 Data** - `/dashboard/data`
   - Commandes/Stock (REP)
   - CRUD données (ADMIN)
   - Analytics (SUP)

5. **👤 Profil** - `/dashboard/profile`
   - Page profil complète
   - Paramètres et sécurité

## 🎨 Personnalisation des couleurs

Les couleurs sont définies dans **`tailwind.config.js`** :

```javascript
colors: {
  primary: '#FF7F32',    // Orange CI
  secondary: '#00A86B',  // Vert tropical
  accent: '#2563EB',     // Bleu action
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
}
```

## 📂 Structure des pages par rôle

### REP (Vendeur)
- ✅ Accueil avec résumé journée
- ✅ Route avec carte et itinéraire
- ✅ Visites avec check-in/out
- ✅ Commandes et stock
- ✅ Profil avec performances

### ADMIN (Administrateur)
- ✅ Accueil avec stats système
- ✅ Carte de tous les PDV
- ✅ Validation PDV proposés
- ✅ CRUD produits/users/tâches
- ✅ Profil avec gestion

### SUP (Manager)
- ✅ Dashboard KPIs
- ✅ Heatmap et analytics carte
- ✅ Pas d'accès aux visites
- ✅ Analytics détaillés
- ✅ Profil avec performances équipe

## 🔧 Composants UI disponibles

### Card
```tsx
import Card from '../components/ui/Card';

<Card className="p-4">
  Contenu de la carte
</Card>
```

### Button
```tsx
import Button from '../components/ui/Button';

<Button variant="primary" size="lg" fullWidth>
  Mon bouton
</Button>

// Variants: primary, secondary, success, danger, outline
// Sizes: sm, md, lg
```

### Badge
```tsx
import Badge from '../components/ui/Badge';

<Badge variant="success" size="sm">
  Actif
</Badge>

// Variants: primary, secondary, success, warning, danger, gray
```

### KPICard
```tsx
import KPICard from '../components/ui/KPICard';

<KPICard
  label="Taux de couverture"
  value={87.5}
  unit="%"
  icon="🎯"
  color="success"
  trend={5.2}
/>
```

## 🎯 Fonctionnalités par page

### Page Profil (PRIORITÉ MAXIMALE)

**Sections implémentées :**
1. ✅ En-tête avec photo et infos principales
2. ✅ Informations personnelles (éditables)
3. ✅ Informations professionnelles
4. ✅ Performances (REP/SUP uniquement)
5. ✅ Paramètres (langue, notifications, mode sombre)
6. ✅ Synchronisation (REP uniquement)
7. ✅ Sécurité (changement mot de passe, 2FA)
8. ✅ Support & Légal
9. ✅ Actions (déconnexion, suppression compte)

**Fonctionnalités :**
- ✏️ Édition inline des informations
- 📸 Upload photo de profil
- 🔄 Synchronisation manuelle
- 🔐 Modals pour actions sensibles
- ⚙️ Toggles pour paramètres
- 📊 Jauges de performance

### Page Visites (REP)

**Workflow complet :**
1. Liste des visites du jour
2. Bouton CHECK-IN géolocalisé
3. Formulaire de visite :
   - 📸 Photos merchandising
   - ✅ Checklist Perfect Store
   - 📦 Gestion stock
   - 🛒 Prendre commande
   - 📝 Notes
4. Bouton CHECK-OUT

### Page Data (REP)

**Onglets :**
- 🛒 **Commandes** : Créer et gérer commandes
- 📦 **Stock** : Alertes ruptures et inventaire

**Fonctionnalités :**
- Recherche produits
- Panier avec calcul TTC
- Modes de paiement
- Alertes visuelles

## 🐛 Résolution de problèmes

### L'application ne démarre pas

```bash
# Supprimer node_modules et réinstaller
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Erreurs TypeScript

Les quelques warnings restants sont normaux et seront corrigés lors de l'intégration backend :
- Types `any` dans les settings
- Import du module `VisitsADMIN` (fichier existe)

### La navigation ne fonctionne pas

Vérifiez que vous êtes bien connecté. Si nécessaire, allez sur `/login` et connectez-vous.

### Les couleurs ne s'affichent pas

Assurez-vous que Tailwind CSS est bien configuré :
```bash
npm run dev
```

## 📱 Test sur mobile

### Avec le navigateur
1. Ouvrir les DevTools (F12)
2. Activer le mode responsive
3. Sélectionner un appareil mobile (iPhone SE, iPhone 12, etc.)

### Avec un vrai appareil
1. Trouver votre IP locale : `ipconfig` (Windows) ou `ifconfig` (Mac/Linux)
2. Accéder à `http://[VOTRE_IP]:5173` depuis votre mobile
3. Exemple : `http://192.168.1.100:5173`

## 🎨 Personnalisation

### Ajouter un nouvel onglet

1. Modifier `src/components/BottomNavigation.tsx` :
```typescript
const navItems: NavItem[] = [
  // ... onglets existants
  {
    id: 'nouveau',
    label: 'Nouveau',
    icon: '✨',
    path: '/dashboard/nouveau',
    roles: ['REP', 'ADMIN', 'SUP'],
  },
];
```

2. Créer la page `src/pages/NouveauPage.tsx`

3. Ajouter la route dans `src/App.tsx`

### Modifier les KPIs affichés

Éditez les fichiers dans `src/pages/home/` selon le rôle.

## 📊 Prochaines étapes

### Intégration backend
1. Créer les services API dans `src/services/`
2. Remplacer les mock data par des appels API
3. Gérer l'authentification réelle
4. Implémenter la synchronisation offline

### Fonctionnalités avancées
1. Intégrer OpenStreetMap (Leaflet)
2. Ajouter Chart.js pour les graphiques
3. Implémenter la géolocalisation
4. Ajouter les notifications push
5. Mode offline avec IndexedDB

## 📞 Support

Pour toute question :
- 📧 Email : support@sfacrm.com
- 💬 Slack : #dev-frontend
- 📚 Documentation : `/docs`

## ✅ Checklist de validation

Avant de passer en production :

- [ ] Tous les rôles testés (REP, ADMIN, SUP)
- [ ] Navigation fluide entre les pages
- [ ] Responsive sur mobile (375px - 428px)
- [ ] Formulaires fonctionnels
- [ ] Modals de confirmation
- [ ] Messages de succès/erreur
- [ ] Performance acceptable
- [ ] Pas d'erreurs console critiques

---

**Version de la maquette :** v1.0.0  
**Dernière mise à jour :** 2025-10-05  
**Statut :** ✅ Prêt pour démo
