import { Link, useNavigate } from 'react-router-dom'
import useSession from './useSession.js'
import { request } from '../../utils/api.js'
import '../../styles/DashboardTopbar.css'

function DashboardTopbar() {
  const navigate = useNavigate()
  const { profile } = useSession()
  const handleLogout = async () => {
    try {
      await request('/auth/logout', { method: 'POST' })
    } finally {
      navigate('/login')
    }
  }
  return (
    <header className="dashboard-topbar">
      <div>
        <h1>Dashboard</h1>
        <p>Welcome back{profile ? `, ${profile.email}` : ''}.</p>
      </div>
      {profile ? (
        <nav className="dashboard-nav">
          <Link to="/dashboard">Overview</Link>
          {profile.role === 'admin' ? (
            <Link to="/dashboard/products">Products</Link>
          ) : null}
          <Link to="/dashboard/orders">Orders</Link>
          {profile.role === 'admin' ? (
            <Link to="/dashboard/security">Security</Link>
          ) : null}
          <Link to="/account">Account</Link>
        </nav>
      ) : null}
      <div className="dashboard-actions">
        <Link className="ghost" to="/shop">
          Shop
        </Link>
        {profile ? (
          <>
            <Link className="solid" to="/dashboard/settings">
              Settings
            </Link>
            <button className="ghost" type="button" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <Link className="solid" to="/login">
            Sign in
          </Link>
        )}
      </div>
    </header>
  )
}

export default DashboardTopbar
