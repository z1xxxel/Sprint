import { api } from './client'
import type { Role } from '../types'

interface LoginResponse {
  message: string
  userId: number
  name: string
  role: Role
  balance: number
  rating: number
}

export async function login(email: string, password: string) {
  const { data } = await api.post<LoginResponse>('/auth/login', { email, password })
  return data
}