import { defineConfig } from 'vite';
import rollupNodePolyFill from 'rollup-plugin-node-polyfills';
import compression from 'vite-plugin-compression'; // import compression plugin

export default defineConfig({
  define: {
    global: 'globalThis', // or: {} if globalThis causes issues
  },
  optimizeDeps: {
    include: ['buffer', 'process'],
  },
  plugins: [
    rollupNodePolyFill(), // existing polyfill plugin
    compression({
      algorithm: 'brotli', // 'brotli' or 'gzip'
      threshold: 10240, // Compress assets over 10 KB
      ext: '.br', // Brotli file extension
    }),
    compression({
      algorithm: 'gzip', // 'gzip' compression
      threshold: 10240, // Compress assets over 10 KB
      ext: '.gz', // Gzip file extension
    }),
  ],
  build: {
    rollupOptions: {
      plugins: [rollupNodePolyFill()],
    },
  },
});
