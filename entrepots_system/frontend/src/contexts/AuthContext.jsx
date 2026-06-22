import React, { createContext, useContext, useState, useEffect } from 'react'
import { authApi } from '../api/auth.api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]     = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')) } catch { return null }
  })
  const [token, setToken]   = useState(() => localStorage.getItem('token'))
  const [roles, setRoles]   = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (token && !user) fetchMe()
  }, [token])

  async function fetchMe() {
    try {
      const { data } = await authApi.me()
      setUser(data.user)
      setRoles(data.roles || [])
      localStorage.setItem('user', JSON.stringify(data.user))
    } catch {
      logout()
    }
  }

  async function login(credentials) {
    setLoading(true)
    try {
      const { data } = await authApi.login(credentials)
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      setToken(data.token)
      setUser(data.user)
      // fetch roles
      const me = await authApi.me()
      setRoles(me.data.roles || [])
      return { success: true }
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Identifiants incorrects' }
    } finally {
      setLoading(false)
    }
  }

  async function logout() {
    try { await authApi.logout() } catch {}
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
    setRoles([])
  }

  function hasRole(role) {
    return roles.includes(role)
  }

  return (
    <AuthContext.Provider value={{ user, token, roles, loading, login, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
