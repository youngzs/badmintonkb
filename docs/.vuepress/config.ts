import { defineUserConfig } from 'vuepress'
import { viteBundler } from '@vuepress/bundler-vite'
import { searchPlugin } from '@vuepress/plugin-search'
import { mediumZoomPlugin } from '@vuepress/plugin-medium-zoom'

export default defineUserConfig({
  lang: 'zh-CN',
  title: '青少年羽毛球训练知识库',
  description: '专业的青少年羽毛球训练知识平台，覆盖4-15岁全年龄段',

  // Base URL for deployment
  base: '/',

  // Head configuration for WeChat sharing and meta tags
  head: [
    ['meta', { name: 'viewport', content: 'width=device-width,initial-scale=1.0,maximum-scale=1.0,user-scalable=no' }],
    ['meta', { name: 'apple-mobile-web-app-capable', content: 'yes' }],
    ['meta', { name: 'apple-mobile-web-app-status-bar-style', content: 'black' }],

    // WeChat sharing metadata (will be customized per page)
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:title', content: '青少年羽毛球训练知识库' }],
    ['meta', { property: 'og:description', content: '专业的青少年羽毛球训练知识平台' }],
  ],

  // Bundler configuration
  bundler: viteBundler({
    viteOptions: {
      build: {
        chunkSizeWarningLimit: 1000,
      },
    },
  }),

  // Plugins
  plugins: [
    searchPlugin({
      locales: {
        '/': {
          placeholder: '搜索训练内容',
        },
      },
      // Maximum suggestions
      maxSuggestions: 10,
      // Hotkeys
      hotKeys: ['s', '/'],
      // Enable search by default
      isSearchable: (page) => page.path !== '/',
    }),
    mediumZoomPlugin({
      // Image zoom plugin for better mobile experience
      selector: '.theme-default-content img',
      zoomOptions: {
        margin: 16,
        background: 'rgba(0, 0, 0, 0.8)',
        scrollOffset: 0,
      },
    }),
  ],

  // Theme configuration (will be customized with custom theme)
  theme: '@vuepress/theme-default',

  // Markdown configuration
  markdown: {
    code: {
      lineNumbers: false,
    },
  },
})
