import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    strictPort: false, // Allows fallback port if 5173 is busy
    open: true,
    watch: {
      usePolling: true, // Useful in WSL/Docker
    },
    hmr: {
      protocol: 'ws',   // Ensure WebSocket protocol is used
      host: 'localhost',
      port: 5173        // Same port as server
    },
    proxy: {
      // Example: forward backend WebSocket requests
      '/ws': {
        target: 'ws://localhost:3001', // Your backend WS server
        ws: true,
        changeOrigin: true,
      }
    }
  }
});
