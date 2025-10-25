/**
 * Script pour générer des icônes SVG simples pour la PWA
 * Ces icônes peuvent être remplacées par des icônes personnalisées plus tard
 */

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const iconsDir = join(__dirname, '../public/icons');

// Créer le dossier icons s'il n'existe pas
if (!existsSync(iconsDir)) {
  mkdirSync(iconsDir, { recursive: true });
}

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Générer une icône SVG simple pour chaque taille
sizes.forEach(size => {
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
  <rect width="${size}" height="${size}" fill="#0284c7"/>
  <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" 
        font-family="Arial, sans-serif" font-size="${size * 0.5}" 
        fill="white" font-weight="bold">SFA</text>
</svg>
  `.trim();

  const filename = join(iconsDir, `icon-${size}x${size}.png`);
  
  // Pour une vraie application, vous voudriez convertir le SVG en PNG
  // Pour l'instant, nous sauvegardons en SVG avec l'extension .png
  // Vous devriez utiliser un outil comme sharp ou canvas pour une vraie conversion
  writeFileSync(filename.replace('.png', '.svg'), svg);
  
  console.log(`✓ Icône générée: icon-${size}x${size}.svg`);
});

console.log('\n✅ Toutes les icônes ont été générées!');
console.log('📝 Note: Les icônes sont en format SVG. Pour une PWA production,');
console.log('   convertissez-les en PNG avec un outil comme sharp ou Inkscape.');
