import React, { useState, useEffect, useRef } from 'react';
import Layout from '@theme/Layout';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { useAuth } from '../context/AuthContext';
import { createClient } from '@supabase/supabase-js';
import { supabase, timeAgo, SUPABASE_URL, SUPABASE_ANON_KEY } from '../lib/supabase';
import type { Profile, ActivityLog, KMSDocument } from '../lib/supabase';
import AuthGuard from '../components/AuthGuard';

interface AdminProfile extends Profile {
  roles?: { name: string };
}

interface DictionaryEntry {
  id: string;
  term: string;
  full_form: string;
  description: string;
  created_at: string;
}

interface FAQEntry {
  id: string;
  question: string;
  answer: string;
  sort_order: number;
  created_at: string;
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
  const [activeTab, setActiveTab] = useState<'users' | 'documents' | 'logs' | 'dictionary' | 'faq'>('users');

  const [dictionary, setDictionary] = useState<DictionaryEntry[]>([]);
  const [faqs, setFaqs] = useState<FAQEntry[]>([]);

  // Dictionary state
  const [newDictTerm, setNewDictTerm] = useState('');
  const [newDictFull, setNewDictFull] = useState('');
  const [newDictDesc, setNewDictDesc] = useState('');

  // FAQ state
  const [newFaqQ, setNewFaqQ] = useState('');
  const [newFaqA, setNewFaqA] = useState('');
  const [newFaqOrder, setNewFaqOrder] = useState<number>(1);

