import useSession from './useSession.js'
import '../../styles/DashboardPages.css'

function DashboardSecurity() {
  const { profile } = useSession()

  if (!profile || profile.role !== 'admin') {
    return (
      <div className="dashboard-page">
        <div className="dashboard-card">
          <h2>Security logs</h2>
          <p>Admin access required.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-card">
        <h2>Security logs</h2>
        <p>Audit log view will appear here for admins.</p>
      </div>
    </div>
  )
}

export default DashboardSecurity
