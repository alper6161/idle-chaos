import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '', // Empty base for Electron
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    // Ensure compatibility with Electron
    target: 'esnext',
    minify: 'esbuild',
    // Generate source maps for debugging
    sourcemap: true,
    // Ensure relative paths work in Electron
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  },
  server: {
    port: 5173,
    strictPort: true
  }
})
