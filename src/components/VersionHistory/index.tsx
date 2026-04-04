import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { supabase, timeAgo } from '../../lib/supabase';
import type { DocumentVersion } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import MarkdownRenderer from '../MarkdownRenderer';

interface VersionHistoryProps {
  documentId: string;
  currentVersionNumber?: number;
}

export default function VersionHistory({ documentId, currentVersionNumber }: VersionHistoryProps) {
  const [versions, setVersions] = useState<DocumentVersion[]>([]);
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(true);
  const { currentUser, isAdmin, isEditor } = useAuth();
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [comparingVersion, setComparingVersion] = useState<DocumentVersion | null>(null);

  useEffect(() => {
    supabase
      .from('document_versions')
      .select('*, profiles(name)')
      .eq('document_id', documentId)
      .order('version_number', { ascending: false })
      .then(({ data }) => {
        if (data) setVersions(data as DocumentVersion[]);
        setLoading(false);
      });
  }, [documentId]);

  if (loading) {
    return (
      <div className="kms-card" style={{ marginTop: '2rem', textAlign: 'center', padding: '1.5rem', color: '#9ca3af', fontSize: '0.85rem' }}>
        Memuat riwayat versi...
      </div>
    );
  }

  if (!versions.length) return null;

  const displayed = expanded ? versions : versions.slice(0, 3);
  const latestVer = currentVersionNumber ?? versions[0]?.version_number;

  const typeConfig = (versionNumber: number) => {
    if (versionNumber === 1) return { icon: '🟢', label: 'Dibuat', color: 'var(--kms-success, #059669)' };
    if (versionNumber === latestVer) return { icon: '🔵', label: 'Terkini', color: 'var(--kms-accent)' };
    return { icon: '⚪', label: 'Diperbarui', color: '#6b7280' };
  };

  const handleCompare = (version: DocumentVersion) => {
    setComparingVersion(version);
  };

  const confirmRestore = async () => {
    if (!comparingVersion) return;
    setRestoringId(comparingVersion.id);

    const newVerNum = Math.max(...versions.map(v => v.version_number)) + 1;
    
    // Insert new version with old content
    const { error } = await supabase.from('document_versions').insert({
      document_id: documentId,
      version_number: newVerNum,
      content: comparingVersion.content,
      user_id: currentUser?.id
    });

    if (!error) {
      await supabase.from('documents').update({ updated_at: new Date().toISOString() }).eq('id', documentId);
      window.location.reload();
    } else {
      alert('Gagal mengembalikan versi: ' + error.message);
      setRestoringId(null);
    }
  };

  return (
    <div className="kms-card" style={{ marginTop: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <h4 style={{ margin: 0, color: 'var(--kms-primary)', fontSize: '0.95rem', fontWeight: 700 }}>
          📋 Riwayat Perubahan
        </h4>
        <span style={{ fontSize: '0.75rem', color: '#6b7280', background: '#f3f4f6', padding: '2px 8px', borderRadius: '20px' }}>
          Versi saat ini: v{latestVer}
        </span>
      </div>

      <div className="kms-version-timeline">
        {displayed.map((v, idx) => {
          const tc = typeConfig(v.version_number);
          return (
            <div key={v.id} className="kms-version-item">
              <div className="kms-version-meta">
                <span style={{ marginRight: '6px' }}>{tc.icon}</span>
                <span style={{ fontWeight: 600, color: tc.color, marginRight: '8px' }}>{tc.label}</span>
                <span>{v.created_at ? timeAgo(v.created_at) : '—'}</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '2px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  oleh <span className="kms-version-author">{(v as any).profiles?.name || 'Unknown'}</span>
                  {' · '}Versi {v.version_number}
                </div>
                {(isAdmin || isEditor) && v.version_number !== latestVer && (
                  <button
                    onClick={() => handleCompare(v)}
                    disabled={restoringId === v.id}
                    style={{
                      background: 'var(--ifm-background-surface-color)', border: '1px solid #e5e7eb', borderRadius: '4px', color: 'var(--kms-primary)',
                      fontSize: '0.7rem', padding: '3px 8px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600
                    }}
                  >
                    {restoringId === v.id ? 'Memulihkan...' : '↩ Restore Versi Ini'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {versions.length > 3 && (
        <button
          onClick={() => setExpanded(!expanded)}
          style={{
            background: 'none', border: 'none', color: 'var(--kms-accent)',
            fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
            padding: '0.5rem 0 0', display: 'block', fontFamily: 'inherit',
          }}
        >
          {expanded ? '▲ Tampilkan lebih sedikit' : `▼ Tampilkan semua (${versions.length} entri)`}
        </button>
      )}

      {/* Comparison View */}
      {comparingVersion && typeof document !== 'undefined' && createPortal(
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          background: 'rgba(0,0,0,0.6)', zIndex: 999999,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
        }}>
          <div style={{
            background: '#fff', borderRadius: '12px', width: '98vw', maxWidth: 'none', 
            height: '96vh', display: 'flex', flexDirection: 'column', overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--kms-primary)' }}>Perbandingan Versi Dokumen</h3>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: '#6b7280' }}>Bandingkan isi dokumen terbaru dengan versi yang akan dipulihkan.</p>
              </div>
              <button onClick={() => setComparingVersion(null)} style={{ background: 'none', border: 'none', fontSize: '1.8rem', cursor: 'pointer', lineHeight: 1, padding: '0 8px', color: '#9ca3af' }}>&times;</button>
            </div>
            
            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
              <div style={{ flex: 1, padding: '1.5rem', overflowY: 'auto', borderRight: '1px solid #e5e7eb', backgroundColor: '#f9fafb' }}>
                <div style={{ marginBottom: '1.25rem', padding: '6px 12px', background: '#e5e7eb', borderRadius: '4px', display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: 600, color: '#374151' }}>
                  <span style={{ fontSize: '1.1rem' }}>🔵</span> Teks Saat Ini (v{latestVer})
                </div>
                <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e5e7eb', minHeight: '100%' }}>
                  <MarkdownRenderer content={versions.find(v => v.version_number === latestVer)?.content || ''} />
                </div>
              </div>
              <div style={{ flex: 1, padding: '1.5rem', overflowY: 'auto', backgroundColor: '#f0fdf4' }}>
                <div style={{ marginBottom: '1.25rem', padding: '6px 12px', background: '#d1fae5', color: '#065f46', borderRadius: '4px', display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: 600 }}>
                  <span style={{ fontSize: '1.1rem' }}>↩</span> Akan di-Restore (v{comparingVersion.version_number})
                </div>
                <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '8px', border: '1px solid #bbf7d0', minHeight: '100%' }}>
                  <MarkdownRenderer content={comparingVersion.content || ''} />
                </div>
              </div>
            </div>

            <div style={{ padding: '1.5rem', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'flex-end', gap: '1rem', background: '#f9fafb' }}>
              <button 
                onClick={() => setComparingVersion(null)}
                style={{ padding: '10px 20px', background: '#fff', color: '#374151', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontFamily: 'inherit', fontSize: '0.9rem' }}
              >
                Batal
              </button>
              <button 
                onClick={confirmRestore}
                disabled={restoringId === comparingVersion.id}
                style={{ padding: '10px 20px', background: 'var(--kms-accent)', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontFamily: 'inherit', fontSize: '0.9rem' }}
              >
                {restoringId === comparingVersion.id ? 'Memulihkan...' : 'Konfirmasi Restore'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>

  );
}
