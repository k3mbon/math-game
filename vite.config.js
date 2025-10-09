import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import path from "path"
 
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: true,
    port: 5176,
    hmr: {
      port: 5176,
    },
    fs: {
      allow: ['..']
    }
  },
  define: {
    // Polyfill for CommonJS modules
    'global': 'globalThis',
    'module': '{}',
    'exports': '{}'
  },
  optimizeDeps: {
    include: ['scratch-blocks']
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom']
        }
      }
    }
  },
  // Copy scratch-blocks media files to public directory during build
  publicDir: 'public',
  assetsInclude: ['**/*.svg', '**/*.png', '**/*.gif']
})
