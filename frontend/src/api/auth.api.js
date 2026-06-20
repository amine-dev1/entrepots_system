import api from './axios'

// Ressource : authentification (conception §4.2)
export const login = (credentials) => api.post('/login', credentials).then((r) => r.data)
export const register = (data) => api.post('/register', data).then((r) => r.data)
export const logout = () => api.post('/logout').then((r) => r.data)
export const me = () => api.get('/me').then((r) => r.data)
