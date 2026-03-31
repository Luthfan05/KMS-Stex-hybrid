import React, { useEffect, useState } from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import { supabase, timeAgo } from '../lib/supabase';
import type { ActivityLog } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

const DEPT_META = [
  { id: 'hrd',         name: 'HRD',          nameEn: 'Human Resources',      desc: 'Rekrutmen, kebijakan SDM, prosedur cuti, dan penilaian kinerja karyawan.', descEn: 'Recruitment, HR policies, leave procedures, and employee performance.' },
  { id: 'finance',     name: 'Finance',       nameEn: 'Finance & Accounting',  desc: 'Prosedur keuangan, laporan bulanan, anggaran, dan reimbursement.', descEn: 'Financial procedures, monthly reports, budgets, and reimbursements.' },
  { id: 'produksi',    name: 'Produksi',      nameEn: 'Production',            desc: 'Proses produksi, kontrol kualitas, dan standar operasional pabrik.', descEn: 'Production processes, quality control, and factory operational standards.' },
  { id: 'pertenunan',  name: 'Pertenunan',    nameEn: 'Weaving',               desc: 'Proses tenun, pemeliharaan mesin tenun, dan standar kualitas kain.', descEn: 'Weaving processes, loom maintenance, and fabric quality standards.' },
  { id: 'persiapan',   name: 'Persiapan',     nameEn: 'Preparation',           desc: 'Persiapan bahan baku, pencelupan, dan proses awal produksi.', descEn: 'Raw material preparation, dyeing, and pre-production processes.' },
  { id: 'pergudangan', name: 'Pergudangan',   nameEn: 'Warehousing',           desc: 'Manajemen gudang, inventaris, penyimpanan, dan distribusi barang.', descEn: 'Warehouse management, inventory, storage, and goods distribution.' },
  { id: 'marketing',   name: 'Marketing',     nameEn: 'Marketing & Sales',     desc: 'Strategi pemasaran, penjualan, hubungan pelanggan, dan promosi.', descEn: 'Marketing strategy, sales, customer relations, and promotions.' },
];

function HeroSection({ lang, docCount }: { lang: string; docCount: number }) {
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
          ? `Access SOPs, policies, guidelines, and company procedures — fast, organized, and always up-to-date. ${docCount > 0 ? `(${docCount} documents available)` : ''}`
          : `Akses SOP, kebijakan, panduan, dan prosedur perusahaan — cepat, terorganisir, dan selalu terkini. ${docCount > 0 ? `(${docCount} dokumen tersedia)` : ''}`}
      </p>
      <div className="kms-hero__search">
        <input
          type="text"
          placeholder={isEn ? 'Search for SOPs, policies, guides...' : 'Cari SOP, kebijakan, panduan...'}
          aria-label="Search KMS"
          onFocus={(e) => {
            const searchBtn = document.querySelector<HTMLButtonElement>('.DocSearch-Button');
            if (searchBtn) searchBtn.click();
            (e.target as HTMLInputElement).blur();
          }}
          readOnly
          style={{ cursor: 'pointer' }}
        />
        <span className="kms-hero__search-icon">&#128269;</span>
      </div>
    </section>
  );
}

