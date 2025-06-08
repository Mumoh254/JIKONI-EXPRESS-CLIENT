import { defineConfig } from 'vite';
import rollupNodePolyFill from 'rollup-plugin-node-polyfills';

export default defineConfig({
  define: {
    global: 'globalThis', // or: {} if globalThis causes issues
  },
  optimizeDeps: {
    include: ['buffer', 'process'],
  },
  plugins: [rollupNodePolyFill()],
  build: {
    rollupOptions: {
      plugins: [rollupNodePolyFill()],
    },
  },
});
