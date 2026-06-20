import axios from 'axios'

// Instance Axios unique (conception §4.1 : api/axios.js)
// baseURL pilotée par l'environnement Vite, défaut = backend local.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api/v1',
  headers: { Accept: 'application/json' },
})

// Clé de stockage du token (partagée avec AuthContext)
export const TOKEN_KEY = 'stockflow_token'

// Intercepteur requête : ajoute le token Bearer s'il existe.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Intercepteur réponse : gestion globale du 401 (token absent/expiré).
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY)
      // Redirige vers /login sauf si on y est déjà (évite la boucle).
      if (!window.location.pathname.startsWith('/login')) {
        window.location.assign('/login')
      }
    }
    return Promise.reject(error)
  },
)

export default api
