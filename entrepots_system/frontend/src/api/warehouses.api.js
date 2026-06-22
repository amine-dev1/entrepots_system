import api from './axios'

export const warehousesApi = {
  list:    (params) => api.get('/warehouses', { params }),
  get:     (id)     => api.get(`/warehouses/${id}`),
  create:  (data)   => api.post('/warehouses', data),
  update:  (id, d)  => api.put(`/warehouses/${id}`, d),
  destroy: (id)     => api.delete(`/warehouses/${id}`),
}
