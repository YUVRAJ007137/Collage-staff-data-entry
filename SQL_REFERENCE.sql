-- QUICK SQL REFERENCE - Copy these queries directly to Supabase SQL Editor

-- ==================== SAMPLE DATA QUERIES ====================

-- Insert Sample Fee Collection Data
INSERT INTO fees_collection (class, strength, provisional_admission, total_fees_from_students, fees_collected_july, fees_remaining, remarks, month_year) VALUES
('SE', 48, 4, 110153.00, NULL, 8694, 'Scholarship Pending', '2025-07'),
('DSE', 22, 0, 9706841, NULL, NULL, NULL, '2025-07'),
('TE', 42, 6, 381435.50, NULL, 263114, 'Scholarship Pending', '2025-07'),
('BE', 2, 0, 69873.00, NULL, 13938, 'Jijau Scholarship Pending', '2025-07');

-- Insert Sample Admission Activities
INSERT INTO admission_activities (faculty_name, task_assigned, status, month_year) VALUES
('Dr. Omkar Ghatge', 'Sub-FC + Calling students for admission (335) Just Dial', 'Process', '2025-07'),
('Dr. Swarupa Wagh', 'Admission followup Calling, Admission (Scrutinizer)', 'Process', '2025-07'),
('Prof. Swati Bhoir', 'Admission followup Calling, Admission Counseling', 'Process', '2025-07');

-- Insert Sample FDP Training Attended
INSERT INTO fdp_training_attended (faculty_name, date_from, date_to, title, type) VALUES
('Dr. Omkar Ghatge', '2025-07-14', '2025-07-18', 'Faculty Development Program', 'FDP'),
('Dr. Swarupa Wagh', '2025-07-14', '2025-07-18', 'Faculty Development Program', 'FDP'),
('Prof. Swati Bhoir', '2025-07-03', '2025-07-04', 'Professional Workshop', 'Training');

-- ==================== VERIFICATION QUERIES ====================

-- Check all tables are created
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%fees%' 
OR table_name LIKE '%admission%';

-- Verify Fees Collection data
SELECT * FROM fees_collection 
WHERE month_year = '2025-07' 
ORDER BY class;

-- Count records by table
SELECT 'fees_collection' as table_name, COUNT(*) as count FROM fees_collection
UNION ALL
SELECT 'admission_activities', COUNT(*) FROM admission_activities
UNION ALL
SELECT 'fdp_training_attended', COUNT(*) FROM fdp_training_attended;

-- ==================== MAINTENANCE QUERIES ====================

-- Backup current month data to temporary table
CREATE TABLE fees_collection_backup_jul2025 AS 
SELECT * FROM fees_collection 
WHERE month_year = '2025-07';

-- Delete test records
DELETE FROM fees_collection WHERE fees_collected_july IS NULL;

-- Archive completed activities
UPDATE admission_activities SET status = 'Completed' 
WHERE month_year < '2025-06' AND status = 'Process';

-- ==================== REPORTING QUERIES ====================

-- Monthly fees summary
SELECT 
  class,
  COUNT(*) as strength,
  SUM(CAST(total_fees_from_students AS NUMERIC)) as total_fees,
  SUM(CAST(fees_collected_july AS NUMERIC)) as collected,
  SUM(CAST(fees_remaining AS NUMERIC)) as remaining
FROM fees_collection 
WHERE month_year = '2025-07'
GROUP BY class
ORDER BY class;

-- Faculty activity log
SELECT 
  faculty_name,
  COUNT(*) as total_activities
FROM admission_activities 
WHERE month_year = '2025-07'
GROUP BY faculty_name
ORDER BY total_activities DESC;

-- FDP attendance summary
SELECT 
  faculty_name,
  COUNT(*) as trainings_attended,
  STRING_AGG(title, ', ') as programs
FROM fdp_training_attended 
WHERE EXTRACT(YEAR FROM date_from) = 2025
GROUP BY faculty_name;

-- ==================== DATA VALIDATION ====================

-- Find missing required fields
SELECT * FROM fees_collection WHERE class IS NULL OR strength IS NULL;

-- Check for duplicate entries (same class, same month)
SELECT class, month_year, COUNT(*) 
FROM fees_collection 
GROUP BY class, month_year 
HAVING COUNT(*) > 1;

-- Identify inactive records
SELECT table_name, COUNT(*) as inactive_records
FROM (
  SELECT 'admission_activities' as table_name FROM admission_activities WHERE status = 'Pending'
  UNION ALL
  SELECT 'inward_letters' FROM inward_letters WHERE status = 'Pending'
  UNION ALL
  SELECT 'outward_letters' FROM outward_letters WHERE status = 'Pending'
) AS pending_items
GROUP BY table_name;

-- ==================== EXPORT QUERIES ====================

-- Export fees collection as CSV copy
COPY (
  SELECT class, strength, provisional_admission, total_fees_from_students, 
         fees_collected_july, fees_remaining, remarks, month_year 
  FROM fees_collection 
  WHERE month_year = '2025-07'
  ORDER BY class
) TO STDOUT WITH CSV HEADER;

-- Export admission activities
COPY (
  SELECT faculty_name, task_assigned, status, month_year 
  FROM admission_activities 
  WHERE month_year = '2025-07'
  ORDER BY faculty_name
) TO STDOUT WITH CSV HEADER;

-- ==================== USEFUL FUNCTIONS ====================

-- Get current month in YYYY-MM format
SELECT TO_CHAR(CURRENT_DATE, 'YYYY-MM') as current_month;

-- Get last month
SELECT TO_CHAR(CURRENT_DATE - INTERVAL '1 month', 'YYYY-MM') as last_month;

-- Compare data across months
SELECT 
  'Current' as period,
  COUNT(*) as record_count,
  MAX(updated_at) as last_update
FROM fees_collection 
WHERE month_year = TO_CHAR(CURRENT_DATE, 'YYYY-MM')
UNION ALL
SELECT 
  'Previous',
  COUNT(*),
  MAX(updated_at)
FROM fees_collection 
WHERE month_year = TO_CHAR(CURRENT_DATE - INTERVAL '1 month', 'YYYY-MM');

-- ==================== RESET & CLEANUP ====================

-- Clear all test data (use with caution!)
-- DELETE FROM fees_collection WHERE month_year = '2025-07';
-- DELETE FROM admission_activities WHERE month_year = '2025-07';

-- Truncate table and reset sequences
-- TRUNCATE TABLE fees_collection RESTART IDENTITY;
-- TRUNCATE TABLE admission_activities RESTART IDENTITY;

-- Drop all tables (DESTRUCTIVE - only for reset)
-- DROP TABLE IF EXISTS fees_collection, admission_activities, fdp_training_attended;
