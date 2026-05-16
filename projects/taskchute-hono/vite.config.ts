import path from 'node:path'
import { cloudflare } from '@cloudflare/vite-plugin'
import { inertiaPages } from '@hono/inertia/vite'
import { defineConfig } from 'vite'
import ssrPlugin from 'vite-ssr-components/plugin'

export default defineConfig({
  plugins: [inertiaPages(), cloudflare(), ssrPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'app'),
    },
  },
})
