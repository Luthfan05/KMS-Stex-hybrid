import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'PT. Sukuntex KMS',
  tagline: 'Knowledge Management System',
  favicon: 'img/favicon.ico',

  future: {
    v4: true,
  },

  url: 'https://kms.stex.co.id',
  baseUrl: '/',

  organizationName: 'PT. Sukuntex',
  projectName: 'kms',

  onBrokenLinks: 'warn',

  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },

  i18n: {
    defaultLocale: 'id',
    locales: ['id'],
    localeConfigs: {
      id: {
        label: 'Bahasa Indonesia',
        direction: 'ltr',
        htmlLang: 'id',
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
    metadata: [{ name: 'google', content: 'notranslate' }],
    image: 'img/kms-social-card.png',
    colorMode: {
      defaultMode: 'light',
      disableSwitch: false,
      respectPrefersColorScheme: false,
    },
    navbar: {
      title: 'PT. Sukuntex KMS',
      logo: {
        alt: 'PT. Sukuntex Logo',
        src: 'img/logo.svg',
        srcDark: 'img/logo-dark.svg',
      },
      style: 'primary',
      hideOnScroll: false,
      items: [
        { to: '/documents', label: 'Dokumen', position: 'left' },
        { to: '/dictionary', label: 'Dictionary', position: 'left' },
        { to: '/faq', label: 'FAQ', position: 'left' },
        { to: '/about', label: 'Tentang KMS', position: 'left' },
        { to: '/admin', label: '⚙️', position: 'right', className: 'navbar-admin-btn' },
        { to: '/login', label: 'Masuk', position: 'right', className: 'navbar-login-btn' },
      ],
    },
    footer: {
      style: 'light',
      links: [],
      copyright: `© ${new Date().getFullYear()} PT. Sukuntex Knowledge Management System.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
