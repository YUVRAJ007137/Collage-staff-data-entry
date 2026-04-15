import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

/**
 * ADMIN DATA MANAGEMENT COMPONENT
 * Manages all monthly report data entry - Tab content only
 */

// Generic PDF Export Function
function exportTableToPDF(tableTitle, columns, data, totalColumns = []) {
  if (data.length === 0) {
    alert('No records to export')
    return
  }

  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 10

  // Title
  doc.setFontSize(16)
  doc.setFont(undefined, 'bold')
  doc.text(tableTitle, margin, margin + 5)

  // Date info
  doc.setFontSize(10)
  doc.setFont(undefined, 'normal')
  const currentDate = new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })
  doc.text(`Generated on: ${currentDate}`, margin, margin + 12)

  // Prepare table data
  const tableData = data.map(record => 
    columns.map(col => {
      const val = record[col]
      return val || ''
    })
  )

  // Add totals row if any totalColumns specified
  if (totalColumns.length > 0) {
    const totalsRow = columns.map(col => {
      if (totalColumns.includes(col)) {
        const sum = data.reduce((acc, r) => {
          const val = parseFloat(r[col]) || 0
          return acc + val
        }, 0)
        return sum > 0 ? sum.toLocaleString('en-IN', { maximumFractionDigits: 2 }) : ''
      }
      return col === columns[0] ? 'TOTAL' : ''
    })
    tableData.push(totalsRow)
  }

  // Generate table
  autoTable(doc, {
    head: [columns.map(col => col.replace(/_/g, ' ').toUpperCase())],
    body: tableData,
    startY: margin + 18,
    margin: margin,
    theme: 'grid',
    headerStyles: {
      fillColor: [99, 102, 241],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center',
      fontSize: 9
    },
    bodyStyles: {
      textColor: [0, 0, 0],
      fontSize: 8
    },
    footStyles: {
      fillColor: [230, 230, 250],
      textColor: [0, 0, 0],
      fontStyle: 'bold'
    },
    columnStyles: Object.fromEntries(
      columns.map((col, idx) => {
        if (totalColumns.includes(col)) {
          return [idx, { halign: 'right' }]
        }
        return [idx, {}]
      })
    ),
  })

  // Save PDF
  const filename = tableTitle.replace(/\s+/g, '_') + '.pdf'
  doc.save(filename)
}

