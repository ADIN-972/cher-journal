import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Use localhost for proxy to avoid circular routing through Cloudflare tunnel
const targetURL = "http://localhost:5000";

export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 5173,
    allowedHosts: [".trycloudflare.com", ".moncherjournal.com"], // Allow cloudflare tunnels + custom domain
    proxy: {
      "/api": {
        target: targetURL,
        changeOrigin: true,
        secure: false,
      },
      "/auth": {
        target: targetURL,
        changeOrigin: true,
        secure: false,
      },
      "/stripe": {
        target: targetURL,
        changeOrigin: true,
        secure: false,
      },
      "/uploads": {
        target: targetURL,
        changeOrigin: true,
        secure: false,
      },
      "/chapters": {
        target: targetURL,
        changeOrigin: true,
        secure: false,
        bypass: function (req) {
          // Si c'est une requête HTML (navigation navigateur), on bypass le proxy pour React Router
          if (req.headers.accept?.includes('text/html')) {
            return '/index.html';
          }
          return undefined;
        },
      },
      "/library": {
        target: targetURL,
        changeOrigin: true,
        secure: false,
        bypass: function (req) {
          if (req.headers.accept?.includes('text/html')) {
            return '/index.html';
          }
          return undefined;
        },
      },
      "/wait": {
        target: targetURL,
        changeOrigin: true,
        secure: false,
      },
      "/config": {
        target: targetURL,
        changeOrigin: true,
        secure: false,
      },
      "/prices": {
        target: targetURL,
        changeOrigin: true,
        secure: false,
      },
      "/reader": {
        target: targetURL,
        changeOrigin: true,
        secure: false,
      },
      "/reviews": {
        target: targetURL,
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
