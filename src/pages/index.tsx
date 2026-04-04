import React, { useEffect, useState } from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import { supabase, timeAgo } from '../lib/supabase';
import type { ActivityLog } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

const DEPT_META = [
  { id: 'all', name: 'Umum (Semua Department)', nameEn: 'General', desc: 'SOP dan kebijakan perusahaan yang berlaku untuk semua departemen.', descEn: 'Company SOPs and policies applicable to all departments.' },
  { id: 'hrd', name: 'HRD', nameEn: 'Human Resources', desc: 'Rekrutmen, kebijakan SDM, prosedur cuti, dan penilaian kinerja karyawan.', descEn: 'Recruitment, HR policies, leave procedures, and employee performance.' },
  { id: 'finance', name: 'Finance', nameEn: 'Finance & Accounting', desc: 'Prosedur keuangan, laporan bulanan, anggaran, dan reimbursement.', descEn: 'Financial procedures, monthly reports, budgets, and reimbursements.' },
  { id: 'produksi', name: 'Produksi', nameEn: 'Production', desc: 'Proses produksi, kontrol kualitas, dan standar operasional pabrik.', descEn: 'Production processes, quality control, and factory operational standards.' },
  { id: 'pertenunan', name: 'Pertenunan', nameEn: 'Weaving', desc: 'Proses tenun, pemeliharaan mesin tenun, dan standar kualitas kain.', descEn: 'Weaving processes, loom maintenance, and fabric quality standards.' },
  { id: 'persiapan', name: 'Persiapan', nameEn: 'Preparation', desc: 'Persiapan bahan baku, pencelupan, dan proses awal produksi.', descEn: 'Raw material preparation, dyeing, and pre-production processes.' },
  { id: 'pergudangan', name: 'Pergudangan', nameEn: 'Warehousing', desc: 'Manajemen gudang, inventaris, penyimpanan, dan distribusi barang.', descEn: 'Warehouse management, inventory, storage, and goods distribution.' },
  { id: 'marketing', name: 'Marketing', nameEn: 'Marketing & Sales', desc: 'Strategi pemasaran, penjualan, hubungan pelanggan, dan promosi.', descEn: 'Marketing strategy, sales, customer relations, and promotions.' },
];

function HeroSection({ lang, docCount }: { lang: string; docCount: number }) {
  const isEn = lang === 'en';
  const [query, setQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      window.location.href = `/documents?q=${encodeURIComponent(query.trim())}`;
    }
  };

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
          ? `Access SOPs, policies, guidelines, and company procedures — fast, organized, and always up-to-date.`
          : `Akses SOP, kebijakan, panduan, dan prosedur perusahaan — cepat, terorganisir, dan selalu terkini.`}
      </p>
      <form onSubmit={handleSearch} className="kms-hero__search" style={{ position: 'relative' }}>
        <input
          type="text"
          placeholder={isEn ? 'Search for SOPs, policies, guides...' : 'Cari SOP, kebijakan, panduan...'}
          aria-label="Search KMS"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button type="submit" style={{ background: 'none', border: 'none', position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', padding: 0 }}>
          <span className="kms-hero__search-icon" style={{ position: 'relative', top: 0, right: 0, transform: 'none' }}>&#128269;</span>
        </button>
      </form>
    </section>
  );
}

