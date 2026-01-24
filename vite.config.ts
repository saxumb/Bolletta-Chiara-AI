
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './', 
  build: {
    outDir: 'dist',
    sourcemap: false,
    assetsDir: 'assets',
    rollupOptions: {
      input: {
        main: './index.html',
      }
    }
  },
  resolve: {
    alias: {
      // Assicura che Vite trovi i moduli anche se importati con percorsi relativi complessi
      '@': '/src',
    },
  },
  define: {
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY)
  }
});
