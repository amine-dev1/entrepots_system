import api from './axios'

// Ressource : entrepôts (lecture: tous, écriture: admin) — conception §4.2
// params accepte { inactifs: true } pour inclure les entrepôts désactivés.
export const listWarehouses = (params) => api.get('/warehouses', { params }).then((r) => r.data)
export const getWarehouse = (id) => api.get(`/warehouses/${id}`).then((r) => r.data)
export const createWarehouse = (data) => api.post('/warehouses', data).then((r) => r.data)
export const updateWarehouse = (id, data) => api.put(`/warehouses/${id}`, data).then((r) => r.data)
export const deleteWarehouse = (id) => api.delete(`/warehouses/${id}`).then((r) => r.data)
