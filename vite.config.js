import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    open: true,
    strictPort: false,   // <-- change this to false to allow fallback port if 5173 is busy
    watch: {
      usePolling: true,  // Useful in WSL/Docker
    },
    hmr: true,           // ensure HMR is on
  },
});
