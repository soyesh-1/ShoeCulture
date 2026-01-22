import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { request } from '../utils/api.js'
import '../styles/Auth.css'

function Login() {
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
      const data = await request('/auth/login', {
        method: 'POST',
        body: JSON.stringify(form),
      })
      if (data.mfaRequired) {
        localStorage.setItem('pendingEmail', form.email)
        navigate('/mfa')
      } else {
        setMessage('Logged in.')
      }
    } catch (err) {
      if (err.message.includes('Email not verified')) {
        try {
          await request('/auth/verify-email/resend', {
            method: 'POST',
            body: JSON.stringify({ email: form.email }),
          })
        } catch (resendError) {
          setError(resendError.message)
          return
        }
        localStorage.setItem('pendingEmail', form.email)
        navigate('/verify-email')
        return
      }
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth">
      <div className="auth-card">
        <h1>Sign in</h1>
        <p>We will send a one-time code to your email.</p>
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
            {loading ? 'Sending OTP...' : 'Continue'}
          </button>
        </form>
        <p className="auth-foot">
          New here? <Link to="/signup">Create account</Link>
        </p>
        <p className="auth-foot">
          Not verified yet? <Link to="/verify-email">Verify email</Link>
        </p>
      </div>
    </div>
  )
}

export default Login
