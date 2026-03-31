import React, { ReactNode, useEffect } from 'react';
import { AuthProvider, useAuth } from '../context/AuthContext';

// ── Navbar Auth Manager ────────────────────────────────────
// Sets HTML data attributes for CSS-based navbar visibility
// and injects a user menu into the navbar when logged in.
function NavbarAuthManager() {
  const { currentUser, isAdmin, loading, logout } = useAuth();

  useEffect(() => {
    if (loading) return;

    const html = document.documentElement;

    if (currentUser) {
      html.setAttribute('data-kms-auth', 'logged-in');
      html.setAttribute('data-kms-role', currentUser.role);
    } else {
      html.setAttribute('data-kms-auth', 'logged-out');
      html.removeAttribute('data-kms-role');
    }

    // Inject/update user menu in navbar
    updateNavbarUserMenu(currentUser, logout);

    return () => {
      // Cleanup on unmount
      const existing = document.getElementById('kms-navbar-user-menu');
      if (existing) existing.remove();
    };
  }, [currentUser, loading]);

  return null;
}

function updateNavbarUserMenu(
  currentUser: { name: string; role: string } | null,
  logout: () => Promise<void>,
) {
  // Remove existing menu
  const existing = document.getElementById('kms-navbar-user-menu');
  if (existing) existing.remove();

  if (!currentUser) return;

  // Find the navbar right side
  const navbarRight = document.querySelector('.navbar__items--right');
  if (!navbarRight) return;

  // Create user menu container
  const menu = document.createElement('div');
  menu.id = 'kms-navbar-user-menu';
  menu.className = 'kms-user-menu';

  // User badge
  const badge = document.createElement('span');
  badge.className = 'kms-user-badge';
  const avatar = document.createElement('span');
  avatar.className = 'kms-user-badge__avatar';
  avatar.textContent = (currentUser.name || 'U')[0].toUpperCase();
  badge.appendChild(avatar);
  const nameText = document.createTextNode(currentUser.name || 'User');
  badge.appendChild(nameText);
  menu.appendChild(badge);

  // Logout button
  const logoutBtn = document.createElement('button');
  logoutBtn.className = 'kms-logout-btn';
  logoutBtn.textContent = 'Keluar';
  logoutBtn.addEventListener('click', async () => {
    await logout();
    window.location.href = '/';
  });
  menu.appendChild(logoutBtn);

  navbarRight.appendChild(menu);
}

// ── Root Component ─────────────────────────────────────────
// Docusaurus Root wrapper — wraps entire app with AuthProvider
export default function Root({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <NavbarAuthManager />
      {children}
    </AuthProvider>
  );
}
