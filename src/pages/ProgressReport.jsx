import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { supabase } from '../lib/supabase'
import './ProgressReport.css'

const CLASS_LABELS = { fe: 'FE', se: 'SE', te: 'TE', be: 'BE' }
const CLASS_ORDER = ['fe', 'se', 'te', 'be']

export default function ProgressReport() {
  const navigate = useNavigate()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from('staff_subject_progress')
        .select(`
          target_sem, lectures_planned_month, lectures_conducted_month, lectures_cumulative,
          syllabus_completed_month, syllabus_cumulative, practical_total, practical_completed,
          assignments_till_date, assignments_out_of,
          subjects(id, name, class),
          app_users(username)
        `)
      if (!error && data) {
        const list = data.map((r) => ({
          ...r,
          subjectName: r.subjects?.name || '-',
          subjectClass: r.subjects?.class || '',
          facultyName: r.app_users?.username || '-',
        }))
        list.sort((a, b) => {
          const ac = CLASS_ORDER.indexOf(a.subjectClass)
          const bc = CLASS_ORDER.indexOf(b.subjectClass)
          if (ac !== bc) return ac - bc
          return (a.subjectName || '').localeCompare(b.subjectName || '')
        })
        setRows(list)
      }
      setLoading(false)
    }
    fetchData()
  }, [])

  const num = (v) => (v == null || v === '' ? 0 : parseFloat(v) || 0)
  const pct = (r) => (num(r.target_sem) ? Math.round((num(r.lectures_conducted_month) / num(r.target_sem)) * 100) : 0)

  const handleBack = () => navigate('/admin')

  const handleExportPDF = () => {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
    doc.setFontSize(14)
    doc.text('Combined Progress Report', 14, 15)
    doc.setFontSize(10)

    const head = [
      ['SR', 'Class', 'Subject', 'Faculty', 'Target/SEM', 'Planned', 'Conducted', 'Cumul.', '%', 'Syllabus %', 'Syll. Cumul.', 'Pract. Total', 'Pract. Done', 'Assignments'],
    ]
    const body = rows.map((r, i) => [
      i + 1,
      CLASS_LABELS[r.subjectClass] || r.subjectClass,
      r.subjectName,
      r.facultyName,
      r.target_sem ?? '-',
      r.lectures_planned_month ?? '-',
      r.lectures_conducted_month ?? '-',
      r.lectures_cumulative ?? '-',
      `${pct(r)}%`,
      r.syllabus_completed_month != null ? `${r.syllabus_completed_month}%` : '-',
      r.syllabus_cumulative != null ? `${r.syllabus_cumulative}%` : '-',
      r.practical_total != null && r.practical_total > 0 ? String(r.practical_total) : 'NA',
      r.practical_completed != null && r.practical_total > 0 ? String(r.practical_completed) : 'NA',
      num(r.assignments_out_of) > 0 ? `${r.assignments_till_date ?? 0} / ${r.assignments_out_of}` : '-',
    ])

    autoTable(doc, {
      head,
      body,
      startY: 22,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [99, 102, 241] },
    })

    doc.save('progress-report.pdf')
  }

  return (
    <div className="progress-report-page">
      <header className="pr-header">
        <div className="pr-header-top">
          <button onClick={handleBack} className="btn-back">← Back to Admin</button>
          <h1>Combined Progress Report</h1>
        </div>
        {rows.length > 0 && (
          <button onClick={handleExportPDF} className="btn-export-pdf">Export PDF</button>
        )}
      </header>
      <main className="pr-content">
        {loading ? (
          <p className="pr-loading">Loading...</p>
        ) : rows.length === 0 ? (
          <p className="pr-empty">No progress data yet. Staff need to fill their subject progress.</p>
        ) : (
          <div className="pr-table-wrapper">
            <table className="progress-table">
              <thead>
                <tr>
                  <th>SR No</th>
                  <th>Class</th>
                  <th>Sub (Subject)</th>
                  <th>Faculty Name</th>
                  <th colSpan={4}>No. of Lectures</th>
                  <th colSpan={3}>% Syllabus Covered</th>
                  <th colSpan={2}>Practical</th>
                  <th>Assignments till Date/ out of</th>
                </tr>
                <tr className="sub-headers">
                  <th></th>
                  <th></th>
                  <th></th>
                  <th></th>
                  <th>Target / SEM</th>
                  <th>Planned in Month</th>
                  <th>Conducted in Month</th>
                  <th>Cumulative Completed</th>
                  <th>%</th>
                  <th>Completed in Month</th>
                  <th>Cumulative Completed</th>
                  <th>Total</th>
                  <th>Completed</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i}>
                    <td>{i + 1}</td>
                    <td>{CLASS_LABELS[r.subjectClass] || r.subjectClass}</td>
                    <td>{r.subjectName}</td>
                    <td>{r.facultyName}</td>
                    <td>{r.target_sem ?? '-'}</td>
                    <td>{r.lectures_planned_month ?? '-'}</td>
                    <td>{r.lectures_conducted_month ?? '-'}</td>
                    <td>{r.lectures_cumulative ?? '-'}</td>
                    <td>{pct(r)}%</td>
                    <td>{r.syllabus_completed_month != null ? `${r.syllabus_completed_month}%` : '-'}</td>
                    <td>{r.syllabus_cumulative != null ? `${r.syllabus_cumulative}%` : '-'}</td>
                    <td>{r.practical_total != null && r.practical_total > 0 ? r.practical_total : 'NA'}</td>
                    <td>{r.practical_completed != null && r.practical_total > 0 ? r.practical_completed : 'NA'}</td>
                    <td>
                      {num(r.assignments_out_of) > 0
                        ? `${r.assignments_till_date ?? 0} / ${r.assignments_out_of}`
                        : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  )
}
