import api from './axios'

// Ressource : catégories (lecture: tous, écriture: gestionnaire/admin) — conception §4.2
export const listCategories = () => api.get('/categories').then((r) => r.data)
export const getCategory = (id) => api.get(`/categories/${id}`).then((r) => r.data)
export const createCategory = (data) => api.post('/categories', data).then((r) => r.data)
export const updateCategory = (id, data) => api.put(`/categories/${id}`, data).then((r) => r.data)
export const deleteCategory = (id) => api.delete(`/categories/${id}`).then((r) => r.data)
