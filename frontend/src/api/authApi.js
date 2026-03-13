import api from './axios'

export const login = (email, password, role) =>
  api.post('/auth/login', { email, password, role })

export const logout = () => api.post('/auth/logout')

export const getMe = () => api.get('/auth/me')
