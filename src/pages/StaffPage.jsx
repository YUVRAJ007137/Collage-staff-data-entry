import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import './StaffPage.css'

const CLASS_LABELS = { fe: 'FE', se: 'SE', te: 'TE', be: 'BE' }

export default function StaffPage() {
  const navigate = useNavigate()
  const username = localStorage.getItem('userUsername') || 'Staff'
  const staffId = localStorage.getItem('userId')
  const [subjects, setSubjects] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!staffId) {
      setLoading(false)
      return
    }
    const fetchSubjects = async () => {
      const { data } = await supabase
        .from('staff_subject_assignments')
        .select('subjects(id, name, class)')
        .eq('staff_id', staffId)
      const list = (data || [])
        .map((r) => r.subjects)
        .filter(Boolean)
      setSubjects(list)
      setLoading(false)
    }
    fetchSubjects()
  }, [staffId])

  const handleLogout = () => {
    localStorage.removeItem('userId')
    localStorage.removeItem('userRole')
    localStorage.removeItem('userUsername')
    navigate('/')
  }

  const handleSubjectClick = (subject) => {
    navigate(`/staff/subject/${subject.id}`)
  }

  return (
    <div className="role-page staff-page">
      <header className="role-header">
        <h1>Staff Portal</h1>
        <div className="role-header-right">
          <span className="user-name">Welcome, {username}</span>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </header>
      <main className="role-content">
        <h2>My Subjects</h2>
        {loading ? (
          <p className="staff-loading">Loading...</p>
        ) : subjects.length === 0 ? (
          <p className="staff-empty">No subjects assigned yet. Contact admin.</p>
        ) : (
          <div className="subject-boxes">
            {subjects.map((subject) => (
              <div
                key={subject.id}
                className="subject-box"
                onClick={() => handleSubjectClick(subject)}
              >
                <h3>{subject.name}</h3>
                <span className="subject-class">{CLASS_LABELS[subject.class] || subject.class}</span>
                <span className="subject-box-hint">Click to fill progress</span>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
