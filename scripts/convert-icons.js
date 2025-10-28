const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const iconsDir = path.join(__dirname, '..', 'public', 'icons');
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

async function convertSvgToPng() {
  console.log('🔄 Conversion des icônes SVG vers PNG...');
  
  // Vérifier si sharp est installé
  try {
    require('sharp');
  } catch (error) {
    console.error('❌ Sharp n\'est pas installé. Exécutez: npm install sharp --save-dev');
    process.exit(1);
  }

  for (const size of sizes) {
    const svgPath = path.join(iconsDir, `icon-${size}x${size}.svg`);
    const pngPath = path.join(iconsDir, `icon-${size}x${size}.png`);
    
    if (fs.existsSync(svgPath)) {
      try {
        await sharp(svgPath)
          .resize(size, size)
          .png({
            quality: 90,
            compressionLevel: 9
          })
          .toFile(pngPath);
        
        console.log(`✅ Converti: icon-${size}x${size}.png`);
      } catch (error) {
        console.error(`❌ Erreur lors de la conversion de icon-${size}x${size}.svg:`, error.message);
      }
    } else {
      console.warn(`⚠️  Fichier SVG manquant: icon-${size}x${size}.svg`);
    }
  }
  
  console.log('✅ Conversion terminée!');
}

// Exécuter la conversion
convertSvgToPng().catch(console.error);
