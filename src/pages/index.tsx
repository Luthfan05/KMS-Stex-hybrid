import React from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';

const departments = [
  {
    id: 'hrd',
    icon: '👥',
    name: 'HRD',
    nameEn: 'Human Resources',
    desc: 'Rekrutmen, kebijakan SDM, prosedur cuti, dan penilaian kinerja karyawan.',
    descEn: 'Recruitment, HR policies, leave procedures, and employee performance.',
    path: '/docs/hrd/intro',
    count: 5,
  },
  {
    id: 'finance',
    icon: '💰',
    name: 'Finance',
    nameEn: 'Finance & Accounting',
    desc: 'Prosedur keuangan, laporan bulanan, anggaran, dan reimbursement.',
    descEn: 'Financial procedures, monthly reports, budgets, and reimbursements.',
    path: '/docs/finance/intro',
    count: 5,
  },
  {
    id: 'operasional',
    icon: '⚙️',
    name: 'Operasional',
    nameEn: 'Operations',
    desc: 'SOP lapangan, keselamatan kerja, pemeliharaan alat, dan pelaporan insiden.',
    descEn: 'Field SOPs, work safety, tool maintenance, and incident reporting.',
    path: '/docs/operasional/intro',
    count: 5,
  },
  {
    id: 'it',
    icon: '💻',
    name: 'IT',
    nameEn: 'Information Technology',
    desc: 'Panduan teknis, keamanan data, infrastruktur, dan troubleshooting.',
    descEn: 'Technical guides, data security, infrastructure, and troubleshooting.',
    path: '/docs/it/intro',
    count: 5,
  },
  {
    id: 'legal',
    icon: '⚖️',
    name: 'Legal',
    nameEn: 'Legal & Compliance',
    desc: 'Regulasi perusahaan, kontrak, kepatuhan, dan privasi data.',
    descEn: 'Company regulations, contracts, compliance, and data privacy.',
    path: '/docs/legal/intro',
    count: 5,
  },
];

function HeroSection({ lang }: { lang: string }) {
  const isEn = lang === 'en';
  return (
    <section className="kms-hero">
      <div className="kms-hero__eyebrow">
        {isEn ? 'Company Knowledge Base' : 'Basis Pengetahuan Perusahaan'}
      </div>
      <h1 className="kms-hero__title">
        {isEn ? 'Find Any Knowledge, Anywhere' : 'Temukan Pengetahuan Kapan Saja'}
      </h1>
      <p className="kms-hero__subtitle">
        {isEn
          ? 'Access SOPs, policies, guidelines, and company procedures — fast, organized, and always up-to-date.'
          : 'Akses SOP, kebijakan, panduan, dan prosedur perusahaan — cepat, terorganisir, dan selalu terkini.'}
      </p>
      <div className="kms-hero__search">
        <input
          type="text"
          placeholder={isEn ? 'Search for SOPs, policies, guides...' : 'Cari SOP, kebijakan, panduan...'}
          aria-label="Search KMS"
          onFocus={(e) => {
            // Trigger Docusaurus local search
            const searchBtn = document.querySelector<HTMLButtonElement>('.DocSearch-Button');
            if (searchBtn) searchBtn.click();
            (e.target as HTMLInputElement).blur();
          }}
          readOnly
          style={{ cursor: 'pointer' }}
        />
        <span className="kms-hero__search-icon">🔍</span>
      </div>
    </section>
  );
}

function DeptGrid({ lang }: { lang: string }) {
  const isEn = lang === 'en';
  return (
    <section style={{ padding: '3rem 2rem', maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.4rem' }}>
          {isEn ? 'Browse by Department' : 'Jelajahi per Departemen'}
        </h2>
        <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>
          {isEn
            ? 'Select your department to access relevant documents.'
            : 'Pilih departemen Anda untuk mengakses dokumen yang relevan.'}
        </p>
      </div>
      <div className="kms-dept-grid">
        {departments.map((dept) => (
          <Link key={dept.id} to={dept.path} className="kms-dept-card">
            <div className="kms-dept-card__icon">{dept.icon}</div>
            <div>
              <p className="kms-dept-card__name">{dept.name}</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--kms-accent)', fontWeight: 600, margin: '0 0 0.35rem' }}>
                {isEn ? dept.nameEn : dept.name}
              </p>
            </div>
            <p className="kms-dept-card__desc">{isEn ? dept.descEn : dept.desc}</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                {dept.count} {isEn ? 'docs' : 'dokumen'}
              </span>
              <span className="kms-dept-card__arrow">→</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function QuickLinks({ lang }: { lang: string }) {
  const isEn = lang === 'en';
  const links = [
    { icon: '📋', label: isEn ? 'Field SOP' : 'SOP Lapangan', path: '/docs/operasional/sop-lapangan' },
    { icon: '📝', label: isEn ? 'Leave Procedure' : 'Prosedur Cuti', path: '/docs/hrd/prosedur-cuti' },
    { icon: '💸', label: isEn ? 'Reimbursement' : 'Reimbursement', path: '/docs/finance/reimbursement' },
    { icon: '🔐', label: isEn ? 'Data Security' : 'Keamanan Data', path: '/docs/it/keamanan-data' },
    { icon: '📖', label: isEn ? 'User Guide' : 'Panduan Penggunaan', path: '/docs/panduan/intro' },
  ];
  return (
    <section style={{ background: 'var(--ifm-background-surface-color)', padding: '2.5rem 2rem', borderTop: '1px solid var(--ifm-toc-border-color)' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <h3 style={{ fontSize: '1rem', color: '#6b7280', fontWeight: 600, marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          ⚡ {isEn ? 'Quick Access' : 'Akses Cepat'}
        </h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
          {links.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                background: '#ffffff',
                border: '1.5px solid var(--ifm-toc-border-color)',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: 500,
                color: 'var(--kms-primary)',
                textDecoration: 'none',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--kms-accent)';
                (e.currentTarget as HTMLElement).style.color = 'var(--kms-accent)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--ifm-toc-border-color)';
                (e.currentTarget as HTMLElement).style.color = 'var(--kms-primary)';
              }}
            >
              <span>{link.icon}</span> {link.label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const { siteConfig, i18n } = useDocusaurusContext();
  const lang = i18n.currentLocale;

  return (
    <Layout
      title={lang === 'en' ? 'Knowledge Management System' : 'Sistem Manajemen Pengetahuan'}
      description={lang === 'en'
        ? 'Centralized company knowledge base for all departments'
        : 'Basis pengetahuan perusahaan terpusat untuk semua departemen'}
    >
      <HeroSection lang={lang} />
      <DeptGrid lang={lang} />
      <QuickLinks lang={lang} />
    </Layout>
  );
}
