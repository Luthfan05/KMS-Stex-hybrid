import React from 'react';
import type { UserRole, Department } from '../../context/AuthContext';

interface RoleBadgeProps {
  role: UserRole;
  department?: Department;
  showDept?: boolean;
}

const roleConfig: Record<UserRole, { label: string; icon: string; className: string }> = {
  admin: { label: 'Admin', icon: '👑', className: 'kms-badge--admin' },
  editor: { label: 'Editor', icon: '✏️', className: 'kms-badge--editor' },
  viewer: { label: 'Viewer', icon: '👁️', className: 'kms-badge--viewer' },
};

const deptLabels: Record<Department, string> = {
  hrd: 'HRD',
  finance: 'Finance',
  operasional: 'Operasional',
  it: 'IT',
  legal: 'Legal',
  all: 'Semua Dept',
};

export default function RoleBadge({ role, department, showDept = false }: RoleBadgeProps) {
  const config = roleConfig[role];
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
      <span className={`kms-badge ${config.className}`}>
        <span>{config.icon}</span>
        <span>{config.label}</span>
      </span>
      {showDept && department && (
        <span className="kms-badge" style={{ background: 'var(--kms-primary-light)', color: 'var(--kms-primary)', border: '1px solid rgba(45,49,146,0.2)' }}>
          {deptLabels[department]}
        </span>
      )}
    </span>
  );
}
