import api from './axios'

export const categoriesApi = {
  list:    ()        => api.get('/categories'),
  get:     (id)      => api.get(`/categories/${id}`),
  create:  (data)    => api.post('/categories', data),
  update:  (id, d)   => api.put(`/categories/${id}`, d),
  destroy: (id)      => api.delete(`/categories/${id}`),
}
