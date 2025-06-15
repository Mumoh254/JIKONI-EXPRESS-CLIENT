import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react({
      jsxRuntime: 'automatic', // 👈 React 17+ automatic runtime
      babel: {
        plugins: [
          '@babel/plugin-transform-react-jsx', // optional fallback for legacy support
        ],
      },
    }),
  ],
  build: {
    target: 'esnext', // 👈 Ensures modern build output for React 19
    commonjsOptions: {
      include: [/node_modules/], // Fixes some ESM/CommonJS issues
    },
  },
  resolve: {
    alias: {
      react: 'react',
      'react-dom': 'react-dom',
    },
  },
});
