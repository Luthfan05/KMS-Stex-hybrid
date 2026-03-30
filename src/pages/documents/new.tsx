import React, { useState, FormEvent } from 'react';
import Layout from '@theme/Layout';
import { supabase } from '../../lib/supabase';
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

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
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

function NewDocumentForm() {
  const { currentUser } = useAuth();
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [slugManual, setSlugManual] = useState(false);
  const [department, setDepartment] = useState('all');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState('draft');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write');

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!slugManual) {
      const prefix = department !== 'all' ? `${department}-` : '';
      setSlug(prefix + slugify(val));
    }
  };

  const handleDeptChange = (val: string) => {
    setDepartment(val);
    if (!slugManual && title) {
      const prefix = val !== 'all' ? `${val}-` : '';
      setSlug(prefix + slugify(title));
    }
  };

  const insertMarkdown = (prefix: string, suffix = '') => {
    const textarea = document.getElementById('kms-content-editor') as HTMLTextAreaElement;
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
    if (!currentUser || !title.trim() || !slug.trim()) return;
    setError('');
    setSaving(true);

    try {
      // Create document
      const { data: doc, error: docError } = await supabase
        .from('documents')
        .insert({
          title: title.trim(),
          slug: slug.trim(),
          department,
          created_by: currentUser.id,
          status,
        })
        .select()
        .single();

      if (docError) {
        if (docError.message.includes('duplicate') || docError.message.includes('unique')) {
          setError('Slug sudah digunakan. Pilih slug yang berbeda.');
        } else {
          setError(docError.message);
        }
        setSaving(false);
        return;
      }

      // Create first version
      if (content.trim()) {
        await supabase.from('document_versions').insert({
          document_id: doc.id,
          content: content.trim(),
          version_number: 1,
          created_by: currentUser.id,
        });
      }

      // Log activity
      await supabase.from('activity_logs').insert({
        user_id: currentUser.id,
        action: 'create_document',
        document_id: doc.id,
      });

      setSuccess(true);
      setTimeout(() => {
        window.location.href = `/document?slug=${doc.slug}`;
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat menyimpan.');
    }
    setSaving(false);
  };

  if (success) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
        <h2 style={{ color: 'var(--kms-success)' }}>Dokumen Berhasil Dibuat!</h2>
        <p style={{ color: '#6b7280' }}>Mengalihkan ke halaman dokumen...</p>
      </div>
    );
  }

  return (
    <div className="kms-editor">
      <div className="kms-editor__header">
        <div>
          <h1 style={{ fontSize: '1.6rem', marginBottom: '0.2rem' }}>📝 Dokumen Baru</h1>
          <p style={{ color: '#6b7280', margin: 0, fontSize: '0.9rem' }}>
            Buat dokumen baru untuk Knowledge Management System
          </p>
        </div>
        <a href="/documents" style={{ fontSize: '0.85rem', color: '#6b7280', textDecoration: 'none' }}>
          ← Kembali
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
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Contoh: SOP Pengajuan Cuti Karyawan"
              required
            />
          </div>

          <div className="kms-editor__form-row">
            <div className="kms-form-group">
              <label htmlFor="doc-slug">
                Slug (URL) *
                <button
                  type="button"
                  onClick={() => setSlugManual(!slugManual)}
                  style={{ background: 'none', border: 'none', color: 'var(--kms-accent)', fontSize: '0.75rem', cursor: 'pointer', marginLeft: '8px', fontFamily: 'inherit' }}
                >
                  {slugManual ? '🔗 Auto' : '✏️ Manual'}
                </button>
              </label>
              <input
                id="doc-slug"
                type="text"
                value={slug}
                onChange={(e) => { setSlugManual(true); setSlug(e.target.value); }}
                placeholder="hrd-sop-pengajuan-cuti"
                required
                style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}
              />
            </div>

            <div className="kms-form-group">
              <label htmlFor="doc-department">Departemen</label>
              <select
                id="doc-department"
                value={department}
                onChange={(e) => handleDeptChange(e.target.value)}
              >
                {DEPT_OPTIONS.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
              </select>
            </div>
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

        {/* Content Editor */}
        <div className="kms-card kms-card--static" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '0.95rem', marginBottom: '1rem', color: 'var(--kms-primary)' }}>📄 Konten Dokumen</h3>

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
              {/* Toolbar */}
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
                placeholder="Tulis konten dokumen di sini menggunakan format Markdown...&#10;&#10;# Judul Utama&#10;## Sub Judul&#10;&#10;Paragraf teks biasa.&#10;&#10;- Item daftar 1&#10;- Item daftar 2&#10;&#10;> Kutipan penting"
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
          <a href="/documents" className="kms-btn kms-btn--ghost" style={{ width: 'auto', padding: '10px 24px' }}>
            Batal
          </a>
          <button
            type="submit"
            className="kms-btn kms-btn--accent"
            disabled={saving || !title.trim() || !slug.trim()}
            style={{ width: 'auto', padding: '10px 28px', opacity: (saving || !title.trim() || !slug.trim()) ? 0.7 : 1 }}
          >
            {saving ? '💾 Menyimpan...' : '💾 Simpan Dokumen'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function NewDocumentPage() {
  return (
    <Layout title="Buat Dokumen Baru" description="Buat dokumen baru di STex KMS">
      <AuthGuard requiredRole="editor">
        <NewDocumentForm />
      </AuthGuard>
    </Layout>
  );
}
