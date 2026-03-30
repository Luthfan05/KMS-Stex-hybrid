import React, { ReactNode } from 'react';
import { useAuth } from '../../context/AuthContext';
import type { Department } from '../../context/AuthContext';

interface AuthGuardProps {
  children: ReactNode;
  requiredRole?: 'admin' | 'editor' | 'viewer';
  requiredDepartment?: Department;
}

/**
 * AuthGuard — wraps any content and shows access denied if:
 * 1. User is not logged in
 * 2. User's role is insufficient
 * 3. User's department doesn't match (for viewers)
 */
export default function AuthGuard({
  children,
  requiredRole = 'viewer',
  requiredDepartment,
}: AuthGuardProps) {
  const { currentUser, loading, isAdmin, isEditor, canAccessDepartment } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 1rem' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="kms-spinner" aria-label="Memuat..." />
          <p style={{ color: '#6b7280', marginTop: '1rem', fontSize: '0.9rem' }}>
            Memeriksa akses...
          </p>
        </div>
      </div>
    );
  }

  // Not logged in
  if (!currentUser) {
    return (
      <div className="kms-auth-container">
        <div className="kms-auth-card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔒</div>
          <h2 style={{ color: 'var(--kms-primary)', marginBottom: '0.5rem' }}>
            Akses Terbatas
          </h2>
          <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            Anda harus masuk untuk melihat halaman ini.
          </p>
          <a href="/login" className="kms-btn kms-btn--primary">
            Masuk Sekarang
          </a>
        </div>
      </div>
    );
  }

  // Role check
  if (requiredRole === 'admin' && !isAdmin) {
    return <AccessDenied message="Halaman ini hanya untuk Administrator." />;
  }
  if (requiredRole === 'editor' && !isEditor) {
    return <AccessDenied message="Halaman ini memerlukan hak Editor." />;
  }

  // Department check (for viewers)
  if (requiredDepartment && !canAccessDepartment(requiredDepartment)) {
    return (
      <AccessDenied
        message={`Anda tidak memiliki akses ke departemen ${requiredDepartment.toUpperCase()}.`}
        showDeptInfo
        userDept={currentUser.department}
      />
    );
  }

  return <>{children}</>;
}

function AccessDenied({
  message,
  showDeptInfo = false,
  userDept,
}: {
  message: string;
  showDeptInfo?: boolean;
  userDept?: string;
}) {
  return (
    <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚫</div>
      <h2 style={{ color: 'var(--kms-danger, #dc2626)' }}>Akses Ditolak</h2>
      <p style={{ color: '#6b7280', maxWidth: '400px', margin: '0 auto 1rem' }}>{message}</p>
      {showDeptInfo && userDept && (
        <div className="kms-notice kms-notice--lock" style={{ maxWidth: '400px', margin: '0 auto 1.5rem' }}>
          Departemen Anda:{' '}
          <strong style={{ textTransform: 'uppercase' }}>{userDept}</strong>
        </div>
      )}
      <a href="/" className="kms-btn kms-btn--ghost" style={{ width: 'auto', padding: '8px 20px' }}>
        ← Kembali ke Beranda
      </a>
    </div>
  );
}
