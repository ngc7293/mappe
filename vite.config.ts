import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";

export default defineConfig({
  base: "./",
  plugins: [svelte()],
  resolve: {
    alias: {
      "@lib": "/src/lib",
      "@components": "/src/components",
    },
  },
});
