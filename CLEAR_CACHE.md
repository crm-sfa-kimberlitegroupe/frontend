# 🧹 Guide de Nettoyage du Cache

## Problème Résolu
Les modifications du frontend n'étaient pas prises en compte à cause de :
1. **Duplication des stores** (`store/authStore.ts` et `core/auth/authStore.ts`)
2. **Cache localStorage** contenant d'anciennes données

## ✅ Corrections Appliquées
- ✅ Suppression du store dupliqué dans `src/store/authStore.ts`
- ✅ Mise à jour de tous les imports pour utiliser `core/auth`
- ✅ Centralisation du store dans `src/core/auth/authStore.ts`

## 🔧 Pour Appliquer les Modifications

### Méthode 1 : Nettoyer le localStorage (Recommandé)

**Dans la console du navigateur (F12) :**
```javascript
// Vider tout le localStorage
localStorage.clear();

// Ou supprimer uniquement le store auth
localStorage.removeItem('auth-storage');

// Recharger la page
location.reload();
```

### Méthode 2 : Mode Incognito
1. Ouvrir une fenêtre de navigation privée
2. Tester l'application (pas de cache)

### Méthode 3 : Vider le cache du navigateur
1. **Chrome/Edge** : `Ctrl + Shift + Delete`
2. Cocher "Cookies et données de sites"
3. Cliquer sur "Effacer les données"

## 🎯 Vérification

Après le nettoyage, vérifiez que :
- [ ] Vous pouvez vous connecter
- [ ] Les modifications du code sont visibles
- [ ] Le store fonctionne correctement

## 📝 Pour les Développeurs

**Éviter ce problème à l'avenir :**

1. **Ne jamais dupliquer les stores**
2. **Utiliser un seul point d'import** : `import { useAuthStore } from '@/core/auth'`
3. **Changer le nom du store** si vous refactorisez :
   ```typescript
   persist(..., {
     name: 'auth-storage-v2', // Nouveau nom = nouveau cache
   })
   ```

## 🚨 Si le Problème Persiste

1. Vérifier que tous les imports utilisent `core/auth` :
   ```bash
   # Dans le terminal
   grep -r "from.*store/authStore" src/
   # Devrait retourner 0 résultats
   ```

2. Supprimer `node_modules/.vite` (cache Vite) :
   ```bash
   rm -rf node_modules/.vite
   npm run dev
   ```

3. Hard refresh du navigateur :
   - **Windows** : `Ctrl + Shift + R`
   - **Mac** : `Cmd + Shift + R`
