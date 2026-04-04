import React from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import ThemedImage from '@theme/ThemedImage';
import useBaseUrl from '@docusaurus/useBaseUrl';

const FEATURES = [
  {
    title: 'Manajemen Dokumen',
    titleEn: 'Document Management',
    desc: 'Buat, edit, dan kelola semua dokumen perusahaan dalam satu platform terpusat.',
    descEn: 'Create, edit, and manage all company documents in one centralized platform.',
  },
  /*
  {
    title: 'Per Departemen',
    titleEn: 'Department-Based',
    desc: 'Dokumen diorganisir per departemen: HRD, Finance, Produksi, Pertenunan, Persiapan, Pergudangan, dan Marketing.',
    descEn: 'Documents organized by department: HR, Finance, Production, Weaving, Preparation, Warehousing, and Marketing.',
  },
  {
    title: 'Riwayat Versi',
    titleEn: 'Version History',
    desc: 'Setiap perubahan tercatat. Lihat siapa yang mengubah apa dan kapan.',
    descEn: 'Every change is tracked. See who changed what and when.',
  },
  */
  {
    title: 'Kontrol Akses',
    titleEn: 'Access Control',
    desc: 'Tiga level peran (Admin, Editor, Viewer) dengan akses berbasis departemen.',
    descEn: 'Three role levels (Admin, Editor, Viewer) with department-based access.',
  },
  {
    title: 'Kolaborasi',
    titleEn: 'Collaboration',
    desc: 'Komentar, balasan, dan feedback langsung di setiap dokumen.',
    descEn: 'Comments, replies, and feedback directly on each document.',
  },
  /*
  {
    title: 'Bilingual',
    titleEn: 'Bilingual',
    desc: 'Mendukung Bahasa Indonesia dan English untuk semua antarmuka.',
    descEn: 'Supports Indonesian and English for all interfaces.',
  },
  {
    title: 'Responsif',
    titleEn: 'Responsive',
    desc: 'Dioptimalkan untuk perangkat mobile dan tablet — akses dari mana saja.',
    descEn: 'Optimized for mobile and tablet devices — access from anywhere.',
  },
  {
    title: 'Log Aktivitas',
    titleEn: 'Activity Logs',
    desc: 'Pantau semua aktivitas pengguna: login, view, edit, dan komentar.',
    descEn: 'Monitor all user activity: logins, views, edits, and comments.',
  },
  */
  {
    title: 'Real-time',
    titleEn: 'Real-time',
    desc: 'Data selalu terkini dari database.',
    descEn: 'Data is always up-to-date from the database.',
  },
];

const ROLES = [
  {
    role: 'Admin',
    color: '#92400e',
    bg: '#fef3c7',
    perms: ['Mengelola semua pengguna', 'Membuat & mengedit semua dokumen', 'Mengubah role & departemen', 'Melihat log aktivitas'],
    permsEn: ['Manage all users', 'Create & edit all documents', 'Change roles & departments', 'View activity logs'],
  },
  {
    role: 'Editor',
    color: '#1e40af',
    bg: '#dbeafe',
    perms: ['Membuat dokumen baru', 'Mengedit dokumen sendiri', 'Menyetujui dokumen', 'Memberi komentar'],
    permsEn: ['Create new documents', 'Edit own documents', 'Approve documents', 'Add comments'],
  },
  {
    role: 'Viewer',
    color: '#166534',
    bg: '#f0fdf4',
    perms: ['Membaca dokumen yang tersedia', 'Memberi feedback', 'Menambah komentar'],
    permsEn: ['Read available documents', 'Give feedback', 'Add comments'],
  },
];

export default function AboutPage() {
  const { i18n } = useDocusaurusContext();
  const isEn = i18n.currentLocale === 'en';

  return (
    <Layout
      title={isEn ? 'About KMS' : 'Tentang KMS'}
      description={isEn ? 'About the PT. Sukuntex Knowledge Management System' : 'Tentang Sistem Manajemen Pengetahuan PT. Sukuntex'}
    >
      <div className="kms-about">
        {/* Hero */}
        <div className="kms-about__hero">
          <ThemedImage
            alt="PT. Sukuntex Logo"
            sources={{
              light: useBaseUrl('/img/logo.svg'),
              dark: useBaseUrl('/img/logo-dark.svg'),
            }}
            style={{ height: '70px', display: 'block', margin: '0 auto 1.25rem' }}
          />
          <h1>{isEn ? 'About PT. Sukuntex KMS' : 'Tentang PT. Sukuntex KMS'}</h1>
          <p>
            {isEn
              ? 'PT. Sukuntex KMS is a Knowledge Management System used as a centralized company documentation. It stores all important information, from standard operating procedures (SOPs) and work manuals to operational records.'
              : 'PT. Sukuntex KMS adalah Knowledge Management System yang digunakan sebagai pusat dokumentasi perusahaan. Semua informasi penting mulai dari SOP, panduan kerja, hingga catatan operasional.'}
          </p>
        </div>

        {/* Features */}
        <h2 style={{ textAlign: 'center', fontSize: '1.3rem', marginBottom: '0.5rem' }}>
          {isEn ? 'Key Features' : 'Fitur Utama'}
        </h2>
        <p style={{ textAlign: 'center', color: '#6b7280', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          {isEn
            ? 'Everything you need for company knowledge management in one place.'
            : 'Semua kebutuhan manajemen pengetahuan dalam satu platform.'}
        </p>

        <div className="kms-feature-grid">
          {FEATURES.map((f) => (
            <div key={f.title} className="kms-feature-card">
              <p className="kms-feature-card__title">{isEn ? f.titleEn : f.title}</p>
              <p className="kms-feature-card__desc">{isEn ? f.descEn : f.desc}</p>
            </div>
          ))}
        </div>

        {/* Roles */}
        <h2 style={{ textAlign: 'center', fontSize: '1.3rem', marginTop: '3rem', marginBottom: '0.5rem' }}>
          {isEn ? 'User Roles' : 'Tingkatan Pengguna'}
        </h2>
        <p style={{ textAlign: 'center', color: '#6b7280', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          {isEn
            ? 'Three levels of access control to keep your documents secure.'
            : 'Hak akses dibagi jadi tiga supaya tetap aman dan terkontrol.'}
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.25rem', margin: '1.5rem 0' }}>
          {ROLES.map((r) => (
            <div key={r.role} className="kms-card kms-card--static" style={{ borderTop: `4px solid ${r.color}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
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

        {/* CTA */}
        <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
          <Link to="/documents" className="kms-btn kms-btn--accent" style={{ width: 'auto', padding: '12px 32px', display: 'inline-flex' }}>
            {isEn ? 'Browse Documents' : 'Jelajahi Dokumen'}
          </Link>
        </div>

        {/* Footer note */}
        <div className="kms-notice kms-notice--info" style={{ marginTop: '2rem' }}>
          {isEn
            ? 'PT. Sukuntex KMS is an internal system for authorized company personnel. Contact Human Resources Department for access.'
            : 'PT. Sukuntex KMS adalah sistem internal untuk karyawan perusahaan yang berwenang. Hubungi HRD untuk mendapatkan akses.'}
        </div>
      </div>
    </Layout>
  );
}
