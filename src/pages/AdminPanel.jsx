import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import './AdminPanel.css'

export default function AdminPanel() {
  const navigate = useNavigate()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [createUsername, setCreateUsername] = useState('')
  const [createPassword, setCreatePassword] = useState('')
  const [createRole, setCreateRole] = useState('student')
  const [createClass, setCreateClass] = useState('fe')
  const [createMessage, setCreateMessage] = useState({ type: '', text: '' })
  const [editUser, setEditUser] = useState(null)
  const [editUsername, setEditUsername] = useState('')
  const [editPassword, setEditPassword] = useState('')
  const [editClass, setEditClass] = useState('fe')

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from('app_users')
      .select('id, username, role, active, class, created_at')
      .order('created_at', { ascending: false })
    if (!error) setUsers(data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('adminLoggedIn')
    navigate('/')
  }

  const handleCreateUser = async (e) => {
    e.preventDefault()
    setCreateMessage({ type: '', text: '' })
    if (!createUsername.trim() || !createPassword.trim()) {
      setCreateMessage({ type: 'error', text: 'Username and password are required' })
      return
    }
    const insertData = { username: createUsername.trim(), password: createPassword, role: createRole }
    if (createRole === 'student') insertData.class = createClass
    const { error } = await supabase.from('app_users').insert(insertData)
    if (error) {
      setCreateMessage({ type: 'error', text: error.message || 'Failed to create user' })
      return
    }
    setCreateMessage({ type: 'success', text: `User "${createUsername}" created as ${createRole}` })
    setCreateUsername('')
    setCreatePassword('')
    fetchUsers()
  }

  const openEditModal = (user) => {
    setEditUser(user)
    setEditUsername(user.username)
    setEditPassword('')
    if (user.role === 'student') {
      setEditClass(user.class || 'fe')
    }
  }

  const closeEditModal = () => {
    setEditUser(null)
    setEditUsername('')
    setEditPassword('')
  }

  const handleEditUser = async (e) => {
    e.preventDefault()
    if (!editUser) return
    if (!editUsername.trim()) return
    const updates = { username: editUsername.trim() }
    if (editUser.role === 'student') {
      updates.class = editClass
    }
    if (editPassword.trim()) updates.password = editPassword
    const { error } = await supabase.from('app_users').update(updates).eq('id', editUser.id)
    if (error) {
      alert(error.message || 'Failed to update user')
      return
    }
    closeEditModal()
    fetchUsers()
  }

  const handleToggleActive = async (user) => {
    const { error } = await supabase
      .from('app_users')
      .update({ active: !user.active })
      .eq('id', user.id)
    if (!error) fetchUsers()
  }

  const handleDeleteUser = async (user) => {
    if (!confirm(`Delete user "${user.username}"?`)) return
    const { error } = await supabase.from('app_users').delete().eq('id', user.id)
    if (!error) fetchUsers()
  }

  return (
    <div className="admin-panel">
      <header className="admin-header">
        <h1>Admin Panel</h1>
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </header>
      <main className="admin-content">
        <div className="feature-grid">
          <div className="feature-box">
            <h3>Create User</h3>
            <p>Create a new student or staff account with username and password.</p>
            <form onSubmit={handleCreateUser} className="create-user-form">
              <input
                type="text"
                placeholder="Username"
                value={createUsername}
                onChange={(e) => setCreateUsername(e.target.value)}
              />
              <input
                type="password"
                placeholder="Password"
                value={createPassword}
                onChange={(e) => setCreatePassword(e.target.value)}
              />
              <select value={createRole} onChange={(e) => setCreateRole(e.target.value)}>
                <option value="student">Student</option>
                <option value="staff">Staff</option>
              </select>
              {createRole === 'student' && (
                <select value={createClass} onChange={(e) => setCreateClass(e.target.value)}>
                  <option value="fe">FE (First Year)</option>
                  <option value="se">SE (Second Year)</option>
                  <option value="te">TE (Third Year)</option>
                  <option value="be">BE (Fourth Year)</option>
                </select>
              )}
              <button type="submit">Create User</button>
            </form>
            {createMessage.text && (
              <p className={`create-message ${createMessage.type}`}>{createMessage.text}</p>
            )}
          </div>

          <div className="feature-box feature-box-clickable" onClick={() => navigate('/admin/staff-assignments')}>
            <h3>Staff & Subject Assignment</h3>
            <p>Assign subjects to staff for FE, SE, TE, BE classes.</p>
            <span className="feature-link">Click to open →</span>
          </div>

          <div className="feature-box feature-box-clickable" onClick={() => navigate('/admin/progress-report')}>
            <h3>Combined Progress Report</h3>
            <p>View all subject progress data filled by staff in one table.</p>
            <span className="feature-link">Click to open →</span>
          </div>

          <div className="feature-box feature-box-full">
            <h3>User List</h3>
            <p>Manage users: edit, activate/deactivate, or delete.</p>
            {loading ? (
              <p className="user-list-loading">Loading...</p>
            ) : users.length === 0 ? (
              <p className="user-list-empty">No users yet. Create one above.</p>
            ) : (
              <div className="user-table-wrapper">
                <table className="user-table">
                  <thead>
                    <tr>
                      <th>Username</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td>{user.username}</td>
                        <td><span className={`role-badge role-${user.role}`}>{user.role}</span></td>
                        <td>
                          <span className={`status-badge status-${user.active ? 'active' : 'inactive'}`}>
                            {user.active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button className="btn-edit" onClick={() => openEditModal(user)} title="Edit">Edit</button>
                            <button
                              className="btn-toggle"
                              onClick={() => handleToggleActive(user)}
                              title={user.active ? 'Deactivate' : 'Activate'}
                            >
                              {user.active ? 'Deactivate' : 'Activate'}
                            </button>
                            <button className="btn-delete" onClick={() => handleDeleteUser(user)} title="Delete">Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>

      {editUser && (
        <div className="modal-overlay" onClick={closeEditModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Edit User</h3>
            <form onSubmit={handleEditUser} className="edit-user-form">
              <div className="form-group">
                <label>Username</label>
                <input
                  type="text"
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  required
                />
              </div>
              {editUser.role === 'student' && (
                <div className="form-group">
                  <label>Class (Year)</label>
                  <select value={editClass} onChange={(e) => setEditClass(e.target.value)}>
                    <option value="fe">FE (First Year)</option>
                    <option value="se">SE (Second Year)</option>
                    <option value="te">TE (Third Year)</option>
                    <option value="be">BE (Fourth Year)</option>
                  </select>
                </div>
              )}
              <div className="form-group">
                <label>New Password (leave blank to keep current)</label>
                <input
                  type="password"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={closeEditModal}>Cancel</button>
                <button type="submit" className="btn-save">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
