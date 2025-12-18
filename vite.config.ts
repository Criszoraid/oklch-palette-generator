import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

export default defineConfig({
  plugins: [
    react(),
    viteSingleFile() // Embeber todo en un solo HTML para Figma
  ],
  root: './',
  publicDir: 'public',
  base: './',
  server: {
    port: 3000,
    open: true,
    host: true
  },
  build: {
    target: 'es2017',
    outDir: 'dist/public',
    assetsDir: 'assets',
    emptyOutDir: false, // No limpiar dist/ para preservar dist/code.js
    rollupOptions: {
      input: {
        index: './public/index.html'
      }
    }
  }
});
