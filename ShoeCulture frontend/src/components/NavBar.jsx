import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { request } from '../utils/api.js'
import '../styles/NavBar.css'

function NavBar() {
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    const loadSession = async () => {
      try {
        const data = await request('/users/me')
        setProfile(data)
      } catch {
        setProfile(null)
      }
    }
    loadSession()
  }, [])

  return (
    <header className="nav">
      <div className="logo-mark">
        <span className="logo-dot" />
        ShoeCulture
      </div>
      <nav className="nav-links">
        <a href="/#drops">Drops</a>
        <Link to="/shop">Shop</Link>
        <Link to="/cart">Cart</Link>
      </nav>
      <div className="nav-actions">
        {profile ? (
          <Link className="solid" to="/dashboard">
            Dashboard
          </Link>
        ) : (
          <>
            <Link className="ghost" to="/login">
              Sign In
            </Link>
            <Link className="solid" to="/signup">
              Create Account
            </Link>
          </>
        )}
      </div>
    </header>
  )
}

export default NavBar
