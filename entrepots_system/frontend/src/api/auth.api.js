import api from './axios'

export const authApi = {
  login:    (data) => api.post('/login', data),
  logout:   ()     => api.post('/logout'),
  me:       ()     => api.get('/me'),
  register: (data) => api.post('/register', data),
}
