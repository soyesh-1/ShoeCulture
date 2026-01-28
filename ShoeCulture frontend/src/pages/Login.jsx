import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { request } from '../utils/api.js'
import '../styles/Auth.css'

function Login() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [captcha, setCaptcha] = useState({
    required: false,
    token: '',
    challenge: '',
  })
  const [captchaAnswer, setCaptchaAnswer] = useState('')

  const loadCaptcha = async () => {
    try {
      const data = await request('/auth/captcha')
      if (data.required) {
        setCaptcha({ required: true, token: data.token, challenge: data.challenge })
      } else {
        setCaptcha({ required: false, token: '', challenge: '' })
      }
      setCaptchaAnswer('')
    } catch (err) {
      setCaptcha({ required: false, token: '', challenge: '' })
    }
  }

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
        body: JSON.stringify({
          ...form,
          captchaToken: captcha.required ? captcha.token : undefined,
          captchaAnswer: captcha.required ? captchaAnswer : undefined,
        }),
      })
      if (data.verificationRequired) {
        localStorage.setItem('pendingEmail', form.email)
        navigate('/verify-email')
        return
      }
      if (data.mfaRequired) {
        localStorage.setItem('pendingEmail', form.email)
        navigate('/mfa')
      } else {
        setMessage('Logged in.')
        navigate('/dashboard')
      }
    } catch (err) {
      setError(err.message)
      await loadCaptcha()
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCaptcha()
  }, [])

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
          {captcha.required ? (
            <label>
              Captcha: {captcha.challenge}
              <input
                type="text"
                value={captchaAnswer}
                onChange={(event) => setCaptchaAnswer(event.target.value)}
                required
              />
            </label>
          ) : null}
          {error ? <div className="error">{error}</div> : null}
          {message ? <div className="success">{message}</div> : null}
          <button className="solid" type="submit" disabled={loading}>
            {loading ? 'Sending OTP...' : 'Continue'}
          </button>
        </form>
        <p className="auth-foot">
          New here? <Link to="/signup">Create account</Link>
        </p>
      </div>
    </div>
  )
}

export default Login
