-- ============================================================
-- STex KMS — Supabase Full Schema Migration
-- Jalankan di Supabase SQL Editor (Settings → SQL Editor)
-- ============================================================

-- ── 1. Tabel Roles ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.roles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- ── 2. Tabel Permissions ──────────────────────────────────
CREATE TABLE IF NOT EXISTS public.permissions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- ── 3. Tabel Role-Permissions (junction) ──────────────────
CREATE TABLE IF NOT EXISTS public.role_permissions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  role_id uuid REFERENCES public.roles(id) ON DELETE CASCADE,
  permission_id uuid REFERENCES public.permissions(id) ON DELETE CASCADE,
  UNIQUE(role_id, permission_id)
);

-- ── 4. Tabel Profiles (extends auth.users) ────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name text,
  nomor_induk text UNIQUE,
  role_id uuid REFERENCES public.roles(id),
  department text DEFAULT 'all',
  created_at timestamptz DEFAULT now()
);

-- Constraint untuk department yang valid
DO $$ BEGIN
  ALTER TABLE public.profiles
    ADD CONSTRAINT profiles_department_check
    CHECK (department IN ('hrd', 'finance', 'operasional', 'it', 'legal', 'all'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ── 5. Tabel Documents ───────────────────────────────────
CREATE TABLE IF NOT EXISTS public.documents (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  department text DEFAULT 'all',
  created_by uuid REFERENCES auth.users(id),
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'published')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ── 6. Tabel Document Versions ────────────────────────────
CREATE TABLE IF NOT EXISTS public.document_versions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id uuid REFERENCES public.documents(id) ON DELETE CASCADE,
  content text,
  version_number integer NOT NULL DEFAULT 1,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

-- ── 7. Tabel Document Views ──────────────────────────────
CREATE TABLE IF NOT EXISTS public.document_views (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id uuid REFERENCES public.documents(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id),
  viewed_at timestamptz DEFAULT now()
);

-- ── 8. Tabel Document Approvals ──────────────────────────
CREATE TABLE IF NOT EXISTS public.document_approvals (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id uuid REFERENCES public.documents(id) ON DELETE CASCADE,
  reviewer_id uuid REFERENCES auth.users(id),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  comment text,
  created_at timestamptz DEFAULT now()
);

-- ── 9. Tabel Comments ────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.comments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id uuid REFERENCES public.documents(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id),
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- ── 10. Tabel Comment Replies ────────────────────────────
CREATE TABLE IF NOT EXISTS public.comment_replies (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  comment_id uuid REFERENCES public.comments(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id),
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- ── 11. Tabel Feedback ───────────────────────────────────
CREATE TABLE IF NOT EXISTS public.feedback (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id uuid REFERENCES public.documents(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id),
  type text NOT NULL CHECK (type IN ('helpful', 'not_helpful')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(document_id, user_id)
);

-- ── 12. Tabel Activity Logs ─────────────────────────────
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  action text,
  document_id uuid REFERENCES public.documents(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- ── 13. Auto-update updated_at pada documents ────────────
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_documents_updated_at ON public.documents;
CREATE TRIGGER set_documents_updated_at
  BEFORE UPDATE ON public.documents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================================
-- SEED DATA
-- ============================================================

-- Seed roles
INSERT INTO public.roles (name) VALUES ('admin')  ON CONFLICT (name) DO NOTHING;
INSERT INTO public.roles (name) VALUES ('editor') ON CONFLICT (name) DO NOTHING;
INSERT INTO public.roles (name) VALUES ('viewer') ON CONFLICT (name) DO NOTHING;

-- Seed permissions
INSERT INTO public.permissions (name) VALUES ('read_documents')    ON CONFLICT (name) DO NOTHING;
INSERT INTO public.permissions (name) VALUES ('create_documents')  ON CONFLICT (name) DO NOTHING;
INSERT INTO public.permissions (name) VALUES ('edit_documents')    ON CONFLICT (name) DO NOTHING;
INSERT INTO public.permissions (name) VALUES ('delete_documents')  ON CONFLICT (name) DO NOTHING;
INSERT INTO public.permissions (name) VALUES ('manage_users')      ON CONFLICT (name) DO NOTHING;
INSERT INTO public.permissions (name) VALUES ('approve_documents') ON CONFLICT (name) DO NOTHING;

-- Admin: all permissions
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM public.roles r, public.permissions p WHERE r.name = 'admin'
ON CONFLICT DO NOTHING;

-- Editor: read, create, edit, approve
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM public.roles r, public.permissions p
WHERE r.name = 'editor' AND p.name IN ('read_documents', 'create_documents', 'edit_documents', 'approve_documents')
ON CONFLICT DO NOTHING;

-- Viewer: read only
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM public.roles r, public.permissions p
WHERE r.name = 'viewer' AND p.name = 'read_documents'
ON CONFLICT DO NOTHING;

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE public.profiles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_views    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_replies   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs     ENABLE ROW LEVEL SECURITY;

-- ── Profiles ──────────────────────────────────────────────
DROP POLICY IF EXISTS "Profiles are viewable by authenticated users" ON public.profiles;
CREATE POLICY "Profiles are viewable by authenticated users"
  ON public.profiles FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id);

-- Admin can update any profile
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
CREATE POLICY "Admins can update any profile"
  ON public.profiles FOR UPDATE
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.roles r ON p.role_id = r.id
      WHERE p.id = auth.uid() AND r.name = 'admin'
    )
  );

-- ── Documents ─────────────────────────────────────────────
DROP POLICY IF EXISTS "Documents are viewable by authenticated users" ON public.documents;
CREATE POLICY "Documents are viewable by authenticated users"
  ON public.documents FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "Editors can insert documents" ON public.documents;
CREATE POLICY "Editors can insert documents"
  ON public.documents FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "Editors can update own documents" ON public.documents;
CREATE POLICY "Editors can update own documents"
  ON public.documents FOR UPDATE
  TO authenticated USING (auth.uid() = created_by);

-- Admin can update any document
DROP POLICY IF EXISTS "Admins can update any document" ON public.documents;
CREATE POLICY "Admins can update any document"
  ON public.documents FOR UPDATE
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.roles r ON p.role_id = r.id
      WHERE p.id = auth.uid() AND r.name = 'admin'
    )
  );

