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

function EditorDashboard() {
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
  const [activeTab, setActiveTab] = useState<'documents' | 'logs' | 'dictionary' | 'faq' | 'archive'>('documents');
  const [hasHydratedTab, setHasHydratedTab] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('kms_editor_tab') as any;
      if (saved) setActiveTab(saved);
      setHasHydratedTab(true);
    }
  }, []);

  useEffect(() => {
    if (hasHydratedTab && typeof window !== 'undefined') {
      localStorage.setItem('kms_editor_tab', activeTab);
    }
  }, [activeTab, hasHydratedTab]);

  const [dictionary, setDictionary] = useState<DictionaryEntry[]>([]);
  const [faqs, setFaqs] = useState<FAQEntry[]>([]);

  const [archivedDicts, setArchivedDicts] = useState<DictionaryEntry[]>([]);
  const [archivedFaqs, setArchivedFaqs] = useState<FAQEntry[]>([]);

  const fetchArchive = async () => {
    const { data: dData } = await supabase.from('dictionary').select('*').is('is_hidden', true).order('term');
    if (dData) setArchivedDicts(dData as DictionaryEntry[]);

    const { data: fData } = await supabase.from('faq').select('*').is('is_hidden', true).order('sort_order');
    if (fData) setArchivedFaqs(fData as FAQEntry[]);
  };

  const restoreArchive = async (table: 'faq' | 'dictionary', id: string, name: string) => {
    if (!confirm(`Kembalikan ${name}?`)) return;
    setSaving(true);
    const { error } = await supabase.from(table).update({ is_hidden: false }).eq('id', id);
    if (!error) {
      if (table === 'dictionary') {
        setArchivedDicts(prev => prev.filter(d => d.id !== id));
        await fetchDictionary();
      } else {
        setArchivedFaqs(prev => prev.filter(f => f.id !== id));
        await fetchFAQ();
      }
    } else {
      alert(`Gagal mengembalikan ${name}: ` + error.message);
    }
    setSaving(false);
  };


  // Dictionary state
  const [newDictTerm, setNewDictTerm] = useState('');
  const [newDictFull, setNewDictFull] = useState('');
  const [newDictDesc, setNewDictDesc] = useState('');
  const [editingDict, setEditingDict] = useState<string | null>(null);
  const [editDictTerm, setEditDictTerm] = useState('');
  const [editDictFull, setEditDictFull] = useState('');
  const [editDictDesc, setEditDictDesc] = useState('');

  // FAQ state
  const [newFaqQ, setNewFaqQ] = useState('');
  const [newFaqA, setNewFaqA] = useState('');
  const [newFaqOrder, setNewFaqOrder] = useState<number>(1);
  const [editingFaq, setEditingFaq] = useState<string | null>(null);
  const [editFaqQ, setEditFaqQ] = useState('');
  const [editFaqA, setEditFaqA] = useState('');
  const [editFaqOrder, setEditFaqOrder] = useState<number>(1);

  // Load drafts on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const dTerm = localStorage.getItem('kms_draft_dict_term');
      if (dTerm) setNewDictTerm(dTerm);
      const dFull = localStorage.getItem('kms_draft_dict_full');
      if (dFull) setNewDictFull(dFull);
      const dDesc = localStorage.getItem('kms_draft_dict_desc');
      if (dDesc) setNewDictDesc(dDesc);

      const fQ = localStorage.getItem('kms_draft_faq_q');
      if (fQ) setNewFaqQ(fQ);
      const fA = localStorage.getItem('kms_draft_faq_a');
      if (fA) setNewFaqA(fA);
    }
  }, []);

  // Save drafts on change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (newDictTerm) localStorage.setItem('kms_draft_dict_term', newDictTerm);
      if (newDictFull) localStorage.setItem('kms_draft_dict_full', newDictFull);
      if (newDictDesc) localStorage.setItem('kms_draft_dict_desc', newDictDesc);
    }
  }, [newDictTerm, newDictFull, newDictDesc]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (newFaqQ) localStorage.setItem('kms_draft_faq_q', newFaqQ);
      if (newFaqA) localStorage.setItem('kms_draft_faq_a', newFaqA);
    }
  }, [newFaqQ, newFaqA]);


  // Add User State
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPass, setNewUserPass] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [newUserUsername, setNewUserUsername] = useState('');
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
    // Refresh token if expired

    await Promise.all([fetchUsers(), fetchRoles(), fetchDocuments(), fetchLogs(), fetchDictionary(), fetchFAQ(), fetchArchive()]);
    setLoadingData(false);
  };

  const fetchDictionary = async () => {
    const { data, error } = await supabase.from('dictionary').select('*').is('is_hidden', false).order('term');
    if (data) setDictionary(data as DictionaryEntry[]);
  };

  const fetchFAQ = async () => {
    const { data } = await supabase.from('faq').select('*').is('is_hidden', false).order('sort_order', { ascending: true });
    if (data) {
      const parsedData = data as FAQEntry[];
      setFaqs(parsedData);
      const maxOrder = parsedData.length > 0 ? Math.max(...parsedData.map(f => f.sort_order || 0)) : 0;
      setNewFaqOrder(maxOrder + 1);
    }
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
          nomor_induk: newUserNomor || null,
          username: newUserUsername || null
        })
        .eq('id', newUserId);

      if (profileError) throw profileError;

      await supabase.from('activity_logs').insert({
        user_id: currentUser?.id,
        action: 'admin_create_user',
        document_id: null,
      });

      // Clear & Close
      setNewUserEmail(''); setNewUserPass(''); setNewUserName(''); setNewUserNomor(''); setNewUserUsername('');
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
      if (typeof window !== 'undefined') {
        localStorage.removeItem('kms_draft_dict_term');
        localStorage.removeItem('kms_draft_dict_full');
        localStorage.removeItem('kms_draft_dict_desc');
      }
      await fetchDictionary();
    } else {
      alert('Gagal menambah istilah (koneksi terganggu). Draft anda masih aman tersimpan (auto-save).');
    }
    setSaving(false);
  };

  const deleteDictionary = async (id: string, term: string) => {
    if (!confirm(`Apakah Anda yakin ingin hapus istilah "${term}"?`)) return;
    const { error } = await supabase.from('dictionary').update({ is_hidden: true }).eq('id', id);
    if (!error) {
      setDictionary(prev => prev.filter(d => d.id !== id));
    } else {
      console.error('Error deleting dictionary:', error);
      alert('Gagal hapus istilah.');
    }
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
      setNewFaqQ(''); setNewFaqA('');
      if (typeof window !== 'undefined') {
        localStorage.removeItem('kms_draft_faq_q');
        localStorage.removeItem('kms_draft_faq_a');
      }
      await fetchFAQ();
    } else {
      alert('Gagal menambah FAQ (koneksi terganggu). Draft anda masih aman tersimpan (auto-save).');
      console.error('Error adding FAQ:', error);
      alert('Gagal menambahkan FAQ.');
    }
    setSaving(false);
  };

  const deleteFaq = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin hapus FAQ ini?')) return;
    const { error } = await supabase.from('faq').update({ is_hidden: true }).eq('id', id);
    if (!error) {
      setFaqs(prev => prev.filter(f => f.id !== id));
    } else {
      console.error('Error deleting FAQ:', error);
      alert('Gagal hapus FAQ.');
    }
  };

  const startEditDict = (d: DictionaryEntry) => {
    setEditingDict(d.id);
    setEditDictTerm(d.term);
    setEditDictFull(d.full_form);
    setEditDictDesc(d.description);
  };
  const saveDict = async (id: string) => {
    setSaving(true);
    const { error } = await supabase.from('dictionary').update({
      term: editDictTerm,
      full_form: editDictFull,
      description: editDictDesc,
    }).eq('id', id);
    if (!error) {
      await fetchDictionary();
    } else {
      alert('Gagal menyimpan perubahan.');
    }
    setSaving(false);
    setEditingDict(null);
  };

  const startEditFaq = (f: FAQEntry) => {
    setEditingFaq(f.id);
    setEditFaqQ(f.question);
    setEditFaqA(f.answer);
    setEditFaqOrder(f.sort_order);
  };
  const saveFaq = async (id: string) => {
    setSaving(true);
    const { error } = await supabase.from('faq').update({
      question: editFaqQ,
      answer: editFaqA,
      sort_order: editFaqOrder,
    }).eq('id', id);
    if (!error) {
      await fetchFAQ();
    } else {
      alert('Gagal menyimpan perubahan.');
    }
    setSaving(false);
    setEditingFaq(null);
  };

  const deleteDocument = async (id: string, title: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus dokumen "${title}"?`)) return;
    setSaving(true);
    
    await supabase.from('activity_logs').insert({
      user_id: currentUser?.id,
      action: 'delete_document',
      document_id: id,
    });
    
    const { error } = await supabase.from('documents').delete().eq('id', id);
    
    if (!error) {
      setDocuments(prev => prev.filter(d => d.id !== id));
      if (typeof window !== 'undefined') {
        localStorage.removeItem(`kms_edit_doc_draft_${id}`);
      }
    } else {
      console.error('Error deleting document:', error);
      alert('Gagal menghapus dokumen.');
    }
    setSaving(false);
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
          {isEn ? 'Editor Dashboard' : 'Dashboard Editor'}
        </h1>
        <p style={{ color: '#6b7280', margin: 0, fontSize: '0.9rem' }}>
          {isEn ? 'Kelola dokumen, kamus, dan FAQ.' : 'Kelola dokumen, kamus, dan FAQ.'}
        </p>
      </div>

      {/* Stats */}
      <div className="kms-stats-grid">
        {[
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
                    { key: 'documents', label: isEn ? 'Documents' : 'Dokumen' },
          { key: 'logs', label: isEn ? 'Activity Log' : 'Log Aktivitas' },
          { key: 'dictionary', label: isEn ? 'Dictionary' : 'Kamus' },
          { key: 'faq', label: 'FAQ' },
          { key: 'archive', label: isEn ? 'Archived' : 'Arsip Data' },
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
                  {[isEn ? 'Title' : 'Judul', 'Status', isEn ? 'Author' : 'Penulis', isEn ? 'Updated' : 'Diperbarui', ''].map((h) => (
                    <th key={h} style={{ textAlign: 'left', padding: '0.6rem 0.75rem', color: '#6b7280', fontWeight: 600, fontSize: '0.78rem', textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loadingData ? (
                  <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>Memuat dokumen...</td></tr>
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
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <a
                          href={`/document?slug=${doc.slug}`}
                          style={{ background: 'none', border: '1px solid #e5e7eb', borderRadius: '6px', padding: '4px 10px', fontSize: '0.78rem', cursor: 'pointer', color: 'var(--kms-primary)', fontFamily: 'inherit', textDecoration: 'none' }}
                        >
                          {isEn ? 'View' : 'Lihat'}
                        </a>
                        <button
                          onClick={() => deleteDocument(doc.id, doc.title)}
                          disabled={saving}
                          style={{ background: 'none', border: '1px solid #fca5a5', borderRadius: '6px', padding: '4px 10px', fontSize: '0.78rem', cursor: 'pointer', color: '#dc2626', fontFamily: 'inherit' }}
                        >
                          {isEn ? 'Delete' : 'Hapus'}
                        </button>
                      </div>
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
                    <td style={{ padding: '0.75rem' }}>
                      {editingDict === d.id ? (
                        <input type="text" value={editDictTerm} onChange={(e) => setEditDictTerm(e.target.value)} style={{ padding: '4px', width: '100%' }} />
                      ) : (
                        <span style={{ fontWeight: 600 }}>{d.term}</span>
                      )}
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      {editingDict === d.id ? (
                        <input type="text" value={editDictFull} onChange={(e) => setEditDictFull(e.target.value)} style={{ padding: '4px', width: '100%' }} />
                      ) : (
                        <span style={{ color: '#6b7280' }}>{d.full_form}</span>
                      )}
                    </td>
                    <td style={{ padding: '0.75rem', maxWidth: '300px' }}>
                      {editingDict === d.id ? (
                        <textarea value={editDictDesc} onChange={(e) => setEditDictDesc(e.target.value)} rows={2} style={{ padding: '4px', width: '100%', resize: 'vertical' }} />
                      ) : (
                        <span style={{ color: '#6b7280' }}>{d.description}</span>
                      )}
                    </td>
                    <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                      {editingDict === d.id ? (
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button onClick={() => saveDict(d.id)} disabled={saving} style={{ background: 'var(--kms-accent)', border: 'none', color: '#fff', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer', fontSize: '0.8rem' }}>Simpan</button>
                          <button onClick={() => setEditingDict(null)} style={{ background: 'none', border: '1px solid #ccc', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer', fontSize: '0.8rem' }}>Batal</button>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button onClick={() => startEditDict(d)} style={{ background: 'none', border: 'none', color: 'var(--kms-primary)', cursor: 'pointer', fontSize: '0.85rem' }}>Edit</button>
                          <button onClick={() => deleteDictionary(d.id, d.term)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.85rem' }}>{isEn ? 'Delete' : 'Hapus'}</button>
                        </div>
                      )}
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
                    <td style={{ padding: '0.75rem', fontWeight: 600, textAlign: 'center' }}>
                      {editingFaq === f.id ? (
                        <input type="number" value={editFaqOrder} onChange={(e) => setEditFaqOrder(Number(e.target.value) || 0)} style={{ width: '60px', padding: '4px' }} />
                      ) : (
                        f.sort_order
                      )}
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      {editingFaq === f.id ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <input type="text" value={editFaqQ} onChange={(e) => setEditFaqQ(e.target.value)} style={{ padding: '4px', width: '100%' }} />
                          <textarea value={editFaqA} onChange={(e) => setEditFaqA(e.target.value)} style={{ padding: '4px', width: '100%' }} rows={2} />
                        </div>
                      ) : (
                        <>
                          <div style={{ fontWeight: 600, color: 'var(--ifm-color-emphasis-900)', marginBottom: '0.25rem' }}>{f.question}</div>
                          <div style={{ color: '#6b7280', fontSize: '0.82rem' }}>{f.answer}</div>
                        </>
                      )}
                    </td>
                    <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                      {editingFaq === f.id ? (
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button onClick={() => saveFaq(f.id)} disabled={saving} style={{ background: 'var(--kms-accent)', border: 'none', color: '#fff', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer', fontSize: '0.8rem' }}>Simpan</button>
                          <button onClick={() => setEditingFaq(null)} style={{ background: 'none', border: '1px solid #ccc', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer', fontSize: '0.8rem' }}>Batal</button>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button onClick={() => startEditFaq(f)} style={{ background: 'none', border: 'none', color: 'var(--kms-primary)', cursor: 'pointer', fontSize: '0.85rem' }}>Edit</button>
                          <button onClick={() => deleteFaq(f.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.85rem' }}>{isEn ? 'Delete' : 'Hapus'}</button>
                        </div>
                      )}
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

      
      {/* ── TAB: Archive ── */}
      {activeTab === 'archive' && (
        <div className="kms-card">
          <h3 style={{ marginBottom: '1.25rem' }}>{isEn ? 'Archived Data' : 'Data yang Diarsipkan (Dihapus)'}</h3>
          <p style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '1.5rem' }}>
            Data FAQ dan Kamus yang telah di-Soft Delete disembunyikan di sini. Anda dapat memulihkannya kembali agar tampil di halaman utama.
          </p>

          <h4 style={{ color: 'var(--kms-primary)', fontSize: '1rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.5rem' }}>FAQ yang Dihapus</h4>
          <div style={{ overflowX: 'auto', marginBottom: '2rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--ifm-toc-border-color)' }}>
                  <th style={{ textAlign: 'left', padding: '0.6rem 0.75rem', color: '#6b7280', fontSize: '0.78rem' }}>PERTANYAAN / JAWABAN</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {archivedFaqs.map(f => (
                  <tr key={f.id} style={{ borderBottom: '1px solid var(--ifm-toc-border-color)' }}>
                    <td style={{ padding: '0.75rem' }}>
                      <div style={{ fontWeight: 600, color: 'var(--ifm-color-emphasis-900)' }}>{f.question}</div>
                      <div style={{ color: '#6b7280', fontSize: '0.82rem' }}>{f.answer}</div>
                    </td>
                    <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                      <button onClick={() => restoreArchive('faq', f.id, 'FAQ ini')} disabled={saving} style={{ background: 'var(--kms-accent)', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}>
                        {saving ? '...' : 'Restore'}
                      </button>
                    </td>
                  </tr>
                ))}
                {archivedFaqs.length === 0 && (
                  <tr><td colSpan={2} style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>Tidak ada FAQ yang diarsipkan</td></tr>
                )}
              </tbody>
            </table>
          </div>

          <h4 style={{ color: 'var(--kms-primary)', fontSize: '1rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.5rem' }}>Kamus Istilah yang Dihapus</h4>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--ifm-toc-border-color)' }}>
                  <th style={{ textAlign: 'left', padding: '0.6rem 0.75rem', color: '#6b7280', fontSize: '0.78rem' }}>ISTILAH</th>
                  <th style={{ textAlign: 'left', padding: '0.6rem 0.75rem', color: '#6b7280', fontSize: '0.78rem' }}>KEPANJANGAN</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {archivedDicts.map(d => (
                  <tr key={d.id} style={{ borderBottom: '1px solid var(--ifm-toc-border-color)' }}>
                    <td style={{ padding: '0.75rem', fontWeight: 600 }}>{d.term}</td>
                    <td style={{ padding: '0.75rem', color: '#6b7280' }}>{d.full_form}</td>
                    <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                      <button onClick={() => restoreArchive('dictionary', d.id, `Istilah ${d.term}`)} disabled={saving} style={{ background: 'var(--kms-accent)', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}>
                        {saving ? '...' : 'Restore'}
                      </button>
                    </td>
                  </tr>
                ))}
                {archivedDicts.length === 0 && (
                  <tr><td colSpan={3} style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>Tidak ada istilah yang diarsipkan</td></tr>
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

export default function EditorPage() {
  const { i18n } = useDocusaurusContext();
  const isEn = i18n.currentLocale === 'en';
  const { isAdmin } = useAuth();

  return (
    <Layout title={isEn ? 'Editor Dashboard' : 'Dashboard Editor'}>
      <AuthGuard requiredRole="editor">
        {isAdmin ? (
          <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚫</div>
            <h2 style={{ color: 'var(--kms-danger)' }}>Akses Ditolak</h2>
            <p style={{ color: '#6b7280', maxWidth: '400px', margin: '0 auto 1rem' }}>
              Halaman ini dikhususkan untuk pengguna dengan peran Editor, bukan Administrator.
            </p>
            <a href="/admin" className="kms-btn kms-btn--primary" style={{ width: 'auto', padding: '8px 20px' }}>
              Ke Dashboard Admin
            </a>
          </div>
        ) : (
          <EditorDashboard />
        )}
      </AuthGuard>
    </Layout>
  );
}
