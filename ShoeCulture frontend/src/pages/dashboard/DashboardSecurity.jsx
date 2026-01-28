import { useEffect, useState } from 'react'
import useSession from './useSession.js'
import { request } from '../../utils/api.js'
import '../../styles/DashboardPages.css'

function DashboardSecurity() {
  const { profile } = useSession()
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)

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
      setLoading(true)
      try {
        const data = await request(`/admin/audit?limit=20&page=${page}`)
        setLogs(data.items || [])
        setTotal(data.total || 0)
      } finally {
        setLoading(false)
      }
    }
    loadLogs()
  }, [page])

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
        <div className="table-actions">
          <button
            className="ghost"
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1 || loading}
          >
            Previous
          </button>
          <span>
            Page {page}
          </span>
          <button
            className="ghost"
            type="button"
            onClick={() => setPage((p) => p + 1)}
            disabled={page * 20 >= total || loading}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  )
}

export default DashboardSecurity
