-- Run this in Supabase SQL Editor (Dashboard > SQL Editor)
-- Creates the users table and login function for student/staff

-- Table for admin-created users (students and staff)
CREATE TABLE IF NOT EXISTS app_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('student', 'staff')),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Add active column if table already exists (run once if migrating)
DO $$ BEGIN
  ALTER TABLE app_users ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Add class column for students (fe/se/te/be)
DO $$ BEGIN
  ALTER TABLE app_users ADD COLUMN IF NOT EXISTS class TEXT CHECK (class IN ('fe', 'se', 'te', 'be'));
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Enable RLS
ALTER TABLE app_users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if re-running (ignore errors)
DROP POLICY IF EXISTS "Allow insert app_users" ON app_users;
DROP POLICY IF EXISTS "Allow select app_users" ON app_users;
DROP POLICY IF EXISTS "Allow update app_users" ON app_users;
DROP POLICY IF EXISTS "Allow delete app_users" ON app_users;

-- Policies for admin panel
CREATE POLICY "Allow insert app_users" ON app_users FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow select app_users" ON app_users FOR SELECT USING (true);
CREATE POLICY "Allow update app_users" ON app_users FOR UPDATE USING (true);
CREATE POLICY "Allow delete app_users" ON app_users FOR DELETE USING (true);

-- Login function: returns user data only if credentials match and user is active
-- Returns { ok: true, ...user } for active users
-- Returns { ok: false, reason: "deactivated" } for inactive users
-- Returns null for invalid credentials
CREATE OR REPLACE FUNCTION login_user(uname TEXT, pwd TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  usr RECORD;
BEGIN
  SELECT id, username, role, active INTO usr
  FROM app_users
  WHERE username = uname AND password = pwd
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  IF usr.active = false THEN
    RETURN json_build_object('ok', false, 'reason', 'deactivated');
  END IF;

  RETURN json_build_object('ok', true, 'id', usr.id, 'username', usr.username, 'role', usr.role);
END;
$$;

-- Check if a user is still active (for page access verification)
CREATE OR REPLACE FUNCTION get_user_active_status(uname TEXT)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(active, true) FROM app_users WHERE username = uname LIMIT 1;
$$;

-- ============ Staff & Subject Assignment Tables ============
-- Subjects for each engineering year (FE, SE, TE, BE)
CREATE TABLE IF NOT EXISTS subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  class TEXT NOT NULL CHECK (class IN ('fe', 'se', 'te', 'be')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(name, class)
);

-- Staff assignments: which staff teaches which subject (for which class)
CREATE TABLE IF NOT EXISTS staff_subject_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(staff_id, subject_id)
);

ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_subject_assignments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all subjects" ON subjects;
DROP POLICY IF EXISTS "Allow all staff_assignments" ON staff_subject_assignments;

CREATE POLICY "Allow all subjects" ON subjects FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all staff_assignments" ON staff_subject_assignments FOR ALL USING (true) WITH CHECK (true);

-- ============ Staff Subject Progress Table ============
-- Tracks lecture, syllabus, practical, assignment progress per subject
CREATE TABLE IF NOT EXISTS staff_subject_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  target_sem TEXT,
  lectures_planned_month NUMERIC DEFAULT 0,
  lectures_conducted_month NUMERIC DEFAULT 0,
  lectures_cumulative NUMERIC DEFAULT 0,
  syllabus_completed_month NUMERIC DEFAULT 0,
  syllabus_cumulative NUMERIC DEFAULT 0,
  practical_total NUMERIC DEFAULT 0,
  practical_completed NUMERIC DEFAULT 0,
  assignments_till_date NUMERIC DEFAULT 0,
  assignments_out_of NUMERIC DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(staff_id, subject_id)
);

ALTER TABLE staff_subject_progress ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all staff_progress" ON staff_subject_progress;
CREATE POLICY "Allow all staff_progress" ON staff_subject_progress FOR ALL USING (true) WITH CHECK (true);
