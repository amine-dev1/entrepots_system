import api from './axios'

export const dashboardApi = {
  kpis: () => api.get('/dashboard'),
  categories: () => api.get('/categories'),
  products: (params) => api.get('/products', { params }),
  users: () => api.get('/users'),

  movements: () => api.get('/dashboard/movements'),
  stockByWarehouse: () => api.get('/dashboard/stock-warehouse'),
}