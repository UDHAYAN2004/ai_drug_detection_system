export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
export const API_PREFIX = '/api/v1'

export const ROLES = {
  ADMIN: 'admin',
  DOCTOR: 'doctor',
  ATHLETE: 'athlete',
}

export const RISK_LEVELS = {
  CRITICAL: 'critical',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
}

export const DETECTION_STATUS = {
  CLEAN: 'clean',
  DETECTED: 'detected',
  INCONCLUSIVE: 'inconclusive',
}

export const INVESTIGATION_STATUS = {
  PENDING: 'pending',
  UNDER_REVIEW: 'under_review',
  CONFIRMED: 'confirmed',
  DISMISSED: 'dismissed',
  BANNED: 'banned',
}

export const USER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
}
