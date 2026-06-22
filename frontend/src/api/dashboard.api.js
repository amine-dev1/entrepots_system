import api from './axios'

// Ressource : dashboard (conception §4.2) — KPIs + séries 30 jours.
export const getDashboard = () => api.get('/dashboard').then((r) => r.data)
