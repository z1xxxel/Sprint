import axios from 'axios'
import { useAuth } from '../store/auth'

export const api = axios.create({ baseURL: '/api' })

api.interceptors.request.use((config) => {
  const user = useAuth.getState().user
  if (user) {
    config.params = { ...(config.params || {}), actorId: user.id }
  }
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const msg = err.response?.data
    if (msg && typeof msg === 'string') console.warn('[API]', msg)
    return Promise.reject(err)
  }
)