import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { request } from '../utils/api.js'
import '../styles/Account.css'

function Account() {
  const [profile, setProfile] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await request('/users/me')
        setProfile(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    loadProfile()
  }, [])

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
              <span className="label">Joined</span>
              <span>{new Date(profile.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        ) : null}
        <Link className="ghost" to="/">
          Back to home
        </Link>
      </div>
    </div>
  )
}

export default Account
