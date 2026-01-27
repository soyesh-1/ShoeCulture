import { NavLink } from 'react-router-dom'
import useSession from './useSession.js'
import '../../styles/DashboardSidebar.css'

function DashboardSidebar() {
  const { profile } = useSession()
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="logo-dot" />
        ShoeCulture
      </div>
      <nav className="sidebar-nav">
        <NavLink to="/dashboard" end>
          Overview
        </NavLink>
        <NavLink to="/dashboard/products">Products</NavLink>
        <NavLink to="/dashboard/cart">Cart</NavLink>
        <NavLink to="/dashboard/orders">Orders</NavLink>
        {profile?.role === 'admin' ? (
          <>
            <NavLink to="/dashboard/users">Users</NavLink>
            <NavLink to="/dashboard/security">Security Logs</NavLink>
          </>
        ) : null}
        <NavLink to="/dashboard/settings">Settings</NavLink>
      </nav>
    </aside>
  )
}

export default DashboardSidebar
