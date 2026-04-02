import React, { ReactNode, useEffect, useRef } from 'react';
import { useLocation, useHistory } from '@docusaurus/router';
import { AuthProvider, useAuth } from '../context/AuthContext';

// ── Navbar Auth Manager ────────────────────────────────────
// Sets HTML data attributes for CSS-based navbar visibility
// and injects a user menu into the navbar when logged in.
function NavbarAuthManager() {
  const { currentUser, isAdmin, loading, logout } = useAuth();
  const observerRef = useRef<MutationObserver | null>(null);

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

    // Inject user menu into navbar — and keep re-injecting
    // when Docusaurus re-renders the navbar (client-side nav).
    const inject = () => {
      updateNavbarUserMenu(currentUser, logout);
    };

    // Initial inject
    inject();

    // Re-inject after a short delay (Docusaurus hydration)
    const timer = setTimeout(inject, 500);

    // Observe the body for DOM changes so we can re-inject
    // because the navbar might not exist yet when this effect runs.
    observerRef.current = new MutationObserver(() => {
      const navbarRight = document.querySelector('.navbar__items--right');
      const existingMenu = document.getElementById('kms-navbar-user-menu');
      
      // If navbar exists but our menu doesn't, inject it
      if (navbarRight && !existingMenu) {
        inject();
      }
    });
    
    observerRef.current.observe(document.body, { childList: true, subtree: true });

    return () => {
      clearTimeout(timer);
      observerRef.current?.disconnect();
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

// ── Global Auth Redirect ───────────────────────────────────
// Forces redirect to login page for all other pages if user is not logged in
function GlobalAuthRedirect() {
  const { currentUser, loading } = useAuth();
  const location = useLocation();
  const history = useHistory();

  useEffect(() => {
    if (loading) return;
    
    if (location.pathname === '/login' || location.pathname === '/login/') {
      return;
    }

    if (!currentUser) {
      history.replace('/login');
    }
  }, [currentUser, loading, location.pathname, history]);

  return null;
}

// ── Root Component ─────────────────────────────────────────
// Docusaurus Root wrapper — wraps entire app with AuthProvider
export default function Root({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <NavbarAuthManager />
      <GlobalAuthRedirect />
      {children}
    </AuthProvider>
  );
}
