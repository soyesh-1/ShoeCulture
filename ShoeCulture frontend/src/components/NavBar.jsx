import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { request } from '../utils/api.js'
import '../styles/NavBar.css'

function NavBar() {
  const [isAuthed, setIsAuthed] = useState(false)

  useEffect(() => {
    let isMounted = true
    const loadSession = async () => {
      try {
        await request('/users/me')
        if (isMounted) {
          setIsAuthed(true)
        }
      } catch (err) {
        if (isMounted) {
          setIsAuthed(false)
        }
      }
    }
    loadSession()
    return () => {
      isMounted = false
    }
  }, [])

  const handleLogout = async () => {
    await request('/auth/logout', { method: 'POST' })
    setIsAuthed(false)
  }

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
        <Link to="/dashboard">Dashboard</Link>
      </nav>
      <div className="nav-actions">
        {isAuthed ? (
          <>
            <Link className="ghost" to="/dashboard">
              Dashboard
            </Link>
            <button className="ghost" type="button" onClick={handleLogout}>
              Logout
            </button>
          </>
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
