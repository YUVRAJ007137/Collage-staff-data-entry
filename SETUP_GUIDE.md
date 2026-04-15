# College Staff Management System - Setup Guide

## Step 1: Create Database Tables

Copy and run the following SQL in your Supabase SQL Editor:

```sql
-- Run the full contents of: supabase-tables.sql
-- (This file is already provided in your project)
```

## Step 2: Login as Admin

Use these credentials in the application:
- **Username**: admin
- **Password**: pass@123

## Available Tables for Data Management

### 1. **Fees Collection**
- Track fees by class (SE, DSE, TE, BE)
- Record provisional admissions
- Track collected and remaining fees

### 2. **Admission Activities**
- Faculty task assignments
- Task status tracking

### 3. **FDP/Training Attended**
- Faculty professional development
- Attended workshops and conferences

### 4. **FDP/Training Organized**
- Department-organized events
- Participant count tracking

### 5. **Industrial Visits**
- Company/industry visits by students
- Class-wise distribution

### 6. **Expert Talks/Guest Lectures**
- Guest speaker sessions
- Cross-cutting topics integration

### 7. **Consultancy**
- Revenue from consultancy work
- Client organization tracking

### 8. **Add-on/Value-Added Courses**
- Course name and duration
- Student enrollment

### 9. **MOOCs/SWAYAM/NPTEL**
- Online course tracking
- Completion metrics

### 10. **Extension Programs**
- Community outreach activities
- Student participation

### 11. **Capacity Building**
- Soft skills programs
- Life skills training
- ICT trainings

### 12. **Competitive Exam Guidance**
- GATE/CAT/GRE preparation sessions
- Expert-led sessions

### 13. **Sports/Cultural Activities**
- Intra and inter-college events
- Student participation levels

### 14. **Alumni Engagement**
- Alumni events
- Networking programs

### 15. **Environmental Activities**
- On-campus and off-campus initiatives
- Student participation

### 16. **Faculty Attendance**
- Leave tracking (CL, C-off, ML, Vacation)
- Cumulative attendance data

### 17. **Committee Meetings**
- Department meetings tracking
- Meeting frequency and status

### 18. **Faculty Activities**
- Portfolio and responsibilities
- Monthly activity logs

### 19. **Pending Letters (Inward/Outward)**
- Administrative correspondence

### 20. **Disciplinary Actions**
- Staff disciplinary records

## How to Use the Admin Panel

1. **Login** with admin credentials
2. **Navigate** to different sections using the tab menu
3. **Fill forms** for each category
4. **View records** in table format
5. **Edit/Delete** existing records as needed

## Monthly Report Process

1. Start each month by logging into admin panel
2. Fill each section with relevant data
3. Data is automatically saved to database
4. Generate reports when needed

## Technical Details

### Database Connection
All tables are connected to Supabase with Row Level Security (RLS) enabled.

### Data Validation
- Numeric fields validate numeric input
- Select fields constrain options
- Required fields are marked

### Table Structure
Each table includes:
- `id` (UUID Primary Key)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)
- Relevant data fields

## Security Notes

⚠️ Current Setup:
- Admin credentials are hardcoded (update before production)
- RLS policies allow all operations (restrict in production)
- Use environment variables for sensitive data

## Next Steps

1. Create additional admin accounts with unique credentials
2. Implement role-based access control
3. Add data export functionality
4. Create monthly report generation
5. Add PDF export for compliance

## Support

For any issues or questions, refer to the SQL schema documentation provided.
