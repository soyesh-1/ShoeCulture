import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { request } from '../utils/api.js'
import { evaluatePassword } from '../utils/passwordStrength.js'
import '../styles/Account.css'

function Account() {
  const [profile, setProfile] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ currentPassword: '', newPassword: '' })
  const [profileForm, setProfileForm] = useState({
    name: '',
    phone: '',
    address: '',
    dob: '',
  })
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')

  const strength = evaluatePassword(form.newPassword)

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await request('/users/me')
        setProfile(data)
        setProfileForm({
          name: data.profile?.name || '',
          phone: data.profile?.phone || '',
          address: data.profile?.address || '',
          dob: data.profile?.dob || '',
        })
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    loadProfile()
  }, [])

  const handleChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }))
  }

  const handlePasswordChange = async (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')
    setSaving(true)
    try {
      await request('/users/password', {
        method: 'POST',
        body: JSON.stringify(form),
      })
      setSuccess('Password updated.')
      setForm({ currentPassword: '', newPassword: '' })
      const refreshed = await request('/users/me')
      setProfile(refreshed)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleProfileChange = (event) => {
    setProfileForm((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }))
  }

  const handleProfileSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')
    setSaving(true)
    try {
      await request('/users/profile', {
        method: 'POST',
        body: JSON.stringify(profileForm),
      })
      setSuccess('Profile updated.')
      const refreshed = await request('/users/me')
      setProfile(refreshed)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const isExpired =
    profile?.passwordExpiresAt &&
    new Date(profile.passwordExpiresAt).getTime() < Date.now()

  return (
    <div className="account">
      <div className="account-card">
        <h1>Account</h1>
        {loading ? <p>Loading...</p> : null}
        {error ? (
          <div className="error">
            {error} <Link to="/login">Sign in</Link>
          </div>
        ) : null}
        {profile ? (
          <div className="account-grid">
            <div>
              <span className="label">Email</span>
              <span>{profile.email}</span>
            </div>
            <div>
              <span className="label">Role</span>
              <span>{profile.role}</span>
            </div>
            <div>
              <span className="label">Email verified</span>
              <span>{profile.isEmailVerified ? 'Yes' : 'No'}</span>
            </div>
            <div>
              <span className="label">Joined</span>
              <span>{new Date(profile.createdAt).toLocaleDateString()}</span>
            </div>
            {profile.passwordExpiresAt ? (
              <div>
                <span className="label">Password expires</span>
                <span>
                  {new Date(profile.passwordExpiresAt).toLocaleDateString()}
                </span>
              </div>
            ) : null}
          </div>
        ) : null}
        {isExpired ? (
          <div className="error">Your password has expired. Update it now.</div>
        ) : null}
        <form className="account-form" onSubmit={handleProfileSubmit}>
          <h2>Profile</h2>
          <label>
            Name
            <input
              type="text"
              name="name"
              value={profileForm.name}
              onChange={handleProfileChange}
            />
          </label>
          <label>
            Phone
            <input
              type="text"
              name="phone"
              value={profileForm.phone}
              onChange={handleProfileChange}
            />
          </label>
          <label>
            Address
            <input
              type="text"
              name="address"
              value={profileForm.address}
              onChange={handleProfileChange}
            />
          </label>
          <label>
            Date of birth
            <input
              type="text"
              name="dob"
              value={profileForm.dob}
              onChange={handleProfileChange}
              placeholder="YYYY-MM-DD"
            />
          </label>
          <button className="solid" type="submit" disabled={saving}>
            {saving ? 'Saving...' : 'Save profile'}
          </button>
        </form>
        <form className="account-form" onSubmit={handlePasswordChange}>
          <h2>Change password</h2>
          <label>
            Current password
            <input
              type="password"
              name="currentPassword"
              value={form.currentPassword}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            New password
            <input
              type="password"
              name="newPassword"
              value={form.newPassword}
              onChange={handleChange}
              required
            />
          </label>
          <div className="strength">
            <div className="strength-meter">
              <span className={`bar ${strength.score >= 1 ? 'on' : ''}`} />
              <span className={`bar ${strength.score >= 2 ? 'on' : ''}`} />
              <span className={`bar ${strength.score >= 3 ? 'on' : ''}`} />
              <span className={`bar ${strength.score >= 4 ? 'on' : ''}`} />
              <span className={`bar ${strength.score >= 5 ? 'on' : ''}`} />
            </div>
            <ul className="strength-list">
              <li className={strength.checks.length ? 'ok' : ''}>
                At least 10 characters
              </li>
              <li className={strength.checks.upper ? 'ok' : ''}>
                One uppercase letter
              </li>
              <li className={strength.checks.lower ? 'ok' : ''}>
                One lowercase letter
              </li>
              <li className={strength.checks.number ? 'ok' : ''}>
                One number
              </li>
              <li className={strength.checks.symbol ? 'ok' : ''}>
                One symbol
              </li>
            </ul>
          </div>
          {error ? <div className="error">{error}</div> : null}
          {success ? <div className="success">{success}</div> : null}
          <button className="solid" type="submit" disabled={saving}>
            {saving ? 'Updating...' : 'Update password'}
          </button>
        </form>
        <Link className="ghost" to="/">
          Back to home
        </Link>
      </div>
    </div>
  )
}

export default Account
