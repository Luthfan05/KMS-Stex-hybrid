import React, { useState, useEffect } from 'react';
import Layout from '@theme/Layout';
import { useLocation } from '@docusaurus/router';
import { supabase, timeAgo } from '../lib/supabase';
import type { KMSDocument, DocumentVersion, Comment, Feedback } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import VersionHistory from '../components/VersionHistory';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

// ── Markdown-like renderer (basic) ─────────────────────────
function RenderContent({ content }: { content: string }) {
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

// ── Comment Section ────────────────────────────────────────
function CommentSection({ documentId }: { documentId: string }) {
  const { currentUser } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [documentId]);

  const fetchComments = async () => {
    const { data } = await supabase
      .from('comments')
      .select('*, profiles(name), comment_replies(*, profiles(name))')
      .eq('document_id', documentId)
      .order('created_at', { ascending: false });
    if (data) setComments(data as Comment[]);
  };

  const submitComment = async () => {
    if (!currentUser || !newComment.trim()) return;
    setSubmitting(true);
    const { error } = await supabase.from('comments').insert({
      document_id: documentId,
      user_id: currentUser.id,
      content: newComment.trim(),
    });
    if (!error) {
      setNewComment('');
      await fetchComments();
      await supabase.from('activity_logs').insert({ user_id: currentUser.id, action: 'add_comment', document_id: documentId });
    }
    setSubmitting(false);
  };

  const submitReply = async (commentId: string) => {
    if (!currentUser || !replyContent.trim()) return;
    setSubmitting(true);
    const { error } = await supabase.from('comment_replies').insert({
      comment_id: commentId,
      user_id: currentUser.id,
      content: replyContent.trim(),
    });
    if (!error) {
      setReplyTo(null);
      setReplyContent('');
      await fetchComments();
    }
    setSubmitting(false);
  };

  return (
    <div className="kms-card kms-card--static" style={{ marginTop: '2rem' }}>
      <h4 style={{ margin: '0 0 1.25rem', color: 'var(--kms-primary)', fontSize: '0.95rem', fontWeight: 700 }}>
        💬 Komentar ({comments.length})
      </h4>

      {currentUser ? (
        <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'var(--ifm-background-surface-color)', borderRadius: '10px', border: '1px solid #e5e7eb' }}>
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Tulis komentar Anda..."
            rows={3}
            style={{ width: '100%', padding: '10px', border: '1.5px solid #e5e7eb', borderRadius: '8px', fontSize: '0.88rem', fontFamily: 'inherit', resize: 'vertical', outline: 'none', boxSizing: 'border-box' }}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <button
              onClick={submitComment}
              disabled={submitting || !newComment.trim()}
              className="kms-btn kms-btn--primary"
              style={{ width: 'auto', padding: '8px 20px', fontSize: '0.85rem', opacity: (!newComment.trim() || submitting) ? 0.7 : 1 }}
            >
              {submitting ? 'Mengirim...' : 'Kirim Komentar'}
            </button>
          </div>
        </div>
      ) : (
        <div className="kms-notice kms-notice--info" style={{ marginBottom: '1.5rem' }}>
          <a href="/login" style={{ color: 'var(--kms-accent)' }}>Masuk</a> untuk menambahkan komentar.
        </div>
      )}

      {comments.length === 0 ? (
        <p style={{ color: '#9ca3af', fontSize: '0.88rem', textAlign: 'center', padding: '1.5rem 0' }}>
          Belum ada komentar. Jadilah yang pertama!
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {comments.map((comment) => (
            <div key={comment.id} style={{ borderBottom: '1px solid #f3f4f6', paddingBottom: '1rem' }}>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--kms-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 700, flexShrink: 0 }}>
                  {((comment as any).profiles?.name || 'U')[0].toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'baseline', marginBottom: '0.35rem' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.88rem', color: '#111827' }}>
                      {(comment as any).profiles?.name || 'Unknown'}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                      {comment.created_at ? timeAgo(comment.created_at) : ''}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.88rem', color: '#374151', lineHeight: 1.6 }}>{comment.content}</p>
                  <button
                    onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
                    style={{ background: 'none', border: 'none', color: 'var(--kms-accent)', fontSize: '0.78rem', cursor: 'pointer', padding: '4px 0', fontFamily: 'inherit', marginTop: '0.35rem' }}
                  >
                    {replyTo === comment.id ? '✕ Batal balas' : '↩ Balas'}
                  </button>

                  {replyTo === comment.id && currentUser && (
                    <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem' }}>
                      <input
                        type="text"
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        placeholder="Tulis balasan..."
                        style={{ flex: 1, padding: '6px 10px', border: '1.5px solid #e5e7eb', borderRadius: '6px', fontSize: '0.82rem', fontFamily: 'inherit', outline: 'none' }}
                      />
                      <button
                        onClick={() => submitReply(comment.id)}
                        disabled={submitting || !replyContent.trim()}
                        style={{ padding: '6px 14px', background: 'var(--kms-accent)', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '0.82rem', cursor: 'pointer', fontFamily: 'inherit' }}
                      >
                        Kirim
                      </button>
                    </div>
                  )}

                  {(comment as any).comment_replies?.length > 0 && (
                    <div style={{ marginTop: '0.75rem', paddingLeft: '1rem', borderLeft: '2px solid #e5e7eb', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {((comment as any).comment_replies as any[]).map((reply) => (
                        <div key={reply.id} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                          <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#e5e7eb', color: '#374151', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0 }}>
                            {(reply.profiles?.name || 'U')[0].toUpperCase()}
                          </div>
                          <div>
                            <span style={{ fontWeight: 600, fontSize: '0.82rem', color: '#374151' }}>{reply.profiles?.name || 'Unknown'}</span>
                            <span style={{ fontSize: '0.72rem', color: '#9ca3af', marginLeft: '6px' }}>{reply.created_at ? timeAgo(reply.created_at) : ''}</span>
                            <p style={{ margin: '2px 0 0', fontSize: '0.82rem', color: '#374151' }}>{reply.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Feedback Section ──────────────────────────────────────
function FeedbackSection({ documentId }: { documentId: string }) {
  const { currentUser } = useAuth();
  const [counts, setCounts] = useState({ helpful: 0, notHelpful: 0 });
  const [userFeedback, setUserFeedback] = useState<string | null>(null);

  useEffect(() => {
    fetchFeedback();
  }, [documentId]);

  const fetchFeedback = async () => {
    const { data } = await supabase.from('feedback').select('type, user_id').eq('document_id', documentId);
    if (data) {
      setCounts({
        helpful: data.filter((f) => f.type === 'helpful').length,
        notHelpful: data.filter((f) => f.type === 'not_helpful').length,
      });
      if (currentUser) {
        const mine = data.find((f) => f.user_id === currentUser.id);
        setUserFeedback(mine?.type || null);
      }
    }
  };

  const submitFeedback = async (type: string) => {
    if (!currentUser) return;
    if (userFeedback === type) return;
    await supabase.from('feedback').delete().eq('document_id', documentId).eq('user_id', currentUser.id);
    await supabase.from('feedback').insert({ document_id: documentId, user_id: currentUser.id, type });
    setUserFeedback(type);
    await fetchFeedback();
  };

  return (
    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', padding: '1rem 0', borderTop: '1px solid #f3f4f6', marginTop: '2rem' }}>
      <span style={{ fontSize: '0.85rem', color: '#6b7280', fontWeight: 600 }}>Apakah dokumen ini bermanfaat?</span>
      <button
        onClick={() => submitFeedback('helpful')}
        style={{
          padding: '6px 14px', border: '1.5px solid', borderRadius: '20px', fontSize: '0.82rem', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
          borderColor: userFeedback === 'helpful' ? '#059669' : '#e5e7eb',
          background: userFeedback === 'helpful' ? '#d1fae5' : '#fff',
          color: userFeedback === 'helpful' ? '#065f46' : '#374151',
          fontWeight: userFeedback === 'helpful' ? 700 : 500,
        }}
      >
        👍 Ya ({counts.helpful})
      </button>
      <button
        onClick={() => submitFeedback('not_helpful')}
        style={{
          padding: '6px 14px', border: '1.5px solid', borderRadius: '20px', fontSize: '0.82rem', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
          borderColor: userFeedback === 'not_helpful' ? '#dc2626' : '#e5e7eb',
          background: userFeedback === 'not_helpful' ? '#fee2e2' : '#fff',
          color: userFeedback === 'not_helpful' ? '#991b1b' : '#374151',
          fontWeight: userFeedback === 'not_helpful' ? 700 : 500,
        }}
      >
        👎 Tidak ({counts.notHelpful})
      </button>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────
export default function DocumentViewPage() {
  const query = useQuery();
  const slug = query.get('slug');
  const { currentUser, isEditor } = useAuth();

  const [document, setDocument] = useState<KMSDocument | null>(null);
  const [latestVersion, setLatestVersion] = useState<DocumentVersion | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) { setNotFound(true); setLoading(false); return; }
    fetchDocument(slug);
  }, [slug]);

  const fetchDocument = async (s: string) => {
    const { data: doc, error } = await supabase
      .from('documents')
      .select('*, profiles(name)')
      .eq('slug', s)
      .single();

    if (error || !doc) { setNotFound(true); setLoading(false); return; }
    setDocument(doc as KMSDocument);

    // Record view
    if (currentUser) {
      await supabase.from('document_views').insert({ document_id: doc.id, user_id: currentUser.id });
      await supabase.from('activity_logs').insert({ user_id: currentUser.id, action: 'view_document', document_id: doc.id });
    }

    // Fetch latest version
    const { data: versions } = await supabase
      .from('document_versions')
      .select('*, profiles(name)')
      .eq('document_id', doc.id)
      .order('version_number', { ascending: false })
      .limit(1);
    if (versions && versions.length > 0) setLatestVersion(versions[0] as DocumentVersion);

    setLoading(false);
  };

  if (loading) {
    return (
      <Layout title="Memuat dokumen...">
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
          <div className="kms-spinner" />
        </div>
      </Layout>
    );
  }

  if (notFound || !document) {
    return (
      <Layout title="Dokumen Tidak Ditemukan">
        <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
          <h2 style={{ color: '#374151' }}>Dokumen Tidak Ditemukan</h2>
          <p style={{ color: '#6b7280' }}>Slug "{slug}" tidak ditemukan di database.</p>
          <a href="/documents" className="kms-btn kms-btn--ghost" style={{ width: 'auto', padding: '10px 24px', marginTop: '1rem' }}>
            ← Kembali ke Daftar Dokumen
          </a>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={document.title} description={`${document.title} — STex KMS`}>
      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '2rem 2rem 4rem' }}>
        {/* Breadcrumb */}
        <nav style={{ fontSize: '0.82rem', color: '#9ca3af', marginBottom: '1.5rem' }}>
          <a href="/" style={{ color: '#9ca3af', textDecoration: 'none' }}>Beranda</a>
          {' / '}
          <a href="/documents" style={{ color: '#9ca3af', textDecoration: 'none' }}>Dokumen</a>
          {' / '}
          <span style={{ color: '#374151' }}>{document.title}</span>
        </nav>

        {/* Document header */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
            <span style={{
              display: 'inline-block', padding: '3px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600,
              background: document.status === 'published' ? '#d1fae5' : document.status === 'draft' ? '#fef3c7' : '#dbeafe',
              color: document.status === 'published' ? '#065f46' : document.status === 'draft' ? '#92400e' : '#1e40af',
            }}>
              {document.status === 'published' ? '✅ Terbit' : document.status === 'draft' ? '📝 Draft' : '🔍 Review'}
            </span>
            {latestVersion && (
              <span style={{ fontSize: '0.75rem', color: '#6b7280', background: '#f3f4f6', padding: '3px 10px', borderRadius: '20px' }}>
                v{latestVersion.version_number}
              </span>
            )}
            {document.department && document.department !== 'all' && (
              <span style={{ fontSize: '0.75rem', color: 'var(--kms-primary)', background: 'var(--kms-primary-light)', padding: '3px 10px', borderRadius: '20px', fontWeight: 600, textTransform: 'uppercase' }}>
                {document.department}
              </span>
            )}
          </div>

          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#111827', margin: '0 0 1rem', lineHeight: 1.3 }}>
            {document.title}
          </h1>

          <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.82rem', color: '#6b7280', flexWrap: 'wrap' }}>
            <span>✍️ {(document as any).profiles?.name || 'Unknown'}</span>
            <span>📅 Dibuat: {document.created_at ? new Date(document.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'}</span>
            <span>🔄 Diperbarui: {document.updated_at ? timeAgo(document.updated_at) : '—'}</span>
          </div>

          {isEditor && (
            <div style={{ marginTop: '0.75rem' }}>
              <a
                href={`/documents/edit?id=${document.id}`}
                style={{ fontSize: '0.82rem', color: 'var(--kms-accent)', textDecoration: 'none', fontWeight: 600 }}
              >
                ✏️ Edit Dokumen
              </a>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="kms-card kms-card--static" style={{ minHeight: '300px' }}>
          {latestVersion?.content ? (
            <RenderContent content={latestVersion.content} />
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📄</div>
              <p>Konten belum tersedia untuk dokumen ini.</p>
              {isEditor && (
                <a href={`/documents/edit?id=${document.id}`} className="kms-btn kms-btn--accent" style={{ width: 'auto', padding: '8px 20px', display: 'inline-block', textDecoration: 'none', marginTop: '0.5rem' }}>
                  ✏️ Tambah Konten
                </a>
              )}
            </div>
          )}

          <FeedbackSection documentId={document.id} />
        </div>

        {/* Version History — uses reusable component */}
        <VersionHistory documentId={document.id} currentVersionNumber={latestVersion?.version_number} />

        {/* Comments */}
        <CommentSection documentId={document.id} />
      </div>
    </Layout>
  );
}
