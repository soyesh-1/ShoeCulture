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
        <Link to="/shop">Shop</Link>
        <Link to="/cart">Cart</Link>
        <Link to="/dashboard">Dashboard</Link>
      </nav>
      <div className="nav-actions">
        <Link className="ghost" to="/dashboard">
          Dashboard
        </Link>
      </div>
    </header>
  )
}

export default NavBar
