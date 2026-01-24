
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Se il tuo repository si chiama "energia-pro", il base deve essere "/energia-pro/"
// Se lo pubblichi su un dominio personalizzato o come sito utente principale, usa "/"
export default defineConfig({
  plugins: [react()],
  base: './', 
  build: {
    outDir: 'dist',
    sourcemap: false
  },
  define: {
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY)
  }
});
