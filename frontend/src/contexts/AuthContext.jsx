import { createContext, useContext, useEffect, useState } from 'react'
import { TOKEN_KEY } from '../api/axios'
import * as authApi from '../api/auth.api'

// Contexte d'authentification (conception §4.1 : contexts/AuthContext — user + token)
const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [roles, setRoles] = useState([])
  const [permissions, setPermissions] = useState([])
  const [loading, setLoading] = useState(true)

  // Au démarrage : si un token est stocké, on restaure la session via /me.
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) {
      setLoading(false)
      return
    }
    authApi
      .me()
      .then((data) => {
        setUser(data.user)
        setRoles(data.roles ?? [])
        setPermissions(data.permissions ?? [])
      })
      .catch(() => localStorage.removeItem(TOKEN_KEY))
      .finally(() => setLoading(false))
  }, [])

  const login = async (credentials) => {
    const data = await authApi.login(credentials)
    localStorage.setItem(TOKEN_KEY, data.token)
    // On récupère le profil complet (rôles + permissions) via /me.
    const profile = await authApi.me()
    setUser(profile.user)
    setRoles(profile.roles ?? [])
    setPermissions(profile.permissions ?? [])
    return profile
  }

  const logout = async () => {
    try {
      await authApi.logout()
    } catch {
      // token déjà invalide côté serveur : on nettoie quand même.
    }
    localStorage.removeItem(TOKEN_KEY)
    setUser(null)
    setRoles([])
    setPermissions([])
  }

  const hasRole = (role) => roles.includes(role)

  const value = {
    user,
    roles,
    permissions,
    loading,
    isAuthenticated: !!user,
    login,
    logout,
    hasRole,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Hook useAuth (conception §4.1 : hooks/useAuth)
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth doit être utilisé à l\'intérieur de <AuthProvider>')
  }
  return ctx
}
