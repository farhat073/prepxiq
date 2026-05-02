-- ================================================================
-- PREPXIQ ERP — COMPLETE DATABASE SCHEMA
-- ================================================================
-- This is the SINGLE source of truth for the entire database.
-- Run this ONCE in your Supabase SQL Editor.
-- If you have already run previous scripts, this is safe to re-run
-- because it uses CREATE TABLE IF NOT EXISTS and DROP POLICY IF EXISTS.
-- ================================================================


-- =====================
-- EXTENSIONS
-- =====================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";


-- =====================
-- TABLE DEFINITIONS
-- =====================

-- 1. PROFILES (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('superadmin', 'admin', 'teacher', 'student')),
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  date_of_birth DATE,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  address TEXT,
  branch_id UUID,
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. BRANCHES
CREATE TABLE IF NOT EXISTS branches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  address TEXT,
  city TEXT,
  state TEXT,
  pincode TEXT,
  phone TEXT,
  email TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add FK from profiles -> branches (safe if already exists)
DO $$ BEGIN
  ALTER TABLE profiles ADD CONSTRAINT fk_branch FOREIGN KEY (branch_id) REFERENCES branches(id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 3. ACADEMIC YEARS
CREATE TABLE IF NOT EXISTS academic_years (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_current BOOLEAN DEFAULT false,
  branch_id UUID REFERENCES branches(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. SUBJECTS
CREATE TABLE IF NOT EXISTS subjects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  code TEXT,
  description TEXT,
  branch_id UUID REFERENCES branches(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. LEVELS
CREATE TABLE IF NOT EXISTS levels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  order_index INTEGER,
  min_score_to_promote NUMERIC,
  branch_id UUID REFERENCES branches(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. BATCHES
CREATE TABLE IF NOT EXISTS batches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  code TEXT UNIQUE,
  level_id UUID REFERENCES levels(id),
  branch_id UUID REFERENCES branches(id),
  academic_year_id UUID REFERENCES academic_years(id),
  capacity INTEGER DEFAULT 30,
  enrolled_count INTEGER DEFAULT 0,
  start_date DATE,
  end_date DATE,
  schedule_days TEXT[],
  start_time TIME,
  end_time TIME,
  room_number TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. BATCH SUBJECTS
CREATE TABLE IF NOT EXISTS batch_subjects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  batch_id UUID REFERENCES batches(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects(id),
  teacher_id UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(batch_id, subject_id)
);

-- 8. STUDENT PROFILES
CREATE TABLE IF NOT EXISTS student_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  admission_number TEXT UNIQUE,
  enrollment_date DATE,
  current_level_id UUID REFERENCES levels(id),
  current_batch_id UUID REFERENCES batches(id),
  school_name TEXT,
  class_in_school TEXT,
  father_name TEXT,
  mother_name TEXT,
  guardian_phone TEXT,
  guardian_email TEXT,
  emergency_contact TEXT,
  medical_notes TEXT,
  referral_source TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active','inactive','graduated','dropped')),
  scholarship_percent NUMERIC DEFAULT 0,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. TEACHER PROFILES
CREATE TABLE IF NOT EXISTS teacher_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  employee_id TEXT UNIQUE,
  qualification TEXT,
  specialization TEXT,
  experience_years INTEGER,
  joining_date DATE,
  salary NUMERIC,
  status TEXT DEFAULT 'active' CHECK (status IN ('active','inactive','on_leave')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. ADMISSIONS
CREATE TABLE IF NOT EXISTS admissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT NOT NULL,
  date_of_birth DATE,
  school_name TEXT,
  class_in_school TEXT,
  desired_level_id UUID REFERENCES levels(id),
  branch_id UUID REFERENCES branches(id),
  source TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','contacted','enrolled','rejected','waitlisted')),
  notes TEXT,
  follow_up_date DATE,
  converted_student_id UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. ATTENDANCE SESSIONS
CREATE TABLE IF NOT EXISTS attendance_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  batch_id UUID REFERENCES batches(id),
  subject_id UUID REFERENCES subjects(id),
  teacher_id UUID REFERENCES profiles(id),
  session_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  topic_covered TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(batch_id, subject_id, session_date)
);

-- 12. ATTENDANCE RECORDS
CREATE TABLE IF NOT EXISTS attendance_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES attendance_sessions(id) ON DELETE CASCADE,
  student_id UUID REFERENCES profiles(id),
  status TEXT NOT NULL CHECK (status IN ('present','absent','late','excused')),
  notes TEXT,
  marked_by UUID REFERENCES profiles(id),
  marked_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. EXAMS
CREATE TABLE IF NOT EXISTS exams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('exam','mock_test','quiz','assignment','class_test')),
  subject_id UUID REFERENCES subjects(id),
  batch_id UUID REFERENCES batches(id),
  academic_year_id UUID REFERENCES academic_years(id),
  exam_date DATE,
  total_marks NUMERIC NOT NULL,
  passing_marks NUMERIC,
  duration_minutes INTEGER,
  instructions TEXT,
  created_by UUID REFERENCES profiles(id),
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. EXAM SCORES
CREATE TABLE IF NOT EXISTS exam_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
  student_id UUID REFERENCES profiles(id),
  marks_obtained NUMERIC,
  grade TEXT,
  rank_in_batch INTEGER,
  is_absent BOOLEAN DEFAULT false,
  remarks TEXT,
  entered_by UUID REFERENCES profiles(id),
  entered_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(exam_id, student_id)
);

-- 15. FEE STRUCTURES
CREATE TABLE IF NOT EXISTS fee_structures (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  batch_id UUID REFERENCES batches(id),
  level_id UUID REFERENCES levels(id),
  amount NUMERIC NOT NULL,
  frequency TEXT CHECK (frequency IN ('monthly','quarterly','annual','one_time')),
  due_day INTEGER,
  late_fee NUMERIC DEFAULT 0,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. FEE RECORDS
CREATE TABLE IF NOT EXISTS fee_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES profiles(id),
  fee_structure_id UUID REFERENCES fee_structures(id),
  amount_due NUMERIC NOT NULL,
  amount_paid NUMERIC DEFAULT 0,
  discount_amount NUMERIC DEFAULT 0,
  discount_reason TEXT,
  due_date DATE,
  paid_date DATE,
  payment_method TEXT CHECK (payment_method IN ('cash','upi','bank_transfer','cheque','online')),
  transaction_id TEXT,
  receipt_number TEXT UNIQUE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','partial','paid','overdue','waived')),
  notes TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 17. STUDY MATERIALS
CREATE TABLE IF NOT EXISTS study_materials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  type TEXT CHECK (type IN ('pdf','video','link','image','doc','other')),
  file_url TEXT,
  external_url TEXT,
  subject_id UUID REFERENCES subjects(id),
  batch_id UUID REFERENCES batches(id),
  uploaded_by UUID REFERENCES profiles(id),
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 18. HOMEWORK
CREATE TABLE IF NOT EXISTS homework (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  subject_id UUID REFERENCES subjects(id),
  batch_id UUID REFERENCES batches(id),
  assigned_by UUID REFERENCES profiles(id),
  due_date DATE,
  max_marks NUMERIC,
  attachment_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 19. HOMEWORK SUBMISSIONS
CREATE TABLE IF NOT EXISTS homework_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  homework_id UUID REFERENCES homework(id) ON DELETE CASCADE,
  student_id UUID REFERENCES profiles(id),
  submission_url TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  marks_given NUMERIC,
  feedback TEXT,
  status TEXT DEFAULT 'submitted' CHECK (status IN ('submitted','reviewed','late'))
);

-- 20. ANNOUNCEMENTS
CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT CHECK (type IN ('general','urgent','event','holiday','exam')),
  target_role TEXT[],
  target_batch_ids UUID[],
  branch_id UUID REFERENCES branches(id),
  is_pinned BOOLEAN DEFAULT false,
  published_by UUID REFERENCES profiles(id),
  publish_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 21. TIMETABLE
CREATE TABLE IF NOT EXISTS timetable (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  batch_id UUID REFERENCES batches(id),
  subject_id UUID REFERENCES subjects(id),
  teacher_id UUID REFERENCES profiles(id),
  day_of_week TEXT CHECK (day_of_week IN ('monday','tuesday','wednesday','thursday','friday','saturday','sunday')),
  start_time TIME,
  end_time TIME,
  room_number TEXT,
  effective_from DATE,
  effective_until DATE,
  is_active BOOLEAN DEFAULT true
);

-- 22. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT,
  type TEXT CHECK (type IN ('info','success','warning','error','fee','attendance','exam','announcement')),
  is_read BOOLEAN DEFAULT false,
  action_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 23. AUDIT LOGS
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  action TEXT NOT NULL,
  resource TEXT NOT NULL,
  resource_id UUID,
  old_data JSONB,
  new_data JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);


-- =====================
-- ENABLE ROW LEVEL SECURITY ON ALL TABLES
-- =====================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic_years ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE batch_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE admissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE fee_structures ENABLE ROW LEVEL SECURITY;
ALTER TABLE fee_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE homework ENABLE ROW LEVEL SECURITY;
ALTER TABLE homework_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE timetable ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;


-- =====================
-- DROP ALL OLD POLICIES & FUNCTIONS (clean slate)
-- First drop policies on ALL tables that reference get_my_role() or get_user_role()
-- =====================
DO $$ 
DECLARE 
  t text;
  all_tables text[] := ARRAY[
    'academic_years', 'admissions', 'announcements', 'attendance_records', 
    'attendance_sessions', 'audit_logs', 'batch_subjects', 'batches', 
    'exam_scores', 'exams', 'fee_records', 'fee_structures', 'homework', 
    'homework_submissions', 'levels', 'notifications', 'student_profiles', 
    'study_materials', 'subjects', 'teacher_profiles', 'timetable'
  ];
BEGIN 
  FOR t IN SELECT unnest(all_tables) LOOP
    EXECUTE format('DROP POLICY IF EXISTS "Admins can do everything" ON %I', t);
    EXECUTE format('DROP POLICY IF EXISTS "Authenticated users can view" ON %I', t);
    EXECUTE format('DROP POLICY IF EXISTS "Admins full access" ON %I', t);
    EXECUTE format('DROP POLICY IF EXISTS "Authenticated read access" ON %I', t);
  END LOOP;
END $$;

-- Now drop profiles policies
DROP POLICY IF EXISTS "Profiles are viewable by self" ON profiles;
DROP POLICY IF EXISTS "Superadmins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can view branch profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can manage profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "superadmin_all" ON profiles;
DROP POLICY IF EXISTS "profiles_own" ON profiles;
DROP POLICY IF EXISTS "admin_read_branch_profiles" ON profiles;
DROP POLICY IF EXISTS "Branches are viewable by everyone" ON branches;

-- NOW safe to drop the functions (no more dependents)
DROP FUNCTION IF EXISTS public.get_my_role();
DROP FUNCTION IF EXISTS public.get_user_role();


-- =====================
-- HELPER FUNCTION: get_user_role()
-- SECURITY DEFINER = bypasses RLS when querying profiles (no recursion)
-- STABLE = cacheable within a transaction for performance
-- =====================
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- Only authenticated users should call this (not anon/public)
REVOKE ALL ON FUNCTION public.get_user_role() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_user_role() FROM anon;
GRANT EXECUTE ON FUNCTION public.get_user_role() TO authenticated;


-- =====================
-- PROFILES POLICIES
-- =====================
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (public.get_user_role() IN ('admin', 'superadmin'));

DROP POLICY IF EXISTS "Admins can insert profiles" ON profiles;
CREATE POLICY "Admins can insert profiles" ON profiles
  FOR INSERT WITH CHECK (public.get_user_role() IN ('admin', 'superadmin'));

DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
CREATE POLICY "Admins can update all profiles" ON profiles
  FOR UPDATE USING (public.get_user_role() IN ('admin', 'superadmin'));

DROP POLICY IF EXISTS "Admins can delete profiles" ON profiles;
CREATE POLICY "Admins can delete profiles" ON profiles
  FOR DELETE USING (public.get_user_role() IN ('admin', 'superadmin'));


-- =====================
-- BRANCHES POLICY (public read)
-- =====================
DROP POLICY IF EXISTS "Branches are viewable by everyone" ON branches;
CREATE POLICY "Branches are viewable by everyone" ON branches
  FOR SELECT USING (true);


-- =====================
-- ALL OTHER TABLES: Admin full access + Authenticated read
-- =====================
DO $$ 
DECLARE 
  t text;
  tables_to_fix text[] := ARRAY[
    'academic_years', 'admissions', 'announcements', 'attendance_records', 
    'attendance_sessions', 'audit_logs', 'batch_subjects', 'batches', 
    'exam_scores', 'exams', 'fee_records', 'fee_structures', 'homework', 
    'homework_submissions', 'levels', 'notifications', 'student_profiles', 
    'study_materials', 'subjects', 'teacher_profiles', 'timetable'
  ];
BEGIN 
  FOR t IN SELECT unnest(tables_to_fix) LOOP
    EXECUTE format('DROP POLICY IF EXISTS "Admins can do everything" ON %I', t);
    EXECUTE format('DROP POLICY IF EXISTS "Authenticated users can view" ON %I', t);
    EXECUTE format('DROP POLICY IF EXISTS "Admins full access" ON %I', t);
    EXECUTE format('DROP POLICY IF EXISTS "Authenticated read access" ON %I', t);

    EXECUTE format(
      'CREATE POLICY "Admins full access" ON %I FOR ALL USING (public.get_user_role() IN (''admin'', ''superadmin''))',
      t
    );
    EXECUTE format(
      'CREATE POLICY "Authenticated read access" ON %I FOR SELECT USING (auth.role() = ''authenticated'')',
      t
    );
  END LOOP;
END $$;


-- =====================
-- TRIGGER: AUTO-CREATE PROFILE ON NEW USER SIGNUP
-- =====================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', 'New User'),
    new.email,
    COALESCE(new.raw_user_meta_data->>'role', 'student')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Drop and recreate to avoid duplicate trigger errors
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- =====================
-- SEED DATA
-- =====================
INSERT INTO branches (id, name, address, city, state, pincode, phone, email)
VALUES (
  'b1111111-1111-1111-1111-111111111111', 
  'Main Center', '123 Education Lane', 'Srinagar', 'J&K', '190001', '9876543210', 'main@prepxiq.com'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO academic_years (id, name, start_date, end_date, is_current, branch_id)
VALUES (
  'a1111111-1111-1111-1111-111111111111',
  '2024-25', '2024-04-01', '2025-03-31', true, 'b1111111-1111-1111-1111-111111111111'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO subjects (id, name, code, description, branch_id)
VALUES 
  ('c1111111-1111-1111-1111-111111111111', 'Physics', 'PHY', 'Physics for competitive exams', 'b1111111-1111-1111-1111-111111111111'),
  ('c2222222-2222-2222-2222-222222222222', 'Chemistry', 'CHM', 'Chemistry for competitive exams', 'b1111111-1111-1111-1111-111111111111'),
  ('c3333333-3333-3333-3333-333333333333', 'Mathematics', 'MTH', 'Mathematics for competitive exams', 'b1111111-1111-1111-1111-111111111111')
ON CONFLICT (id) DO NOTHING;


-- =====================
-- ENSURE PROFILE EXISTS FOR CURRENT USERS
-- (catches users created before the trigger was set up)
-- =====================
INSERT INTO public.profiles (id, full_name, email, role, is_active)
SELECT 
  id,
  COALESCE(raw_user_meta_data->>'full_name', 'Administrator'),
  email,
  'superadmin',
  true
FROM auth.users
WHERE email = 'fskp7527@gmail.com'
ON CONFLICT (id) DO UPDATE SET role = 'superadmin', is_active = true;


-- =====================
-- VERIFY: This should print your profile
-- =====================
SELECT id, email, role, is_active FROM profiles;
