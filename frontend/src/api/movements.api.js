import api from './axios'

// Ressource : mouvements de stock (conception §4.2).
// params accepte { type, product_id, warehouse_id, from, to, per_page }.
export const listMovements = (params) => api.get('/movements', { params }).then((r) => r.data)
// createMovement délègue à StockService côté backend (transaction + verrou).
export const createMovement = (data) => api.post('/movements', data).then((r) => r.data)
