import { useEffect, useState } from 'react'
import useSession from './useSession.js'
import { request } from '../../utils/api.js'
import '../../styles/DashboardPages.css'

function DashboardSecurity() {
  const { profile } = useSession()
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)

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

  useEffect(() => {
    const loadLogs = async () => {
      try {
        const data = await request('/admin/audit?limit=50')
        setLogs(data.items || [])
      } finally {
        setLoading(false)
      }
    }
    loadLogs()
  }, [])

  return (
    <div className="dashboard-page">
      <div className="dashboard-card">
        <h2>Security logs</h2>
        {loading ? <p>Loading logs...</p> : null}
        {!loading && logs.length === 0 ? <p>No logs available.</p> : null}
        <div className="table">
          {logs.map((log) => (
            <div key={log._id} className="table-row table-row-logs">
              <span>{new Date(log.createdAt).toLocaleString()}</span>
              <span>{log.action}</span>
              <span>{log.actorId || 'system'}</span>
              <span>{log.ip || '-'}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default DashboardSecurity
