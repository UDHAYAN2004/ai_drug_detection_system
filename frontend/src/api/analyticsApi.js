import api from './axios'

export const getDashboardStats   = () => api.get('/analytics/dashboard-stats')
export const getMonthlyReports   = () => api.get('/analytics/monthly-reports')
export const getDetectionTrends  = () => api.get('/analytics/detection-trends')
