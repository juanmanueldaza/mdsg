import { defineConfig } from "vite";

export default defineConfig({
  base: "/",
  build: {
    outDir: "dist",
    target: "es2015"
  },
  server: {
    port: 3000,
    open: true
  }
});
