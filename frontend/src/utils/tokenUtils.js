const ACCESS_KEY  = 'ds_access_token'
const REFRESH_KEY = 'ds_refresh_token'
const USER_KEY    = 'ds_user'

export const saveTokens = (access, refresh) => {
  localStorage.setItem(ACCESS_KEY,  access)
  localStorage.setItem(REFRESH_KEY, refresh)
}

export const getAccessToken  = () => localStorage.getItem(ACCESS_KEY)
export const getRefreshToken = () => localStorage.getItem(REFRESH_KEY)

export const saveUser = (user) => localStorage.setItem(USER_KEY, JSON.stringify(user))
export const getUser  = () => { try { return JSON.parse(localStorage.getItem(USER_KEY)) } catch { return null } }

export const clearAuth = () => {
  localStorage.removeItem(ACCESS_KEY)
  localStorage.removeItem(REFRESH_KEY)
  localStorage.removeItem(USER_KEY)
}