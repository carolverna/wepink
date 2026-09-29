import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// base precisa bater com o nome do repositório para o GitHub Pages servir os assets
export default defineConfig({
  base: "/wepink/",
  plugins: [react()],
});
