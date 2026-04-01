// ============================================================
// STex KMS — Supabase Configuration
// Isi SUPABASE_URL dan SUPABASE_ANON_KEY dengan nilai dari
// project Supabase Anda: Settings → API
// ============================================================

import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL = 'https://kecfkgpyywupjpjsostw.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtlY2ZrZ3B5eXd1cGpwanNvc3R3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4MjEyODYsImV4cCI6MjA5MDM5NzI4Nn0.MTmTw1YI6cGW1poI8Q-zM6LTwKQ85hZtmBr8yBtguv4';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ── Database Types ─────────────────────────────────────────

export interface Profile {
  id: string;
  name: string | null;
  nomor_induk: string | null;
  role_id: string | null;
  department: string | null;
  created_at: string;
  roles?: { name: string };
}

export interface Role {
  id: string;
  name: string;
}

export interface Permission {
  id: string;
  name: string;
}

export interface KMSDocument {
  id: string;
  title: string;
  slug: string;
  department: string;
  created_by: string;
  status: string;
  created_at: string;
  updated_at: string;
  profiles?: { name: string | null };
}

export interface DocumentVersion {
  id: string;
  document_id: string;
  content: string | null;
  version_number: number;
  created_by: string;
  created_at: string;
  profiles?: { name: string | null };
}

export interface DocumentApproval {
  id: string;
  document_id: string;
  reviewer_id: string;
  status: string;
  comment: string | null;
  created_at: string;
  profiles?: { name: string | null };
}

export interface DocumentView {
  id: string;
  document_id: string | null;
  user_id: string | null;
  viewed_at: string;
}

export interface Comment {
  id: string;
  document_id: string;
  user_id: string;
  content: string;
  created_at: string;
  profiles?: { name: string | null };
  comment_replies?: CommentReply[];
}

export interface CommentReply {
  id: string;
  comment_id: string;
  user_id: string;
  content: string;
  created_at: string;
  profiles?: { name: string | null };
}

export interface Feedback {
  id: string;
  document_id: string;
  user_id: string;
  type: string;
  created_at: string;
}

export interface ActivityLog {
  id: string;
  user_id: string | null;
  action: string | null;
  document_id: string | null;
  created_at: string;
  profiles?: { name: string | null };
  documents?: { title: string; slug: string } | null;
}

// ── Helper: format relative time ──────────────────────────

export function timeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'baru saja';
  if (diffMins < 60) return `${diffMins} menit lalu`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} jam lalu`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) return `${diffDays} hari lalu`;
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}
