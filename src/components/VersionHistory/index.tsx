import React, { useState, useEffect } from 'react';
import { supabase, timeAgo } from '../../lib/supabase';
import type { DocumentVersion } from '../../lib/supabase';

interface VersionHistoryProps {
  documentId: string;
  currentVersionNumber?: number;
}

export default function VersionHistory({ documentId, currentVersionNumber }: VersionHistoryProps) {
  const [versions, setVersions] = useState<DocumentVersion[]>([]);
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(true);

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
              <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '2px' }}>
                oleh <span className="kms-version-author">{(v as any).profiles?.name || 'Unknown'}</span>
                {' · '}Versi {v.version_number}
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
    </div>
  );
}
