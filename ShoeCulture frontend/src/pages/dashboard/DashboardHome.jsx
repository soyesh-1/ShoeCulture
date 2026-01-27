import useSession from './useSession.js'
import '../../styles/DashboardPages.css'

function DashboardHome() {
  const { profile, loading } = useSession()

  return (
    <div className="dashboard-page">
      <div className="dashboard-card">
        <h2>Account overview</h2>
        {loading ? <p>Loading...</p> : null}
        {profile ? (
          <div className="info-grid">
            <div>
              <span className="label">Email</span>
              <span>{profile.email}</span>
            </div>
            <div>
              <span className="label">Role</span>
              <span>{profile.role}</span>
            </div>
            <div>
              <span className="label">Joined</span>
              <span>{new Date(profile.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        ) : (
          <p>Please sign in to view your dashboard.</p>
        )}
      </div>
      <div className="dashboard-card">
        <h2>Security status</h2>
        <p>Login sessions are protected and monitored.</p>
      </div>
    </div>
  )
}

export default DashboardHome
