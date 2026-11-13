import { api } from './client'

export interface UserNotification {
  id: number
  userId: number
  type: string
  title: string
  message: string | null
  isRead: boolean
  relatedId: number | null
  createdAt: string
}

export const getMyNotifications = (userId: number) =>
  api.get<UserNotification[]>(`/notifications/user/${userId}`).then((r) => r.data)

export const getUnreadNotificationsCount = (userId: number) =>
  api.get<{ count: number }>(`/notifications/user/${userId}/unread-count`).then((r) => r.data.count)

export const markAllNotificationsRead = (userId: number) =>
  api.put(`/notifications/user/${userId}/read-all`).then((r) => r.data)