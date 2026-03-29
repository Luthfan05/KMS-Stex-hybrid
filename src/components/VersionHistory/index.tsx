import React, { useState } from 'react';

interface VersionEntry {
  version: string;
  date: string;
  author: string;
  summary: string;
  type: 'create' | 'edit' | 'major';
}

interface VersionHistoryProps {
  history: VersionEntry[];
  currentVersion?: string;
}

const typeConfig = {
  create: { icon: '🟢', label: 'Dibuat', color: 'var(--kms-success)' },
  edit: { icon: '🔵', label: 'Diperbarui', color: 'var(--kms-accent)' },
  major: { icon: '🟠', label: 'Revisi Mayor', color: 'var(--kms-warning)' },
};

export default function VersionHistory({ history, currentVersion }: VersionHistoryProps) {
  const [expanded, setExpanded] = useState(false);
  const displayedHistory = expanded ? history : history.slice(0, 3);

  if (!history || history.length === 0) return null;

  return (
    <div className="kms-card" style={{ marginTop: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <h4 style={{ margin: 0, color: 'var(--kms-primary)', fontSize: '0.95rem', fontWeight: 700 }}>
          📋 Riwayat Perubahan
        </h4>
        {currentVersion && (
          <span style={{ fontSize: '0.75rem', color: '#6b7280', background: '#f3f4f6', padding: '2px 8px', borderRadius: '20px' }}>
            Versi saat ini: {currentVersion}
          </span>
        )}
      </div>

      <div className="kms-version-timeline">
        {displayedHistory.map((entry, idx) => {
          const tc = typeConfig[entry.type];
          return (
            <div key={idx} className="kms-version-item">
              <div className="kms-version-meta">
                <span style={{ marginRight: '6px' }}>{tc.icon}</span>
                <span style={{ fontWeight: 600, color: tc.color, marginRight: '8px' }}>{tc.label}</span>
                <span>{entry.date}</span>
              </div>
              <div style={{ fontSize: '0.88rem', color: '#374151', marginBottom: '0.2rem' }}>
                {entry.summary}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#9ca3af' }}>
                oleh <span className="kms-version-author">{entry.author}</span>
                {' · '}Versi {entry.version}
              </div>
            </div>
          );
        })}
      </div>

      {history.length > 3 && (
        <button
          onClick={() => setExpanded(!expanded)}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--kms-accent)',
            fontSize: '0.82rem',
            fontWeight: 600,
            cursor: 'pointer',
            padding: '0.5rem 0 0',
            display: 'block',
          }}
        >
          {expanded ? '▲ Tampilkan lebih sedikit' : `▼ Tampilkan semua (${history.length} entri)`}
        </button>
      )}
    </div>
  );
}
