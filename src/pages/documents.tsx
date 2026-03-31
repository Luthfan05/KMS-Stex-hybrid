import React, { useState, useEffect } from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import { useLocation } from '@docusaurus/router';
import { supabase, timeAgo } from '../lib/supabase';
import type { KMSDocument } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

const DEPT_OPTIONS = [
  { value: 'all', label: 'Semua Departemen' },
  { value: 'hrd', label: 'HRD' },
  { value: 'finance', label: 'Finance' },
  { value: 'produksi', label: 'Produksi' },
  { value: 'pertenunan', label: 'Pertenunan' },
  { value: 'persiapan', label: 'Persiapan' },
  { value: 'pergudangan', label: 'Pergudangan' },
  { value: 'marketing', label: 'Marketing' },
];

const STATUS_OPTIONS = [
  { value: 'all', label: 'Semua Status' },
  { value: 'published', label: 'Terbit' },
  { value: 'draft', label: 'Draft' },
  { value: 'review', label: 'Review' },
];

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function DocumentsPage() {
  const query = useQuery();
  const { currentUser, isAdmin, isEditor } = useAuth();

  const [documents, setDocuments] = useState<KMSDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState(query.get('dept') || 'all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 12;

  useEffect(() => {
    fetchDocuments();
  }, [deptFilter, statusFilter, page]);

  const fetchDocuments = async () => {
    setLoading(true);
    let q = supabase
      .from('documents')
      .select('*, profiles(name)')
      .order('updated_at', { ascending: false })
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

    if (deptFilter !== 'all') {
      q = q.eq('department', deptFilter);
    }
    if (statusFilter !== 'all') {
      q = q.eq('status', statusFilter);
    }

    const { data, error } = await q;
    if (!error && data) setDocuments(data as KMSDocument[]);
    setLoading(false);
  };

  const filtered = documents.filter((d) => {
    if (!search) return true;
    return d.title.toLowerCase().includes(search.toLowerCase()) ||
      d.slug.toLowerCase().includes(search.toLowerCase());
  });

  const statusBadge = (status: string) => {
    const map: Record<string, { bg: string; color: string; label: string }> = {
      published: { bg: '#d1fae5', color: '#065f46', label: 'Terbit' },
      draft:     { bg: '#fef3c7', color: '#92400e', label: 'Draft' },
      review:    { bg: '#dbeafe', color: '#1e40af', label: 'Review' },
    };
    const s = map[status] || { bg: '#f3f4f6', color: '#6b7280', label: status };
    return (
      <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 600, background: s.bg, color: s.color }}>
        {s.label}
      </span>
    );
  };

  return (
    <Layout title="Daftar Dokumen" description="Semua dokumen KMS STex">
      <div className="kms-dashboard">
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.6rem', marginBottom: '0.2rem' }}>Daftar Dokumen</h1>
            <p style={{ color: '#6b7280', margin: 0, fontSize: '0.9rem' }}>
              Semua dokumen perusahaan yang tersedia
            </p>
          </div>
          {isEditor && (
            <a href="/documents/new" className="kms-btn kms-btn--accent" style={{ width: 'auto', padding: '10px 20px' }}>
              + Dokumen Baru
            </a>
          )}
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Cari judul atau slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ flex: 1, minWidth: '220px', padding: '10px 14px', border: '1.5px solid #e5e7eb', borderRadius: '8px', fontSize: '0.88rem', outline: 'none', fontFamily: 'inherit' }}
          />
          <select
            value={deptFilter}
            onChange={(e) => { setDeptFilter(e.target.value); setPage(0); }}
            style={{ padding: '10px 14px', border: '1.5px solid #e5e7eb', borderRadius: '8px', fontSize: '0.88rem', background: '#fff', fontFamily: 'inherit', cursor: 'pointer' }}
          >
            {DEPT_OPTIONS.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
            style={{ padding: '10px 14px', border: '1.5px solid #e5e7eb', borderRadius: '8px', fontSize: '0.88rem', background: '#fff', fontFamily: 'inherit', cursor: 'pointer' }}
          >
            {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>

        {/* Department quick tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          {DEPT_OPTIONS.map((d) => (
            <button
              key={d.value}
              onClick={() => { setDeptFilter(d.value); setPage(0); }}
              style={{
                padding: '6px 14px', border: '1.5px solid',
                borderColor: deptFilter === d.value ? 'var(--kms-accent)' : '#e5e7eb',
                borderRadius: '20px', fontSize: '0.82rem', fontWeight: deptFilter === d.value ? 700 : 500,
                background: deptFilter === d.value ? 'var(--kms-accent)' : '#fff',
                color: deptFilter === d.value ? '#fff' : '#6b7280',
                cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
              }}
            >
              {d.label}
            </button>
          ))}
        </div>

        {/* Document grid */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
            <div className="kms-spinner" />
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#9ca3af' }}>--</div>
            <h3 style={{ color: '#6b7280' }}>Tidak ada dokumen ditemukan</h3>
            <p style={{ color: '#9ca3af', fontSize: '0.9rem' }}>Coba ubah filter atau kata kunci pencarian.</p>
          </div>
        ) : (
          <>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '1.25rem',
              marginBottom: '2rem',
            }}>
              {filtered.map((doc) => (
                <Link
                  key={doc.id}
                  to={`/document?slug=${doc.slug}`}
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <div
                    className="kms-card"
                    style={{ height: '100%', cursor: 'pointer', transition: 'all 0.2s', borderLeft: '4px solid var(--kms-accent)', margin: 0 }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = ''; }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                      <h3 style={{ margin: 0, fontSize: '1rem', color: '#111827', lineHeight: 1.4, flex: 1 }}>
                        {doc.title}
                      </h3>
                      {statusBadge(doc.status)}
                    </div>
                    <div style={{ fontFamily: 'monospace', fontSize: '0.72rem', color: '#9ca3af', marginBottom: '0.75rem' }}>
                      /{doc.slug}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                      <span style={{ fontSize: '0.78rem', color: '#6b7280' }}>
                        {(doc as any).profiles?.name || 'Unknown'}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                        {doc.updated_at ? timeAgo(doc.updated_at) : ''}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', padding: '1rem 0' }}>
              <button
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
                style={{ padding: '8px 16px', border: '1.5px solid #e5e7eb', borderRadius: '8px', background: '#fff', cursor: page === 0 ? 'default' : 'pointer', opacity: page === 0 ? 0.5 : 1, fontFamily: 'inherit', fontSize: '0.88rem' }}
              >
                ← Sebelumnya
              </button>
              <span style={{ padding: '8px 16px', fontSize: '0.88rem', color: '#6b7280' }}>
                Hal. {page + 1}
              </span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={filtered.length < PAGE_SIZE}
                style={{ padding: '8px 16px', border: '1.5px solid #e5e7eb', borderRadius: '8px', background: '#fff', cursor: filtered.length < PAGE_SIZE ? 'default' : 'pointer', opacity: filtered.length < PAGE_SIZE ? 0.5 : 1, fontFamily: 'inherit', fontSize: '0.88rem' }}
              >
                Berikutnya →
              </button>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
