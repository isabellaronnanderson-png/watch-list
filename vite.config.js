import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // When running `vercel dev` this isn't needed (it serves /api itself).
      // This proxy only matters if you ever run plain `vite` alongside a
      // separately-running local API server on port 3001.
      '/api': 'http://localhost:3001'
    }
  }
})
