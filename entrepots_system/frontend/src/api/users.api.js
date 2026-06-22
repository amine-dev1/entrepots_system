import api from './axios'

export const usersApi = {
  list:    ()       => api.get('/users'),
  get:     (id)     => api.get(`/users/${id}`),
  create:  (data)   => api.post('/users', data),
  update:  (id, d)  => api.put(`/users/${id}`, d),
  destroy: (id)     => api.delete(`/users/${id}`),
  toggle:  (id)     => api.post(`/users/${id}/toggle`),
}
