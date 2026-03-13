import api from './axios'

export const getAllReports  = () => api.get('/reports/admin/all')
export const getReport     = (id) => api.get(`/reports/${id}`)
export const verifyReport  = (id, data) => api.post(`/reports/${id}/verify`, data)
