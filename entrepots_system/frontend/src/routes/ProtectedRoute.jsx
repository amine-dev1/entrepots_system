import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function ProtectedRoute({ children, roles }) {
  const { token, roles: userRoles } = useAuth()

  if (!token) return <Navigate to="/login" replace />

  if (roles && roles.length > 0) {
    const allowed = roles.some(r => userRoles.includes(r))
    if (!allowed) return <Navigate to="/dashboard" replace />
  }

  return children
}
