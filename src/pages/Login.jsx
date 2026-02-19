import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import './Login.css'

const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'pass@123',
}

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
      localStorage.setItem('adminLoggedIn', 'true')
      navigate('/admin')
      return
    }

    setLoading(true)
    const { data, error: rpcError } = await supabase.rpc('login_user', {
      uname: username,
      pwd: password,
    })
    setLoading(false)

    if (rpcError) {
      setError(rpcError.message || 'Login failed')
      return
    }

    if (data && data.ok === true && data.username) {
      localStorage.setItem('userId', data.id)
      localStorage.setItem('userRole', data.role)
      localStorage.setItem('userUsername', data.username)
      if (data.role === 'student') navigate('/student')
      else if (data.role === 'staff') navigate('/staff')
      return
    }

    if (data && data.reason === 'deactivated') {
      setError('Your account has been deactivated. Contact admin.')
      return
    }

    setError('Invalid username or password')
  }

  return (
    <div className="login-container">
      {/* Cinematic animated background layers */}
      <div className="login-bg-gradient" />
      <motion.div
        className="login-orbit login-orbit-1"
        animate={{ x: ['-5%', '5%', '-5%'], y: ['-5%', '5%', '-5%'] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="login-orbit login-orbit-2"
        animate={{ x: ['5%', '-5%', '5%'], y: ['10%', '-10%', '10%'] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
      />

      <motion.div
        className="login-hero"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: 'easeOut' }}
      >
        <h1 className="login-title">College Staff Portal</h1>
        <p className="login-tagline">
          Manage classes, subjects, and syllabus progress with a cinematic dashboard built
          for staff and students.
        </p>
      </motion.div>

      <motion.div
        className="login-card"
        initial={{ opacity: 0, y: 60, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
      >
        <h2>Sign in</h2>
        <p className="login-subtitle">Admin, Staff, and Student access</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              autoComplete="username"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              autoComplete="current-password"
              required
            />
          </div>
          {error && <p className="error">{error}</p>}
          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </motion.div>
    </div>
  )
}