-- Admin can delete documents
DROP POLICY IF EXISTS "Admins can delete documents" ON public.documents;
CREATE POLICY "Admins can delete documents"
  ON public.documents FOR DELETE
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.roles r ON p.role_id = r.id
      WHERE p.id = auth.uid() AND r.name = 'admin'
    )
  );

-- ── Document Versions ─────────────────────────────────────
DROP POLICY IF EXISTS "Document versions are viewable by authenticated users" ON public.document_versions;
CREATE POLICY "Document versions are viewable by authenticated users"
  ON public.document_versions FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert document versions" ON public.document_versions;
CREATE POLICY "Authenticated users can insert document versions"
  ON public.document_versions FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = created_by);

-- ── Document Views ────────────────────────────────────────
DROP POLICY IF EXISTS "Document views are viewable by authenticated users" ON public.document_views;
CREATE POLICY "Document views are viewable by authenticated users"
  ON public.document_views FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert document views" ON public.document_views;
CREATE POLICY "Authenticated users can insert document views"
  ON public.document_views FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

-- ── Comments ──────────────────────────────────────────────
DROP POLICY IF EXISTS "Comments are viewable by authenticated users" ON public.comments;
CREATE POLICY "Comments are viewable by authenticated users"
  ON public.comments FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert comments" ON public.comments;
CREATE POLICY "Authenticated users can insert comments"
  ON public.comments FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

-- ── Comment Replies ───────────────────────────────────────
DROP POLICY IF EXISTS "Comment replies are viewable by authenticated users" ON public.comment_replies;
CREATE POLICY "Comment replies are viewable by authenticated users"
  ON public.comment_replies FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert comment replies" ON public.comment_replies;
CREATE POLICY "Authenticated users can insert comment replies"
  ON public.comment_replies FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

-- ── Feedback ──────────────────────────────────────────────
DROP POLICY IF EXISTS "Feedback is viewable by authenticated users" ON public.feedback;
CREATE POLICY "Feedback is viewable by authenticated users"
  ON public.feedback FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert feedback" ON public.feedback;
CREATE POLICY "Authenticated users can insert feedback"
  ON public.feedback FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own feedback" ON public.feedback;
CREATE POLICY "Users can delete own feedback"
  ON public.feedback FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ── Activity Logs ─────────────────────────────────────────
DROP POLICY IF EXISTS "Activity logs are viewable by authenticated users" ON public.activity_logs;
CREATE POLICY "Activity logs are viewable by authenticated users"
  ON public.activity_logs FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "System can insert activity logs" ON public.activity_logs;
CREATE POLICY "System can insert activity logs"
  ON public.activity_logs FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  viewer_role_id uuid;
BEGIN
  SELECT id INTO viewer_role_id FROM public.roles WHERE name = 'viewer';
  INSERT INTO public.profiles (id, name, role_id, department)
  VALUES (new.id, new.raw_user_meta_data->>'name', viewer_role_id, 'all');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ============================================================
-- DONE! Jalankan SQL ini di Supabase SQL Editor.
-- ============================================================
