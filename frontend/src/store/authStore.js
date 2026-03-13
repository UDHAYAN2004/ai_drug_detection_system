import { create } from 'zustand'
import { saveTokens, getAccessToken, getUser, saveUser, clearAuth } from '../utils/tokenUtils'

const useAuthStore = create((set) => ({
  // Rehydrate from localStorage on page reload
  user:            getUser(),
  isAuthenticated: !!getAccessToken(),

  // Called after login — backend returns { access_token, refresh_token, role, user_id, name }
  setAuth: (tokenResponse) => {
    const user = {
      id:    tokenResponse.user_id,
      name:  tokenResponse.name,
      role:  tokenResponse.role,
      email: tokenResponse.email || '',   // may not be in response, fallback ''
    }
    saveTokens(tokenResponse.access_token, tokenResponse.refresh_token)
    saveUser(user)
    set({ user, isAuthenticated: true })
  },

  logout: () => {
    clearAuth()
    set({ user: null, isAuthenticated: false })
  },
}))

export default useAuthStore