import { Outlet } from 'react-router-dom'
import DashboardSidebar from './DashboardSidebar.jsx'
import DashboardTopbar from './DashboardTopbar.jsx'
import '../../styles/Dashboard.css'

function DashboardLayout() {
  return (
    <div className="dashboard">
      <DashboardSidebar />
      <div className="dashboard-main">
        <DashboardTopbar />
        <div className="dashboard-content">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export default DashboardLayout
