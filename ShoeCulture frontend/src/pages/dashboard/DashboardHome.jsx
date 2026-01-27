import '../../styles/DashboardPages.css'

function DashboardHome() {
  return (
    <div className="dashboard-page">
      <div className="dashboard-card">
        <h2>Account overview</h2>
        <p>Overview of store activity and recent updates.</p>
      </div>
      <div className="dashboard-card">
        <h2>Security status</h2>
        <p>Login sessions are protected and monitored.</p>
      </div>
    </div>
  )
}

export default DashboardHome
