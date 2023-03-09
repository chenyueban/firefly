/// <reference types="vitest" />
import path from 'node:path'
import Pages from 'vite-plugin-pages'
import Layouts from 'vite-plugin-vue-layouts'
import Vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite'
import AutoImport from 'unplugin-auto-import/vite'
import { NaiveUiResolver } from 'unplugin-vue-components/resolvers'
import VueI18n from '@intlify/unplugin-vue-i18n/vite'
import Inspect from 'vite-plugin-inspect'
import Unocss from 'unocss/vite'
import VueMacros from 'unplugin-vue-macros/vite'
import { defineConfig } from 'vite'

const resolve = (...p: string[]) => path.resolve(__dirname, ...p)

export default defineConfig({
  resolve: {
    alias: {
      '~/': `${resolve('src')}/`,
    },
  },
  plugins: [
    VueMacros({
      plugins: {
        vue: Vue({
          include: [/\.vue$/],
          reactivityTransform: true,
        }),
      },
    }),

    // https://github.com/antfu/unplugin-auto-import
    AutoImport({
      imports: [
        'vue',
        'vue-router',
        'vue-i18n',
        'vue/macros',
        '@vueuse/head',
        '@vueuse/core',
      ],
      dts: resolve('src/auto-imports.d.ts'),
      dirs: [
        resolve('src/composables'),
        resolve('src/store'),
      ],
      vueTemplate: true,
    }),

    // https://github.com/antfu/unplugin-vue-components
    Components({
      extensions: ['vue'],
      include: [/\.vue$/, /\.vue\?vue/],
      dirs: resolve('src/components'),
      dts: resolve('src/components.d.ts'),
      resolvers: [NaiveUiResolver()],
    }),

    // https://github.com/antfu/unocss
    // see unocss.config.ts for config
    Unocss(),

    // https://github.com/intlify/bundle-tools/tree/main/packages/unplugin-vue-i18n
    VueI18n({
      runtimeOnly: true,
      compositionOnly: true,
      include: [resolve('locales/**')],
    }),

    // https://github.com/antfu/vite-plugin-inspect
    // Visit http://localhost:5173/__inspect/ to see the inspector
    Inspect(),

    // https://github.com/hannoeru/vite-plugin-pages
    Pages({
      dirs: resolve('src/pages'),
      extensions: ['vue'],
    }),

    // https://github.com/JohnCampionJr/vite-plugin-vue-layouts
    Layouts({ layoutsDirs: resolve('src/layouts') }),
  ],
  test: {
    environment: 'jsdom',
    deps: { inline: ['@vue', '@vueuse'] },
  },
})
