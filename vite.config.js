import { defineConfig } from 'vite';
import { resolve } from 'path';

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
  resolve: {
    alias: {
      // 🧪 ALCHEMICAL TRANSFORMATION: Clean aliases replace index.js confusion
      '@components': resolve(__dirname, 'src/components'),
      '@utils': resolve(__dirname, 'src/utils'),
      '@services': resolve(__dirname, 'src/services'),  
      '@events': resolve(__dirname, 'src/events'),
      
      // 🎯 Specific module aliases for clean imports
      '@auth': resolve(__dirname, 'src/services/auth.js'),
      '@github': resolve(__dirname, 'src/services/github.js'),
      '@deployment': resolve(__dirname, 'src/services/deployment.js'),
      '@registry': resolve(__dirname, 'src/services/registry.js'),
      '@observable': resolve(__dirname, 'src/events/observable.js'),
      '@handlers': resolve(__dirname, 'src/events/handlers.js'),
      '@security': resolve(__dirname, 'src/utils/security-minimal.js'),
      '@markdown': resolve(__dirname, 'src/utils/markdown-processor.js'),
      '@ui': resolve(__dirname, 'src/components/ui-components.js'),
      '@state': resolve(__dirname, 'src/utils/state-management.js')
    }
  }
});
