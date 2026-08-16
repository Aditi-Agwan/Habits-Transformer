import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  // Use a relative base so links and assets resolve both locally and on GitHub Pages.
  base: './',
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main:  fileURLToPath(new URL("./index.html",         import.meta.url)),
        arena: fileURLToPath(new URL("./v_1.0.0/index.html", import.meta.url)),
      },
    },
  },
});