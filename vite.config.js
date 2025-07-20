import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'firebase-vendor': ['firebase/auth', 'firebase/firestore', 'firebase/app'],
          'ui-vendor': ['@mui/material', '@mui/icons-material', '@emotion/react', '@emotion/styled'],
          'game-vendor': ['blockly', 'framer-motion'],
          
          // Game components
          'game-components': [
            './src/components/OpenWorldGame.jsx',
            './src/components/SimpleOpenWorldGame.jsx',
            './src/components/TestGame.jsx',
            './src/components/GameComparison.jsx'
          ],
          
          // Dashboard components
          'dashboard-components': [
            './src/components/DashboardPage.jsx',
            './src/components/TeacherDashboard.jsx',
            './src/components/DashboardRedirect.jsx'
          ],
          
          // Educational components
          'education-components': [
            './src/components/IterationPage.jsx',
            './src/components/NumerationPage.jsx',
            './src/components/Arcade.jsx'
          ]
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
})
