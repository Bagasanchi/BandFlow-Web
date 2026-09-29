import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Listen on the LAN too, so phones and other computers on the same Wi-Fi can open the site.
  server: { host: true, port: 5173 },
  preview: { host: true, port: 4173 },
})
