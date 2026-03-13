import axios from "axios"
import { API_BASE_URL, API_PREFIX } from "../utils/constants"
import { getAccessToken, getRefreshToken, saveTokens, clearAuth } from "../utils/tokenUtils"

const api = axios.create({
  baseURL: `${API_BASE_URL}${API_PREFIX}`,
  headers: {
    "Content-Type": "application/json"
  }
})

/* ───────────────── REQUEST INTERCEPTOR ───────────────── */

api.interceptors.request.use((config) => {

  const token = getAccessToken()

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  // Important fix: detect FormData and remove JSON header
  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"]
  }

  return config
})


/* ───────────────── TOKEN REFRESH SYSTEM ───────────────── */

let isRefreshing = false
let queue = []

const processQueue = (error, token = null) => {
  queue.forEach((p) => (error ? p.reject(error) : p.resolve(token)))
  queue = []
}

api.interceptors.response.use(

  (res) => res,

  async (error) => {

    const original = error.config

    if (error.response?.status === 401 && !original._retry) {

      if (isRefreshing) {

        return new Promise((resolve, reject) => {

          queue.push({ resolve, reject })

        }).then((token) => {

          original.headers.Authorization = `Bearer ${token}`
          return api(original)

        })

      }

      original._retry = true
      isRefreshing = true

      try {

        const refresh = getRefreshToken()

        const { data } = await axios.post(
          `${API_BASE_URL}${API_PREFIX}/auth/refresh`,
          { refresh_token: refresh }
        )

        saveTokens(data.access_token, data.refresh_token)

        processQueue(null, data.access_token)

        original.headers.Authorization = `Bearer ${data.access_token}`

        return api(original)

      } catch (err) {

        processQueue(err, null)

        clearAuth()

        window.location.href = "/login"

        return Promise.reject(err)

      } finally {

        isRefreshing = false

      }

    }

    return Promise.reject(error)

  }

)

export default api