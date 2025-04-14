import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  server: {
    host: '0.0.0.0', // Bind to all interfaces
    port: 5173
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
