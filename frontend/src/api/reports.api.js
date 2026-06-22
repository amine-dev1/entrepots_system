import api from './axios'

// Ressource : rapports (conception §4.2).
// type = stock_global | mouvements | inventaire ; format = pdf | xlsx.
// Réponse binaire (blob) à télécharger côté UI.
export const downloadReport = (type, format = 'pdf', params = {}) =>
  api
    .get(`/reports/${type}`, { params: { ...params, format }, responseType: 'blob' })
    .then((r) => r.data)
