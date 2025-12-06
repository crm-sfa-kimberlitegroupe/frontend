/**
 * Script de test du mode offline
 * Utilisation : node scripts/test-offline.js
 */

const fs = require('fs');
const path = require('path');

console.log('\n=== Test du Mode Offline PWA ===\n');

const tests = [
  {
    name: 'Service Worker',
    check: () => {
      const swPath = path.join(__dirname, '../public/service-worker.js');
      return fs.existsSync(swPath);
    },
    success: 'Service Worker trouvé',
    error: 'Service Worker manquant'
  },
  {
    name: 'Manifest PWA',
    check: () => {
      const manifestPath = path.join(__dirname, '../public/manifest.json');
      if (!fs.existsSync(manifestPath)) return false;
      
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      return manifest.name && manifest.start_url && manifest.display;
    },
    success: 'Manifest PWA valide',
    error: 'Manifest PWA invalide ou manquant'
  },
  {
    name: 'Hook useNetworkStatus',
    check: () => {
      const hookPath = path.join(__dirname, '../src/core/hooks/useNetworkStatus.ts');
      return fs.existsSync(hookPath);
    },
    success: 'Hook useNetworkStatus trouvé',
    error: 'Hook useNetworkStatus manquant'
  },
  {
    name: 'Composant OfflineIndicator',
    check: () => {
      const componentPath = path.join(__dirname, '../src/core/components/OfflineIndicator.tsx');
      return fs.existsSync(componentPath);
    },
    success: 'Composant OfflineIndicator trouvé',
    error: 'Composant OfflineIndicator manquant'
  },
  {
    name: 'Intégration dans App.tsx',
    check: () => {
      const appPath = path.join(__dirname, '../src/App.tsx');
      const content = fs.readFileSync(appPath, 'utf8');
      return content.includes('OfflineIndicator');
    },
    success: 'OfflineIndicator intégré dans App.tsx',
    error: 'OfflineIndicator non intégré dans App.tsx'
  },
  {
    name: 'Enregistrement Service Worker',
    check: () => {
      const mainPath = path.join(__dirname, '../src/main.tsx');
      const content = fs.readFileSync(mainPath, 'utf8');
      return content.includes('serviceWorker') && content.includes('register');
    },
    success: 'Service Worker enregistré dans main.tsx',
    error: 'Service Worker non enregistré dans main.tsx'
  }
];

let passed = 0;
let failed = 0;

tests.forEach((test, index) => {
  try {
    const result = test.check();
    if (result) {
      console.log(`✅ ${index + 1}. ${test.name}: ${test.success}`);
      passed++;
    } else {
      console.log(`❌ ${index + 1}. ${test.name}: ${test.error}`);
      failed++;
    }
  } catch (error) {
    console.log(`❌ ${index + 1}. ${test.name}: Erreur - ${error.message}`);
    failed++;
  }
});

console.log(`\n=== Résultats ===`);
console.log(`Réussis: ${passed}/${tests.length}`);
console.log(`Échoués: ${failed}/${tests.length}`);

if (failed === 0) {
  console.log('\n✨ Tous les tests sont passés! Le mode offline est prêt.\n');
  console.log('Prochaines étapes:');
  console.log('1. npm run build');
  console.log('2. npm run preview');
  console.log('3. Tester en mode offline dans le navigateur (F12 > Network > Offline)\n');
} else {
  console.log('\n⚠️  Certains tests ont échoué. Vérifiez la configuration.\n');
  process.exit(1);
}
