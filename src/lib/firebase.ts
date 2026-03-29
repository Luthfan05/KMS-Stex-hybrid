// ============================================================
// STex KMS — Firebase Configuration
// Ganti nilai di bawah dengan konfigurasi Firebase project Anda
// ============================================================

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || 'YOUR_API_KEY',
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || 'YOUR_AUTH_DOMAIN',
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || 'YOUR_PROJECT_ID',
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || 'YOUR_STORAGE_BUCKET',
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || 'YOUR_MESSAGING_SENDER_ID',
  appId: process.env.REACT_APP_FIREBASE_APP_ID || 'YOUR_APP_ID',
};

// Prevent duplicate app initialization (Next.js / hot reload)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;

// ──────────────────────────────────────────────
// Firestore Schema Reference (Dokumentasi):
//
// Collection: users
//   Document: {uid}
//     - email: string
//     - displayName: string
//     - role: 'admin' | 'editor' | 'viewer'
//     - department: 'hrd' | 'finance' | 'operasional' | 'it' | 'legal' | 'all'
//     - createdAt: Timestamp
//     - lastLogin: Timestamp
//
// Collection: audit_logs
//   Document: {auto-id}
//     - userId: string
//     - action: string  (e.g., 'edit_doc', 'login', 'create_user')
//     - target: string  (e.g., doc path)
//     - timestamp: Timestamp
//     - metadata: object
// ──────────────────────────────────────────────
