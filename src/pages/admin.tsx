import React, { useState, useEffect } from 'react';
import Layout from '@theme/Layout';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Link from '@docusaurus/Link';

interface AdminUser {
  uid: string;
  displayName: string;
  email: string;
  role: string;
  department: string;
  lastLogin?: string;
}

const MOCK_USERS: AdminUser[] = [
  { uid: '1', displayName: 'Ahmad Supriadi', email: 'ahmad@stex.co.id', role: 'admin', department: 'all', lastLogin: '29 Mar 2026' },
  { uid: '2', displayName: 'Siti Rahayu', email: 'siti@stex.co.id', role: 'editor', department: 'hrd', lastLogin: '28 Mar 2026' },
  { uid: '3', displayName: 'Budi Santoso', email: 'budi@stex.co.id', role: 'viewer', department: 'operasional', lastLogin: '29 Mar 2026' },
  { uid: '4', displayName: 'Dewi Lestari', email: 'dewi@stex.co.id', role: 'editor', department: 'finance', lastLogin: '27 Mar 2026' },
  { uid: '5', displayName: 'Riko Pratama', email: 'riko@stex.co.id', role: 'viewer', department: 'it', lastLogin: '29 Mar 2026' },
];

const roleColors: Record<string, string> = {
  admin: 'kms-badge--admin',
  editor: 'kms-badge--editor',
  viewer: 'kms-badge--viewer',
};
const roleIcons: Record<string, string> = { admin: '👑', editor: '✏️', viewer: '👁️' };

export default function AdminPage() {
  const { i18n } = useDocusaurusContext();
  const isEn = i18n.currentLocale === 'en';
  const [users, setUsers] = useState<AdminUser[]>(MOCK_USERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('all');

  const filtered = users.filter((u) => {
    const matchSearch = u.displayName.toLowerCase().includes(searchQuery.toLowerCase())
      || u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchRole = filterRole === 'all' || u.role === filterRole;
    return matchSearch && matchRole;
  });

  const stats = {
    total: users.length,
    admin: users.filter((u) => u.role === 'admin').length,
    editor: users.filter((u) => u.role === 'editor').length,
    viewer: users.filter((u) => u.role === 'viewer').length,
  };

  return (
    <Layout title={isEn ? 'Admin Dashboard' : 'Dashboard Admin'}>
      <div className="kms-dashboard">
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.6rem', marginBottom: '0.25rem' }}>
            {isEn ? '⚙️ Admin Dashboard' : '⚙️ Dashboard Admin'}
          </h1>
          <p style={{ color: '#6b7280', margin: 0, fontSize: '0.9rem' }}>
            {isEn ? 'Manage users, roles, and content access.' : 'Kelola pengguna, peran, dan akses konten.'}
          </p>
        </div>

        {/* Stats */}
        <div className="kms-stats-grid">
          {[
            { icon: '👥', label: isEn ? 'Total Users' : 'Total Pengguna', value: stats.total, color: 'var(--kms-primary)' },
            { icon: '👑', label: 'Admin', value: stats.admin, color: '#92400e' },
            { icon: '✏️', label: 'Editor', value: stats.editor, color: '#1e40af' },
            { icon: '👁️', label: 'Viewer', value: stats.viewer, color: '#166534' },
          ].map((s) => (
            <div key={s.label} className="kms-stat-card">
              <div className="kms-stat-card__icon">{s.icon}</div>
              <div className="kms-stat-card__label">{s.label}</div>
              <div className="kms-stat-card__value" style={{ color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* User Management */}
        <div className="kms-card">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.25rem', alignItems: 'center' }}>
            <h3 style={{ margin: 0, flex: 1 }}>{isEn ? 'User Management' : 'Manajemen Pengguna'}</h3>
            <button className="kms-btn kms-btn--accent" style={{ width: 'auto', padding: '8px 16px', fontSize: '0.83rem' }}>
              + {isEn ? 'Add User' : 'Tambah Pengguna'}
            </button>
          </div>

          {/* Filters */}
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder={isEn ? 'Search user...' : 'Cari pengguna...'}
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
              <option value="admin">Admin</option>
              <option value="editor">Editor</option>
              <option value="viewer">Viewer</option>
            </select>
          </div>

          {/* Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--ifm-toc-border-color)' }}>
                  {[isEn ? 'Name' : 'Nama', 'Email', isEn ? 'Role' : 'Peran', 'Department', isEn ? 'Last Login' : 'Login Terakhir', ''].map((h) => (
                    <th key={h} style={{ textAlign: 'left', padding: '0.6rem 0.75rem', color: '#6b7280', fontWeight: 600, fontSize: '0.78rem', textTransform: 'uppercase' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((user) => (
                  <tr key={user.uid} style={{ borderBottom: '1px solid var(--ifm-toc-border-color)' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--ifm-background-surface-color)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={{ padding: '0.75rem' }}>
                      <div style={{ fontWeight: 600, color: '#111827' }}>{user.displayName}</div>
                    </td>
                    <td style={{ padding: '0.75rem', color: '#6b7280' }}>{user.email}</td>
                    <td style={{ padding: '0.75rem' }}>
                      <span className={`kms-badge ${roleColors[user.role]}`}>
                        {roleIcons[user.role]} {user.role}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <span className="kms-tag kms-tag--dept" style={{ cursor: 'default', fontSize: '0.75rem' }}>
                        {user.department === 'all' ? (isEn ? 'All' : 'Semua') : user.department.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem', color: '#9ca3af', fontSize: '0.8rem' }}>{user.lastLogin ?? '-'}</td>
                    <td style={{ padding: '0.75rem' }}>
                      <button style={{ background: 'none', border: '1px solid #e5e7eb', borderRadius: '6px', padding: '4px 10px', fontSize: '0.78rem', cursor: 'pointer', color: 'var(--kms-primary)', fontFamily: 'inherit' }}>
                        {isEn ? 'Edit' : 'Ubah'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <p style={{ textAlign: 'center', color: '#9ca3af', padding: '2rem', margin: 0 }}>
                {isEn ? 'No users found.' : 'Tidak ada pengguna ditemukan.'}
              </p>
            )}
          </div>
        </div>

        {/* Audit Log Notice */}
        <div className="kms-notice kms-notice--info" style={{ marginTop: '1.5rem' }}>
          📋 {isEn
            ? 'Full audit logs are stored in Firestore. All admin actions are recorded for security compliance.'
            : 'Log audit lengkap tersimpan di Firestore. Semua tindakan admin direkam untuk kepatuhan keamanan.'}
        </div>
      </div>
    </Layout>
  );
}
