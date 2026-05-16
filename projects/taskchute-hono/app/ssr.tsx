import type { PageObject } from '@hono/inertia'
import { createInertiaApp, type ResolvedComponent } from '@inertiajs/react'
import type { Page } from '@inertiajs/core'
import { renderToString } from 'react-dom/server'

import AppLayout from './components/AppLayout'

const pages = import.meta.glob<{ default: ResolvedComponent }>('./pages/**/*.tsx')

export const renderPage = (page: PageObject) =>
  createInertiaApp({
    page: page as Page,
    render: renderToString,
    resolve: async (name) => {
      const loader = pages[`./pages/${name}.tsx`]
      if (!loader) throw new Error(`Inertia page not found: ${name}`)
      const mod = await loader()
      const component = mod.default as ResolvedComponent & {
        layout?: (children: React.ReactNode) => React.ReactNode
      }
      if (!component.layout) {
        component.layout = (children) => <AppLayout>{children}</AppLayout>
      }
      return component
    },
    setup: ({ App, props }) => <App {...props} />,
  })
