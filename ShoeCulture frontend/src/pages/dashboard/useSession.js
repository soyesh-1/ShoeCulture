import { useEffect, useState } from 'react'
import { request } from '../../utils/api.js'

function useSession() {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await request('/users/me')
        setProfile(data)
      } catch {
        setProfile(null)
      } finally {
        setLoading(false)
      }
    }
    loadProfile()
  }, [])

  return { profile, loading }
}

export default useSession
