import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import type { Session } from '@supabase/supabase-js';

// ── Types ──────────────────────────────────────────────────
export type UserRole = 'admin' | 'editor' | 'viewer';
export type Department = 'hrd' | 'finance' | 'produksi' | 'pertenunan' | 'persiapan' | 'pergudangan' | 'marketing' | 'all';

export interface KMSUser {
  id: string;
  email: string;
  name: string;
  nomor_induk: string;
  role: UserRole;
  role_id: string;
  department: Department;
}

interface AuthContextType {
  currentUser: KMSUser | null;
  session: Session | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAdmin: boolean;
  isEditor: boolean;
  isViewer: boolean;
  canAccessDepartment: (dept: Department) => boolean;
  canEdit: boolean;
}

// ── Context ────────────────────────────────────────────────
const AuthContext = createContext<AuthContextType | null>(null);

// ── Provider ───────────────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [currentUser, setCurrentUser] = useState<KMSUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string, email: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*, roles(name)')
        .eq('id', userId)
        .single();

      if (error || !data) {
        console.error('Error fetching profile:', error);
        setCurrentUser(null);
        return;
      }

      setCurrentUser({
        id: userId,
        email,
        name: data.name || 'User',
        nomor_induk: data.nomor_induk || '',
        role: ((data as any).roles?.name as UserRole) || 'viewer',
        role_id: data.role_id || '',
        department: (data.department as Department) || 'all',
      });
    } catch (err) {
      console.error('Profile fetch error:', err);
      setCurrentUser(null);
    }
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchProfile(session.user.id, session.user.email || '').finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      if (session?.user) {
        await fetchProfile(session.user.id, session.user.email || '');
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  const isAdmin = currentUser?.role === 'admin';
  const isEditor = currentUser?.role === 'editor' || isAdmin;
  const isViewer = !!currentUser;
  const canEdit = isEditor;

  const canAccessDepartment = (dept: Department): boolean => {
    if (!currentUser) return false;
    if (isAdmin) return true;
    if (currentUser.department === 'all') return true;
    return currentUser.department === dept;
  };

  const value: AuthContextType = {
    currentUser,
    session,
    loading,
    login,
    logout,
    isAdmin,
    isEditor,
    isViewer,
    canAccessDepartment,
    canEdit,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ── Hook ───────────────────────────────────────────────────
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