// Master Export Function - All Tables in Single PDF
async function exportAllTablesToPDF() {
  try {
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const margin = 15

    // Title Page
    doc.setFontSize(24)
    doc.setFont(undefined, 'bold')
    doc.text('ATMA MALIK INSTITUTE', pageWidth / 2, 50, { align: 'center' })
    
    doc.setFontSize(18)
    doc.setFont(undefined, 'bold')
    doc.text('Monthly Reports - Complete Data Export', pageWidth / 2, 80, { align: 'center' })
    
    doc.setFontSize(12)
    doc.setFont(undefined, 'normal')
    const currentDate = new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })
    doc.text(`Generated on: ${currentDate}`, pageWidth / 2, 120, { align: 'center' })

    // Table data definitions
    const tableConfigs = [
      { id: 'fees_collection', title: 'Fees Collection Report', columns: ['class', 'strength', 'total_fees_from_students', 'fees_collected_july', 'fees_remaining', 'month_year'], totalColumns: ['total_fees_from_students', 'fees_collected_july', 'fees_remaining'] },
      { id: 'admission_activities', title: 'Admission Activities', columns: ['faculty_name', 'task_assigned', 'status', 'month_year'], totalColumns: [] },
      { id: 'fdp_training_attended', title: 'FDP/Training Attended', columns: ['faculty_name', 'title', 'type', 'total_attended'], totalColumns: [] },
      { id: 'fdp_training_organized', title: 'FDP/Training Organized', columns: ['convener_name', 'title', 'type', 'number_of_participants'], totalColumns: ['number_of_participants'] },
      { id: 'industrial_visits', title: 'Industrial Visits', columns: ['company_industry_name', 'class_division', 'number_of_students'], totalColumns: ['number_of_students'] },
      { id: 'expert_talks', title: 'Expert Talks/Guest Lectures', columns: ['expert_name', 'topic', 'session_type', 'student_strength'], totalColumns: ['student_strength'] },
      { id: 'consultancy', title: 'Consultancy', columns: ['organization_name', 'amount_fetched'], totalColumns: ['amount_fetched'] },
      { id: 'addon_courses', title: 'Add-on/Value-Added Courses', columns: ['course_name', 'number_of_students', 'duration_hours'], totalColumns: ['number_of_students', 'duration_hours'] },
      { id: 'moocs_courses', title: 'MOOCs/SWAYAM/NPTEL', columns: ['course_name', 'platform', 'number_of_students'], totalColumns: ['number_of_students'] },
      { id: 'extension_programs', title: 'Extension & Outreach Programs', columns: ['program_name', 'number_of_students'], totalColumns: ['number_of_students'] },
      { id: 'capacity_building', title: 'Capacity Building & Skills Enhancement', columns: ['program_name', 'program_type', 'expert_name', 'student_strength'], totalColumns: ['student_strength'] },
      { id: 'competitive_guidance', title: 'Guidance for Competitive Exams', columns: ['program_name', 'expert_name', 'student_strength'], totalColumns: ['student_strength'] },
      { id: 'interview_sessions', title: 'Interview Preparation Sessions', columns: ['session_type', 'expert_name', 'student_strength'], totalColumns: ['student_strength'] },
      { id: 'sports_cultural_activities', title: 'Sports/Cultural Activities', columns: ['activity_name', 'activity_type', 'level', 'student_strength'], totalColumns: ['student_strength'] },
      { id: 'alumni_engagement', title: 'Alumni Engagement Programs', columns: ['program_name', 'activity_conducted', 'alumni_strength'], totalColumns: ['alumni_strength'] },
      { id: 'environmental_activities', title: 'Environmental Promotion Activities', columns: ['program_name', 'activity_conducted', 'student_strength', 'location'], totalColumns: ['student_strength'] },
      { id: 'constitutional_programs', title: 'Constitutional Sensitization Programs', columns: ['program_name', 'activity_conducted', 'participants_count'], totalColumns: ['participants_count'] },
      { id: 'faculty_attendance', title: 'Faculty Attendance', columns: ['faculty_name', 'attendance_month', 'cl_availed', 'od_availed'], totalColumns: ['cl_availed', 'od_availed'] },
      { id: 'inward_letters', title: 'Inward Letters', columns: ['inward_number', 'subject', 'status'], totalColumns: [] },
      { id: 'outward_letters', title: 'Outward Letters', columns: ['outward_number', 'subject', 'status'], totalColumns: [] },
      { id: 'disciplinary_actions', title: 'Disciplinary Actions', columns: ['staff_name', 'reason_for_action', 'action_taken'], totalColumns: [] },
      { id: 'committee_meetings', title: 'Committee Meetings', columns: ['committee_name', 'coordinator_name', 'meeting_frequency', 'current_month_status'], totalColumns: [] },
      { id: 'faculty_activities', title: 'Faculty Activities & Portfolios', columns: ['faculty_name', 'department', 'portfolio', 'activities_conducted', 'month_year'], totalColumns: [] },
    ]

    // Add new page after title
    doc.addPage()

    // Fetch and add each table
    for (const config of tableConfigs) {
      const { data } = await supabase.from(config.id).select('*').order('created_at', { ascending: false })
      const records = data || []

      // Prepare table data
      const tableData = records.map(record =>
        config.columns.map(col => record[col] || '')
      )

      // Add totals row if applicable
      if (config.totalColumns.length > 0 && records.length > 0) {
        const totalsRow = config.columns.map(col => {
          if (config.totalColumns.includes(col)) {
            const sum = records.reduce((acc, r) => {
              const val = parseFloat(r[col]) || 0
              return acc + val
            }, 0)
            return sum > 0 ? sum.toLocaleString('en-IN', { maximumFractionDigits: 2 }) : ''
          }
          return col === config.columns[0] ? 'TOTAL' : ''
        })
        tableData.push(totalsRow)
      }

      // Add table to PDF with automatic page breaks
      autoTable(doc, {
        head: [config.columns.map(col => col.replace(/_/g, ' ').toUpperCase())],
        body: tableData.length > 0 ? tableData : [['No records found']],
        startY: doc.lastAutoTable ? doc.lastAutoTable.finalY + 15 : 30,
        margin: margin,
        theme: 'grid',
        didDrawPage: function() {
          // This handles automatic page breaks
        },
        headerStyles: {
          fillColor: [99, 102, 241],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          halign: 'center',
          fontSize: 8
        },
        bodyStyles: {
          textColor: [0, 0, 0],
          fontSize: 7
        },
        columnStyles: Object.fromEntries(
          config.columns.map((col, idx) => {
            if (config.totalColumns.includes(col)) {
              return [idx, { halign: 'right' }]
            }
            return [idx, {}]
          })
        ),
      })
    }

    // Save PDF
    const filename = `Monthly_Reports_Complete_${new Date().getTime()}.pdf`
    doc.save(filename)
    alert('✅ Master export completed successfully!')
  } catch (error) {
    console.error('Export error:', error)
    alert('❌ Error exporting data: ' + error.message)
  }
}

