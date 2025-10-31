import { spawn, exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

console.log('🚀 Démarrage du test PWA...\n');

// Fonction pour exécuter une commande et afficher la sortie
function runCommand(command, args = [], options = {}) {
  return new Promise((resolve, reject) => {
    console.log(`📋 Exécution: ${command} ${args.join(' ')}`);
    
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: true,
      ...options
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Commande échouée avec le code ${code}`));
      }
    });

    child.on('error', (error) => {
      reject(error);
    });
  });
}

// Fonction pour démarrer le serveur et localtunnel en parallèle
async function startServerAndTunnel() {
  console.log('🌐 Démarrage du serveur local sur le port 3000...');
  
  // Démarrer le serveur serve
  const serverProcess = spawn('npx', ['serve', '-s', 'dist', '-l', '3000'], {
    stdio: 'pipe',
    shell: true
  });

  // Attendre que le serveur soit prêt
  await new Promise((resolve) => {
    setTimeout(resolve, 3000); // Attendre 3 secondes pour que le serveur démarre
  });

  console.log('🔗 Création du tunnel HTTPS public...');
  
  // Démarrer localtunnel
  const tunnelProcess = spawn('npx', ['lt', '--port', '3000'], {
    stdio: 'pipe',
    shell: true
  });

  // Capturer l'URL du tunnel
  tunnelProcess.stdout.on('data', (data) => {
    const output = data.toString();
    if (output.includes('https://')) {
      const url = output.match(/(https:\/\/[^\s]+)/);
      if (url) {
        console.log('\n🎉 TUNNEL CRÉÉ AVEC SUCCÈS !');
        console.log('📱 URL pour tester sur votre iPhone:');
        console.log(`🔗 ${url[1]}`);
        console.log('\n📋 Instructions:');
        console.log('1. Ouvrez cette URL sur votre iPhone');
        console.log('2. Testez les fonctionnalités PWA');
        console.log('3. Appuyez sur Ctrl+C pour arrêter les serveurs');
      }
    }
  });

  tunnelProcess.stderr.on('data', (data) => {
    console.log(`Tunnel: ${data}`);
  });

  // Gérer l'arrêt propre
  process.on('SIGINT', () => {
    console.log('\n🛑 Arrêt des serveurs...');
    serverProcess.kill();
    tunnelProcess.kill();
    process.exit(0);
  });

  // Garder le processus en vie
  return new Promise(() => {
    // Ne jamais résoudre pour garder les serveurs actifs
  });
}

async function main() {
  try {
    // Étape 1: Build de l'application
    console.log('🔨 Construction de l\'application...');
    await runCommand('npm', ['run', 'build']);
    console.log('✅ Build terminé avec succès!\n');

    // Étape 2: Démarrer le serveur et le tunnel
    await startServerAndTunnel();

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

main();
