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

  presets: [
    [
      'classic',
      {
        // Docs disabled — content is now fully dynamic via Supabase
        docs: false,
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
          to: '/documents',
          label: '📚 Dokumen',
          position: 'left',
        },
        {
          to: '/documents?dept=hrd',
          label: 'HRD',
          position: 'left',
        },
        {
          to: '/documents?dept=finance',
          label: 'Finance',
          position: 'left',
        },
        {
          to: '/documents?dept=operasional',
          label: 'Operasional',
          position: 'left',
        },
        {
          to: '/documents?dept=it',
          label: 'IT',
          position: 'left',
        },
        {
          to: '/documents?dept=legal',
          label: 'Legal',
          position: 'left',
        },
        {
          type: 'localeDropdown',
          position: 'right',
        },
        {
          to: '/admin',
          label: '⚙️',
          position: 'right',
          className: 'navbar-admin-btn',
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
          title: 'Departemen',
          items: [
            { label: 'HRD', to: '/documents?dept=hrd' },
            { label: 'Finance', to: '/documents?dept=finance' },
            { label: 'Operasional', to: '/documents?dept=operasional' },
            { label: 'IT', to: '/documents?dept=it' },
            { label: 'Legal', to: '/documents?dept=legal' },
          ],
        },
        {
          title: 'Akses',
          items: [
            { label: 'Masuk / Login', to: '/login' },
            { label: 'Dashboard Admin', to: '/admin' },
            { label: 'Semua Dokumen', to: '/documents' },
          ],
        },
        {
          title: 'Sistem',
          items: [
            { label: 'Tentang KMS', to: '/about' },
          ],
        },
      ],
      copyright: `© ${new Date().getFullYear()} STex. Knowledge Management System — Powered by Supabase.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
