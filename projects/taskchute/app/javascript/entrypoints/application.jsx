import React from 'react'
import { createRoot } from 'react-dom/client'
import { createInertiaApp } from '@inertiajs/react'
import { Client as Styletron } from 'styletron-engine-atomic'
import { Provider as StyletronProvider } from 'styletron-react'
import { LightTheme, BaseProvider } from 'baseui'
import AppLayout from '../components/AppLayout'

const engine = new Styletron()

const pages = import.meta.glob('../pages/**/*.jsx', { eager: true })

createInertiaApp({
  resolve: (name) => {
    const page = pages[`../pages/${name}.jsx`]
    if (!page) {
      throw new Error(`Inertia page not found: ${name}`)
    }
    page.default.layout =
      page.default.layout || ((children) => <AppLayout>{children}</AppLayout>)
    return page
  },
  setup({ el, App, props }) {
    createRoot(el).render(
      <StyletronProvider value={engine}>
        <BaseProvider theme={LightTheme}>
          <App {...props} />
        </BaseProvider>
      </StyletronProvider>
    )
  },
})
