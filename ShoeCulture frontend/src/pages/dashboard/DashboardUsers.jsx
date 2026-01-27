import useSession from './useSession.js'
import '../../styles/DashboardPages.css'

function DashboardUsers() {
  const { profile } = useSession()

  if (!profile || profile.role !== 'admin') {
    return (
      <div className="dashboard-page">
        <div className="dashboard-card">
          <h2>Users</h2>
          <p>Admin access required.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-card">
        <h2>Users</h2>
        <p>User management will appear here for admins.</p>
      </div>
    </div>
  )
}

export default DashboardUsers
