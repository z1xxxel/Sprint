import { api } from './client'
import type {
  AdminDashboard,
  AdminQuest,
  AdminTransaction,
  Page,
} from '../types'
import type { SupportTicket } from './support'

export type {
  AdminDashboard,
  AdminQuest,
  AdminTransaction,
  Page,
}

// Обновленный интерфейс для настроек
export interface SystemSetting {
  settingKey: string
  settingValue: string
  label: string | null
  description: string | null
  category: string | null
}

export const getAdminDashboard = () =>
  api.get<AdminDashboard>('/admin/dashboard').then((r) => r.data)

export const getSettings = () =>
  api.get<SystemSetting[]>('/admin/settings').then((r) => r.data)

export const updateSetting = (key: string, value: string) =>
  api
    .put<SystemSetting>(`/admin/settings/${key}`, null, { params: { value } })
    .then((r) => r.data)

export const getAdminQuests = () =>
  api.get<AdminQuest[]>('/admin/quests').then((r) => r.data)

export const getPendingQuests = () =>
  api.get<AdminQuest[]>('/admin/quests/pending').then((r) => r.data)

export const approveAdminQuest = (userQuestId: number) =>
  api.put<string>(`/admin/quests/${userQuestId}/approve`, null).then((r) => r.data)

export const rejectAdminQuest = (userQuestId: number, reason: string) =>
  api
    .put<string>(`/admin/quests/${userQuestId}/reject`, null, {
      params: { reason },
    })
    .then((r) => r.data)

export const cancelCompletedQuest = (userQuestId: number, reason: string) =>
  api
    .put<string>(`/admin/quests/${userQuestId}/cancel-completed`, null, {
      params: { reason },
    })
    .then((r) => r.data)

export const getAdminTransactions = (page = 0, size = 50) =>
  api
    .get<Page<AdminTransaction>>('/admin/transactions', { params: { page, size } })
    .then((r) => r.data)

export const cancelTransaction = (transactionId: number, reason: string) =>
  api
    .put<string>(`/admin/transactions/${transactionId}/cancel`, null, {
      params: { reason },
    })
    .then((r) => r.data)

export const applyPenalty = (params: {
  actorId: number
  userId: number
  coins: number
  rating: number
  reason: string
}) => api.post<string>('/admin/penalties', params).then((r) => r.data)

// === Тикеты (все, для админа) ===
export const getAllTickets = (actorId: number) =>
  api
    .get<SupportTicket[]>('/admin/tickets', { params: { actorId } })
    .then((r) => r.data)