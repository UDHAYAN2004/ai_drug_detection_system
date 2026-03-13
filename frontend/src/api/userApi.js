import api from './axios'

export const getAllUsers  = (role) => api.get('/admin/users', { params: role ? { role } : {} })
export const updateUser  = (id, data) => api.put(`/admin/users/${id}`, data)
export const deleteUser  = (id) => api.delete(`/admin/users/${id}`)
export const getActivityLogs = () => api.get('/admin/activity-logs')
export const getAdminDashboard = () => api.get('/admin/dashboard')
