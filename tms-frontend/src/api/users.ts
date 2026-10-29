import { api } from './client'
import type { Profile, UserListItem, CoinTx, RatingTx } from '../types'

export const getProfile = (userId: number) =>
  api.get<Profile>(`/users/${userId}/profile`).then((r) => r.data)

export const searchUsers = (query: string) =>
  api.get<UserListItem[]>('/users/search', { params: { query } }).then((r) => r.data)

export const getAllUsers = () =>
  api.get<UserListItem[]>('/users').then((r) => r.data)

export const updateAvatar = (userId: number, actorId: number, avatarUrl: string) =>
  api
    .put(`/users/${userId}/avatar`, { avatarUrl }, { params: { actorId } })
    .then((r) => r.data)

export const getBalanceHistory = (userId: number, size = 100) =>
  api
    .get<{ content: CoinTx[] }>(`/users/${userId}/balance-history`, { params: { size } })
    .then((r) => r.data.content)

export const getRatingHistory = (userId: number, size = 100) =>
  api
    .get<{ content: RatingTx[] }>(`/users/${userId}/rating-history`, { params: { size } })
    .then((r) => r.data.content)

// ==========================================
// === Админские действия ===
// ==========================================
export const changeUserRole = (userId: number, role: string, actorId: number) =>
  api
    .put(`/users/${userId}/role`, null, { params: { role, actorId } })
    .then((r) => r.data)

export const toggleUserBlock = (userId: number, actorId: number) =>
  api
    .put(`/users/${userId}/block`, null, { params: { actorId } })
    .then((r) => r.data)

export const changeUserPassword = (
  userId: number,
  newPassword: string,
  actorId: number
) =>
  api
    .put<string>(`/users/${userId}/password`, { newPassword }, { params: { actorId } })
    .then((r) => r.data)

// ==========================================
// === Создание пользователя ===
// ==========================================
export interface CreateUserPayload {
  name: string
  email: string
  password: string
  role: string
}

export const createUser = (actorId: number, data: CreateUserPayload) =>
  api
    .post<import('../types').UserListItem>('/users', data, { params: { actorId } })
    .then((r) => r.data)

export interface ActivityPoint {
  date: string
  dayLabel: string
  earned: number
  spent: number
}

export const getActivityChart = (userId: number) =>
  api.get<ActivityPoint[]>(`/users/${userId}/activity-chart`).then((r) => r.data)