import api from './axios'

// GET /activity-logs?action=...&user_id=...&date_debut=...
export const listActivityLogs = (params) => 
  api.get('/activity-logs', { params }).then((r) => r.data)