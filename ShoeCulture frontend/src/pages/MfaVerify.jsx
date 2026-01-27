import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { request } from '../utils/api.js'
import '../styles/Auth.css'

function MfaVerify() {
  const navigate = useNavigate()
  const [email, setEmail] = useState(
    localStorage.getItem('pendingEmail') || ''
  )
  const [otp, setOtp] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)
    try {
      await request('/auth/mfa/verify', {
        method: 'POST',
        body: JSON.stringify({ email, token: otp }),
      })
      setMessage('Login successful. Redirecting...')
      setTimeout(() => navigate('/dashboard'), 800)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth">
      <div className="auth-card">
        <h1>Enter OTP</h1>
        <p>Check your email for the 6-digit code.</p>
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
            OTP
            <input
              type="text"
              value={otp}
              onChange={(event) => setOtp(event.target.value)}
              required
            />
          </label>
          {error ? <div className="error">{error}</div> : null}
          {message ? <div className="success">{message}</div> : null}
          <button className="solid" type="submit" disabled={loading}>
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>
        </form>
        <p className="auth-foot">
          Need a new OTP? <Link to="/login">Sign in again</Link>
        </p>
      </div>
    </div>
  )
}

export default MfaVerify
