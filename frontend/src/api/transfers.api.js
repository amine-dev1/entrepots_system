import api from './axios'

// Ressource : transferts inter-entrepôts (conception §4.2) — cycle complet.
export const listTransfers = (params) => api.get('/transfers', { params }).then((r) => r.data)
export const getTransfer = (id) => api.get(`/transfers/${id}`).then((r) => r.data)
export const createTransfer = (data) => api.post('/transfers', data).then((r) => r.data)
export const updateTransfer = (id, data) => api.put(`/transfers/${id}`, data).then((r) => r.data)
export const deleteTransfer = (id) => api.delete(`/transfers/${id}`).then((r) => r.data)

// Machine à états : brouillon -> en_attente -> valide -> recu | annule
export const submitTransfer = (id) => api.post(`/transfers/${id}/submit`).then((r) => r.data)
export const validateTransfer = (id) => api.post(`/transfers/${id}/validate`).then((r) => r.data)
export const receiveTransfer = (id) => api.post(`/transfers/${id}/receive`).then((r) => r.data)
export const cancelTransfer = (id) => api.post(`/transfers/${id}/cancel`).then((r) => r.data)
