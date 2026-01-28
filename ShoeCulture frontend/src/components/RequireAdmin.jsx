import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { request } from '../utils/api.js'

function RequireAdmin({ children }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const check = async () => {
      try {
        const data = await request('/users/me')
        if (data.role !== 'admin') {
          navigate('/dashboard', { replace: true })
          return
        }
        setLoading(false)
      } catch {
        navigate('/login', { replace: true, state: { from: location.pathname } })
      }
    }
    check()
  }, [location.pathname, navigate])

  if (loading) {
    return <div style={{ padding: '40px' }}>Loading...</div>
  }

  return children
}

export default RequireAdmin
