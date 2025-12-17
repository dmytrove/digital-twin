import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Three.js related chunks for better caching
          'three': ['three'],
          'react-three': ['@react-three/fiber', '@react-three/drei'],
          // React ecosystem
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // State management and utilities
          'store': ['zustand'],
          // Map related dependencies
          'leaflet': ['leaflet', 'react-leaflet'],
          // UI libraries
          'ui': ['lucide-react']
        }
      }
    },
    // Optimize chunks
    chunkSizeWarningLimit: 800,
    target: 'esnext',
    minify: 'esbuild'
  },
  // Enable tree shaking
  define: {
    __DEV__: false
  }
});