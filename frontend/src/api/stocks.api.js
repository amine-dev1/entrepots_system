import api from './axios'

// Ressource : stocks (conception §4.2) — lecture pour tout authentifié.
// params accepte { warehouse_id, product_id, alert, per_page }.
export const listStocks = (params) => api.get('/stocks', { params }).then((r) => r.data)
export const listStockAlerts = (params) => api.get('/stocks/alerts', { params }).then((r) => r.data)
