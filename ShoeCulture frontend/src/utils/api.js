const API_BASE = import.meta.env.VITE_API_BASE || '/api/v1'
let csrfToken = null

const getCsrfToken = async () => {
  if (csrfToken) {
    return csrfToken
  }
  const response = await fetch(`${API_BASE}/security/csrf`, {
    credentials: 'include',
  })
  const data = await response.json().catch(() => ({}))
  csrfToken = data.token || null
  return csrfToken
}

const request = async (path, options = {}) => {
  const method = (options.method || 'GET').toUpperCase()
  const requiresCsrf = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  }

  if (requiresCsrf) {
    const token = await getCsrfToken()
    if (token) {
      headers['x-csrf-token'] = token
    }
  }

  const response = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    ...options,
    headers,
  })

  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    if (data.error === 'Invalid CSRF token.') {
      csrfToken = null
    }
    const message = data.error || 'Request failed.'
    throw new Error(Array.isArray(message) ? message.join(' ') : message)
  }
  return data
}

export { request }
export { getCsrfToken }

const requestMultipart = async (path, formData) => {
  const token = await getCsrfToken()
  const response = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    credentials: 'include',
    headers: token ? { 'x-csrf-token': token } : undefined,
    body: formData,
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    const message = data.error || 'Request failed.'
    throw new Error(Array.isArray(message) ? message.join(' ') : message)
  }
  return data
}

export { requestMultipart }
