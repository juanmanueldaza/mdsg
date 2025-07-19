import { defineConfig } from 'vite';

export default defineConfig({
  base: '/',
  build: {
    outDir: 'dist',
    target: 'es2020',
    minify: true,
    sourcemap: false,
    chunkSizeWarningLimit: 500,
  },
  server: {
    port: 3000,
    open: true,
  },
  preview: {
    port: 3001,
  },
});
