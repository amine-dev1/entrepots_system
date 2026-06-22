import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function ProtectedRoute({ children, roles }) {
  const { isAuthenticated, roles: userRoles, loading } = useAuth()

  // Attendre la restauration de session (/me) avant de décider.
  if (loading) return null

  if (!isAuthenticated) return <Navigate to="/login" replace />

  if (roles && roles.length > 0) {
    const allowed = roles.some((r) => userRoles.includes(r))
    if (!allowed) return <Navigate to="/dashboard" replace />
  }

  return children
}
