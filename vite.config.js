// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,       // You can set your dev server port here
    open: true,       // Opens browser automatically on start
  },
  build: {
    outDir: 'dist',   // Output folder for production build
  },
  resolve: {
    alias: {
      // Example alias for cleaner imports (optional)
      '@': '/src',
    },
  },
})
