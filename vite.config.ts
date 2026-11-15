import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // PHP API (server/) runs on :8080 in development:
    //   php -d opcache.revalidate_freq=0 -S localhost:8080 -t server server/router.php
    // Proxying keeps the site, the /admin app and the API on one origin, so the
    // admin's session cookie just works.
    proxy: { '/api': 'http://localhost:8080' },
  },
})
