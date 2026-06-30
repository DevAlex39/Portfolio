import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { getDirname } from '@adonisjs/core/helpers'

export default defineConfig({
  plugins: [vue()],

  resolve: {
    alias: {
      '~/': `${getDirname(import.meta.url)}/inertia/`,
    },
  },
})
