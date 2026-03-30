import React, { useState, useEffect, FormEvent } from 'react';
import Layout from '@theme/Layout';
import { useLocation } from '@docusaurus/router';
import { supabase, timeAgo } from '../../lib/supabase';
import type { KMSDocument, DocumentVersion } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import AuthGuard from '../../components/AuthGuard';

const DEPT_OPTIONS = [
  { value: 'all', label: '🏢 Semua Departemen' },
  { value: 'hrd', label: '👥 HRD' },
  { value: 'finance', label: '💰 Finance' },
  { value: 'operasional', label: '⚙️ Operasional' },
  { value: 'it', label: '💻 IT' },
  { value: 'legal', label: '⚖️ Legal' },
];

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

// ── Markdown-like preview ──────────────────────────────────
function RenderPreview({ content }: { content: string }) {
  if (!content.trim()) {
    return <p style={{ color: '#9ca3af', fontStyle: 'italic' }}>Belum ada konten untuk di-preview...</p>;
  }
  const lines = content.split('\n');
  return (
    <div style={{ lineHeight: 1.8, color: '#374151', fontSize: '0.95rem' }}>
      {lines.map((line, i) => {
        if (line.startsWith('# '))  return <h1 key={i} style={{ fontSize: '1.6rem', fontWeight: 700, marginTop: '1.5rem', color: '#111827' }}>{line.slice(2)}</h1>;
        if (line.startsWith('## ')) return <h2 key={i} style={{ fontSize: '1.3rem', fontWeight: 700, marginTop: '1.25rem', color: '#1f2937', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.3rem' }}>{line.slice(3)}</h2>;
        if (line.startsWith('### ')) return <h3 key={i} style={{ fontSize: '1.1rem', fontWeight: 600, marginTop: '1rem', color: '#374151' }}>{line.slice(4)}</h3>;
        if (line.startsWith('- ') || line.startsWith('* ')) return <li key={i} style={{ marginLeft: '1.5rem', marginBottom: '0.25rem' }}>{line.slice(2)}</li>;
        if (line.startsWith('> ')) return <blockquote key={i} style={{ borderLeft: '4px solid var(--kms-accent)', paddingLeft: '1rem', color: '#6b7280', margin: '0.5rem 0', fontStyle: 'italic' }}>{line.slice(2)}</blockquote>;
        if (line.trim() === '') return <br key={i} />;
        return <p key={i} style={{ margin: '0 0 0.5rem' }}>{line}</p>;
      })}
    </div>
  );
}

function EditDocumentForm() {
  const query = useQuery();
  const docId = query.get('id');
  const { currentUser } = useAuth();

  const [docData, setDocData] = useState<KMSDocument | null>(null);
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('all');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState('draft');
  const [currentVersion, setCurrentVersion] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write');

  useEffect(() => {
    if (!docId) { setNotFound(true); setLoading(false); return; }
    fetchDocument();
  }, [docId]);

  const fetchDocument = async () => {
    const { data: doc, error: docErr } = await supabase
      .from('documents')
      .select('*, profiles(name)')
      .eq('id', docId)
      .single();

    if (docErr || !doc) { setNotFound(true); setLoading(false); return; }


    setDocData(doc as KMSDocument);
    setTitle(doc.title);
    setDepartment(doc.department || 'all');
    setStatus(doc.status);

    // Get latest version
    const { data: versions } = await supabase
      .from('document_versions')
      .select('*')
      .eq('document_id', doc.id)
      .order('version_number', { ascending: false })
      .limit(1);

    if (versions && versions.length > 0) {
      setContent(versions[0].content || '');
      setCurrentVersion(versions[0].version_number);
    }

    setLoading(false);
  };

  const insertMarkdown = (prefix: string, suffix = '') => {
    const textarea = window.document.getElementById('kms-content-editor') as HTMLTextAreaElement | null;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = content.substring(start, end);
    const before = content.substring(0, start);
    const after = content.substring(end);
    const newContent = before + prefix + (selected || 'teks') + suffix + after;
    setContent(newContent);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + (selected || 'teks').length);
    }, 10);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!currentUser || !docData || !title.trim()) return;
    setError('');
    setSaving(true);

    try {
      // Update document metadata
      const { error: updateErr } = await supabase
        .from('documents')
        .update({
          title: title.trim(),
          department,
          status,
        })
        .eq('id', docData.id);

      if (updateErr) {
        setError(updateErr.message);
        setSaving(false);
        return;
      }

      // Create new version
      const newVersion = currentVersion + 1;
      await supabase.from('document_versions').insert({
        document_id: docData.id,
        content: content.trim(),
        version_number: newVersion,
        created_by: currentUser.id,
      });

      // Log activity
      await supabase.from('activity_logs').insert({
        user_id: currentUser.id,
        action: 'edit_document',
        document_id: docData.id,
      });

      setCurrentVersion(newVersion);
      setSuccess(true);
      setTimeout(() => {
        window.location.href = `/document?slug=${docData.slug}`;
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat menyimpan.');
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
        <div className="kms-spinner" />
      </div>
    );
  }

  if (notFound || !docData) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
        <h2 style={{ color: '#374151' }}>Dokumen Tidak Ditemukan</h2>
        <p style={{ color: '#6b7280' }}>ID dokumen tidak valid atau dokumen sudah dihapus.</p>
        <a href="/documents" className="kms-btn kms-btn--ghost" style={{ width: 'auto', padding: '10px 24px' }}>
          ← Kembali ke Daftar Dokumen
        </a>
      </div>
    );
  }

  if (success) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
        <h2 style={{ color: 'var(--kms-success)' }}>Perubahan Berhasil Disimpan!</h2>
        <p style={{ color: '#6b7280' }}>Versi {currentVersion} telah dibuat. Mengalihkan...</p>
      </div>
    );
  }

  return (
    <div className="kms-editor">
      <div className="kms-editor__header">
        <div>
          <h1 style={{ fontSize: '1.6rem', marginBottom: '0.2rem' }}>✏️ Edit Dokumen</h1>
          <p style={{ color: '#6b7280', margin: 0, fontSize: '0.9rem' }}>
            Mengedit: <strong>{docData.title}</strong>
            <span style={{ marginLeft: '8px', fontSize: '0.78rem', color: '#9ca3af' }}>
              (v{currentVersion} · /{docData.slug})
            </span>
          </p>
        </div>
        <a href={`/document?slug=${docData.slug}`} style={{ fontSize: '0.85rem', color: '#6b7280', textDecoration: 'none' }}>
          ← Kembali ke Dokumen
        </a>
      </div>

      {error && (
        <div className="kms-notice kms-notice--danger" style={{ marginBottom: '1.5rem' }}>
          ⚠️ {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="kms-card kms-card--static" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '0.95rem', marginBottom: '1rem', color: 'var(--kms-primary)' }}>📋 Detail Dokumen</h3>

          <div className="kms-form-group">
            <label htmlFor="doc-title">Judul Dokumen *</label>
            <input
              id="doc-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="kms-editor__form-row">
            <div className="kms-form-group">
              <label htmlFor="doc-department">Departemen</label>
              <select
                id="doc-department"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
              >
                {DEPT_OPTIONS.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
              </select>
            </div>

            <div className="kms-form-group">
              <label htmlFor="doc-status">Status</label>
              <select id="doc-status" value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="draft">📝 Draft</option>
                <option value="review">🔍 Review</option>
                <option value="published">✅ Terbit</option>
              </select>
            </div>
          </div>

          <div style={{ fontSize: '0.78rem', color: '#9ca3af', marginTop: '0.5rem' }}>
            Slug: <code style={{ background: '#f3f4f6', padding: '2px 6px', borderRadius: '4px' }}>/{docData.slug}</code>
            {' · '}Dibuat: {docData.created_at ? timeAgo(docData.created_at) : '—'}
            {' · '}Oleh: {(docData as any).profiles?.name || '—'}
          </div>
        </div>

        {/* Content Editor */}
        <div className="kms-card kms-card--static" style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <h3 style={{ fontSize: '0.95rem', margin: 0, color: 'var(--kms-primary)' }}>📄 Konten Dokumen</h3>
            <span style={{ fontSize: '0.75rem', color: '#6b7280', background: '#f3f4f6', padding: '2px 8px', borderRadius: '20px' }}>
              Akan menjadi v{currentVersion + 1}
            </span>
          </div>

          {/* Tab bar */}
          <div className="kms-editor__tab-bar">
            <button
              type="button"
              className={`kms-editor__tab ${activeTab === 'write' ? 'kms-editor__tab--active' : ''}`}
              onClick={() => setActiveTab('write')}
            >
              ✏️ Tulis
            </button>
            <button
              type="button"
              className={`kms-editor__tab ${activeTab === 'preview' ? 'kms-editor__tab--active' : ''}`}
              onClick={() => setActiveTab('preview')}
            >
              👁️ Preview
            </button>
          </div>

          {activeTab === 'write' ? (
            <>
              <div className="kms-editor__toolbar" style={{ marginTop: '0.75rem' }}>
                <button type="button" onClick={() => insertMarkdown('# ')}>H1</button>
                <button type="button" onClick={() => insertMarkdown('## ')}>H2</button>
                <button type="button" onClick={() => insertMarkdown('### ')}>H3</button>
                <button type="button" onClick={() => insertMarkdown('**', '**')}>B</button>
                <button type="button" onClick={() => insertMarkdown('*', '*')}>I</button>
                <button type="button" onClick={() => insertMarkdown('- ')}>• List</button>
                <button type="button" onClick={() => insertMarkdown('> ')}>Quote</button>
              </div>

              <textarea
                id="kms-content-editor"
                className="kms-editor__content-area"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Tulis konten dokumen di sini menggunakan format Markdown..."
              />
            </>
          ) : (
            <div className="kms-editor__preview" style={{ marginTop: '0.75rem' }}>
              <RenderPreview content={content} />
            </div>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <a href={`/document?slug=${docData.slug}`} className="kms-btn kms-btn--ghost" style={{ width: 'auto', padding: '10px 24px' }}>
            Batal
          </a>
          <button
            type="submit"
            className="kms-btn kms-btn--accent"
            disabled={saving || !title.trim()}
            style={{ width: 'auto', padding: '10px 28px', opacity: (saving || !title.trim()) ? 0.7 : 1 }}
          >
            {saving ? '💾 Menyimpan...' : `💾 Simpan (v${currentVersion + 1})`}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function EditDocumentPage() {
  return (
    <Layout title="Edit Dokumen" description="Edit dokumen di STex KMS">
      <AuthGuard requiredRole="editor">
        <EditDocumentForm />
      </AuthGuard>
    </Layout>
  );
}
