import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { copyFileSync, existsSync } from 'fs'

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  plugins: [
    react(),
    {
      name: 'copy-service-worker',
      closeBundle() {
        // Copier le service worker dans le dossier dist
        const src = path.resolve(process.cwd(), 'public/service-worker.js');
        const dest = path.resolve(process.cwd(), 'dist/service-worker.js');
        if (existsSync(src)) {
          copyFileSync(src, dest);
          console.log('Service Worker copié dans dist/');
        }
      }
    }
  ],
  resolve: {
    alias: {
      '@': path.resolve(process.cwd(), './src'),
      '@/core': path.resolve(process.cwd(), './src/core'),
      '@/features': path.resolve(process.cwd(), './src/features'),
      '@/assets': path.resolve(process.cwd(), './src/assets'),
      '@/layouts': path.resolve(process.cwd(), './src/layouts'),
    },
  },
  server: {
    port: 5173,
    // Désactiver le cache en développement
    headers: {
      'Cache-Control': 'no-store',
    },
    // Désactiver l'overlay HMR
    hmr: {
      overlay: false
    }
  },
  build: {
    // Générer des noms de fichiers avec hash pour éviter le cache
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]',
        // Code splitting pour réduire la taille des bundles
        manualChunks: {
          // Séparer les dépendances React
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // Séparer les librairies de cartes
          'maps-vendor': ['leaflet', '@react-google-maps/api'],
          // Séparer les utilitaires
          'utils-vendor': ['date-fns', 'lucide-react', 'clsx'],
          // Séparer Redux
          'redux-vendor': ['@reduxjs/toolkit', 'react-redux'],
        },
      },
    },
    // Assurer la compatibilité ES modules
    target: 'es2020',
    minify: 'esbuild',
    // Augmenter la limite d'avertissement à 800kb
    chunkSizeWarningLimit: 800,
  },
})
