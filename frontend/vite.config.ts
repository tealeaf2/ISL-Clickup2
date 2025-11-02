import { defineConfig } from 'vitest/config'
import path from "path"
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(), 
    tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      // Proxy API requests to ClickUp API to avoid CORS issues
      '/api/clickup': {
        target: 'https://api.clickup.com/api/v2',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/clickup/, ''),
        configure: (proxy, _options) => {
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            // Forward the Authorization header from the original request
            if (req.headers.authorization) {
              proxyReq.setHeader('Authorization', req.headers.authorization);
            }
          });
        },
      },
    },
  },
  test: {
    environment: 'happy-dom',
    setupFiles: './tst/setup.ts',
    include: ['tst/**/*.{test,spec}.{tsx,ts}'],
  }
})

