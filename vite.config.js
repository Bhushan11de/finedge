import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  server: {
    port: 3000,
    host: true,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://44.232.157.2:5000',
        changeOrigin: true,
        secure: false
      }
    }
  },
  plugins: [
    react(),
    visualizer({
      open: true,
      filename: 'dist/stats.html'
    })
  ],
  build: {
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: [
            'react',
            'react-dom',
            'framer-motion',
            '@tremor/react',
            'axios',
            'react-icons'
          ]
        }
      }
    }
  }
});
