import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  resolve: {
    alias: {
      // 🧪 ALCHEMICAL TRANSFORMATION: Match Vite aliases for testing
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
      '@state': resolve(__dirname, 'src/utils/state-management.js'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.js'],
    include: ['tests/**/*.test.js', 'src/**/*.test.js'],
    exclude: ['node_modules', 'dist', '.git'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'tests/', 'dist/', '*.config.js', 'server.js'],
      thresholds: {
        global: {
          branches: 70,
          functions: 70,
          lines: 70,
          statements: 70,
        },
      },
    },
    testTimeout: 10000,
    hookTimeout: 10000,
  },
  esbuild: {
    target: 'es2020',
  },
});