const REPORT_TABS = [
  { id: 'fees', label: 'Fees Collection', table: 'fees_collection' },
  { id: 'admission', label: 'Admission Activities', table: 'admission_activities' },
  { id: 'fdp_attended', label: 'FDP/Training Attended', table: 'fdp_training_attended' },
  { id: 'fdp_organized', label: 'FDP/Training Organized', table: 'fdp_training_organized' },
  { id: 'industrial', label: 'Industrial Visits', table: 'industrial_visits' },
  { id: 'expert', label: 'Expert Talks', table: 'expert_talks' },
  { id: 'consultancy', label: 'Consultancy', table: 'consultancy' },
  { id: 'addon', label: 'Add-on Courses', table: 'addon_courses' },
  { id: 'moocs', label: 'MOOCs/NPTEL', table: 'moocs_courses' },
  { id: 'extension', label: 'Extension Programs', table: 'extension_programs' },
  { id: 'capacity', label: 'Capacity Building', table: 'capacity_building' },
  { id: 'competitive', label: 'Competitive Guidance', table: 'competitive_guidance' },
  { id: 'interview', label: 'Interview Sessions', table: 'interview_sessions' },
  { id: 'sports', label: 'Sports/Cultural', table: 'sports_cultural_activities' },
  { id: 'alumni', label: 'Alumni Engagement', table: 'alumni_engagement' },
  { id: 'environment', label: 'Environmental', table: 'environmental_activities' },
  { id: 'constitutional', label: 'Constitutional', table: 'constitutional_programs' },
  { id: 'attendance', label: 'Faculty Attendance', table: 'faculty_attendance' },
  { id: 'inward', label: 'Inward Letters', table: 'inward_letters' },
  { id: 'outward', label: 'Outward Letters', table: 'outward_letters' },
  { id: 'disciplinary', label: 'Disciplinary Actions', table: 'disciplinary_actions' },
  { id: 'committee', label: 'Committee Meetings', table: 'committee_meetings' },
  { id: 'faculty', label: 'Faculty Activities', table: 'faculty_activities' },
]

