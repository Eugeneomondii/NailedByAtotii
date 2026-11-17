import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { api } from '../../api'
import { getToken, setToken } from '../../auth'
import { BUSINESS } from '../../config'

export default function Login() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Already logged in? Skip straight to the dashboard
  if (getToken()) return <Navigate to="/admin" replace />

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await api('/api/admin/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      })
      setToken(data.access_token)
      navigate('/admin')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-pink-50 px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-2xl bg-white p-8 shadow">
        <h1 className="text-2xl font-bold text-pink-600">{BUSINESS.name}</h1>
        <p className="mt-1 text-gray-600">Admin login</p>

        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          autoComplete="username"
          className="mt-6 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-pink-500 focus:outline-none"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          autoComplete="current-password"
          className="mt-3 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-pink-500 focus:outline-none"
        />

        {error && <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

        <button
          type="submit"
          disabled={!username || !password || loading}
          className="mt-5 w-full rounded-full bg-pink-600 py-2.5 font-semibold text-white hover:bg-pink-700 disabled:bg-pink-300"
        >
          {loading ? 'Logging in...' : 'Log in'}
        </button>
      </form>
    </div>
  )
}