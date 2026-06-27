import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import viteCompression from 'vite-plugin-compression';

export default defineConfig({
  plugins: [
    react(),
    // Generate gzip compressed assets for production
    viteCompression({ algorithm: 'gzip', ext: '.gz' }),
    // Also generate brotli for modern browsers
    viteCompression({ algorithm: 'brotliCompress', ext: '.br' }),
  ],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target    : 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  build: {
    sourcemap: false, // disable in production for smaller output
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunk: core React libs
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // Data fetching chunk
          'vendor-query': ['@tanstack/react-query'],
          // UI utilities
          'vendor-ui': ['lucide-react', 'react-hot-toast', 'react-hook-form'],
        },
      },
    },
    // Target modern browsers for smaller output
    target: 'es2020',
  },
});
