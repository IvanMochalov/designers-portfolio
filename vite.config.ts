/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { tanstackRouter } from "@tanstack/router-plugin/vite";

const pagesBase = process.env.GITHUB_PAGES === "true" ? "/designers-portfolio/" : "/";

export default defineConfig({
  base: pagesBase,
  plugins: [
    tanstackRouter({ target: "react", autoCodeSplitting: true }),
    react(),
  ],
  test: {
    environment: "node",
  },
  server: {
    host: "0.0.0.0",
    port: 5173,
    strictPort: true,
  },
});
