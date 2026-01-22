import { Link } from 'react-router-dom'
import '../styles/NavBar.css'

function NavBar() {
  return (
    <header className="nav">
      <div className="logo-mark">
        <span className="logo-dot" />
        ShoeCulture
      </div>
      <nav className="nav-links">
        <a href="/#drops">Drops</a>
        <Link to="/account">Account</Link>
      </nav>
      <div className="nav-actions">
        <Link className="ghost" to="/login">
          Sign In
        </Link>
        <Link className="solid" to="/signup">
          Create Account
        </Link>
      </div>
    </header>
  )
}

export default NavBar