function DeptGrid({ lang, deptCounts }: { lang: string; deptCounts: Record<string, number> }) {
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
        {DEPT_META.map((dept) => {
          const count = deptCounts[dept.id] ?? 0;
          return (
            <Link key={dept.id} to={`/documents?dept=${dept.id}`} className="kms-dept-card">
              <div className="kms-dept-card__icon" style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--kms-accent)' }}>{dept.name.charAt(0)}</div>
              <div>
                <p className="kms-dept-card__name">{dept.name}</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--kms-accent)', fontWeight: 600, margin: '0 0 0.35rem' }}>
                  {isEn ? dept.nameEn : dept.name}
                </p>
              </div>
              <p className="kms-dept-card__desc">{isEn ? dept.descEn : dept.desc}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                  {count} {isEn ? 'docs' : 'dokumen'}
                </span>
                <span className="kms-dept-card__arrow">→</span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function RecentActivity({ lang, logs }: { lang: string; logs: ActivityLog[] }) {
  const isEn = lang === 'en';
  if (logs.length === 0) return null;
  return (
    <section style={{ background: 'var(--ifm-background-surface-color)', padding: '2.5rem 2rem', borderTop: '1px solid var(--ifm-toc-border-color)' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <h3 style={{ fontSize: '1rem', color: '#6b7280', fontWeight: 600, marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {isEn ? 'Recent Activity' : 'Aktivitas Terbaru'}
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {logs.slice(0, 5).map((log) => (
            <div key={log.id} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid var(--ifm-toc-border-color)' }}>
              <span style={{ fontSize: '0.82rem', minWidth: '20px', color: '#6b7280', fontFamily: 'monospace' }}>
                {log.action?.includes('create') ? 'NEW' : log.action?.includes('edit') ? 'EDT' : log.action?.includes('login') ? 'LOG' : 'ACT'}
              </span>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: '0.83rem', color: '#374151' }}>
                  <strong>{(log as any).profiles?.name || 'Unknown'}</strong>
                  {' — '}
                  <span style={{ color: '#6b7280' }}>{log.action || '—'}</span>
                  {(log as any).documents?.title && (
                    <span>
                      {': '}
                      <a href={`/document?slug=${(log as any).documents.slug}`} style={{ color: 'var(--kms-accent)', textDecoration: 'none' }}>
                        {(log as any).documents.title}
                      </a>
                    </span>
                  )}
                </span>
              </div>
              <span style={{ fontSize: '0.75rem', color: '#9ca3af', whiteSpace: 'nowrap' }}>
                {log.created_at ? timeAgo(log.created_at) : ''}
              </span>
            </div>
          ))}
        </div>
        <div style={{ marginTop: '1rem' }}>
          <Link to="/documents" style={{ fontSize: '0.83rem', color: 'var(--kms-accent)', textDecoration: 'none', fontWeight: 600 }}>
            {isEn ? 'Browse all documents →' : 'Lihat semua dokumen →'}
          </Link>
        </div>
      </div>
    </section>
  );
}

function QuickLinks({ lang }: { lang: string }) {
  const isEn = lang === 'en';
  const links = [
    { label: isEn ? 'All Documents' : 'Semua Dokumen', path: '/documents' },
    { label: isEn ? 'Login' : 'Masuk', path: '/login' },
    { label: isEn ? 'Admin Dashboard' : 'Dashboard Admin', path: '/admin' },
    { label: isEn ? 'User Guide' : 'Panduan Penggunaan', path: '/documents?dept=all' },
  ];
  return (
    <section style={{ padding: '2rem 2rem 3rem', borderTop: '1px solid var(--ifm-toc-border-color)' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <h3 style={{ fontSize: '1rem', color: '#6b7280', fontWeight: 600, marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {isEn ? 'Quick Access' : 'Akses Cepat'}
        </h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
          {links.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '8px 16px', background: '#ffffff', border: '1.5px solid var(--ifm-toc-border-color)',
                borderRadius: '8px', fontSize: '0.85rem', fontWeight: 500,
                color: 'var(--kms-primary)', textDecoration: 'none', transition: 'all 0.15s ease',
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
              {link.label}
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
  const { currentUser } = useAuth();

  const [deptCounts, setDeptCounts] = useState<Record<string, number>>({});
  const [totalDocs, setTotalDocs] = useState(0);
  const [recentLogs, setRecentLogs] = useState<ActivityLog[]>([]);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    // Fetch document counts grouped by department column
    const { data: docs } = await supabase
      .from('documents')
      .select('department, status')
      .eq('status', 'published');

    if (docs) {
      setTotalDocs(docs.length);
      const counts: Record<string, number> = {};
      for (const dept of DEPT_META) {
        counts[dept.id] = docs.filter((d) => d.department === dept.id).length;
      }
      setDeptCounts(counts);
    }

    // Fetch recent activity logs
    const { data: logs } = await supabase
      .from('activity_logs')
      .select('*, profiles(name), documents(title, slug)')
      .order('created_at', { ascending: false })
      .limit(10);
    if (logs) setRecentLogs(logs as ActivityLog[]);
  };

  return (
    <Layout
      title={lang === 'en' ? 'Knowledge Management System' : 'Sistem Manajemen Pengetahuan'}
      description={lang === 'en'
        ? 'Centralized company knowledge base for all departments'
        : 'Basis pengetahuan perusahaan terpusat untuk semua departemen'}
    >
      <HeroSection lang={lang} docCount={totalDocs} />
      <DeptGrid lang={lang} deptCounts={deptCounts} />
      {currentUser && <RecentActivity lang={lang} logs={recentLogs} />}
      <QuickLinks lang={lang} />
    </Layout>
  );
}
