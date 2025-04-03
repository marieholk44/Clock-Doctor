import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import themePlugin from "@replit/vite-plugin-shadcn-theme-json";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

export default defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    themePlugin(),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@assets": path.resolve(__dirname, "..", "attached_assets"),
      "@shared": path.resolve(__dirname, "src", "lib"), // Redirect shared imports to frontend lib
    },
  },
  server: {
    host: "0.0.0.0",
    port: 5173,
  },
  define: {
    // Define global constants for the app
    'import.meta.env.STANDALONE': process.env.STANDALONE === 'true' ? true : false,
  },
});