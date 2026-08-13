import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// GitHub Pages serves at username.github.io/Paisa/ (needs base "/Paisa/");
// Vercel serves at the domain root. Vercel sets VERCEL=1 during builds,
// so both hosts work with no manual configuration.
export default defineConfig({
  base: process.env.VERCEL ? "/" : "/Paisa/",
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL("./index.html", import.meta.url)),
        levelup: fileURLToPath(new URL("./levelup/index.html", import.meta.url)),
      },
    },
  },
});
