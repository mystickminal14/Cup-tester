import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// Relative base by default, so the build works in any folder (/, /cuptaster/, …).
// Set BASE_PATH=/some/path/ to pin it.
export default defineConfig({
  base: process.env.BASE_PATH || './',
  plugins: [react(), tailwindcss()],
})
