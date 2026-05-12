import { defineConfig } from 'vite'
import { fileURLToPath } from 'node:url'
import RubyPlugin from 'vite-plugin-ruby'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [RubyPlugin(), react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./app/javascript', import.meta.url)),
    },
  },
})
