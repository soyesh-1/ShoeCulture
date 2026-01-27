import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { request } from '../utils/api.js'
import '../styles/Auth.css'

function TotpSetup() {
  const navigate = useNavigate()
  const [qrCode, setQrCode] = useState('')
  const [token, setToken] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const setup = async () => {
      try {
        const data = await request('/auth/totp/setup', { method: 'POST' })
        setQrCode(data.qrCode)
      } catch (err) {
        setError(err.message)
      }
    }
    setup()
  }, [])

  const handleVerify = async (event) => {
    event.preventDefault()
    setError('')
    setMessage('')
    try {
      await request('/auth/totp/verify', {
        method: 'POST',
        body: JSON.stringify({ token }),
      })
      setMessage('Authenticator enabled. You can sign in now.')
      navigate('/login')
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="auth">
      <div className="auth-card">
        <h1>Set up authenticator</h1>
        <p>Scan the QR code using Google Authenticator, then enter the code.</p>
        {qrCode ? <img src={qrCode} alt="Authenticator QR" /> : null}
        <form onSubmit={handleVerify}>
          <label>
            6-digit code
            <input
              type="text"
              value={token}
              onChange={(event) => setToken(event.target.value)}
              required
            />
          </label>
          {error ? <div className="error">{error}</div> : null}
          {message ? <div className="success">{message}</div> : null}
          <button className="solid" type="submit">
            Verify setup
          </button>
        </form>
        <p className="auth-foot">
          Already set up? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  )
}

export default TotpSetup
