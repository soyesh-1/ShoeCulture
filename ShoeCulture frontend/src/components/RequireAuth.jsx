import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { request } from '../utils/api.js'

function RequireAuth({ children }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const check = async () => {
      try {
        await request('/users/me')
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

export default RequireAuth
