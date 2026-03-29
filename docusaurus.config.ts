import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'STex KMS',
  tagline: 'Knowledge Management System',
  favicon: 'img/favicon.ico',

  future: {
    v4: true,
  },

  url: 'https://kms.stex.co.id',
  baseUrl: '/',

  organizationName: 'stex',
  projectName: 'kms',

  onBrokenLinks: 'warn',

  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },

  i18n: {
    defaultLocale: 'id',
    locales: ['id', 'en'],
    localeConfigs: {
      id: {
        label: 'Bahasa Indonesia',
        direction: 'ltr',
        htmlLang: 'id',
      },
      en: {
        label: 'English',
        direction: 'ltr',
        htmlLang: 'en',
      },
    },
  },

  plugins: [
    [
      require.resolve('@easyops-cn/docusaurus-search-local'),
      {
        hashed: true,
        language: ['en'],
        searchBarShortcutHint: false,
        docsRouteBasePath: '/docs',
        indexDocs: true,
        indexBlog: false,
        indexPages: false,
      },
    ],
  ],

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          showLastUpdateAuthor: true,
          showLastUpdateTime: true,
          editUrl: undefined,
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: 'img/kms-social-card.png',
    colorMode: {
      defaultMode: 'light',
      disableSwitch: false,
      respectPrefersColorScheme: false,
    },
    navbar: {
      title: 'STex KMS',
      logo: {
        alt: 'STex Logo',
        src: 'img/logo.svg',
        srcDark: 'img/logo-dark.svg',
      },
      style: 'primary',
      hideOnScroll: false,
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'hrdSidebar',
          position: 'left',
          label: 'HRD',
        },
        {
          type: 'docSidebar',
          sidebarId: 'financeSidebar',
          position: 'left',
          label: 'Finance',
        },
        {
          type: 'docSidebar',
          sidebarId: 'operasionalSidebar',
          position: 'left',
          label: 'Operasional',
        },
        {
          type: 'docSidebar',
          sidebarId: 'itSidebar',
          position: 'left',
          label: 'IT',
        },
        {
          type: 'docSidebar',
          sidebarId: 'legalSidebar',
          position: 'left',
          label: 'Legal',
        },
        {
          type: 'localeDropdown',
          position: 'right',
        },
        {
          to: '/login',
          label: 'Masuk',
          position: 'right',
          className: 'navbar-login-btn',
        },
      ],
    },
    footer: {
      style: 'light',
      links: [
        {
          title: 'Department',
          items: [
            { label: 'HRD', to: '/docs/hrd/intro' },
            { label: 'Finance', to: '/docs/finance/intro' },
            { label: 'Operasional', to: '/docs/operasional/intro' },
            { label: 'IT', to: '/docs/it/intro' },
            { label: 'Legal', to: '/docs/legal/intro' },
          ],
        },
        {
          title: 'Akses',
          items: [
            { label: 'Masuk / Login', to: '/login' },
            { label: 'Dashboard Admin', to: '/admin' },
            { label: 'Info Peran', to: '/role-info' },
          ],
        },
        {
          title: 'Sistem',
          items: [
            { label: 'Tentang KMS', to: '/about' },
            { label: 'Panduan Penggunaan', to: '/docs/panduan/intro' },
          ],
        },
      ],
      copyright: `© ${new Date().getFullYear()} STex. Knowledge Management System.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
    docs: {
      sidebar: {
        hideable: true,
        autoCollapseCategories: true,
      },
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