// Generic Data Table Component
function DataTable({ columns, data, onDelete, onEdit, showTotals = false, totalColumns = [] }) {
  const calculateTotal = (colName) => {
    if (!showTotals || totalColumns.length === 0) return null
    if (!totalColumns.includes(colName)) return null
    
    const sum = data.reduce((acc, record) => {
      const val = parseFloat(record[colName]) || 0
      return acc + val
    }, 0)
    return sum > 0 ? sum : null
  }

  return (
    <div className="records-table-wrapper">
      <table className="records-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col}>{col.replace(/_/g, ' ').toUpperCase()}</th>
            ))}
            <th>ACTIONS</th>
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr><td colSpan={columns.length + 1} style={{ textAlign: 'center', padding: '20px', color: '#999' }}>No records found</td></tr>
          ) : (
            <>
              {data.map((record) => (
                <tr key={record.id}>
                  {columns.map((col) => (
                    <td key={`${record.id}-${col}`}>{String(record[col] || '-').substring(0, 30)}</td>
                  ))}
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="btn-edit-small" onClick={() => onEdit(record)}>Edit</button>
                      <button className="btn-delete-small" onClick={() => onDelete(record.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
              {showTotals && totalColumns.length > 0 && (
                <tr style={{ background: 'rgba(99, 102, 241, 0.2)', fontWeight: 'bold' }}>
                  <td style={{ color: '#fff' }}>TOTAL</td>
                  {columns.slice(1).map((col) => {
                    const total = calculateTotal(col)
                    return (
                      <td key={`total-${col}`} style={{ color: '#fff' }}>
                        {total !== null ? total.toLocaleString('en-IN', { maximumFractionDigits: 2 }) : '-'}
                      </td>
                    )
                  })}
                  <td></td>
                </tr>
              )}
            </>
          )}
        </tbody>
      </table>
    </div>
  )
}

// Fees Collection Tab
function FeesCollectionTab() {
  const [records, setRecords] = useState([])
  const [formData, setFormData] = useState({
    class: '',
    strength: '',
    total_fees_from_students: '',
    fees_collected_july: '',
    fees_remaining: '',
    month_year: new Date().toISOString().slice(0, 7),
  })
  const [loading, setLoading] = useState(false)
  const [editingId, setEditingId] = useState(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const { data } = await supabase.from('fees_collection').select('*').order('created_at', { ascending: false })
    setRecords(data || [])
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    const cleanData = {
      class: formData.class || null,
      strength: formData.strength ? parseInt(formData.strength) : null,
      total_fees_from_students: formData.total_fees_from_students ? parseFloat(formData.total_fees_from_students) : null,
      fees_collected_july: formData.fees_collected_july ? parseFloat(formData.fees_collected_july) : null,
      fees_remaining: formData.fees_remaining ? parseFloat(formData.fees_remaining) : null,
      month_year: formData.month_year
    }
    
    let error = null
    if (editingId) {
      // Update existing record
      const result = await supabase.from('fees_collection').update(cleanData).eq('id', editingId)
      error = result.error
    } else {
      // Insert new record
      const result = await supabase.from('fees_collection').insert([cleanData])
      error = result.error
    }
    
    setLoading(false)
    if (!error) {
      alert(editingId ? 'Record updated successfully!' : 'Record added successfully!')
      loadData()
      resetForm()
    } else {
      alert('Error: ' + error.message)
    }
  }

  const resetForm = () => {
    setFormData({
      class: '',
      strength: '',
      total_fees_from_students: '',
      fees_collected_july: '',
      fees_remaining: '',
      month_year: new Date().toISOString().slice(0, 7),
    })
    setEditingId(null)
  }

  const handleEdit = (record) => {
    setFormData({
      class: record.class || '',
      strength: record.strength || '',
      total_fees_from_students: record.total_fees_from_students || '',
      fees_collected_july: record.fees_collected_july || '',
      fees_remaining: record.fees_remaining || '',
      month_year: record.month_year || new Date().toISOString().slice(0, 7),
    })
    setEditingId(record.id)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id) => {
    if (confirm('Delete this record?')) {
      const { error } = await supabase.from('fees_collection').delete().eq('id', id)
      if (!error) {
        loadData()
      }
    }
  }

  const handleExport = () => {
    exportTableToPDF(
      'Fees Collection Report',
      ['class', 'strength', 'total_fees_from_students', 'fees_collected_july', 'fees_remaining', 'month_year'],
      records,
      ['strength', 'total_fees_from_students', 'fees_collected_july', 'fees_remaining']
    )
  }

  return (
    <div className="tab-section">
      <h2>{editingId ? 'Edit' : 'Add'} Fees Collection Report</h2>
      <form onSubmit={handleSubmit} className="data-form-grid">
        <input placeholder="Class (SE/DSE/TE/BE)" value={formData.class} onChange={(e) => setFormData({...formData, class: e.target.value})} required />
        <input type="number" placeholder="Strength" value={formData.strength} onChange={(e) => setFormData({...formData, strength: e.target.value})} />
        <input type="number" placeholder="Total Fees (Rs.)" value={formData.total_fees_from_students} onChange={(e) => setFormData({...formData, total_fees_from_students: e.target.value})} />
        <input type="number" placeholder="Collected (Rs.)" value={formData.fees_collected_july} onChange={(e) => setFormData({...formData, fees_collected_july: e.target.value})} />
        <input type="month" value={formData.month_year} onChange={(e) => setFormData({...formData, month_year: e.target.value})} />
        <button type="submit" className="submit-btn" disabled={loading}>{loading ? (editingId ? 'Updating...' : 'Adding...') : (editingId ? 'Update Record' : 'Add Record')}</button>
        {editingId && <button type="button" className="submit-btn btn-cancel-form" onClick={resetForm}>Cancel Edit</button>}
      </form>
      <h3 style={{ marginTop: '2rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>Records</span>
        <button className="btn-export" onClick={handleExport}>📥 Export to PDF</button>
      </h3>
      <DataTable 
        columns={['class', 'strength', 'total_fees_from_students', 'fees_collected_july', 'fees_remaining', 'month_year']} 
        data={records} 
        onDelete={handleDelete} 
        onEdit={handleEdit} 
        showTotals={true}
        totalColumns={['strength', 'total_fees_from_students', 'fees_collected_july', 'fees_remaining']}
      />
    </div>
  )
}

// Admission Activities Tab
function AdmissionActivitiesTab() {
  const [records, setRecords] = useState([])
  const [formData, setFormData] = useState({
    faculty_name: '',
    task_assigned: '',
    status: 'In Progress',
    month_year: new Date().toISOString().slice(0, 7),
  })
  const [loading, setLoading] = useState(false)
  const [editingId, setEditingId] = useState(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const { data } = await supabase.from('admission_activities').select('*').order('created_at', { ascending: false })
    setRecords(data || [])
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    let error = null
    if (editingId) {
      const result = await supabase.from('admission_activities').update(formData).eq('id', editingId)
      error = result.error
    } else {
      const result = await supabase.from('admission_activities').insert([formData])
      error = result.error
    }
    setLoading(false)
    if (!error) {
      alert(editingId ? 'Record updated successfully!' : 'Record added successfully!')
      loadData()
      resetForm()
    } else {
      alert('Error: ' + error.message)
    }
  }

  const resetForm = () => {
    setFormData({ faculty_name: '', task_assigned: '', status: 'In Progress', month_year: new Date().toISOString().slice(0, 7) })
    setEditingId(null)
  }

  const handleEdit = (record) => {
    setFormData({
      faculty_name: record.faculty_name || '',
      task_assigned: record.task_assigned || '',
      status: record.status || 'In Progress',
      month_year: record.month_year || new Date().toISOString().slice(0, 7),
    })
    setEditingId(record.id)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id) => {
    if (confirm('Delete this record?')) {
      const { error } = await supabase.from('admission_activities').delete().eq('id', id)
      if (!error) {
        loadData()
      }
    }
  }

  const handleExport = () => {
    exportTableToPDF(
      'Admission Activities Report',
      ['faculty_name', 'task_assigned', 'status', 'month_year'],
      records,
      []
    )
  }

  return (
    <div className="tab-section">
      <h2>{editingId ? 'Edit' : 'Add'} Admission Activities</h2>
      <form onSubmit={handleSubmit} className="data-form-grid">
        <input placeholder="Faculty Name" value={formData.faculty_name} onChange={(e) => setFormData({...formData, faculty_name: e.target.value})} required />
        <input placeholder="Task Assigned" value={formData.task_assigned} onChange={(e) => setFormData({...formData, task_assigned: e.target.value})} />
        <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})}>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
          <option value="Pending">Pending</option>
        </select>
        <input type="month" value={formData.month_year} onChange={(e) => setFormData({...formData, month_year: e.target.value})} />
        <button type="submit" className="submit-btn" disabled={loading}>{loading ? (editingId ? 'Updating...' : 'Adding...') : (editingId ? 'Update Record' : 'Add Record')}</button>
        {editingId && <button type="button" className="submit-btn btn-cancel-form" onClick={resetForm}>Cancel Edit</button>}
      </form>
      <h3 style={{ marginTop: '2rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>Records</span>
        <button className="btn-export" onClick={handleExport}>📥 Export to PDF</button>
      </h3>
      <DataTable columns={['faculty_name', 'task_assigned', 'status', 'month_year']} data={records} onDelete={handleDelete} onEdit={handleEdit} />
    </div>
  )
}

// Generic Tab Component
function GenericTab({ title, tableName, columns }) {
  const [records, setRecords] = useState([])
  const [formData, setFormData] = useState({})
  const [loading, setLoading] = useState(false)
  const [editingId, setEditingId] = useState(null)

  useEffect(() => {
    // Initialize form data
    const initialForm = {}
    columns.forEach(col => { initialForm[col] = '' })
    // Only add month_year if it's in the columns
    if (columns.includes('month_year')) {
      initialForm.month_year = new Date().toISOString().slice(0, 7)
    }
    setFormData(initialForm)
    loadData()
  }, [tableName])

  const loadData = async () => {
    const { data } = await supabase.from(tableName).select('*').order('created_at', { ascending: false })
    setRecords(data || [])
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    // Clean data: convert empty strings to null
    const cleanData = {}
    Object.keys(formData).forEach(key => {
      const value = formData[key]
      if (value === '' || value === undefined) {
        cleanData[key] = null
      } else if (!isNaN(value) && value !== null && value !== '') {
        // Try to parse as number if it looks numeric
        cleanData[key] = isNaN(parseInt(value)) ? parseFloat(value) : parseInt(value)
      } else {
        cleanData[key] = value
      }
    })
    
    let error = null
    if (editingId) {
      const result = await supabase.from(tableName).update(cleanData).eq('id', editingId)
      error = result.error
    } else {
      const result = await supabase.from(tableName).insert([cleanData])
      error = result.error
    }
    
    setLoading(false)
    if (!error) {
      alert(editingId ? 'Record updated successfully!' : 'Record added successfully!')
      loadData()
      resetForm()
    } else {
      alert('Error: ' + error.message)
    }
  }

  const resetForm = () => {
    const resetData = {}
    columns.forEach(col => { resetData[col] = '' })
    if (columns.includes('month_year')) {
      resetData.month_year = new Date().toISOString().slice(0, 7)
    }
    setFormData(resetData)
    setEditingId(null)
  }

  const handleEdit = (record) => {
    const editData = {}
    columns.forEach(col => { editData[col] = record[col] || '' })
    if (columns.includes('month_year')) {
      editData.month_year = record.month_year || new Date().toISOString().slice(0, 7)
    }
    setFormData(editData)
    setEditingId(record.id)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id) => {
    if (confirm('Delete this record?')) {
      const { error } = await supabase.from(tableName).delete().eq('id', id)
      if (!error) {
        loadData()
      }
    }
  }

  const handleExport = () => {
    exportTableToPDF(
      title,
      columns,
      records,
      []
    )
  }

  return (
    <div className="tab-section">
      <h2>{editingId ? 'Edit' : 'Add'} {title}</h2>
      <form onSubmit={handleSubmit} className="data-form-grid">
        {columns.map(col => (
          <input 
            key={col} 
            placeholder={col.replace(/_/g, ' ').toUpperCase()} 
            value={formData[col] || ''} 
            onChange={(e) => setFormData({...formData, [col]: e.target.value})} 
          />
        ))}
        {columns.includes('month_year') && (
          <input type="month" value={formData.month_year || ''} onChange={(e) => setFormData({...formData, month_year: e.target.value})} />
        )}
        <button type="submit" className="submit-btn" disabled={loading}>{loading ? (editingId ? 'Updating...' : 'Adding...') : (editingId ? 'Update Record' : 'Add Record')}</button>
        {editingId && <button type="button" className="submit-btn btn-cancel-form" onClick={resetForm}>Cancel Edit</button>}
      </form>
      <h3 style={{ marginTop: '2rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>Records</span>
        <button className="btn-export" onClick={handleExport}>📥 Export to PDF</button>
      </h3>
      <DataTable columns={columns} data={records} onDelete={handleDelete} onEdit={handleEdit} />
    </div>
  )
}

export default function AdminDataManagement() {
  const [activeTab, setActiveTab] = useState('fees')

  return (
    <div className="monthly-reports-section">
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>Monthly Reports</h2>
        <button 
          className="btn-export" 
          onClick={exportAllTablesToPDF}
          style={{ 
            backgroundColor: '#ec4899', 
            padding: '10px 20px',
            fontSize: '16px',
            fontWeight: 'bold'
          }}
        >
          📥 Export All Tables (Master PDF)
        </button>
      </div>

      <div className="reports-nav-tabs">
        {REPORT_TABS.map((tab) => (
          <button
            key={tab.id}
            className={`reports-nav-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="reports-content">
        {activeTab === 'fees' && <FeesCollectionTab />}
        {activeTab === 'admission' && <AdmissionActivitiesTab />}
        {activeTab === 'fdp_attended' && <GenericTab title="FDP/Training Attended" tableName="fdp_training_attended" columns={['faculty_name', 'title', 'type']} />}
        {activeTab === 'fdp_organized' && <GenericTab title="FDP/Training Organized" tableName="fdp_training_organized" columns={['convener_name', 'title', 'type', 'number_of_participants']} />}
        {activeTab === 'industrial' && <GenericTab title="Industrial Visits" tableName="industrial_visits" columns={['company_industry_name', 'class_division', 'number_of_students']} />}
        {activeTab === 'expert' && <GenericTab title="Expert Talks/Guest Lectures" tableName="expert_talks" columns={['expert_name', 'topic', 'session_type', 'student_strength']} />}
        {activeTab === 'consultancy' && <GenericTab title="Consultancy" tableName="consultancy" columns={['organization_name', 'amount_fetched']} />}
        {activeTab === 'addon' && <GenericTab title="Add-on/Value-Added Courses" tableName="addon_courses" columns={['course_name', 'number_of_students', 'duration_hours']} />}
        {activeTab === 'moocs' && <GenericTab title="MOOCs/SWAYAM/NPTEL" tableName="moocs_courses" columns={['course_name', 'platform', 'number_of_students']} />}
        {activeTab === 'extension' && <GenericTab title="Extension & Outreach Programs" tableName="extension_programs" columns={['program_name', 'number_of_students']} />}
        {activeTab === 'capacity' && <GenericTab title="Capacity Building & Skills Enhancement" tableName="capacity_building" columns={['program_name', 'program_type', 'expert_name', 'student_strength']} />}
        {activeTab === 'competitive' && <GenericTab title="Guidance for Competitive Exams" tableName="competitive_guidance" columns={['program_name', 'expert_name', 'student_strength']} />}
        {activeTab === 'interview' && <GenericTab title="Interview Preparation Sessions" tableName="interview_sessions" columns={['session_type', 'expert_name', 'student_strength']} />}
        {activeTab === 'sports' && <GenericTab title="Sports/Cultural Activities" tableName="sports_cultural_activities" columns={['activity_name', 'activity_type', 'level', 'student_strength']} />}
        {activeTab === 'alumni' && <GenericTab title="Alumni Engagement Programs" tableName="alumni_engagement" columns={['program_name', 'activity_conducted', 'alumni_strength']} />}
        {activeTab === 'environment' && <GenericTab title="Environmental Promotion Activities" tableName="environmental_activities" columns={['program_name', 'activity_conducted', 'student_strength', 'location']} />}
        {activeTab === 'constitutional' && <GenericTab title="Constitutional Sensitization Programs" tableName="constitutional_programs" columns={['program_name', 'activity_conducted', 'participants_count']} />}
        {activeTab === 'attendance' && <GenericTab title="Faculty Attendance" tableName="faculty_attendance" columns={['faculty_name', 'attendance_month', 'cl_availed', 'od_availed']} />}
        {activeTab === 'inward' && <GenericTab title="Inward Letters" tableName="inward_letters" columns={['inward_number', 'subject', 'status']} />}
        {activeTab === 'outward' && <GenericTab title="Outward Letters" tableName="outward_letters" columns={['outward_number', 'subject', 'status']} />}
        {activeTab === 'disciplinary' && <GenericTab title="Disciplinary Actions" tableName="disciplinary_actions" columns={['staff_name', 'reason_for_action', 'action_taken']} />}
        {activeTab === 'committee' && <GenericTab title="Committee Meetings" tableName="committee_meetings" columns={['committee_name', 'coordinator_name', 'meeting_frequency', 'current_month_status']} />}
        {activeTab === 'faculty' && <GenericTab title="Faculty Activities & Portfolios" tableName="faculty_activities" columns={['faculty_name', 'department', 'portfolio', 'activities_conducted']} />}
      </div>
    </div>
  )
}
