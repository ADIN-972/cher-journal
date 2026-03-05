import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Use localhost for proxy to avoid circular routing through Cloudflare tunnel
const targetURL = "http://localhost:5000";

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5174,
    allowedHosts: ['.trycloudflare.com', '.moncherjournal.com'], // Allow cloudflare tunnels + custom domain
    proxy: {
      "/api": {
        target: targetURL,
        changeOrigin: true,
        secure: false,
        ws: true,
        cookieDomainRewrite: "localhost",
        configure: (proxy, _options) => {
          proxy.on("error", (err, _req, _res) => {
            console.log("[Proxy Error]", err);
          });
          proxy.on("proxyReq", (proxyReq, req, _res) => {
            console.log("[Proxy Request]", req.method, req.url);
            console.log("[Proxy Request Headers]", req.headers);
          });
          proxy.on("proxyRes", (proxyRes, req, _res) => {
            console.log("[Proxy Response]", proxyRes.statusCode, req.url);
            console.log("[Proxy Response Headers]", proxyRes.headers);
          });
        },
      },
      "/uploads": {
        target: targetURL,
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
