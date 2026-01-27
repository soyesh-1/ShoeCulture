const API_BASE = import.meta.env.VITE_API_BASE || '/api/v1'

const request = async (path, options = {}) => {
  const response = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  })

  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    const message = data.error || 'Request failed.'
    throw new Error(Array.isArray(message) ? message.join(' ') : message)
  }
  return data
}

export { request }
