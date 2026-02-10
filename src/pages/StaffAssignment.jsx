import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import './StaffAssignment.css'

const CLASS_LABELS = { fe: 'FE (First Year)', se: 'SE (Second Year)', te: 'TE (Third Year)', be: 'BE (Fourth Year)' }

export default function StaffAssignment() {
  const navigate = useNavigate()
  const [staffList, setStaffList] = useState([])
  const [subjects, setSubjects] = useState([])
  const [assignments, setAssignments] = useState([])
  const [loading, setLoading] = useState(true)
  const [newSubjectName, setNewSubjectName] = useState('')
  const [newSubjectClass, setNewSubjectClass] = useState('fe')
  const [selectedStaff, setSelectedStaff] = useState(null)
  const [assignSubjectId, setAssignSubjectId] = useState('')

  const fetchData = async () => {
    const [staffRes, subjRes, assignRes] = await Promise.all([
      supabase.from('app_users').select('id, username').eq('role', 'staff'),
      supabase.from('subjects').select('id, name, class').order('class').order('name'),
      supabase.from('staff_subject_assignments').select('id, staff_id, subject_id')
    ])
    if (!staffRes.error) setStaffList(staffRes.data || [])
    if (!subjRes.error) setSubjects(subjRes.data || [])
    if (!assignRes.error) setAssignments(assignRes.data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleBack = () => navigate('/admin')

  const handleAddSubject = async (e) => {
    e.preventDefault()
    if (!newSubjectName.trim()) return
    const { error } = await supabase.from('subjects').insert({ name: newSubjectName.trim(), class: newSubjectClass })
    if (!error) {
      setNewSubjectName('')
      fetchData()
    } else {
      alert(error.message)
    }
  }

  const handleAssignSubject = async (e) => {
    e.preventDefault()
    if (!selectedStaff || !assignSubjectId) return
    const { error } = await supabase.from('staff_subject_assignments').insert({ staff_id: selectedStaff.id, subject_id: assignSubjectId })
    if (!error) {
      setAssignSubjectId('')
      fetchData()
    } else {
      alert(error.message)
    }
  }

  const handleRemoveAssignment = async (assignmentId) => {
    if (!confirm('Remove this assignment?')) return
    const { error } = await supabase.from('staff_subject_assignments').delete().eq('id', assignmentId)
    if (!error) fetchData()
  }

  const getStaffAssignments = (staffId) => {
    return assignments
      .filter((a) => a.staff_id === staffId)
      .map((a) => subjects.find((s) => s.id === a.subject_id))
      .filter(Boolean)
  }

  const getAssignmentId = (staffId, subjectId) => {
    return assignments.find((a) => a.staff_id === staffId && a.subject_id === subjectId)?.id
  }

  const subjectsByClass = subjects.reduce((acc, s) => {
    if (!acc[s.class]) acc[s.class] = []
    acc[s.class].push(s)
    return acc
  }, {})

  return (
    <div className="staff-assignment-page">
      <header className="sa-header">
        <button onClick={handleBack} className="btn-back">← Back to Admin</button>
        <h1>Staff & Subject Assignment</h1>
      </header>
      <main className="sa-content">
        {loading ? (
          <p className="sa-loading">Loading...</p>
        ) : (
          <>
            <section className="sa-section">
              <h2>Add Subject</h2>
              <form onSubmit={handleAddSubject} className="add-subject-form">
                <input
                  type="text"
                  placeholder="Subject name"
                  value={newSubjectName}
                  onChange={(e) => setNewSubjectName(e.target.value)}
                />
                <select value={newSubjectClass} onChange={(e) => setNewSubjectClass(e.target.value)}>
                  <option value="fe">FE (First Year)</option>
                  <option value="se">SE (Second Year)</option>
                  <option value="te">TE (Third Year)</option>
                  <option value="be">BE (Fourth Year)</option>
                </select>
                <button type="submit">Add Subject</button>
              </form>
            </section>

            <section className="sa-section">
              <h2>Subjects by Class</h2>
              <div className="subjects-by-class">
                {['fe', 'se', 'te', 'be'].map((cls) => (
                  <div key={cls} className="class-subjects">
                    <h4>{CLASS_LABELS[cls]}</h4>
                    <ul>
                      {(subjectsByClass[cls] || []).map((s) => (
                        <li key={s.id}>{s.name}</li>
                      ))}
                      {(subjectsByClass[cls] || []).length === 0 && <li className="empty">No subjects</li>}
                    </ul>
                  </div>
                ))}
              </div>
            </section>

            <section className="sa-section">
              <h2>Staff List & Assignments</h2>
              <div className="staff-grid">
                {staffList.map((staff) => (
                  <div key={staff.id} className="staff-card">
                    <div className="staff-card-header">
                      <h3>{staff.username}</h3>
                      <button
                        className="btn-select"
                        onClick={() => setSelectedStaff(selectedStaff?.id === staff.id ? null : staff)}
                      >
                        {selectedStaff?.id === staff.id ? 'Cancel' : 'Assign Subject'}
                      </button>
                    </div>
                    <div className="assigned-subjects">
                      <strong>Assigned:</strong>
                      {getStaffAssignments(staff.id).length === 0 ? (
                        <span className="none">None</span>
                      ) : (
                        <ul>
                          {getStaffAssignments(staff.id).map((s) => (
                            <li key={s.id}>
                              {s.name} ({CLASS_LABELS[s.class]})
                              <button className="btn-remove" onClick={() => handleRemoveAssignment(getAssignmentId(staff.id, s.id))}>×</button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    {selectedStaff?.id === staff.id && (
                      <form onSubmit={handleAssignSubject} className="assign-form">
                        <select value={assignSubjectId} onChange={(e) => setAssignSubjectId(e.target.value)} required>
                          <option value="">Select subject</option>
                          {subjects.map((s) => (
                            <option key={s.id} value={s.id}>{s.name} - {CLASS_LABELS[s.class]}</option>
                          ))}
                        </select>
                        <button type="submit">Assign</button>
                      </form>
                    )}
                  </div>
                ))}
              </div>
              {staffList.length === 0 && <p className="sa-empty">No staff users. Create staff in Admin Panel.</p>}
            </section>
          </>
        )}
      </main>
    </div>
  )
}
