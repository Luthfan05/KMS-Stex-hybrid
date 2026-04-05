import React, { useState, useEffect, FormEvent } from 'react';
import Layout from '@theme/Layout';
import { useLocation } from '@docusaurus/router';
import { supabase, timeAgo } from '../../lib/supabase';
import type { KMSDocument, DocumentVersion } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import AuthGuard from '../../components/AuthGuard';
import imageCompression from 'browser-image-compression';

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

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

import MarkdownRenderer from '../../components/MarkdownRenderer';

function EditDocumentForm() {
  const query = useQuery();
  const docId = query.get('id');
  const { currentUser, checkSession } = useAuth();

  const [docData, setDocData] = useState<KMSDocument | null>(null);
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('all');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState('draft');
  const [currentVersion, setCurrentVersion] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write');
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

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

    const userDept = currentUser?.department;
    const isDocOwner = currentUser?.role === 'admin' || (currentUser?.role === 'editor' && (userDept === 'all' || doc.department === userDept));

    if (!isDocOwner) {
      setError('Anda tidak memiliki izin untuk mengedit dokumen ini. Anda hanya bisa mengedit dokumen dari departemen Anda sendiri.');
      setDocData(null);
      setNotFound(true);
      setLoading(false);
      return;
    }


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

    // Load draft if exists
    const draft = localStorage.getItem(`kms_edit_doc_draft_${docId}`);
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        if (parsed.title) setTitle(parsed.title);
        if (parsed.content) setContent(parsed.content);
        if (parsed.department) setDepartment(parsed.department);
        if (parsed.status) setStatus(parsed.status);
      } catch (e) { }
    }

    setLoading(false);
  };

  // Save draft on change
  React.useEffect(() => {
    if (docId && docData && !loading) {
      localStorage.setItem(`kms_edit_doc_draft_${docId}`, JSON.stringify({ title, content, department, status }));
    }
  }, [title, content, department, status, docId, docData, loading]);

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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setError('');

    const sessionActive = await checkSession();
    if (!sessionActive) {
      setError('Sesi Anda telah berakhir. Harap buka tab baru untuk Login kembali agar bisa mengunggah gambar.');
      setUploadingImage(false);
      return;
    }

    try {
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1280,
        useWebWorker: true,
        fileType: 'image/webp',
      };

      const compressedFile = await imageCompression(file, options);

      const fileExt = 'webp';
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('document-images')
        .upload(filePath, compressedFile);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage.from('document-images').getPublicUrl(filePath);

      const imageMarkdown = `![${file.name}](${data.publicUrl})`;

      const textarea = window.document.getElementById('kms-content-editor') as HTMLTextAreaElement | null;
      if (textarea) {
        const start = textarea.selectionStart;
        const before = content.substring(0, start);
        const after = content.substring(textarea.selectionEnd);
        setContent(before + imageMarkdown + after);
      } else {
        setContent((prev) => prev + '\n' + imageMarkdown + '\n');
      }
    } catch (err: any) {
      setError('Gagal mengupload gambar. Pastikan bucket "document-images" ada dan publik di Supabase. ' + (err.message || ''));
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async () => {
    if (!docData) return;
    if (!window.confirm('Apakah Anda yakin ingin menghapus dokumen ini? Tindakan ini tidak dapat dibatalkan.')) return;
    
    setDeleting(true);
    setError('');

    const sessionActive = await checkSession();
    if (!sessionActive) {
      setError('Sesi Anda telah berakhir. Harap buka tab baru untuk Login kembali.');
      setDeleting(false);
      return;
    }

    try {
      await supabase.from('activity_logs').insert({
        user_id: currentUser?.id,
        action: 'delete_document',
        document_id: docData.id,
      });

      const { error: delErr } = await supabase
        .from('documents')
        .delete()
        .eq('id', docData.id);

      if (delErr) {
        setError(delErr.message);
        setDeleting(false);
        return;
      }

      localStorage.removeItem(`kms_edit_doc_draft_${docData.id}`);
      window.location.href = '/documents';
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat menghapus.');
      setDeleting(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!currentUser || !docData || !title.trim()) return;
    setError('');
    setSaving(true);

    const sessionActive = await checkSession();
    if (!sessionActive) {
      setError('Sesi Anda telah berakhir. Draft tulisan Anda tersimpan di browser. Harap buka tab baru untuk Login kembali, lalu coba simpan lagi.');
      setSaving(false);
      return;
    }

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

      localStorage.removeItem(`kms_edit_doc_draft_${docData.id}`);
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
        <div style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#9ca3af' }}>--</div>
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
        <div style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--kms-success)' }}>OK</div>
        <h2 style={{ color: 'var(--kms-success)' }}>Perubahan Berhasil Disimpan!</h2>
        <p style={{ color: '#6b7280' }}>Versi {currentVersion} telah dibuat. Mengalihkan...</p>
      </div>
    );
  }

  return (
    <div className="kms-editor">
      <div className="kms-editor__header">
        <div>
          <h1 style={{ fontSize: '1.6rem', marginBottom: '0.2rem' }}>Edit Dokumen</h1>
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
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="kms-card kms-card--static" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '0.95rem', marginBottom: '1rem', color: 'var(--kms-primary)' }}>Detail Dokumen</h3>

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
                <option value="draft">Draft</option>
                <option value="review">Review</option>
                <option value="published">Terbit</option>
              </select>
            </div>
          </div>

          <div style={{ fontSize: '0.78rem', color: '#9ca3af', marginTop: '0.5rem' }}>
            Tautan: <code style={{ background: '#f3f4f6', padding: '2px 6px', borderRadius: '4px' }}>/{docData.slug}</code>
            {' · '}Dibuat: {docData.created_at ? timeAgo(docData.created_at) : '—'}
            {' · '}Oleh: {(docData as any).profiles?.name || '—'}
          </div>
        </div>

        {/* Content Editor */}
        <div className="kms-card kms-card--static" style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <h3 style={{ fontSize: '0.95rem', margin: 0, color: 'var(--kms-primary)' }}>Konten Dokumen</h3>
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
              Tulis
            </button>
            <button
              type="button"
              className={`kms-editor__tab ${activeTab === 'preview' ? 'kms-editor__tab--active' : ''}`}
              onClick={() => setActiveTab('preview')}
            >
              Preview
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
                <button type="button" onClick={() => insertMarkdown('- ')}>• L1</button>
                <button type="button" onClick={() => insertMarkdown('  - ')}>• L2</button>
                <button type="button" onClick={() => insertMarkdown('    - ')}>• L3</button>
                <button type="button" onClick={() => insertMarkdown('\n---\n\n')}>Garis</button>
                <button type="button" onClick={() => insertMarkdown('> ')}>Quote</button>
                <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploadingImage}>
                  {uploadingImage ? 'Mengupload...' : '🖼 Gambar'}
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  style={{ display: 'none' }}
                />
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
              <MarkdownRenderer content={content} />
            </div>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'space-between' }}>
          <button
            type="button"
            onClick={handleDelete}
            className="kms-btn"
            disabled={deleting}
            style={{ width: 'auto', padding: '10px 24px', backgroundColor: 'var(--kms-danger)', color: 'white', opacity: deleting ? 0.7 : 1 }}
          >
            {deleting ? 'Menghapus...' : 'Hapus Dokumen'}
          </button>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <a href={`/document?slug=${docData.slug}`} className="kms-btn kms-btn--ghost" style={{ width: 'auto', padding: '10px 24px' }}>
              Batal
            </a>
            <button
              type="submit"
              className="kms-btn kms-btn--accent"
              disabled={saving || !title.trim() || deleting}
              style={{ width: 'auto', padding: '10px 28px', opacity: (saving || !title.trim() || deleting) ? 0.7 : 1 }}
            >
              {saving ? 'Menyimpan...' : `Simpan (v${currentVersion + 1})`}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default function EditDocumentPage() {
  return (
    <Layout title="Edit Dokumen" description="Edit dokumen di Sukuntex KMS">
      <AuthGuard requiredRole="editor">
        <EditDocumentForm />
      </AuthGuard>
    </Layout>
  );
}
