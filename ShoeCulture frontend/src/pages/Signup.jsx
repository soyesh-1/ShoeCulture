import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { request } from '../utils/api.js'
import '../styles/Auth.css'

function Signup() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)
    try {
      await request('/auth/register', {
        method: 'POST',
        body: JSON.stringify(form),
      })
      localStorage.setItem('pendingEmail', form.email)
      setMessage('OTP sent to your email. Verify to continue.')
      navigate('/verify-email')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth">
      <div className="auth-card">
        <h1>Create account</h1>
        <p>Use a strong password with symbols, numbers, and uppercase.</p>
        <form onSubmit={handleSubmit}>
          <label>
            Email
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Password
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </label>
          {error ? <div className="error">{error}</div> : null}
          {message ? <div className="success">{message}</div> : null}
          <button className="solid" type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create account'}
          </button>
        </form>
        <p className="auth-foot">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  )
}

export default Signup
