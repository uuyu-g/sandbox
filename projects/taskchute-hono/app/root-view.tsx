import type { RootView } from '@hono/inertia'
import { renderToString } from 'react-dom/server'
import { Link, Script, ViteClient } from 'vite-ssr-components/react'

import { renderPage } from './ssr'

const Head = () => (
  <>
    <ViteClient />
    <Link rel="stylesheet" href="/app/styles.css" />
    <Script src="/app/client.tsx" />
  </>
)

export const rootView: RootView = async (page) => {
  const { head, body } = await renderPage(page)
  const headHtml = renderToString(<Head />) + head.join('')
  return `<!DOCTYPE html><html lang="ja"><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /><title>TaskChute</title>${headHtml}</head><body>${body}</body></html>`
}
