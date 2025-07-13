import { defineConfig } from 'vite';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

// Load site config from sites.config.json
const sites = JSON.parse(
  fs.readFileSync(resolve(__dirname, 'sites.config.json'), 'utf-8')
);

const input = {};
for (const site of sites) {
  input[site.name] = resolve(__dirname, site.entry);
}

export default defineConfig({
  server: {
    // Allow all hosts to prevent blocking of .local domains
    host: true,

    // Explicitly allow common development hostnames
    allowedHosts: [
      '.local',
      'localhost',
      '127.0.0.1',
      '*.daza.ar',
      '.daza.ar',
      '*.local',
      'cv.local',
      'onepager.local',
      'start.local',
      'navbar.local',
      'mdsite.local',
      'data.local',
      'wallpapers.local',
      'laboratoriodeprogramacioncreativa.local',
      'spanishlessons.local',
    ],

    // Enable CORS for all origins
    cors: {
      origin: true,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD'],
      allowedHeaders: [
        'Content-Type',
        'Authorization',
        'Accept',
        'Origin',
        'X-Requested-With',
      ],
    },

    // Set headers to allow cross-origin requests
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, HEAD',
      'Access-Control-Allow-Headers':
        'Content-Type, Authorization, Accept, Origin, X-Requested-With',
      'Access-Control-Allow-Credentials': 'true',
      'Cross-Origin-Embedder-Policy': 'unsafe-none',
      'Cross-Origin-Opener-Policy': 'unsafe-none',
    },

    // Configure file watching
    watch: {
      usePolling: true,
      interval: 300,
      // Watch markdown, json, and static files for hot reload
      ignored: [
        '!**/*.md',
        '!**/*.json',
        '!**/*.yml',
        '!**/*.yaml',
        '!**/*.csv',
        '!**/*.xml',
        '!**/*.txt',
        '!**/public/**',
        'node_modules/**',
      ],
    },

    // Enable HMR (Hot Module Replacement)
    hmr: {
      overlay: true,
      port: undefined, // Use same port as dev server
    },

    // Optimize for development
    strictPort: false,
    open: false, // Don't auto-open browser (handled by dev.sh)
  },

  // Build configuration
  build: {
    rollupOptions: {
      input,
    },
    // Optimize for production
    target: 'esnext',
    minify: 'esbuild',
    sourcemap: false,
    reportCompressedSize: false,
  },

  // Preview server configuration (for production testing)
  preview: {
    host: true,
    cors: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  },

  // Plugin configuration
  plugins: [],

  // Resolve configuration
  resolve: {
    alias: {
      // Add common aliases if needed
      '@': resolve(__dirname, './src'),
      '@lib': resolve(__dirname, './lib'),
      '@sites': resolve(__dirname, './sites'),
    },
  },

  // CSS configuration
  css: {
    devSourcemap: true,
  },

  // Logging
  logLevel: 'info',
  clearScreen: false,

  // Define global constants
  define: {
    __DEV__: JSON.stringify(process.env.NODE_ENV !== 'production'),
    __PROD__: JSON.stringify(process.env.NODE_ENV === 'production'),
  },
});
