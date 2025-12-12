import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["santa-icon-192.png", "santa-icon-512.png"],
      manifest: {
        name: "Call Santa",
        short_name: "Call Santa",
        description: "Call Santa Claus and have a magical voice conversation!",
        theme_color: "#1a472a",
        background_color: "#0f1a12",
        display: "standalone",
        orientation: "portrait",
        start_url: "/",
        icons: [
          {
            src: "/santa-icon-192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/santa-icon-512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "/santa-icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
      },
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
