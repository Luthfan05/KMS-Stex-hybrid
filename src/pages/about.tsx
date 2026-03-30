import React from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

const FEATURES = [
  {
    icon: '📚',
    title: 'Manajemen Dokumen',
    titleEn: 'Document Management',
    desc: 'Buat, edit, dan kelola semua dokumen perusahaan dalam satu platform terpusat.',
    descEn: 'Create, edit, and manage all company documents in one centralized platform.',
  },
  {
    icon: '🏢',
    title: 'Per Departemen',
    titleEn: 'Department-Based',
    desc: 'Dokumen diorganisir per departemen: HRD, Finance, Operasional, IT, dan Legal.',
    descEn: 'Documents organized by department: HR, Finance, Operations, IT, and Legal.',
  },
  {
    icon: '📋',
    title: 'Riwayat Versi',
    titleEn: 'Version History',
    desc: 'Setiap perubahan tercatat. Lihat siapa yang mengubah apa dan kapan.',
    descEn: 'Every change is tracked. See who changed what and when.',
  },
  {
    icon: '🔐',
    title: 'Kontrol Akses',
    titleEn: 'Access Control',
    desc: 'Tiga level peran (Admin, Editor, Viewer) dengan akses berbasis departemen.',
    descEn: 'Three role levels (Admin, Editor, Viewer) with department-based access.',
  },
  {
    icon: '💬',
    title: 'Kolaborasi',
    titleEn: 'Collaboration',
    desc: 'Komentar, balasan, dan feedback langsung di setiap dokumen.',
    descEn: 'Comments, replies, and feedback directly on each document.',
  },
  {
    icon: '🌐',
    title: 'Bilingual',
    titleEn: 'Bilingual',
    desc: 'Mendukung Bahasa Indonesia dan English untuk semua antarmuka.',
    descEn: 'Supports Indonesian and English for all interfaces.',
  },
  {
    icon: '📱',
    title: 'Responsif',
    titleEn: 'Responsive',
    desc: 'Dioptimalkan untuk perangkat mobile dan tablet — akses dari mana saja.',
    descEn: 'Optimized for mobile and tablet devices — access from anywhere.',
  },
  {
    icon: '📊',
    title: 'Log Aktivitas',
    titleEn: 'Activity Logs',
    desc: 'Pantau semua aktivitas pengguna: login, view, edit, dan komentar.',
    descEn: 'Monitor all user activity: logins, views, edits, and comments.',
  },
  {
    icon: '⚡',
    title: 'Real-time',
    titleEn: 'Real-time',
    desc: 'Data selalu terkini dari database Supabase PostgreSQL.',
    descEn: 'Data is always up-to-date from the Supabase PostgreSQL database.',
  },
];

const ROLES = [
  {
    role: 'Admin',
    icon: '👑',
    color: '#92400e',
    bg: '#fef3c7',
    perms: ['Mengelola semua pengguna', 'Membuat & mengedit semua dokumen', 'Mengubah role & departemen', 'Melihat log aktivitas'],
    permsEn: ['Manage all users', 'Create & edit all documents', 'Change roles & departments', 'View activity logs'],
  },
  {
    role: 'Editor',
    icon: '✏️',
    color: '#1e40af',
    bg: '#dbeafe',
    perms: ['Membuat dokumen baru', 'Mengedit dokumen sendiri', 'Menyetujui dokumen', 'Memberi komentar'],
    permsEn: ['Create new documents', 'Edit own documents', 'Approve documents', 'Add comments'],
  },
  {
    role: 'Viewer',
    icon: '👁️',
    color: '#166534',
    bg: '#f0fdf4',
    perms: ['Membaca dokumen yang tersedia', 'Memberi feedback', 'Menambah komentar', 'Melihat riwayat versi'],
    permsEn: ['Read available documents', 'Give feedback', 'Add comments', 'View version history'],
  },
];

