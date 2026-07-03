import { defineConfig } from '@adonisjs/inertia'
import type { InferSharedProps } from '@adonisjs/inertia/types'

const inertiaConfig = defineConfig({
  /**
   * Path to the Edge view that will be used as the root view
   * for Inertia responses.
   */
  rootView: 'inertia_layout',

  /**
   * Data that should be shared with all rendered pages.
   */
  sharedData: {
    errors: (ctx) => ctx.session?.flashMessages.get('errors'),
    success: (ctx) => ctx.session?.flashMessages.get('success'),
  },

  /**
   * Options for the server-side rendering.
   * Disabled here because the portfolio relies on window / DOM
   * APIs (scroll, matchMedia, getBoundingClientRect) that only
   * exist in the browser.
   */
  ssr: {
    enabled: false,
    entrypoint: 'inertia/app/ssr.ts',
  },
})

export default inertiaConfig

export type SharedProps = InferSharedProps<typeof inertiaConfig>

declare module '@adonisjs/inertia/types' {
  export interface SharedProps extends InferSharedProps<typeof inertiaConfig> {}
}
