import api from './axios'

export const getAllInvestigations = (status) =>
  api.get('/investigations/all', { params: status ? { status } : {} })

export const getInvestigation  = (id) => api.get(`/investigations/${id}`)
export const updateInvestigationStatus = (id, status, notes) =>
  api.put(`/investigations/${id}/status`, { status, notes })
