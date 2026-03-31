import React, { useState, useEffect, useRef } from 'react';
import Layout from '@theme/Layout';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { useAuth } from '../context/AuthContext';
import { supabase, timeAgo } from '../lib/supabase';
import type { Profile, ActivityLog, KMSDocument } from '../lib/supabase';
import AuthGuard from '../components/AuthGuard';

interface AdminProfile extends Profile {
  roles?: { name: string };
}

const roleColors: Record<string, string> = {
  admin: 'kms-badge--admin',
  editor: 'kms-badge--editor',
  viewer: 'kms-badge--viewer',
};
const roleIcons: Record<string, string> = { admin: '', editor: '', viewer: '' };

const deptLabel = (d: string | null) => {
  if (!d || d === 'all') return 'Semua';
  return d.toUpperCase();
};

function AdminDashboard() {
  const { i18n } = useDocusaurusContext();
  const isEn = i18n.currentLocale === 'en';
  const { currentUser } = useAuth();

  const [users, setUsers] = useState<AdminProfile[]>([]);
  const [roles, setRoles] = useState<{ id: string; name: string }[]>([]);
  const [documents, setDocuments] = useState<KMSDocument[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [loadingData, setLoadingData] = useState(true);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [editRole, setEditRole] = useState('');
  const [editDept, setEditDept] = useState('');
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'users' | 'documents' | 'logs'>('users');

  const departments = ['all', 'hrd', 'finance', 'produksi', 'pertenunan', 'persiapan', 'pergudangan', 'marketing'];

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoadingData(true);
    await Promise.all([fetchUsers(), fetchRoles(), fetchDocuments(), fetchLogs()]);
    setLoadingData(false);
  };

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*, roles(name), last_login, status')
      .order('created_at', { ascending: false });
    if (!error && data) setUsers(data as AdminProfile[]);
  };

  const fetchRoles = async () => {
    const { data } = await supabase.from('roles').select('*').order('name');
    if (data) setRoles(data);
  };

  const fetchDocuments = async () => {
    const { data } = await supabase
      .from('documents')
      .select('*, profiles(name)')
      .order('updated_at', { ascending: false })
      .limit(20);
    if (data) setDocuments(data as KMSDocument[]);
  };

  const fetchLogs = async () => {
    const { data } = await supabase
      .from('activity_logs')
      .select('*, profiles(name), documents(title, slug)')
      .order('created_at', { ascending: false })
      .limit(30);
    if (data) setActivityLogs(data as ActivityLog[]);
  };

  const startEdit = (user: AdminProfile) => {
    setEditingUser(user.id);
    setEditRole(user.role_id || '');
    setEditDept(user.department || 'all');
  };

  const saveUser = async (userId: string) => {
    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({ role_id: editRole, department: editDept })
      .eq('id', userId);
    if (!error) {
      await supabase.from('activity_logs').insert({
        user_id: currentUser?.id,
        action: `admin_update_user`,
        document_id: null,
      });
      await fetchUsers();
    }
    setSaving(false);
    setEditingUser(null);
  };

  const filtered = users.filter((u) => {
    const matchSearch =
      (u.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.nomor_induk || '').toLowerCase().includes(searchQuery.toLowerCase());
    const roleName = (u as any).roles?.name || '';
    const matchRole = filterRole === 'all' || roleName === filterRole;
    return matchSearch && matchRole;
  });

  const stats = {
    total: users.length,
    admin: users.filter((u) => (u as any).roles?.name === 'admin').length,
    editor: users.filter((u) => (u as any).roles?.name === 'editor').length,
    viewer: users.filter((u) => (u as any).roles?.name === 'viewer').length,
    docs: documents.length,
    published: documents.filter((d) => d.status === 'published').length,
    draft: documents.filter((d) => d.status === 'draft').length,
  };


  return (
    <div className="kms-dashboard">
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.6rem', marginBottom: '0.25rem' }}>
            {isEn ? 'Admin Dashboard' : 'Dashboard Admin'}
          </h1>
          <p style={{ color: '#6b7280', margin: 0, fontSize: '0.9rem' }}>
            {isEn ? 'Manage users, roles, documents, and activity.' : 'Kelola pengguna, peran, dokumen, dan aktivitas.'}
          </p>
        </div>

        {/* Stats */}
        <div className="kms-stats-grid">
          {[
            { label: isEn ? 'Total Users' : 'Total Pengguna', value: stats.total, color: 'var(--kms-primary)' },
            { label: 'Admin', value: stats.admin, color: '#92400e' },
            { label: 'Editor', value: stats.editor, color: '#1e40af' },
            { label: 'Viewer', value: stats.viewer, color: '#166534' },
            { label: isEn ? 'Documents' : 'Dokumen', value: stats.docs, color: 'var(--kms-primary)' },
            { label: isEn ? 'Published' : 'Terbit', value: stats.published, color: '#059669' },
            { label: 'Draft', value: stats.draft, color: '#d97706' },
          ].map((s) => (
            <div key={s.label} className="kms-stat-card">

              <div className="kms-stat-card__label">{s.label}</div>
              <div className="kms-stat-card__value" style={{ color: s.color }}>
                {loadingData ? '…' : s.value}
              </div>
            </div>
          ))}
        </div>

        {/* Tab bar */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '2px solid var(--ifm-toc-border-color)', paddingBottom: 0 }}>
          {[
            { key: 'users', label: isEn ? 'Users' : 'Pengguna' },
            { key: 'documents', label: isEn ? 'Documents' : 'Dokumen' },
            { key: 'logs', label: isEn ? 'Activity Log' : 'Log Aktivitas' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              style={{
                background: 'none',
                border: 'none',
                borderBottom: activeTab === tab.key ? '2px solid var(--kms-accent)' : '2px solid transparent',
                padding: '0.6rem 1rem',
                fontSize: '0.88rem',
                fontWeight: activeTab === tab.key ? 700 : 500,
                color: activeTab === tab.key ? 'var(--kms-accent)' : '#6b7280',
                cursor: 'pointer',
                marginBottom: '-2px',
                fontFamily: 'inherit',
                transition: 'all 0.15s',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── TAB: Users ── */}
        {activeTab === 'users' && (
          <div className="kms-card">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.25rem', alignItems: 'center' }}>
              <h3 style={{ margin: 0, flex: 1 }}>{isEn ? 'User Management' : 'Manajemen Pengguna'}</h3>
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
              <input
                type="text"
                placeholder={isEn ? 'Search by name or nomor induk...' : 'Cari nama atau nomor induk...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ flex: 1, minWidth: '200px', padding: '8px 12px', border: '1.5px solid #e5e7eb', borderRadius: '7px', fontSize: '0.85rem', outline: 'none', fontFamily: 'inherit' }}
              />
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                style={{ padding: '8px 12px', border: '1.5px solid #e5e7eb', borderRadius: '7px', fontSize: '0.85rem', background: '#fff', fontFamily: 'inherit', cursor: 'pointer' }}
              >
                <option value="all">{isEn ? 'All Roles' : 'Semua Peran'}</option>
                {roles.map((r) => <option key={r.id} value={r.name}>{r.name}</option>)}
              </select>
            </div>

            {/* Table */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--ifm-toc-border-color)' }}>
                    {[isEn ? 'Name' : 'Nama', isEn ? 'ID' : 'Nomor Induk', isEn ? 'Role' : 'Peran', isEn ? 'Department' : 'Departemen', isEn ? 'Last Login' : 'Login Terakhir', 'Status', isEn ? 'Joined' : 'Bergabung', ''].map((h) => (
                      <th key={h} style={{ textAlign: 'left', padding: '0.6rem 0.75rem', color: '#6b7280', fontWeight: 600, fontSize: '0.78rem', textTransform: 'uppercase' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loadingData ? (
                    <tr><td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>Memuat data...</td></tr>
                  ) : filtered.map((user) => {
                    const roleName = (user as any).roles?.name || 'viewer';
                    const isEditing = editingUser === user.id;
                    return (
                      <tr key={user.id} style={{ borderBottom: '1px solid var(--ifm-toc-border-color)' }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--ifm-background-surface-color)')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                      >
                        <td style={{ padding: '0.75rem' }}>
                          <div style={{ fontWeight: 600, color: '#111827' }}>{user.name || '—'}</div>
                        </td>
                        <td style={{ padding: '0.75rem', color: '#6b7280', fontFamily: 'monospace', fontSize: '0.8rem' }}>
                          {user.nomor_induk || '—'}
                        </td>
                        <td style={{ padding: '0.75rem' }}>
                          {isEditing ? (
                            <select
                              value={editRole}
                              onChange={(e) => setEditRole(e.target.value)}
                              style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid #e5e7eb', fontSize: '0.82rem', fontFamily: 'inherit' }}
                            >
                              {roles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
                            </select>
                          ) : (
                            <span className={`kms-badge ${roleColors[roleName] || 'kms-badge--viewer'}`}>
                              {roleIcons[roleName] || '👁️'} {roleName}
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '0.75rem' }}>
                          {isEditing ? (
                            <select
                              value={editDept}
                              onChange={(e) => setEditDept(e.target.value)}
                              style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid #e5e7eb', fontSize: '0.82rem', fontFamily: 'inherit' }}
                            >
                              {departments.map((d) => <option key={d} value={d}>{deptLabel(d)}</option>)}
                            </select>
                          ) : (
                            <span className="kms-tag kms-tag--dept" style={{ cursor: 'default', fontSize: '0.75rem' }}>
                              {deptLabel(user.department)}
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '0.75rem', color: '#9ca3af', fontSize: '0.8rem' }}>
                          {(user as any).last_login ? timeAgo((user as any).last_login) : '—'}
                        </td>
                        <td style={{ padding: '0.75rem' }}>
                          <span style={{
                            display: 'inline-block', padding: '2px 8px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 600,
                            background: (user as any).status === 'active' ? '#d1fae5' : '#fef3c7',
                            color: (user as any).status === 'active' ? '#065f46' : '#92400e',
                          }}>
                            {(user as any).status || 'active'}
                          </span>
                        </td>
                        <td style={{ padding: '0.75rem', color: '#9ca3af', fontSize: '0.8rem' }}>
                          {user.created_at ? timeAgo(user.created_at) : '—'}
                        </td>
                        <td style={{ padding: '0.75rem' }}>
                          {isEditing ? (
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <button
                                onClick={() => saveUser(user.id)}
                                disabled={saving}
                                style={{ background: 'var(--kms-accent)', color: '#fff', border: 'none', borderRadius: '6px', padding: '4px 10px', fontSize: '0.78rem', cursor: 'pointer', fontFamily: 'inherit' }}
                              >
                                {saving ? '…' : '✓ Simpan'}
                              </button>
                              <button
                                onClick={() => setEditingUser(null)}
                                style={{ background: 'none', border: '1px solid #e5e7eb', borderRadius: '6px', padding: '4px 8px', fontSize: '0.78rem', cursor: 'pointer', fontFamily: 'inherit' }}
                              >
                                Batal
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => startEdit(user)}
                              style={{ background: 'none', border: '1px solid #e5e7eb', borderRadius: '6px', padding: '4px 10px', fontSize: '0.78rem', cursor: 'pointer', color: 'var(--kms-primary)', fontFamily: 'inherit' }}
                            >
                              {isEn ? 'Edit' : 'Ubah'}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {!loadingData && filtered.length === 0 && (
                <p style={{ textAlign: 'center', color: '#9ca3af', padding: '2rem', margin: 0 }}>
                  {isEn ? 'No users found.' : 'Tidak ada pengguna ditemukan.'}
                </p>
              )}
            </div>
          </div>
        )}

        {/* ── TAB: Documents ── */}
        {activeTab === 'documents' && (
          <div className="kms-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <h3 style={{ margin: 0 }}>{isEn ? 'Document Management' : 'Manajemen Dokumen'}</h3>
              <a href="/documents/new" className="kms-btn kms-btn--accent" style={{ width: 'auto', padding: '8px 16px', fontSize: '0.83rem' }}>
                + {isEn ? 'New Document' : 'Dokumen Baru'}
              </a>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--ifm-toc-border-color)' }}>
                    {[isEn ? 'Title' : 'Judul', 'Slug', 'Status', isEn ? 'Author' : 'Penulis', isEn ? 'Updated' : 'Diperbarui', ''].map((h) => (
                      <th key={h} style={{ textAlign: 'left', padding: '0.6rem 0.75rem', color: '#6b7280', fontWeight: 600, fontSize: '0.78rem', textTransform: 'uppercase' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loadingData ? (
                    <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>Memuat dokumen...</td></tr>
                  ) : documents.map((doc) => (
                    <tr key={doc.id} style={{ borderBottom: '1px solid var(--ifm-toc-border-color)' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--ifm-background-surface-color)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <td style={{ padding: '0.75rem', fontWeight: 600, color: '#111827' }}>
                        <a href={`/document?slug=${doc.slug}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                          {doc.title}
                        </a>
                      </td>
                      <td style={{ padding: '0.75rem', color: '#6b7280', fontFamily: 'monospace', fontSize: '0.78rem' }}>{doc.slug}</td>
                      <td style={{ padding: '0.75rem' }}>
                        <span style={{
                          display: 'inline-block', padding: '2px 8px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600,
                          background: doc.status === 'published' ? '#d1fae5' : doc.status === 'draft' ? '#fef3c7' : '#fee2e2',
                          color: doc.status === 'published' ? '#065f46' : doc.status === 'draft' ? '#92400e' : '#991b1b',
                        }}>
                          {doc.status}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem', color: '#6b7280', fontSize: '0.82rem' }}>
                        {(doc as any).profiles?.name || '—'}
                      </td>
                      <td style={{ padding: '0.75rem', color: '#9ca3af', fontSize: '0.8rem' }}>
                        {doc.updated_at ? timeAgo(doc.updated_at) : '—'}
                      </td>
                      <td style={{ padding: '0.75rem' }}>
                        <a
                          href={`/document?slug=${doc.slug}`}
                          style={{ background: 'none', border: '1px solid #e5e7eb', borderRadius: '6px', padding: '4px 10px', fontSize: '0.78rem', cursor: 'pointer', color: 'var(--kms-primary)', fontFamily: 'inherit', textDecoration: 'none' }}
                        >
                          {isEn ? 'View' : 'Lihat'}
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!loadingData && documents.length === 0 && (
                <p style={{ textAlign: 'center', color: '#9ca3af', padding: '2rem', margin: 0 }}>
                  {isEn ? 'No documents yet.' : 'Belum ada dokumen.'}
                </p>
              )}
            </div>
          </div>
        )}

        {/* ── TAB: Activity Logs ── */}
        {activeTab === 'logs' && (
          <div className="kms-card">
            <h3 style={{ marginBottom: '1.25rem' }}>{isEn ? 'Activity Log' : 'Log Aktivitas'}</h3>
            {loadingData ? (
              <p style={{ textAlign: 'center', color: '#9ca3af', padding: '2rem' }}>Memuat log...</p>
            ) : activityLogs.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#9ca3af', padding: '2rem' }}>
                {isEn ? 'No activity logs yet.' : 'Belum ada log aktivitas.'}
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {activityLogs.map((log) => (
                  <div key={log.id} style={{ display: 'flex', gap: '0.75rem', padding: '0.65rem 0', borderBottom: '1px solid var(--ifm-toc-border-color)', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '0.82rem', minWidth: '24px', marginTop: '1px', color: '#6b7280', fontFamily: 'monospace' }}>
                      {log.action?.startsWith('admin') ? 'ADM' : log.action?.includes('login') ? 'LOG' : log.action?.includes('create') ? 'NEW' : log.action?.includes('edit') ? 'EDT' : 'ACT'}
                    </span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.85rem', color: '#374151' }}>
                        <strong>{(log as any).profiles?.name || 'Unknown'}</strong>
                        {' — '}
                        <span style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: '#6b7280' }}>{log.action || '—'}</span>
                        {(log as any).documents?.title && (
                          <span>
                            {' → '}
                            <a href={`/document?slug=${(log as any).documents.slug}`} style={{ color: 'var(--kms-accent)', textDecoration: 'none', fontSize: '0.82rem' }}>
                              {(log as any).documents.title}
                            </a>
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '2px' }}>
                        {log.created_at ? timeAgo(log.created_at) : '—'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Supabase notice */}
        <div className="kms-notice kms-notice--info" style={{ marginTop: '1.5rem' }}>
          {isEn
            ? 'All data is fetched in real-time from Supabase PostgreSQL. All admin actions are recorded in activity_logs.'
            : 'Semua data diambil secara real-time dari Supabase PostgreSQL. Semua tindakan admin dicatat di activity_logs.'}
        </div>
    </div>
  );
}

export default function AdminPage() {
  const { i18n } = useDocusaurusContext();
  const isEn = i18n.currentLocale === 'en';

  return (
    <Layout title={isEn ? 'Admin Dashboard' : 'Dashboard Admin'}>
      <AuthGuard requiredRole="admin">
        <AdminDashboard />
      </AuthGuard>
    </Layout>
  );
}