function DeptGrid({ lang, deptCounts, currentUser, isAdmin }: { lang: string; deptCounts: Record<string, number>, currentUser: any, isAdmin: boolean }) {
  const isEn = lang === 'en';

  const visibleDepts = DEPT_META.filter(dept => {
    const isEditor = currentUser?.role === 'editor';
    if (isAdmin || isEditor || !currentUser) return true;
    if (currentUser.department === 'all') return true;
    return dept.id === 'all' || dept.id === currentUser.department;
  });

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
        {visibleDepts.map((dept) => {
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
        <details>
          <summary style={{ cursor: 'pointer', outline: 'none', fontWeight: 600, color: '#6b7280', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {isEn ? 'Recent Activity' : 'Aktivitas Terbaru'}
          </summary>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
            {logs.slice(0, 5).map((log) => {
              const docTitle = (log as any).documents?.title;
              const docSlug = (log as any).documents?.slug;
              const docLink = docTitle ? (
                <a href={`/document?slug=${docSlug}`} style={{ color: 'var(--kms-accent)', textDecoration: 'none', fontWeight: 600 }}>
                  "{docTitle}"
                </a>
              ) : null;

              let actionText: React.ReactNode = 'Aktivitas sistem';
              const action = log.action || '';

              if (action === 'view_document') actionText = <>{docLink || 'Dokumen'} {isEn ? 'accessed' : 'diakses'}</>;
              else if (action === 'add_comment') actionText = <>{isEn ? 'New comment on' : 'Komentar baru pada'} {docLink || 'dokumen'}</>;
              else if (action.includes('create_user')) actionText = isEn ? 'New user added' : 'Pengguna baru ditambahkan';
              else if (action.includes('update_user')) actionText = isEn ? 'User profile updated' : 'Profil pengguna diperbarui';
              else if (action.includes('create')) actionText = <>{isEn ? 'Document' : 'Dokumen'} {docLink} {isEn ? 'created' : 'ditambahkan'}</>;
              else if (action.includes('edit')) actionText = <>{isEn ? 'Document' : 'Dokumen'} {docLink} {isEn ? 'updated' : 'diperbarui'}</>;
              else if (action.includes('login')) actionText = isEn ? 'System login' : 'Masuk ke sistem';
              else if (docLink) actionText = <>{docLink} {isEn ? 'modified' : 'diubah'}</>;

              return (
                <div key={log.id} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid var(--ifm-toc-border-color)' }}>
                  <span style={{ fontSize: '0.82rem', minWidth: '20px', color: '#6b7280', fontFamily: 'monospace' }}>
                    {action.includes('create') ? 'NEW' : action.includes('edit') ? 'EDT' : action.includes('login') ? 'LOG' : 'ACT'}
                  </span>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: '0.88rem', color: '#374151' }}>
                      {actionText}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#9ca3af', whiteSpace: 'nowrap' }}>
                    {log.created_at ? timeAgo(log.created_at) : ''}
                  </span>
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: '1rem' }}>
            <Link to="/documents" style={{ fontSize: '0.83rem', color: 'var(--kms-accent)', textDecoration: 'none', fontWeight: 600 }}>
              {isEn ? 'Browse all documents →' : 'Lihat semua dokumen →'}
            </Link>
          </div>
        </details>
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
  }, [currentUser]);

  const fetchStats = async () => {
    // Memaksa penyegaran token jika kadaluarsa setelah tab idle lama


    // Fetch document counts grouped by department column
    const { data: docs } = await supabase
      .from('documents')
      .select('department, status')
      .eq('status', 'published');

    if (docs) {
      let allowedDocs = docs;
      // Allow editors to see all documents
      if (currentUser && currentUser.role !== 'admin' && currentUser.role !== 'editor' && currentUser.department !== 'all') {
        allowedDocs = docs.filter(d => d.department === 'all' || d.department === currentUser.department);
      }
      setTotalDocs(allowedDocs.length);

      const counts: Record<string, number> = {};
      for (const dept of DEPT_META) {
        counts[dept.id] = allowedDocs.filter((d) => d.department === dept.id).length;
      }
      setDeptCounts(counts);
    }

    // Fetch recent activity logs
    const { data: logs } = await supabase
      .from('activity_logs')
      .select('*, profiles(name, department), documents(title, slug)')
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
      <DeptGrid lang={lang} deptCounts={deptCounts} currentUser={currentUser} isAdmin={currentUser?.role === 'admin'} />
      {currentUser && <RecentActivity lang={lang} logs={recentLogs} />}
    </Layout>
  );
}
