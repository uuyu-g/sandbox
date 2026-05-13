import { createInertiaApp, type ResolvedComponent } from '@inertiajs/react'
import { hydrateRoot } from 'react-dom/client'

import AppLayout from './components/AppLayout'

createInertiaApp({
  resolve: async (name) => {
    const pages = import.meta.glob<{ default: ResolvedComponent }>('./pages/**/*.tsx')
    const page = await pages[`./pages/${name}.tsx`]()
    const component = page.default as ResolvedComponent & {
      layout?: (children: React.ReactNode) => React.ReactNode
    }
    if (!component.layout) {
      component.layout = (children) => <AppLayout>{children}</AppLayout>
    }
    return component
  },
  setup({ el, App, props }) {
    hydrateRoot(el, <App {...props} />)
  },
})
