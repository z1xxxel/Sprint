import { create } from 'zustand'
import type { Role } from '../types'

export interface AuthUser {
  id: number
  name: string
  email: string
  role: Role
  avatarUrl?: string | null
}

interface State {
  user: AuthUser | null
  login: (user: AuthUser) => void
  updateUser: (patch: Partial<AuthUser>) => void
  logout: () => void
}

export const useAuth = create<State>((set) => ({
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  login: (user) => {
    localStorage.setItem('user', JSON.stringify(user))
    set({ user })
  },
  updateUser: (patch) => {
    set((state) => {
      if (!state.user) return state
      const updated = { ...state.user, ...patch }
      localStorage.setItem('user', JSON.stringify(updated))
      return { user: updated }
    })
  },
  logout: () => {
    localStorage.removeItem('user')
    set({ user: null })
  },
}))