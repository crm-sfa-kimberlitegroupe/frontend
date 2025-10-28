import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distDir = path.join(__dirname, '..', 'dist');

// Créer un fichier .htaccess pour Apache ou un _headers pour Netlify
const htaccessContent = `
# Force MIME types for JavaScript files
<FilesMatch "\\.js$">
    Header set Content-Type "application/javascript; charset=utf-8"
</FilesMatch>

<FilesMatch "\\.mjs$">
    Header set Content-Type "application/javascript; charset=utf-8"
</FilesMatch>

<FilesMatch "\\.css$">
    Header set Content-Type "text/css; charset=utf-8"
</FilesMatch>

<FilesMatch "\\.json$">
    Header set Content-Type "application/json; charset=utf-8"
</FilesMatch>

# Cache control
<FilesMatch "\\.(js|css|png|jpg|jpeg|gif|svg|ico)$">
    Header set Cache-Control "public, max-age=31536000"
</FilesMatch>

# Fallback for SPA
RewriteEngine On
RewriteRule ^(?!.*\\.).*$ /index.html [L]
`;

const netlifyHeaders = `
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff

/*.js
  Content-Type: application/javascript; charset=utf-8

/*.mjs  
  Content-Type: application/javascript; charset=utf-8

/*.css
  Content-Type: text/css; charset=utf-8

/*.json
  Content-Type: application/json; charset=utf-8

/manifest.json
  Content-Type: application/manifest+json; charset=utf-8
`;

function createConfigFiles() {
  console.log('🔧 Création des fichiers de configuration serveur...');
  
  // Créer .htaccess pour Apache
  const htaccessPath = path.join(distDir, '.htaccess');
  fs.writeFileSync(htaccessPath, htaccessContent.trim());
  console.log('✅ Fichier .htaccess créé');
  
  // Créer _headers pour Netlify
  const headersPath = path.join(distDir, '_headers');
  fs.writeFileSync(headersPath, netlifyHeaders.trim());
  console.log('✅ Fichier _headers créé');
  
  // Créer _redirects pour Netlify SPA
  const redirectsPath = path.join(distDir, '_redirects');
  const redirectsContent = '/*    /index.html   200';
  fs.writeFileSync(redirectsPath, redirectsContent);
  console.log('✅ Fichier _redirects créé');
}

// Exécuter si le dossier dist existe
if (fs.existsSync(distDir)) {
  createConfigFiles();
} else {
  console.warn('⚠️ Dossier dist non trouvé. Assurez-vous de lancer ce script après le build.');
}
