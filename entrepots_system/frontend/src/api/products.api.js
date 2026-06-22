import api from './axios'

export const productsApi = {
  list:    (params) => api.get('/products', { params }),
  get:     (id)    => api.get(`/products/${id}`),
  create:  (data)  => {
    const isForm = data instanceof FormData
    return api.post('/products', data, isForm ? { headers: { 'Content-Type': 'multipart/form-data' } } : undefined)
  },
  update:  (id, d) => {
    const isForm = d instanceof FormData
    return api.post(`/products/${id}`, d, isForm ? { headers: { 'Content-Type': 'multipart/form-data' } } : undefined)
  },
  destroy: (id)    => api.delete(`/products/${id}`),
}
