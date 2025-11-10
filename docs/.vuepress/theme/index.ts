import { defaultTheme } from '@vuepress/theme-default'
import type { Theme } from 'vuepress'

export default {
  name: 'vuepress-theme-badminton-training',
  extends: defaultTheme({
    // Mobile-first responsive design configuration
    navbar: [
      {
        text: '首页',
        link: '/',
      },
      {
        text: '年龄组',
        children: [
          {
            text: '启蒙期 (4-6岁)',
            link: '/age-groups/enlightenment-4-6',
          },
          {
            text: '基础期 (7-9岁)',
            link: '/age-groups/foundation-7-9',
          },
          {
            text: '发展期 (10-12岁)',
            link: '/age-groups/development-10-12',
          },
          {
            text: '提高期 (13-15岁)',
            link: '/age-groups/advanced-13-15',
          },
        ],
      },
      {
        text: '理论模块',
        children: [
          {
            text: '技术理论',
            link: '/theory/technique-theory',
          },
          {
            text: '体能训练科学',
            link: '/theory/physical-training-science',
          },
          {
            text: '运动损伤预防',
            link: '/theory/injury-prevention',
          },
          {
            text: '运动营养',
            link: '/theory/nutrition',
          },
          {
            text: '运动心理学',
            link: '/theory/psychology',
          },
        ],
      },
      {
        text: '指导手册',
        children: [
          {
            text: '教练培训',
            link: '/guidance/coach-training',
          },
          {
            text: '家长手册',
            link: '/guidance/parent-handbook',
          },
        ],
      },
      {
        text: '资源库',
        link: '/resources',
      },
    ],

    // Sidebar configuration
    sidebar: 'auto',

    // Theme color
    colorMode: 'auto',
    colorModeSwitch: true,

    // Logo
    logo: '/images/logo.png',
    logoDark: '/images/logo-dark.png',

    // Repository information
    repo: '',
    repoLabel: 'GitHub',

    // Edit link
    editLink: false,

    // Last updated
    lastUpdated: true,
    lastUpdatedText: '最后更新',

    // Contributors
    contributors: false,

    // Page meta
    externalLinkIcon: true,

    // Mobile optimization
    sidebarDepth: 2,

    // Responsive breakpoints are handled by CSS
  }),
} as Theme
