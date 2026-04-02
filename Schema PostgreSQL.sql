-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.activity_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  action text,
  document_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT activity_logs_pkey PRIMARY KEY (id),
  CONSTRAINT activity_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT activity_logs_document_id_fkey FOREIGN KEY (document_id) REFERENCES public.documents(id),
  CONSTRAINT activity_logs_user_id_profiles_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.comment_replies (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  comment_id uuid,
  user_id uuid,
  content text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT comment_replies_pkey PRIMARY KEY (id),
  CONSTRAINT comment_replies_comment_id_fkey FOREIGN KEY (comment_id) REFERENCES public.comments(id),
  CONSTRAINT comment_replies_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT comment_replies_user_id_profiles_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.comments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  document_id uuid,
  user_id uuid,
  content text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT comments_pkey PRIMARY KEY (id),
  CONSTRAINT comments_document_id_fkey FOREIGN KEY (document_id) REFERENCES public.documents(id),
  CONSTRAINT comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT comments_user_id_profiles_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.departments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT departments_pkey PRIMARY KEY (id)
);
CREATE TABLE public.dictionary (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  term text NOT NULL,
  full_form text NOT NULL DEFAULT ''::text,
  description text NOT NULL DEFAULT ''::text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT dictionary_pkey PRIMARY KEY (id)
);
CREATE TABLE public.document_approvals (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  document_id uuid,
  reviewer_id uuid,
  status text DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text])),
  comment text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT document_approvals_pkey PRIMARY KEY (id),
  CONSTRAINT document_approvals_document_id_fkey FOREIGN KEY (document_id) REFERENCES public.documents(id),
  CONSTRAINT document_approvals_reviewer_id_fkey FOREIGN KEY (reviewer_id) REFERENCES auth.users(id),
  CONSTRAINT document_approvals_reviewer_id_profiles_fkey FOREIGN KEY (reviewer_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.document_versions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  document_id uuid,
  content text,
  version_number integer NOT NULL DEFAULT 1,
  created_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT document_versions_pkey PRIMARY KEY (id),
  CONSTRAINT document_versions_document_id_fkey FOREIGN KEY (document_id) REFERENCES public.documents(id),
  CONSTRAINT document_versions_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id),
  CONSTRAINT document_versions_created_by_profiles_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id)
);
CREATE TABLE public.document_views (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  document_id uuid,
  user_id uuid,
  viewed_at timestamp with time zone DEFAULT now(),
  CONSTRAINT document_views_pkey PRIMARY KEY (id),
  CONSTRAINT document_views_document_id_fkey FOREIGN KEY (document_id) REFERENCES public.documents(id),
  CONSTRAINT document_views_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT document_views_user_id_profiles_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.documents (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  department text DEFAULT 'all'::text,
  created_by uuid,
  status text DEFAULT 'draft'::text CHECK (status = ANY (ARRAY['draft'::text, 'review'::text, 'published'::text])),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT documents_pkey PRIMARY KEY (id),
  CONSTRAINT documents_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id),
  CONSTRAINT documents_created_by_profiles_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id),
  CONSTRAINT documents_department_fkey FOREIGN KEY (department) REFERENCES public.departments(code)
);
CREATE TABLE public.faq (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  question text NOT NULL,
  answer text NOT NULL DEFAULT ''::text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT faq_pkey PRIMARY KEY (id)
);
CREATE TABLE public.feedback (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  document_id uuid,
  user_id uuid,
  type text NOT NULL CHECK (type = ANY (ARRAY['helpful'::text, 'not_helpful'::text])),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT feedback_pkey PRIMARY KEY (id),
  CONSTRAINT feedback_document_id_fkey FOREIGN KEY (document_id) REFERENCES public.documents(id),
  CONSTRAINT feedback_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT feedback_user_id_profiles_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.permissions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT permissions_pkey PRIMARY KEY (id)
);
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  name text,
  nomor_induk text UNIQUE,
  role_id uuid,
  department text DEFAULT 'all'::text,
  created_at timestamp with time zone DEFAULT now(),
  username text UNIQUE,
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id),
  CONSTRAINT profiles_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id),
  CONSTRAINT profiles_department_fkey FOREIGN KEY (department) REFERENCES public.departments(code)
);
CREATE TABLE public.role_permissions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  role_id uuid,
  permission_id uuid,
  CONSTRAINT role_permissions_pkey PRIMARY KEY (id),
  CONSTRAINT role_permissions_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id),
  CONSTRAINT role_permissions_permission_id_fkey FOREIGN KEY (permission_id) REFERENCES public.permissions(id)
);
CREATE TABLE public.roles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT roles_pkey PRIMARY KEY (id)
);

-- ==========================================
-- INDEXES FOR RELATIONAL PERFORMANCE
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON public.activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_document_id ON public.activity_logs(document_id);

CREATE INDEX IF NOT EXISTS idx_comment_replies_comment_id ON public.comment_replies(comment_id);
CREATE INDEX IF NOT EXISTS idx_comments_document_id ON public.comments(document_id);

CREATE INDEX IF NOT EXISTS idx_document_approvals_document_id ON public.document_approvals(document_id);

CREATE INDEX IF NOT EXISTS idx_document_versions_document_id ON public.document_versions(document_id);
CREATE INDEX IF NOT EXISTS idx_document_versions_created_by ON public.document_versions(created_by);

CREATE INDEX IF NOT EXISTS idx_documents_department ON public.documents(department);
CREATE INDEX IF NOT EXISTS idx_documents_status ON public.documents(status);
CREATE INDEX IF NOT EXISTS idx_documents_created_by ON public.documents(created_by);

CREATE INDEX IF NOT EXISTS idx_feedback_document_id ON public.feedback(document_id);

CREATE INDEX IF NOT EXISTS idx_profiles_role_id ON public.profiles(role_id);
CREATE INDEX IF NOT EXISTS idx_profiles_department ON public.profiles(department);