import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    sourcemap: false,
  },
  server: {
    https:
      process.env.VITE_HTTPS_KEY && process.env.VITE_HTTPS_CERT
        ? {
            key: fs.readFileSync(process.env.VITE_HTTPS_KEY),
            cert: fs.readFileSync(process.env.VITE_HTTPS_CERT),
          }
        : false,
    proxy: {
      '/api': {
        target:
          process.env.VITE_API_TARGET ||
          (process.env.VITE_API_HTTPS === 'true'
            ? 'https://localhost:4001'
            : 'http://localhost:4001'),
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
