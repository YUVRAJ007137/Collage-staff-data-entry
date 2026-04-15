-- ATMA MALIK INSTITUTE - Monthly Report Tables

-- 1. Fees Collection Report
CREATE TABLE IF NOT EXISTS fees_collection (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class TEXT NOT NULL,
  strength INTEGER,
  provisional_admission INTEGER,
  total_fees_from_students NUMERIC,
  fees_collected_july NUMERIC,
  fees_remaining NUMERIC,
  remarks TEXT,
  month_year TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Admission Activities Report
CREATE TABLE IF NOT EXISTS admission_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  faculty_name TEXT NOT NULL,
  task_assigned TEXT,
  status TEXT,
  month_year TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. FDP/Conference/Training Attended
CREATE TABLE IF NOT EXISTS fdp_training_attended (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  faculty_name TEXT NOT NULL,
  date_from DATE,
  date_to DATE,
  title TEXT,
  type TEXT CHECK (type IN ('FDP', 'Conference', 'Training')),
  total_attended INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. FDP/Conference/Training Organized
CREATE TABLE IF NOT EXISTS fdp_training_organized (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date_conducted DATE,
  convener_name TEXT,
  title TEXT,
  type TEXT CHECK (type IN ('FDP', 'Conference', 'Training')),
  number_of_participants INTEGER,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Industrial Visits
CREATE TABLE IF NOT EXISTS industrial_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_industry_name TEXT NOT NULL,
  class_division TEXT,
  number_of_students INTEGER,
  visit_date DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Expert Talk/Guest Lecture
CREATE TABLE IF NOT EXISTS expert_talks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date_conducted DATE,
  expert_name TEXT NOT NULL,
  topic TEXT,
  session_type TEXT,
  student_strength INTEGER,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Consultancy
CREATE TABLE IF NOT EXISTS consultancy (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_name TEXT NOT NULL,
  amount_fetched NUMERIC,
  date_completed DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 8. Add-on / Value-Added Courses
CREATE TABLE IF NOT EXISTS addon_courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_name TEXT NOT NULL,
  number_of_students INTEGER,
  duration_hours INTEGER,
  course_date DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 9. MOOCs/SWAYAM/NPTEL
CREATE TABLE IF NOT EXISTS moocs_courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_name TEXT NOT NULL,
  platform TEXT CHECK (platform IN ('MOOC', 'SWAYAM', 'NPTEL', 'Other')),
  number_of_students INTEGER,
  completion_date DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 10. Extension & Outreach Programs
CREATE TABLE IF NOT EXISTS extension_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_name TEXT NOT NULL,
  number_of_students INTEGER,
  program_date DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 11. Capacity Building & Skills Enhancement
CREATE TABLE IF NOT EXISTS capacity_building (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date_conducted DATE,
  program_name TEXT NOT NULL,
  program_type TEXT CHECK (program_type IN ('Soft Skills', 'Language', 'Life Skills', 'ICT')),
  expert_name TEXT,
  student_strength INTEGER,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 12. Guidance for Competitive Exams
CREATE TABLE IF NOT EXISTS competitive_guidance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date_conducted DATE,
  program_name TEXT NOT NULL,
  expert_name TEXT,
  student_strength INTEGER,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 13. Sessions on Interview Preparation
CREATE TABLE IF NOT EXISTS interview_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date_conducted DATE,
  session_type TEXT CHECK (session_type IN ('Aptitude', 'Resume', 'Group Discussion', 'Interview', 'JAM/CLAT/GATE', 'Other')),
  expert_name TEXT,
  student_strength INTEGER,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 14. Sports/Cultural Activities
CREATE TABLE IF NOT EXISTS sports_cultural_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_date DATE,
  activity_name TEXT NOT NULL,
  activity_type TEXT CHECK (activity_type IN ('Sports', 'Cultural')),
  level TEXT CHECK (level IN ('Intra-college', 'Inter-college', 'University', 'State', 'National', 'International')),
  student_strength INTEGER,
  status TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 15. Alumni Engagement Programs
CREATE TABLE IF NOT EXISTS alumni_engagement (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_date DATE,
  program_name TEXT NOT NULL,
  activity_conducted TEXT,
  alumni_strength INTEGER,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 16. Environmental Promotion Activities
CREATE TABLE IF NOT EXISTS environmental_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_date DATE,
  program_name TEXT NOT NULL,
  activity_conducted TEXT,
  student_strength INTEGER,
  location TEXT CHECK (location IN ('In Campus', 'Beyond Campus', 'Both')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 17. Constitutional Sensitization Programs
CREATE TABLE IF NOT EXISTS constitutional_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_date DATE,
  program_name TEXT NOT NULL,
  activity_conducted TEXT,
  participants_count INTEGER,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 18. Faculty Attendance
CREATE TABLE IF NOT EXISTS faculty_attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  faculty_name TEXT NOT NULL,
  attendance_month TEXT,
  cl_applicable INTEGER DEFAULT 0,
  coff_applicable INTEGER DEFAULT 0,
  ml_applicable INTEGER DEFAULT 0,
  vacation_applicable INTEGER DEFAULT 0,
  cl_availed INTEGER DEFAULT 0,
  coff_availed INTEGER DEFAULT 0,
  od_availed INTEGER DEFAULT 0,
  lwp_availed INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 19. Pending Inward Letters
CREATE TABLE IF NOT EXISTS inward_letters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inward_number TEXT,
  letter_issue_date DATE,
  subject TEXT NOT NULL,
  remarks TEXT,
  status TEXT CHECK (status IN ('Pending', 'Resolved')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 20. Pending Outward Letters
CREATE TABLE IF NOT EXISTS outward_letters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  outward_number TEXT,
  letter_issue_date DATE,
  subject TEXT NOT NULL,
  remarks TEXT,
  status TEXT CHECK (status IN ('Pending', 'Sent')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 21. Disciplinary Actions
CREATE TABLE IF NOT EXISTS disciplinary_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_name TEXT NOT NULL,
  reason_for_action TEXT NOT NULL,
  action_taken TEXT,
  remarks TEXT,
  action_date DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 22. Committee Meetings
CREATE TABLE IF NOT EXISTS committee_meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  committee_name TEXT NOT NULL,
  coordinator_name TEXT,
  meeting_count INTEGER DEFAULT 1,
  meeting_frequency TEXT CHECK (meeting_frequency IN ('Monthly', 'Quarterly', 'Half Yearly', 'Yearly')),
  targeted_months TEXT,
  current_month_status TEXT CHECK (current_month_status IN ('Conducted', 'Not Conducted', 'Scheduled')),
  cumulative_conducted INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 23. Faculty Activities & Portfolios
CREATE TABLE IF NOT EXISTS faculty_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  faculty_name TEXT NOT NULL,
  department TEXT,
  portfolio TEXT,
  activities_conducted TEXT,
  month_year TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS and create policies
ALTER TABLE fees_collection ENABLE ROW LEVEL SECURITY;
ALTER TABLE admission_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE fdp_training_attended ENABLE ROW LEVEL SECURITY;
ALTER TABLE fdp_training_organized ENABLE ROW LEVEL SECURITY;
ALTER TABLE industrial_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE expert_talks ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultancy ENABLE ROW LEVEL SECURITY;
ALTER TABLE addon_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE moocs_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE extension_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE capacity_building ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitive_guidance ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sports_cultural_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE alumni_engagement ENABLE ROW LEVEL SECURITY;
ALTER TABLE environmental_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE constitutional_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE faculty_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE inward_letters ENABLE ROW LEVEL SECURITY;
ALTER TABLE outward_letters ENABLE ROW LEVEL SECURITY;
ALTER TABLE disciplinary_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE committee_meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE faculty_activities ENABLE ROW LEVEL SECURITY;

-- Create policies for all tables (allow all for now - adjust based on your auth)
CREATE POLICY "Allow all operations" ON fees_collection FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations" ON admission_activities FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations" ON fdp_training_attended FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations" ON fdp_training_organized FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations" ON industrial_visits FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations" ON expert_talks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations" ON consultancy FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations" ON addon_courses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations" ON moocs_courses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations" ON extension_programs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations" ON capacity_building FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations" ON competitive_guidance FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations" ON interview_sessions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations" ON sports_cultural_activities FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations" ON alumni_engagement FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations" ON environmental_activities FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations" ON constitutional_programs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations" ON faculty_attendance FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations" ON inward_letters FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations" ON outward_letters FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations" ON disciplinary_actions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations" ON committee_meetings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations" ON faculty_activities FOR ALL USING (true) WITH CHECK (true);
