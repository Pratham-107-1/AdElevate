import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // @tailwindcss/vite handles Tailwind directly as a Vite plugin - it does
  // NOT need a postcss.config.js. Without this explicit (empty) config,
  // Vite auto-searches parent directories for a postcss.config.* file and
  // may pick up an unrelated one from elsewhere on your machine (pointing
  // at an old, incompatible global Tailwind v3 install). Setting this
  // explicitly stops that upward search entirely.
  css: {
    postcss: {
      plugins: [],
    },
  },
})
