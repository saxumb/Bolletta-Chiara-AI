
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './', 
  build: {
    outDir: 'dist',
    sourcemap: false,
    assetsDir: 'assets',
    // Assicuriamoci che i file PWA rimangano nella root della dist
    rollupOptions: {
      input: {
        main: './index.html',
      }
    }
  },
  define: {
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY)
  }
});
