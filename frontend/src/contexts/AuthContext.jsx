import { createContext, useContext, useEffect, useState } from 'react'
import { TOKEN_KEY } from '../api/axios'
import * as authApi from '../api/auth.api'

// Contexte d'authentification (conception §4.1 : contexts/AuthContext — user + token)
const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [roles, setRoles] = useState([])
  const [permissions, setPermissions] = useState([])
  const [scopedWarehouses, setScopedWarehouses] = useState([]) // [] = accès à tous
  const [warehouseScoped, setWarehouseScoped] = useState(false)
  const [loading, setLoading] = useState(true)

  const applyProfile = (data) => {
    setUser(data.user)
    setRoles(data.roles ?? [])
    setPermissions(data.permissions ?? [])
    setScopedWarehouses(data.warehouses ?? [])
    setWarehouseScoped(!!data.warehouse_scoped)
  }

  // Au démarrage : si un token est stocké, on restaure la session via /me.
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) {
      setLoading(false)
      return
    }
    authApi
      .me()
      .then(applyProfile)
      .catch(() => localStorage.removeItem(TOKEN_KEY))
      .finally(() => setLoading(false))
  }, [])

  const login = async (credentials) => {
    const data = await authApi.login(credentials)
    localStorage.setItem(TOKEN_KEY, data.token)
    // On récupère le profil complet (rôles + permissions + périmètre) via /me.
    const profile = await authApi.me()
    applyProfile(profile)
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
    setScopedWarehouses([])
    setWarehouseScoped(false)
  }

  const hasRole = (role) => roles.includes(role)
  const hasPermission = (perm) => permissions.includes(perm)
  const can = (perm) => hasRole('administrateur') || permissions.includes(perm)

  // Filtre une liste d'entrepôts selon le périmètre de l'utilisateur.
  const filterWarehouses = (list = []) => {
    if (!warehouseScoped) return list
    const ids = new Set(scopedWarehouses.map((w) => w.id))
    return list.filter((w) => ids.has(w.id))
  }

  const value = {
    user,
    roles,
    permissions,
    scopedWarehouses,
    warehouseScoped,
    loading,
    isAuthenticated: !!user,
    login,
    logout,
    hasRole,
    hasPermission,
    can,
    filterWarehouses,
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
