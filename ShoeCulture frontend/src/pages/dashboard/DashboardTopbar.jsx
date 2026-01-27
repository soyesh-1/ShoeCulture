import { Link } from 'react-router-dom'
import '../../styles/DashboardTopbar.css'

function DashboardTopbar() {
  return (
    <header className="dashboard-topbar">
      <div>
        <h1>Dashboard</h1>
        <p>Welcome back.</p>
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
