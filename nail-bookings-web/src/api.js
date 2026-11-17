import { getToken, clearToken } from './auth'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000'

export async function api(path, options = {}) {
  const token = getToken()

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })

  const data = await response.json().catch(() => null)

  // A 401 while we hold a token means it expired: log out and go to the login page
  if (response.status === 401 && token) {
    clearToken()
    window.location.assign('/admin/login')
    throw new Error('Your session expired. Please log in again.')
  }

  if (!response.ok) {
    throw new Error(data?.error || 'Something went wrong. Please try again.')
  }
  return data
}