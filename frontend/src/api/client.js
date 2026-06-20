import axios from 'axios'

// Base URL aligns with the API prefix /api/v1 (conception §4.2).
const baseURL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api/v1'

const client = axios.create({
  baseURL,
  headers: { Accept: 'application/json' },
})

// Attach the Sanctum bearer token (set after login) to every request.
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Surface a clean message on 401 so the UI can prompt a re-login.
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
    }
    return Promise.reject(error)
  },
)

export default client
