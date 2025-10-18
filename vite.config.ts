import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
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
  },
  build: {
    // Générer des noms de fichiers avec hash pour éviter le cache
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]',
      },
    },
  },
})
