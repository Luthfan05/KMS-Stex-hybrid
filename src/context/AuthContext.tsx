import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  User,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

// ── Types ──────────────────────────────────────────────────
export type UserRole = 'admin' | 'editor' | 'viewer';
export type Department = 'hrd' | 'finance' | 'operasional' | 'it' | 'legal' | 'all';

export interface KMSUser {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  department: Department;
}

interface AuthContextType {
  currentUser: KMSUser | null;
  firebaseUser: User | null;
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
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [currentUser, setCurrentUser] = useState<KMSUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        setFirebaseUser(fbUser);
        // Fetch role & department from Firestore
        try {
          const userDoc = await getDoc(doc(db, 'users', fbUser.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setCurrentUser({
              uid: fbUser.uid,
              email: fbUser.email ?? '',
              displayName: data.displayName || fbUser.displayName || 'User',
              role: data.role as UserRole,
              department: data.department as Department,
            });
            // Update last login
            await setDoc(
              doc(db, 'users', fbUser.uid),
              { lastLogin: serverTimestamp() },
              { merge: true }
            );
          } else {
            // New user — assign default viewer role
            const newUser: KMSUser = {
              uid: fbUser.uid,
              email: fbUser.email ?? '',
              displayName: fbUser.displayName ?? 'User',
              role: 'viewer',
              department: 'all',
            };
            await setDoc(doc(db, 'users', fbUser.uid), {
              ...newUser,
              createdAt: serverTimestamp(),
              lastLogin: serverTimestamp(),
            });
            setCurrentUser(newUser);
          }
        } catch (err) {
          console.error('Error fetching user data:', err);
          setCurrentUser(null);
        }
      } else {
        setFirebaseUser(null);
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    await signOut(auth);
  };

  const isAdmin = currentUser?.role === 'admin';
  const isEditor = currentUser?.role === 'editor' || isAdmin;
  const isViewer = !!currentUser;
  const canEdit = isEditor;

  /**
   * Check if current user can access a specific department.
   * - Admin: all departments
   * - Editor: all departments (read), their own department (write)
   * - Viewer: only their assigned department (or 'all')
   */
  const canAccessDepartment = (dept: Department): boolean => {
    if (!currentUser) return false;
    if (isAdmin) return true;
    if (currentUser.department === 'all') return true;
    return currentUser.department === dept;
  };

  const value: AuthContextType = {
    currentUser,
    firebaseUser,
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
