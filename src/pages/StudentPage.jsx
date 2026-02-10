import { useNavigate } from 'react-router-dom'
import './StudentPage.css'

export default function StudentPage() {
  const navigate = useNavigate()
  const username = localStorage.getItem('userUsername') || 'Student'

  const handleLogout = () => {
    localStorage.removeItem('userId')
    localStorage.removeItem('userRole')
    localStorage.removeItem('userUsername')
    navigate('/')
  }

  return (
    <div className="role-page student-page">
      <header className="role-header">
        <h1>Student Portal</h1>
        <div className="role-header-right">
          <span className="user-name">Welcome, {username}</span>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </header>
      <main className="role-content">
        <div className="role-welcome">
          <h2>Student Dashboard</h2>
          <p>You are logged in as a student. Your content and features will appear here.</p>
        </div>
      </main>
    </div>
  )
}
