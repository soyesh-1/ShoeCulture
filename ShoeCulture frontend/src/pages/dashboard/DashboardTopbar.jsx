import { Link } from 'react-router-dom'
import useSession from './useSession.js'
import '../../styles/DashboardTopbar.css'

function DashboardTopbar() {
  const { profile } = useSession()

  return (
    <header className="dashboard-topbar">
      <div>
        <h1>Dashboard</h1>
        <p>Welcome back{profile ? `, ${profile.email}` : ''}.</p>
      </div>
      <div className="dashboard-actions">
        <Link className="ghost" to="/shop">
          Shop
        </Link>
        <Link className="solid" to="/dashboard/settings">
          Settings
        </Link>
      </div>
    </header>
  )
}

export default DashboardTopbar
