import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  base: '/',

  build: {
    outDir: 'dist',
    target: 'es2022', // Modern target for better performance
    minify: 'terser',
    sourcemap: false,
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      output: {
        manualChunks: {
          // Only split actual frontend dependencies if any
        },
      },
    },
    terserOptions: {
      compress: {
        drop_console: true, // Remove console logs in production
        drop_debugger: true,
      },
    },
  },

  server: {
    port: 3000,
    open: true,
    hmr: {
      overlay: true, // Show build errors as overlay
    },
  },

  preview: {
    port: 3001,
    open: true,
  },

  resolve: {
    alias: {
      // 🧪 ALCHEMICAL TRANSFORMATION: Clean aliases for modular architecture
      '@components': resolve(process.cwd(), 'src/components'),
      '@utils': resolve(process.cwd(), 'src/utils'),
      '@services': resolve(process.cwd(), 'src/services'),
      '@events': resolve(process.cwd(), 'src/events'),

      // 🎯 Specific module aliases for clean imports
      '@auth': resolve(process.cwd(), 'src/services/auth.js'),
      '@github': resolve(process.cwd(), 'src/services/github.js'),
      '@deployment': resolve(process.cwd(), 'src/services/deployment.js'),
      '@registry': resolve(process.cwd(), 'src/services/registry.js'),

      '@observable': resolve(process.cwd(), 'src/events/observable.js'),
      '@handlers': resolve(process.cwd(), 'src/events/handlers.js'),

      '@ui': resolve(process.cwd(), 'src/components/ui-components.js'),
      '@markdown': resolve(process.cwd(), 'src/utils/markdown-processor.js'),
      '@security': resolve(process.cwd(), 'src/utils/security-minimal.js'),
      '@state': resolve(process.cwd(), 'src/utils/state-management.js'),
      '@validation': resolve(process.cwd(), 'src/utils/validation.js'),
      '@csrf': resolve(process.cwd(), 'src/utils/csrf.js'),
    },
  },

  // Optimize dependencies (frontend only)
  optimizeDeps: {
    include: [], // No external dependencies to optimize for frontend
    exclude: ['cors', 'express'], // Exclude server-side dependencies
  },

  // CSS processing
  css: {
    devSourcemap: true,
  },

  // ESBuild configuration for faster builds
  esbuild: {
    target: 'es2022',
    legalComments: 'none',
  },
});
