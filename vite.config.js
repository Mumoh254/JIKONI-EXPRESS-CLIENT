// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,         // Allow LAN access (local network)
    port: 5173,         // Dev port
    open: true,         // Auto open in browser
    strictPort: true,   // Fail if port is taken
    watch: {
      usePolling: true, // Fix for Windows auto-refresh issue
    },
  },
  build: {
    outDir: 'dist',      // Folder for production build
  },
});
