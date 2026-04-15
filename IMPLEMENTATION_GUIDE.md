# Implementation Guide - Admin Monthly Reports

## Overview
This system allows the admin to manage and fill all monthly report tables from the college PDF document.

## Files Provided

1. **supabase-tables.sql** - Complete SQL schema for all 23 tables
2. **SETUP_GUIDE.md** - Quick start guide
3. **AdminDataManagement.jsx** - Enhanced admin component (optional, modular approach)

## Step 1: Create Database Tables (CRITICAL)

Go to your **Supabase Dashboard → SQL Editor** and copy/paste the entire contents of **supabase-tables.sql**

### What Tables Are Created:

```
1.  fees_collection
2.  admission_activities
3.  fdp_training_attended
4.  fdp_training_organized
5.  industrial_visits
6.  expert_talks
7.  consultancy
8.  addon_courses
9.  moocs_courses
10. extension_programs
11. capacity_building
12. competitive_guidance
13. interview_sessions
14. sports_cultural_activities
15. alumni_engagement
16. environmental_activities
17. constitutional_programs
18. faculty_attendance
19. inward_letters
20. outward_letters
21. disciplinary_actions
22. committee_meetings
23. faculty_activities
```

## Step 2: Access the Admin Panel

1. **Go to**: http://localhost:5173
2. **Login with**:
   - Username: `admin`
   - Password: `pass@123`
3. Click "Sign In" to access the admin panel

## Step 3: Fill Monthly Report Data

From the admin panel, you can now:

- ✅ Manage users (create, edit, deactivate)
- ✅ Enter fees collection data by class
- ✅ Record admission activities and faculty tasks
- ✅ Log FDP/training attended and organized
- ✅ Track industrial visits
- ✅ Record expert talks and guest lectures
- ✅ Track consultancy revenue
- ✅ Log add-on courses and online courses
- ✅ Record extension programs
- ✅ Capacity building program logs
- ✅ Sports and cultural activities
- ✅ Alumni engagement programs
- ✅ Environmental initiatives
- ✅ Faculty attendance tracking
- ✅ Committee meeting records
- ✅ Faculty activities and portfolios
- ✅ Manage disciplinary actions
- ✅ Track pending letters (inward/outward)

## Data Entry Example: Fees Collection

1. Go to **Fees Collection** tab
2. Fill in:
   - Class: "SE"
   - Strength: 48
   - Total Fees: 110153.00
   - Fees Collected: (amount collected)
   - Month: July 2025
3. Click "Add Record"
4. Record appears in table below

## SQL Query Reference

### Insert Fee Collection Data (Example)
```sql
INSERT INTO fees_collection (
  class, strength, total_fees_from_students, 
  fees_collected_july, fees_remaining, month_year
) VALUES (
  'SE', 48, 110153.00, 110000.00, 153.00, '2025-07'
);
```

### Query Current Month Data
```sql
SELECT * FROM fees_collection 
WHERE month_year = '2025-07' 
ORDER BY created_at DESC;
```

### Export Monthly Report
```sql
SELECT * FROM fees_collection 
WHERE month_year = EXTRACT(YEAR-MONTH FROM CURRENT_DATE)
UNION ALL
SELECT * FROM admission_activities 
WHERE month_year = EXTRACT(YEAR-MONTH FROM CURRENT_DATE);
-- (repeat for all tables)
```

## Database Structure Example

### Fees Collection Table
```
id     | class | strength | total_fees_from_students | month_year | created_at
-------|-------|----------|--------------------------|------------|----------
uuid   | SE    | 48       | 110153.00                | 2025-07    | timestamp
uuid   | TE    | 42       | 381435.50                | 2025-07    | timestamp
```

### Admission Activities Table
```
id   | faculty_name      | task_assigned              | status  | month_year
-----|-------------------|----------------------------|---------|--------
uuid | Dr. Omkar Ghatge  | Sub-FC + Calling Students  | Process | 2025-07
uuid | Dr. Swarupa Wagh  | Admission Followup         | Process | 2025-07
```

## Monthly Workflow

### Start of Month:
1. Login to admin panel
2. Verify all users are active
3. Check RLS policies are set

### During Month:
1. Enter fees collection daily
2. Log activities as they happen
3. Update admission tasks
4. Record guest lectures and events

### End of Month:
1. Complete all pending entries
2. Review data for accuracy
3. Generate export (feature coming soon)
4. Archive monthly report

## Troubleshooting

### Error: "supabaseKey is required"
- Check `.env` file has `VITE_SUPABASE_ANON_KEY`
- Verify key in Supabase dashboard

### Error: "jwt malformed"
- Supabase credentials might be wrong
- Regenerate anon key from Supabase

### Tables not appearing in admin:
- Ensure SQL was executed successfully
- Check RLS policies are created
- Refresh browser page

### Can't insert data:
- Verify RLS policies allow INSERT
- Check column names match exactly
- Validate data types (null fields, numeric, etc.)

## Advanced: Custom API Routes (Optional)

Create a new file for automated data submission:

```javascript
// src/api/reports.js
export async function submitMonthlyReport() {
  const response = await fetch('/api/monthly-report', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      month: 'July',
      year: 2025,
      fees: [...],
      activities: [...]
    })
  });
  return response.json();
}
```

## Next Phase Features (Future)

- [ ] PDF report generation
- [ ] Email notifications
- [ ] Data validation rules
- [ ] Bulk import from Excel
- [ ] Export to Excel/PDF
- [ ] Dashboard analytics
- [ ] Role-based access control
- [ ] Approval workflows

## Support Resources

- Email admin credentials to: your-email@college.edu
- Keep backup of monthly reports
- Archive exported files monthly
- Document any custom changes made

## Security Reminders

⚠️ Before Production:
1. ✅ Change admin password from default
2. ✅ Create admin-only user roles
3. ✅ Restrict RLS policies
4. ✅ Enable backups
5. ✅ Use environment variables for keys
6. ✅ Audit access logs

---

**Created**: April 2026
**Last Updated**: April 15, 2026
**Maintained By**: IT Department
