import api from './axios'

// Ressource : inventaires (conception §4.2) — session, saisie, clôture, ajustement.
export const listInventories = (params) => api.get('/inventories', { params }).then((r) => r.data)
export const getInventory = (id) => api.get(`/inventories/${id}`).then((r) => r.data)
export const openInventory = (data) => api.post('/inventories', data).then((r) => r.data)
// Saisie de la quantité réelle comptée pour une ligne d'inventaire.
export const recordCount = (inventoryId, itemId, data) =>
  api.put(`/inventories/${inventoryId}/items/${itemId}`, data).then((r) => r.data)
export const closeInventory = (id) => api.post(`/inventories/${id}/close`).then((r) => r.data)
export const adjustInventory = (id) => api.post(`/inventories/${id}/adjust`).then((r) => r.data)
