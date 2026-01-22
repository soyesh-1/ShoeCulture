import { useState } from 'react'
import { Link } from 'react-router-dom'
import { request } from '../utils/api.js'
import '../styles/Auth.css'

function VerifyEmail() {
  const [email, setEmail] = useState(
    localStorage.getItem('pendingEmail') || ''
  )
  const [otp, setOtp] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [resendStatus, setResendStatus] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)
    try {
      await request('/auth/verify-email', {
        method: 'POST',
        body: JSON.stringify({ email, otp }),
      })
      setMessage('Email verified. You can sign in now.')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setError('')
    setMessage('')
    setResendStatus('')
    try {
      await request('/auth/verify-email/resend', {
        method: 'POST',
        body: JSON.stringify({ email }),
      })
      setResendStatus('OTP resent. Check your inbox.')
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="auth">
      <div className="auth-card">
        <h1>Verify your email</h1>
        <p>Enter the 6-digit OTP sent to your email.</p>
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
          {resendStatus ? <div className="success">{resendStatus}</div> : null}
          <button className="solid" type="submit" disabled={loading}>
            {loading ? 'Verifying...' : 'Verify email'}
          </button>
        </form>
        <button className="ghost" type="button" onClick={handleResend}>
          Resend OTP
        </button>
        <p className="auth-foot">
          Ready to sign in? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  )
}

export default VerifyEmail