export default function AboutPage() {
  const { i18n } = useDocusaurusContext();
  const isEn = i18n.currentLocale === 'en';

  return (
    <Layout
      title={isEn ? 'About KMS' : 'Tentang KMS'}
      description={isEn ? 'About the STex Knowledge Management System' : 'Tentang Sistem Manajemen Pengetahuan STex'}
    >
      <div className="kms-about">
        {/* Hero */}
        <div className="kms-about__hero">
          <div style={{
            width: 70, height: 70, borderRadius: 16,
            background: 'linear-gradient(135deg, var(--kms-primary), var(--kms-accent))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1.25rem', fontSize: '2rem',
          }}>
            📚
          </div>
          <h1>{isEn ? 'About STex KMS' : 'Tentang STex KMS'}</h1>
          <p>
            {isEn
              ? 'A centralized Knowledge Management System built for efficient company-wide document management.'
              : 'Sistem Manajemen Pengetahuan terpusat yang dibangun untuk pengelolaan dokumen perusahaan yang efisien.'}
          </p>
        </div>

        {/* Features */}
        <h2 style={{ textAlign: 'center', fontSize: '1.3rem', marginBottom: '0.5rem' }}>
          {isEn ? '✨ Key Features' : '✨ Fitur Utama'}
        </h2>
        <p style={{ textAlign: 'center', color: '#6b7280', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          {isEn
            ? 'Everything you need for company knowledge management in one platform.'
            : 'Semua yang Anda butuhkan untuk manajemen pengetahuan perusahaan dalam satu platform.'}
        </p>

        <div className="kms-feature-grid">
          {FEATURES.map((f) => (
            <div key={f.title} className="kms-feature-card">
              <div className="kms-feature-card__icon">{f.icon}</div>
              <p className="kms-feature-card__title">{isEn ? f.titleEn : f.title}</p>
              <p className="kms-feature-card__desc">{isEn ? f.descEn : f.desc}</p>
            </div>
          ))}
        </div>

        {/* Roles */}
        <h2 style={{ textAlign: 'center', fontSize: '1.3rem', marginTop: '3rem', marginBottom: '0.5rem' }}>
          {isEn ? '🔐 User Roles' : '🔐 Peran Pengguna'}
        </h2>
        <p style={{ textAlign: 'center', color: '#6b7280', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          {isEn
            ? 'Three levels of access control to keep your documents secure.'
            : 'Tiga level kontrol akses untuk menjaga keamanan dokumen Anda.'}
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.25rem', margin: '1.5rem 0' }}>
          {ROLES.map((r) => (
            <div key={r.role} className="kms-card kms-card--static" style={{ borderTop: `4px solid ${r.color}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <span style={{ fontSize: '1.5rem' }}>{r.icon}</span>
                <span style={{ fontWeight: 700, fontSize: '1.1rem', color: r.color }}>{r.role}</span>
              </div>
              <ul style={{ margin: 0, paddingLeft: '1.25rem', listStyleType: 'disc' }}>
                {(isEn ? r.permsEn : r.perms).map((p) => (
                  <li key={p} style={{ fontSize: '0.85rem', color: '#4b5563', marginBottom: '0.35rem', lineHeight: 1.5 }}>{p}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Tech Stack */}
        <div className="kms-card kms-card--static" style={{ marginTop: '2.5rem', textAlign: 'center' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--kms-primary)' }}>
            🛠️ {isEn ? 'Technology Stack' : 'Teknologi yang Digunakan'}
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'center' }}>
            {[
              { name: 'Docusaurus', icon: '🦖' },
              { name: 'React', icon: '⚛️' },
              { name: 'TypeScript', icon: '📘' },
              { name: 'Supabase', icon: '⚡' },
              { name: 'PostgreSQL', icon: '🐘' },
            ].map((tech) => (
              <span key={tech.name} style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '8px 16px', background: 'var(--kms-primary-light)',
                border: '1px solid var(--ifm-toc-border-color)',
                borderRadius: '8px', fontSize: '0.85rem', fontWeight: 500, color: 'var(--kms-primary)',
              }}>
                {tech.icon} {tech.name}
              </span>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
          <Link to="/documents" className="kms-btn kms-btn--accent" style={{ width: 'auto', padding: '12px 32px', display: 'inline-flex' }}>
            📚 {isEn ? 'Browse Documents' : 'Jelajahi Dokumen'}
          </Link>
        </div>

        {/* Footer note */}
        <div className="kms-notice kms-notice--info" style={{ marginTop: '2rem' }}>
          🏢 {isEn
            ? 'STex KMS is an internal system for authorized company personnel. Contact your administrator for access.'
            : 'STex KMS adalah sistem internal untuk karyawan perusahaan yang berwenang. Hubungi administrator Anda untuk mendapatkan akses.'}
        </div>
      </div>
    </Layout>
  );
}
