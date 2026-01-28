import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { request } from '../utils/api.js'
import '../styles/Auth.css'

function VerifyEmail() {
  const navigate = useNavigate()
  const [email, setEmail] = useState(
    localStorage.getItem('pendingEmail') || ''
  )
  const [code, setCode] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)
    try {
      await request('/auth/verify-email', {
        method: 'POST',
        body: JSON.stringify({ email, token: code }),
      })
      setMessage('Email verified. You can sign in now.')
      setTimeout(() => navigate('/login'), 800)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setError('')
    setMessage('')
    setLoading(true)
    try {
      await request('/auth/verify-email/resend', {
        method: 'POST',
        body: JSON.stringify({ email }),
      })
      setMessage('Verification code sent.')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth">
      <div className="auth-card">
        <h1>Verify email</h1>
        <p>Enter the 6-digit code sent to your email.</p>
        <form onSubmit={handleSubmit}>
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>
          <label>
            Verification code
            <input
              type="text"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              required
            />
          </label>
          {error ? <div className="error">{error}</div> : null}
          {message ? <div className="success">{message}</div> : null}
          <button className="solid" type="submit" disabled={loading}>
            {loading ? 'Verifying...' : 'Verify email'}
          </button>
        </form>
        <div className="auth-foot">
          <button className="ghost" type="button" onClick={handleResend}>
            Resend code
          </button>
          <Link to="/login">Back to sign in</Link>
        </div>
      </div>
    </div>
  )
}

export default VerifyEmail
