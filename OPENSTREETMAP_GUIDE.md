# Guide d'implémentation OpenStreetMap

## 📍 Implémentation réussie

OpenStreetMap a été intégré avec succès dans votre projet via **React Leaflet**.

## 🎯 Fonctionnalités

### Dans le formulaire d'enregistrement de PDV (Point De Vente)

Lorsque vous enregistrez un nouveau point de vente dans l'étape 2 du formulaire :

1. **Capture de position GPS** : Cliquez sur "Utiliser ma position actuelle" pour obtenir automatiquement vos coordonnées GPS
2. **Visualisation sur carte** : Une carte OpenStreetMap s'affiche automatiquement dès que les coordonnées sont renseignées
3. **Ajustement de position** : Vous pouvez **déplacer le marqueur** sur la carte pour ajuster précisément la position
4. **Vérification visuelle** : La carte vous permet de vérifier visuellement que vous êtes au bon endroit

## 🗺️ Composant Map réutilisable

Le composant `Map.tsx` peut être réutilisé partout dans votre application :

```tsx
import Map from '../../../components/Map';

<Map
  latitude={5.3599}
  longitude={-4.0083}
  height="300px"
  zoom={15}
  draggableMarker={true}
  onLocationChange={(lat, lng) => {
    console.log('Nouvelle position:', lat, lng);
  }}
  popupText="Mon point de vente"
/>
```

### Props disponibles

- `latitude` (number, requis) : Latitude de la position
- `longitude` (number, requis) : Longitude de la position
- `height` (string, optionnel) : Hauteur de la carte (défaut: "300px")
- `zoom` (number, optionnel) : Niveau de zoom (défaut: 15)
- `draggableMarker` (boolean, optionnel) : Permet de déplacer le marqueur (défaut: false)
- `onLocationChange` (function, optionnel) : Callback appelé quand le marqueur est déplacé
- `popupText` (string, optionnel) : Texte affiché dans la popup du marqueur

## 📦 Dépendances installées

- `leaflet@1.9.4` : Bibliothèque de cartes interactives
- `react-leaflet@5.0.0` : Composants React pour Leaflet
- `@types/leaflet` : Types TypeScript pour Leaflet

## 🚀 Utilisation

### Accéder au formulaire PDV

1. Allez dans la section **Visites**
2. Cliquez sur **"Nouveau PDV"**
3. Remplissez l'étape 1 (Informations de base)
4. Passez à l'étape 2 (Localisation)
5. Cliquez sur **"Utiliser ma position actuelle"**
6. La carte s'affiche automatiquement avec votre position
7. Déplacez le marqueur si nécessaire pour ajuster la position exacte

## 💡 Conseils d'utilisation

- **Précision GPS** : Assurez-vous d'être sur place pour une meilleure précision
- **Marqueur déplaçable** : Vous pouvez affiner la position en déplaçant le marqueur directement sur la carte
- **Zoom** : Utilisez la molette de la souris ou les boutons +/- pour zoomer
- **Navigation** : Cliquez et glissez pour déplacer la carte

## 🔧 Configuration technique

Les styles CSS de Leaflet sont importés globalement dans `main.tsx` :

```tsx
import 'leaflet/dist/leaflet.css'
```

Les icônes des marqueurs sont configurées dans `Map.tsx` pour fonctionner correctement avec Vite.

## 📱 Compatibilité

- ✅ Fonctionne sur desktop et mobile
- ✅ Support de la géolocalisation navigateur
- ✅ Cartes OpenStreetMap gratuites et open-source
- ✅ Pas de clé API nécessaire

## 🌍 Source des cartes

Les cartes proviennent d'OpenStreetMap, un projet collaboratif de cartographie libre.
Attribution : © OpenStreetMap contributors
