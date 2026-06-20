import api from './axios'

// Ressource : produits (lecture: tous, écriture: gestionnaire/admin) — conception §4.2
// params accepte { inactifs: true } pour inclure les produits désactivés.
export const listProducts = (params) => api.get('/products', { params }).then((r) => r.data)
export const getProduct = (id) => api.get(`/products/${id}`).then((r) => r.data)

// createProduct/updateProduct acceptent un objet simple OU un FormData (upload image).
export const createProduct = (data) => api.post('/products', data).then((r) => r.data)
// L'API utilise POST pour la mise à jour (multipart ne supporte pas PUT).
export const updateProduct = (id, data) => api.post(`/products/${id}`, data).then((r) => r.data)
export const deleteProduct = (id) => api.delete(`/products/${id}`).then((r) => r.data)
