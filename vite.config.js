import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Important for Electron to load files correctly
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    // Ensure compatibility with Electron
    target: 'esnext',
    minify: 'esbuild',
    // Generate source maps for debugging
    sourcemap: true
  },
  server: {
    port: 5173,
    strictPort: true
  }
})
