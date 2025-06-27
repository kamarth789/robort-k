import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import runtimeErrorModal from "@replit/vite-plugin-runtime-error-modal";
import { resolve } from "path";

export default defineConfig({
  plugins: [react(), runtimeErrorModal()],
  root: "client",
  build: {
    outDir: "../dist/public",
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "client", "src"),
      "@shared": resolve(__dirname, "shared"),
    },
  },
});