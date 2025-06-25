const { defineConfig } = require('vite');
const { resolve } = require('path');

module.exports = defineConfig({
  root: '.',
  server: {
    watch: {
      usePolling: true,
    },
    port: 3000, // Root port, but each site will be available via subpath
  },
  build: {
    rollupOptions: {
      input: {
        cv: resolve(__dirname, 'sites/cv/index.html'),
        onepager: resolve(__dirname, 'sites/onepager/index.html'),
        start: resolve(__dirname, 'sites/start/index.html'),
        navbar: resolve(__dirname, 'sites/navbar/index.html'),
        mdsite: resolve(__dirname, 'sites/mdsite/index.html'),
        data: resolve(__dirname, 'sites/data/index.html'),
      },
    },
  },
});
