import { defineConfig } from 'vite'

// https://vite.dev/config/
// Note: This project uses vanilla JS (no React), so the React plugin is not needed.
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
})

