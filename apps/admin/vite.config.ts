import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
        ws: true,
        cookieDomainRewrite: 'localhost',
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('[Proxy Error]', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('[Proxy Request]', req.method, req.url);
            console.log('[Proxy Request Headers]', req.headers);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('[Proxy Response]', proxyRes.statusCode, req.url);
            console.log('[Proxy Response Headers]', proxyRes.headers);
          });
        },
      },
      '/uploads': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
