import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
// import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    headers: {
      'Cross-Origin-Opener-Policy': 'unsafe-none',
      'Cross-Origin-Embedder-Policy': 'unsafe-none',
    },
  },
  plugins: [
    react(),
    // VitePWA({
    //   registerType: 'autoUpdate',
    //   manifest: {
    //     name: 'TomaShops',
    //     short_name: 'TomaShops',
    //     start_url: '/',
    //     display: 'standalone',
    //     background_color: '#ffffff',
    //     theme_color: '#14b8a6',
    //     description: 'Video 1st Marketplace',
    //     icons: [
    //       {
    //         src: '/tomashops-favicon-v2.png',
    //         sizes: '192x192',
    //         type: 'image/png',
    //       },
    //       {
    //         src: '/tomashops-favicon-v2.png',
    //         sizes: '512x512',
    //         type: 'image/png',
    //       },
    //     ],
    //   },
    //   workbox: {
    //     globPatterns: ['**/*.{js,css,html,png,svg,ico,json}'],
    //     maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB limit for precaching
    //     runtimeCaching: [
    //       {
    //         urlPattern: /^https:\/\/.*/, // cache all network requests
    //         handler: 'NetworkFirst',
    //         options: {
    //           cacheName: 'external-cache',
    //           expiration: { maxEntries: 50, maxAgeSeconds: 86400 },
    //         },
    //       },
    //     ],
    //   },
    // })
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
