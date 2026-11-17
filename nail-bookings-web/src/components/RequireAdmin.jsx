import { Navigate } from 'react-router-dom'
import { getToken } from '../auth'

export default function RequireAdmin({ children }) {
  if (!getToken()) return <Navigate to="/admin/login" replace />
  return children
}