  // Add User State
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPass, setNewUserPass] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [newUserNomor, setNewUserNomor] = useState('');
  const [newUserRole, setNewUserRole] = useState('');
  const [newUserDept, setNewUserDept] = useState('all');
  const [addUserError, setAddUserError] = useState('');

  const departments = ['all', 'hrd', 'finance', 'produksi', 'pertenunan', 'persiapan', 'pergudangan', 'marketing'];

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoadingData(true);
    await Promise.all([fetchUsers(), fetchRoles(), fetchDocuments(), fetchLogs(), fetchDictionary(), fetchFAQ()]);
    setLoadingData(false);
  };

  const fetchDictionary = async () => {
    const { data, error } = await supabase.from('dictionary').select('*').order('term');
    if (data) setDictionary(data as DictionaryEntry[]);
  };

  const fetchFAQ = async () => {
    const { data } = await supabase.from('faq').select('*').order('sort_order', { ascending: true });
    if (data) setFaqs(data as FAQEntry[]);
  };

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*, roles(name)')
      .order('created_at', { ascending: false });
    if (!error && data) setUsers(data as AdminProfile[]);
    else if (error) console.error('Error fetching users:', error);
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

  const handleAddUser = async () => {
    if (!newUserEmail || !newUserPass || !newUserName || !newUserRole) {
      setAddUserError(isEn ? 'Please fill in all required fields.' : 'Harap lengkapi semua kolom wajib.');
      return;
    }
    
    setAddUserError('');
    setSaving(true);

    try {
      // Use clean client with persistSession: false to avoid logging out the admin
      const tempClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }
      });

      const { data, error } = await tempClient.auth.signUp({
        email: newUserEmail,
        password: newUserPass,
        options: {
          data: { name: newUserName },
        }
      });

      if (error) throw error;
      
      const newUserId = data.user?.id;
      if (!newUserId) {
        throw new Error('Gagal membuat akun.');
      }

      // Wait a moment for trigger to insert the profile row
      await new Promise(r => setTimeout(r, 800));

      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          role_id: newUserRole,
          department: newUserDept,
          nomor_induk: newUserNomor || null
        })
        .eq('id', newUserId);
      
      if (profileError) throw profileError;

      await supabase.from('activity_logs').insert({
        user_id: currentUser?.id,
        action: 'admin_create_user',
        document_id: null,
      });

      // Clear & Close
      setNewUserEmail(''); setNewUserPass(''); setNewUserName(''); setNewUserNomor('');
      setShowAddUser(false);
      await fetchUsers();
    } catch (err: any) {
      console.error(err);
      setAddUserError(err.message || 'Terjadi kesalahan saat menambahkan pengguna.');
    } finally {
      setSaving(true); // disable double click
      setTimeout(() => setSaving(false), 500);
    }
  };

  const addDictionary = async () => {
    if (!newDictTerm || !newDictFull || !newDictDesc) return;
    setSaving(true);
    const { error } = await supabase.from('dictionary').insert({
      term: newDictTerm,
      full_form: newDictFull,
      description: newDictDesc,
    });
    if (!error) {
      setNewDictTerm(''); setNewDictFull(''); setNewDictDesc('');
      await fetchDictionary();
    }
    setSaving(false);
  };

  const deleteDictionary = async (id: string, term: string) => {
    if (!confirm(`Hapus istilah ${term}?`)) return;
    await supabase.from('dictionary').delete().eq('id', id);
    await fetchDictionary();
  };

  const addFaq = async () => {
    if (!newFaqQ || !newFaqA) return;
    setSaving(true);
    const { error } = await supabase.from('faq').insert({
      question: newFaqQ,
      answer: newFaqA,
      sort_order: newFaqOrder,
    });
    if (!error) {
      setNewFaqQ(''); setNewFaqA(''); setNewFaqOrder(faqs.length + 2);
      await fetchFAQ();
    }
    setSaving(false);
  };

  const deleteFaq = async (id: string) => {
    if (!confirm('Hapus FAQ ini?')) return;
    await supabase.from('faq').delete().eq('id', id);
    await fetchFAQ();
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
            { key: 'dictionary', label: isEn ? 'Dictionary' : 'Kamus' },
            { key: 'faq', label: 'FAQ' },
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
            {/* Header & Add Button */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.25rem', alignItems: 'center' }}>
              <h3 style={{ margin: 0, flex: 1 }}>{isEn ? 'User Management' : 'Manajemen Pengguna'}</h3>
              <button
                onClick={() => {
                  setShowAddUser(!showAddUser);
                  if (!showAddUser && !newUserRole && roles.length > 0) {
                    setNewUserRole(roles.find(r => r.name === 'viewer')?.id || roles[0].id);
                  }
                }}
                className="kms-btn kms-btn--accent"
                style={{ width: 'auto', padding: '6px 14px', fontSize: '0.85rem' }}
              >
                {showAddUser ? (isEn ? 'Cancel' : 'Batal') : (isEn ? '+ New User' : '+ Pengguna Baru')}
              </button>
            </div>

            {/* Add User Form */}
            {showAddUser && (
              <div style={{ background: 'var(--ifm-background-surface-color)', padding: '1.5rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid var(--ifm-toc-border-color)' }}>
                <h4 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.05rem', color: 'var(--kms-primary)' }}>
                  {isEn ? 'Create New Account' : 'Buat Akun Baru'}
                </h4>
                
                {addUserError && (
                  <div className="kms-notice kms-notice--lock" style={{ marginBottom: '1rem', fontSize: '0.85rem' }}>
                    {addUserError}
                  </div>
                )}
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
                  <div className="kms-form-group" style={{ marginBottom: 0 }}>
                    <label style={{ fontSize: '0.8rem', marginBottom: '4px' }}>{isEn ? 'Full Name *' : 'Nama Lengkap *'}</label>
                    <input type="text" value={newUserName} onChange={e => setNewUserName(e.target.value)} style={{ padding: '8px 12px', border: '1px solid var(--ifm-toc-border-color)', borderRadius: '6px', fontSize: '0.85rem', background: 'transparent', color: 'inherit', width: '100%' }} />
                  </div>
                  <div className="kms-form-group" style={{ marginBottom: 0 }}>
                    <label style={{ fontSize: '0.8rem', marginBottom: '4px' }}>{isEn ? 'Email Address *' : 'Alamat Email *'}</label>
                    <input type="email" value={newUserEmail} onChange={e => setNewUserEmail(e.target.value)} style={{ padding: '8px 12px', border: '1px solid var(--ifm-toc-border-color)', borderRadius: '6px', fontSize: '0.85rem', background: 'transparent', color: 'inherit', width: '100%' }} />
                  </div>
                  <div className="kms-form-group" style={{ marginBottom: 0 }}>
                    <label style={{ fontSize: '0.8rem', marginBottom: '4px' }}>{isEn ? 'Nomor Induk' : 'Nomor Induk'}</label>
                    <input type="text" value={newUserNomor} onChange={e => setNewUserNomor(e.target.value)} style={{ padding: '8px 12px', border: '1px solid var(--ifm-toc-border-color)', borderRadius: '6px', fontSize: '0.85rem', background: 'transparent', color: 'inherit', width: '100%' }} />
                  </div>
                  <div className="kms-form-group" style={{ marginBottom: 0 }}>
                    <label style={{ fontSize: '0.8rem', marginBottom: '4px' }}>{isEn ? 'Password *' : 'Kata Sandi *'}</label>
                    <input type="password" value={newUserPass} onChange={e => setNewUserPass(e.target.value)} style={{ padding: '8px 12px', border: '1px solid var(--ifm-toc-border-color)', borderRadius: '6px', fontSize: '0.85rem', background: 'transparent', color: 'inherit', width: '100%' }} />
                  </div>
                  <div className="kms-form-group" style={{ marginBottom: 0 }}>
                    <label style={{ fontSize: '0.8rem', marginBottom: '4px' }}>{isEn ? 'Role *' : 'Peran *'}</label>
                    <select value={newUserRole} onChange={e => setNewUserRole(e.target.value)} style={{ padding: '8px 12px', border: '1px solid var(--ifm-toc-border-color)', borderRadius: '6px', fontSize: '0.85rem', background: 'transparent', color: 'inherit', width: '100%' }}>
                      <option value="" disabled>{isEn ? 'Select Role' : 'Pilih Peran'}</option>
                      {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                    </select>
                  </div>
                  <div className="kms-form-group" style={{ marginBottom: 0 }}>
                    <label style={{ fontSize: '0.8rem', marginBottom: '4px' }}>{isEn ? 'Department *' : 'Departemen *'}</label>
                    <select value={newUserDept} onChange={e => setNewUserDept(e.target.value)} style={{ padding: '8px 12px', border: '1px solid var(--ifm-toc-border-color)', borderRadius: '6px', fontSize: '0.85rem', background: 'transparent', color: 'inherit', width: '100%' }}>
                      {departments.map((d) => <option key={d} value={d}>{deptLabel(d)}</option>)}
                    </select>
                  </div>
                </div>
                <button
                  onClick={handleAddUser}
                  disabled={saving || !newUserEmail || !newUserPass || !newUserName || !newUserRole}
                  className="kms-btn kms-btn--primary"
                  style={{ width: 'auto', padding: '8px 18px', fontSize: '0.85rem' }}
                >
                  {saving ? '...' : isEn ? 'Create User' : 'Buat Pengguna'}
                </button>
              </div>
            )}

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

        {/* ── TAB: Dictionary ── */}
        {activeTab === 'dictionary' && (
          <div className="kms-card">
            <h3 style={{ marginBottom: '1.25rem' }}>{isEn ? 'Dictionary Management' : 'Manajemen Kamus Istilah'}</h3>
            
            {/* Add New Dictionary Form */}
            <div style={{ background: 'var(--ifm-background-surface-color)', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem', border: '1px solid var(--ifm-toc-border-color)' }}>
              <h4 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1rem', color: 'var(--kms-primary)' }}>{isEn ? 'Add New Term' : 'Tambah Istilah Baru'}</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                <input
                  type="text"
                  placeholder={isEn ? 'Term (e.g., SOP)' : 'Istilah (cth: SOP)'}
                  value={newDictTerm}
                  onChange={(e) => setNewDictTerm(e.target.value)}
                  style={{ padding: '8px 12px', border: '1px solid var(--ifm-toc-border-color)', borderRadius: '6px', fontSize: '0.85rem', background: 'transparent', color: 'inherit' }}
                />
                <input
                  type="text"
                  placeholder={isEn ? 'Full Form' : 'Kepanjangan (cth: Standar Operasional)'}
                  value={newDictFull}
                  onChange={(e) => setNewDictFull(e.target.value)}
                  style={{ padding: '8px 12px', border: '1px solid var(--ifm-toc-border-color)', borderRadius: '6px', fontSize: '0.85rem', background: 'transparent', color: 'inherit' }}
                />
                <input
                  type="text"
                  placeholder={isEn ? 'Validation rules or short description...' : 'Deskripsi singkat...'}
                  value={newDictDesc}
                  onChange={(e) => setNewDictDesc(e.target.value)}
                  style={{ gridColumn: '1 / -1', padding: '8px 12px', border: '1px solid var(--ifm-toc-border-color)', borderRadius: '6px', fontSize: '0.85rem', background: 'transparent', color: 'inherit' }}
                />
              </div>
              <button
                onClick={addDictionary}
                disabled={saving || !newDictTerm || !newDictFull || !newDictDesc}
                className="kms-btn kms-btn--accent"
                style={{ width: 'auto', padding: '6px 16px', fontSize: '0.85rem' }}
              >
                {saving ? '...' : isEn ? 'Add Term' : 'Tambah Istilah'}
              </button>
            </div>

            {/* List */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--ifm-toc-border-color)' }}>
                    <th style={{ textAlign: 'left', padding: '0.6rem 0.75rem', color: '#6b7280', fontSize: '0.78rem' }}>{isEn ? 'TERM' : 'ISTILAH'}</th>
                    <th style={{ textAlign: 'left', padding: '0.6rem 0.75rem', color: '#6b7280', fontSize: '0.78rem' }}>{isEn ? 'FULL FORM' : 'KEPANJANGAN'}</th>
                    <th style={{ textAlign: 'left', padding: '0.6rem 0.75rem', color: '#6b7280', fontSize: '0.78rem' }}>{isEn ? 'DESCRIPTION' : 'DESKRIPSI'}</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {dictionary.map(d => (
                    <tr key={d.id} style={{ borderBottom: '1px solid var(--ifm-toc-border-color)' }}>
                      <td style={{ padding: '0.75rem', fontWeight: 600 }}>{d.term}</td>
                      <td style={{ padding: '0.75rem', color: '#6b7280' }}>{d.full_form}</td>
                      <td style={{ padding: '0.75rem', color: '#6b7280', maxWidth: '300px' }}>{d.description}</td>
                      <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                        <button onClick={() => deleteDictionary(d.id, d.term)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.85rem' }}>
                          {isEn ? 'Delete' : 'Hapus'}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {dictionary.length === 0 && (
                    <tr><td colSpan={4} style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>Belum ada kamus</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── TAB: FAQ ── */}
        {activeTab === 'faq' && (
          <div className="kms-card">
            <h3 style={{ marginBottom: '1.25rem' }}>{isEn ? 'FAQ Management' : 'Manajemen FAQ'}</h3>
            
            {/* Add New FAQ Form */}
            <div style={{ background: 'var(--ifm-background-surface-color)', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem', border: '1px solid var(--ifm-toc-border-color)' }}>
              <h4 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1rem', color: 'var(--kms-primary)' }}>{isEn ? 'Add New FAQ' : 'Tambah FAQ Baru'}</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 100px', gap: '1rem', marginBottom: '1rem' }}>
                <input
                  type="text"
                  placeholder={isEn ? 'Question...' : 'Pertanyaan...'}
                  value={newFaqQ}
                  onChange={(e) => setNewFaqQ(e.target.value)}
                  style={{ padding: '8px 12px', border: '1px solid var(--ifm-toc-border-color)', borderRadius: '6px', fontSize: '0.85rem', background: 'transparent', color: 'inherit' }}
                />
                <input
                  type="number"
                  placeholder="Urutan"
                  value={newFaqOrder}
                  onChange={(e) => setNewFaqOrder(parseInt(e.target.value) || 0)}
                  style={{ padding: '8px 12px', border: '1px solid var(--ifm-toc-border-color)', borderRadius: '6px', fontSize: '0.85rem', background: 'transparent', color: 'inherit' }}
                />
                <textarea
                  placeholder={isEn ? 'Answer...' : 'Jawaban...'}
                  value={newFaqA}
                  onChange={(e) => setNewFaqA(e.target.value)}
                  rows={3}
                  style={{ gridColumn: '1 / -1', padding: '8px 12px', border: '1px solid var(--ifm-toc-border-color)', borderRadius: '6px', fontSize: '0.85rem', background: 'transparent', color: 'inherit', resize: 'vertical' }}
                />
              </div>
              <button
                onClick={addFaq}
                disabled={saving || !newFaqQ || !newFaqA}
                className="kms-btn kms-btn--accent"
                style={{ width: 'auto', padding: '6px 16px', fontSize: '0.85rem' }}
              >
                {saving ? '...' : isEn ? 'Add FAQ' : 'Tambah FAQ'}
              </button>
            </div>

            {/* List */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--ifm-toc-border-color)' }}>
                    <th style={{ textAlign: 'left', padding: '0.6rem 0.75rem', color: '#6b7280', fontSize: '0.78rem', width: '60px' }}>URUTAN</th>
                    <th style={{ textAlign: 'left', padding: '0.6rem 0.75rem', color: '#6b7280', fontSize: '0.78rem' }}>{isEn ? 'QUESTION / ANSWER' : 'PERTANYAAN / JAWABAN'}</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {faqs.map(f => (
                    <tr key={f.id} style={{ borderBottom: '1px solid var(--ifm-toc-border-color)' }}>
                      <td style={{ padding: '0.75rem', fontWeight: 600, textAlign: 'center' }}>{f.sort_order}</td>
                      <td style={{ padding: '0.75rem' }}>
                        <div style={{ fontWeight: 600, color: 'var(--ifm-color-emphasis-900)', marginBottom: '0.25rem' }}>{f.question}</div>
                        <div style={{ color: '#6b7280', fontSize: '0.82rem' }}>{f.answer}</div>
                      </td>
                      <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                        <button onClick={() => deleteFaq(f.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.85rem' }}>
                          {isEn ? 'Delete' : 'Hapus'}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {faqs.length === 0 && (
                    <tr><td colSpan={3} style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>Belum ada FAQ</td></tr>
                  )}
                </tbody>
              </table>
            </div>
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
