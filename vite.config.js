import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      '/api-me-sandbox': {
        target: 'https://sandbox.melhorenvio.com.br/api/v2',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api-me-sandbox/, '')
      },
      '/api-me': {
        target: 'https://melhorenvio.com.br/api/v2',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api-me/, '')
      }
    }
  }
})