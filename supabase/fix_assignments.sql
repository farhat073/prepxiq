-- ================================================================
-- FIX: TEACHER & STUDENT ASSIGNMENT SYSTEM
-- ================================================================
-- Run this ONCE in your Supabase SQL Editor.
-- Fixes RLS policies and constraints for batch_subjects & student_profiles
-- so that admin can assign teachers to batches and students to batches.
-- ================================================================


-- =====================
-- 1. FIX batch_subjects TABLE
-- =====================

-- Drop ALL existing policies on batch_subjects
DO $$
DECLARE
  pol record;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies WHERE tablename = 'batch_subjects'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON batch_subjects', pol.policyname);
  END LOOP;
END $$;

-- Ensure RLS is enabled
ALTER TABLE batch_subjects ENABLE ROW LEVEL SECURITY;

-- Admin/Superadmin can do EVERYTHING (insert, update, delete, select)
CREATE POLICY "batch_subjects_admin_all"
  ON batch_subjects FOR ALL
  USING (public.get_user_role() IN ('admin', 'superadmin'))
  WITH CHECK (public.get_user_role() IN ('admin', 'superadmin'));

-- All authenticated users can READ batch_subjects
CREATE POLICY "batch_subjects_auth_read"
  ON batch_subjects FOR SELECT
  USING (auth.role() = 'authenticated');


-- =====================
-- 2. FIX student_profiles TABLE
-- =====================

-- Drop ALL existing policies on student_profiles
DO $$
DECLARE
  pol record;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies WHERE tablename = 'student_profiles'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON student_profiles', pol.policyname);
  END LOOP;
END $$;

-- Ensure RLS is enabled
ALTER TABLE student_profiles ENABLE ROW LEVEL SECURITY;

-- Admin/Superadmin can do EVERYTHING
CREATE POLICY "student_profiles_admin_all"
  ON student_profiles FOR ALL
  USING (public.get_user_role() IN ('admin', 'superadmin'))
  WITH CHECK (public.get_user_role() IN ('admin', 'superadmin'));

-- All authenticated users can READ student_profiles
CREATE POLICY "student_profiles_auth_read"
  ON student_profiles FOR SELECT
  USING (auth.role() = 'authenticated');

-- Students can update their own profile
CREATE POLICY "student_profiles_self_update"
  ON student_profiles FOR UPDATE
  USING (profile_id = auth.uid());


-- =====================
-- 3. FIX teacher_profiles TABLE (for good measure)
-- =====================

DO $$
DECLARE
  pol record;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies WHERE tablename = 'teacher_profiles'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON teacher_profiles', pol.policyname);
  END LOOP;
END $$;

ALTER TABLE teacher_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "teacher_profiles_admin_all"
  ON teacher_profiles FOR ALL
  USING (public.get_user_role() IN ('admin', 'superadmin'))
  WITH CHECK (public.get_user_role() IN ('admin', 'superadmin'));

CREATE POLICY "teacher_profiles_auth_read"
  ON teacher_profiles FOR SELECT
  USING (auth.role() = 'authenticated');


-- =====================
-- 4. FIX batches TABLE
-- =====================

DO $$
DECLARE
  pol record;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies WHERE tablename = 'batches'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON batches', pol.policyname);
  END LOOP;
END $$;

ALTER TABLE batches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "batches_admin_all"
  ON batches FOR ALL
  USING (public.get_user_role() IN ('admin', 'superadmin'))
  WITH CHECK (public.get_user_role() IN ('admin', 'superadmin'));

CREATE POLICY "batches_auth_read"
  ON batches FOR SELECT
  USING (auth.role() = 'authenticated');


-- =====================
-- 5. FIX subjects TABLE
-- =====================

DO $$
DECLARE
  pol record;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies WHERE tablename = 'subjects'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON subjects', pol.policyname);
  END LOOP;
END $$;

ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "subjects_admin_all"
  ON subjects FOR ALL
  USING (public.get_user_role() IN ('admin', 'superadmin'))
  WITH CHECK (public.get_user_role() IN ('admin', 'superadmin'));

CREATE POLICY "subjects_auth_read"
  ON subjects FOR SELECT
  USING (auth.role() = 'authenticated');


-- =====================
-- 6. FIX profiles TABLE (ensure admin can read all)
-- =====================

DO $$
DECLARE
  pol record;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies WHERE tablename = 'profiles'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON profiles', pol.policyname);
  END LOOP;
END $$;

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile
CREATE POLICY "profiles_self_select"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "profiles_self_update"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Admin/Superadmin full access
CREATE POLICY "profiles_admin_all"
  ON profiles FOR ALL
  USING (public.get_user_role() IN ('admin', 'superadmin'))
  WITH CHECK (public.get_user_role() IN ('admin', 'superadmin'));


-- =====================
-- 7. VERIFY everything is good
-- =====================

-- Check batch_subjects policies
SELECT tablename, policyname, cmd, qual
FROM pg_policies
WHERE tablename IN ('batch_subjects', 'student_profiles', 'profiles', 'batches', 'subjects')
ORDER BY tablename, policyname;
