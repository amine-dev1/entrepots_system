import api from './axios'

// Contrôle d'accès (RBAC) — réservé à l'administrateur.
export const listPermissions = () => api.get('/permissions').then((r) => r.data)
export const listRoles = () => api.get('/roles').then((r) => r.data)
export const updateRolePermissions = (roleId, permissions) =>
  api.put(`/roles/${roleId}`, { permissions }).then((r) => r.data)

export const getUserAccess = (userId) => api.get(`/users/${userId}/access`).then((r) => r.data)
export const updateUserAccess = (userId, { roles, permissions, warehouses }) =>
  api.put(`/users/${userId}/access`, { roles, permissions, warehouses }).then((r) => r.data)
