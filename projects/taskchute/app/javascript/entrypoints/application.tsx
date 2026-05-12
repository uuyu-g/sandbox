import React from 'react'
import { createRoot } from 'react-dom/client'
import { createInertiaApp } from '@inertiajs/react'
import AppLayout from '@/components/AppLayout'
import '@/styles/application.css'

const pages = import.meta.glob('../pages/**/*.tsx', { eager: true }) as Record<
  string,
  { default: React.ComponentType<any> & { layout?: (children: React.ReactNode) => React.ReactNode } }
>

createInertiaApp({
  resolve: (name) => {
    const page = pages[`../pages/${name}.tsx`]
    if (!page) {
      throw new Error(`Inertia page not found: ${name}`)
    }
    page.default.layout =
      page.default.layout || ((children) => <AppLayout>{children}</AppLayout>)
    return page
  },
  setup({ el, App, props }) {
    createRoot(el).render(<App {...props} />)
  },
})
