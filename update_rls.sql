-- 1. Hapus policy RLS lama pada tabel documents
DROP POLICY IF EXISTS "Documents are viewable by authenticated users" ON public.documents;
DROP POLICY IF EXISTS "Editors can insert documents" ON public.documents;
DROP POLICY IF EXISTS "Editors can update own documents" ON public.documents;
DROP POLICY IF EXISTS "View docs based on dept and role" ON public.documents;
DROP POLICY IF EXISTS "Editors insert in their department" ON public.documents;
DROP POLICY IF EXISTS "Admins can insert any document" ON public.documents;
DROP POLICY IF EXISTS "Editors update in their department" ON public.documents;

-- 2. SELECT Policy: 
-- Viewer dan Editor hanya bisa melihat dokumen jika department dok = 'all' ATAU departemennya cocok dengan profil user.
-- Admin bisa melihat semua dokumen.
CREATE POLICY "View docs based on dept and role"
  ON public.documents FOR SELECT
  TO authenticated USING (
    department = 'all' 
    OR 
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() AND p.department = documents.department
    )
    OR 
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.roles r ON p.role_id = r.id
      WHERE p.id = auth.uid() AND r.name = 'admin'
    )
  );

-- 3. INSERT Policy (Editor): 
-- Editor hanya bisa membuat (insert) dokumen untuk departemennya sendiri.
CREATE POLICY "Editors insert in their department"
  ON public.documents FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.roles r ON p.role_id = r.id
      WHERE p.id = auth.uid() 
        AND r.name = 'editor' 
        AND p.department = department
    )
  );

-- 4. INSERT Policy (Admin): 
-- Admin bisa buat (insert) dokumen untuk departemen mana pun.
CREATE POLICY "Admins can insert any document"
  ON public.documents FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.roles r ON p.role_id = r.id
      WHERE p.id = auth.uid() AND r.name = 'admin'
    )
  );

-- 5. UPDATE Policy (Editor): 
-- Editor HANYA bisa mengedit dokumen yang ada di departemennya sendiri.
CREATE POLICY "Editors update in their department"
  ON public.documents FOR UPDATE
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.roles r ON p.role_id = r.id
      WHERE p.id = auth.uid() 
        AND r.name = 'editor' 
        AND p.department = documents.department
    )
  );

-- ==========================================
-- DELETE POLICIES (Baru Ditambahkan)
-- ==========================================

-- Mengizinkan pengguna menghapus komentarnya sendiri, dan admin menghapus komentar siapa pun
CREATE POLICY "Users can delete own comments" ON public.comments FOR DELETE USING (
  user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.profiles p JOIN public.roles r ON p.role_id = r.id 
    WHERE p.id = auth.uid() AND r.name = 'admin'
  )
);

-- Mengizinkan pengguna menghapus balasannya sendiri, dan admin menghapus balasan siapa pun
CREATE POLICY "Users can delete own replies" ON public.comment_replies FOR DELETE USING (
  user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.profiles p JOIN public.roles r ON p.role_id = r.id 
    WHERE p.id = auth.uid() AND r.name = 'admin'
  )
);

-- Mengizinkan pengguna menghapus (atau mengganti) feedback-nya sendiri
CREATE POLICY "Users can delete own feedback" ON public.feedback FOR DELETE USING (
  user_id = auth.uid()
);
