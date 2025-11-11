import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import path from 'path';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: '青少年羽毛球训练知识库',
  tagline: '专业的青少年羽毛球训练知识平台，覆盖4-15岁全年龄段',
  favicon: 'img/favicon.ico',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: 'https://your-docusaurus-site.example.com',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'facebook', // Usually your GitHub org/user name.
  projectName: 'docusaurus', // Usually your repo name.

  onBrokenLinks: 'warn', // 暂时允许断链，逐步修复

  // Chinese language configuration
  i18n: {
    defaultLocale: 'zh-Hans',
    locales: ['zh-Hans'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          routeBasePath: '/', // 文档作为首页，修复断链问题
          // Remove edit links
          editUrl: undefined,
        },
        blog: false, // Disable blog feature
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  plugins: [
    // 会员系统插件 - 配置Webpack和路径别名
    function premiumSystemPlugin() {
      return {
        name: 'premium-system-plugin',
        configureWebpack() {
          return {
            resolve: {
              alias: {
                '@': path.resolve(__dirname, 'src'),
              },
              fallback: {
                crypto: require.resolve('crypto-browserify'),
                stream: require.resolve('stream-browserify'),
                buffer: require.resolve('buffer/'),
                path: require.resolve('path-browserify'),
              },
            },
          };
        },
      };
    },
  ],

  themes: [
    [
      require.resolve("@easyops-cn/docusaurus-search-local"),
      {
        hashed: true,
        language: ["zh", "en"],
        highlightSearchTermsOnTargetPage: true,
        explicitSearchResultPath: true,
      },
    ],
  ],

  themeConfig: {
    // Replace with your project's social card
    image: 'img/docusaurus-social-card.jpg',
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: '青少年羽毛球训练知识库',
      hideOnScroll: false,
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'trainingSidebar',
          position: 'left',
          label: '训练内容',
        },
        {
          type: 'search',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'light',
      copyright: `版权所有 © ${new Date().getFullYear()} 青少年羽毛球训练知识库`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
