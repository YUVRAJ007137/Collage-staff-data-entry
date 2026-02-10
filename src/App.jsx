import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './lib/supabase'
import Login from './pages/Login'
import AdminPanel from './pages/AdminPanel'
import StaffAssignment from './pages/StaffAssignment'
import ProgressReport from './pages/ProgressReport'
import StudentPage from './pages/StudentPage'
import StaffPage from './pages/StaffPage'
import SubjectProgressForm from './pages/SubjectProgressForm'

function AdminRoute({ children }) {
  const isLoggedIn = localStorage.getItem('adminLoggedIn') === 'true'
  return isLoggedIn ? children : <Navigate to="/" replace />
}

function UserRoute({ children, role }) {
  const userRole = localStorage.getItem('userRole')
  const username = localStorage.getItem('userUsername')
  const [active, setActive] = useState(null)

  useEffect(() => {
    if (!username || userRole !== role) return
    supabase.rpc('get_user_active_status', { uname: username }).then(({ data }) => {
      setActive(data === true)
    })
  }, [username, role, userRole])

  if (!username || userRole !== role) return <Navigate to="/" replace />
  if (active === false) {
    localStorage.removeItem('userId')
    localStorage.removeItem('userRole')
    localStorage.removeItem('userUsername')
    return <Navigate to="/" replace />
  }
  if (active === null) return <div className="route-loading">Verifying access...</div>

  return children
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/admin" element={<AdminRoute><AdminPanel /></AdminRoute>} />
        <Route path="/admin/staff-assignments" element={<AdminRoute><StaffAssignment /></AdminRoute>} />
        <Route path="/admin/progress-report" element={<AdminRoute><ProgressReport /></AdminRoute>} />
        <Route
          path="/student"
          element={
            <UserRoute role="student">
              <StudentPage />
            </UserRoute>
          }
        />
        <Route path="/staff" element={<UserRoute role="staff"><StaffPage /></UserRoute>} />
        <Route path="/staff/subject/:subjectId" element={<UserRoute role="staff"><SubjectProgressForm /></UserRoute>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
