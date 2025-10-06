# Configuration des Variables d'Environnement

## Problème Résolu

Le frontend utilisait `http://localhost:3000` en production au lieu de `https://backendsfa.onrender.com`.

## Solution

### 1. Créer le fichier `.env.production`

**IMPORTANT**: Ce fichier doit être créé manuellement car il est dans `.gitignore` pour des raisons de sécurité.

Créez le fichier `.env.production` à la racine du frontend avec le contenu suivant:

```env
# Configuration pour la production
# Ce fichier est utilisé lors du build de production

# URL de l'API backend en production (Render)
VITE_API_URL=https://backendsfa.onrender.com/api
```

### 2. Commandes pour créer le fichier

**Windows (PowerShell)**:
```powershell
cd FrontendSFA/frontend
@"
# Configuration pour la production
VITE_API_URL=https://backendsfa.onrender.com/api
"@ | Out-File -FilePath .env.production -Encoding UTF8
```

**Linux/Mac**:
```bash
cd FrontendSFA/frontend
cat > .env.production << 'EOF'
# Configuration pour la production
VITE_API_URL=https://backendsfa.onrender.com/api
EOF
```

### 3. Vérification

Les fichiers suivants utilisent correctement la variable d'environnement:

- ✅ `src/services/api.ts` - Ligne 1: `const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';`
- ✅ `src/services/authService.ts` - Ligne 3: `const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';`

### 4. Fichiers d'environnement disponibles

- `.env.development` - Utilisé en développement local (localhost:3000)
- `.env.production.example` - Template pour la production
- `.env.production` - **À CRÉER** - Utilisé lors du build de production

### 5. Rebuild après création

Après avoir créé `.env.production`, vous devez rebuilder le frontend:

```bash
cd FrontendSFA/frontend
npm run build
```

### 6. Configuration Vercel (si déployé sur Vercel)

Si vous déployez sur Vercel, ajoutez la variable d'environnement dans les paramètres du projet:

1. Allez dans votre projet Vercel
2. Settings → Environment Variables
3. Ajoutez:
   - **Name**: `VITE_API_URL`
   - **Value**: `https://backendsfa.onrender.com/api`
   - **Environment**: Production

### 7. Vérification du build

Pour vérifier que la variable est correctement utilisée dans le build:

```bash
# Après le build, vérifiez les fichiers générés
grep -r "localhost:3000" dist/
# Ne devrait rien retourner si tout est correct
```

## Notes Importantes

- ⚠️ Le fichier `.env.production` ne doit JAMAIS être commité dans Git
- ⚠️ Chaque environnement de déploiement doit avoir son propre `.env.production`
- ⚠️ Vite charge automatiquement le bon fichier `.env` selon le mode (development/production)
- ⚠️ Les variables doivent commencer par `VITE_` pour être accessibles dans le code frontend
