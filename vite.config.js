import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import path from "node:path"
import { fileURLToPath } from "node:url"
 
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

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
    'global': 'globalThis',
    'process.env.NODE_ENV': '"production"'
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
