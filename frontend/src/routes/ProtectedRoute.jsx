import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const HOME_BY_ROLE = {
  administrateur: '/dashboard',
  gestionnaire: '/dashboard',
  auditeur: '/dashboard',
  magasinier: '/stocks',
}

export default function ProtectedRoute({ children, roles }) {
  const { isAuthenticated, roles: userRoles, loading } = useAuth()

  if (loading) return null

  if (!isAuthenticated) return <Navigate to="/login" replace />

  if (roles && roles.length > 0) {
    const allowed = roles.some((r) => userRoles.includes(r))
    if (!allowed) {
      const home = HOME_BY_ROLE[userRoles[0]] || '/stocks'
      return <Navigate to={home} replace />
    }
  }

  return children
}
