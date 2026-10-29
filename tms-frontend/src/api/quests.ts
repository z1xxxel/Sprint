// src/api/quests.ts
import { api } from './client'
import type { QuestListItem, AdminQuestLog } from '../types'

export interface UserQuestForReview {
  id: number
  userId: number
  questTitle: string
  userName: string
  status: string
  startedAt: string
  submittedAt: string | null
  completedAt: string | null
  adminComment: string | null
}

export interface CreateQuestWithAudiencePayload {
  creatorId: number
  title: string
  description: string
  rewardCoins: number
  rewardRating: number | null
  deadline: string | null
  isMandatory: boolean
  penaltyCoins: number | null
  penaltyRating: number | null
  isRepeatable: boolean          // <-- ДОБАВЛЕНО
  cooldownHours: number | null   // <-- ДОБАВЛЕНО
  allUsers: boolean
  departmentIds: number[] | null
  userIds: number[] | null
  excludeUserIds: number[] | null
}

export interface AdminQuestParticipant {
  userQuestId: number
  userId: number
  userName: string
  status: string
  startedAt: string
  submittedAt: string | null
  completedAt: string | null
}

export interface ApplyQuestPenaltyPayload {
  actorId: number
  userIds: number[] | null
  applyCoins: boolean
  applyRating: boolean
  reason: string
}

// ==========================================
// === REVIEW ===
// ==========================================
export const getQuestsForReview = (actorId: number) =>
  api.get<UserQuestForReview[]>('/quests/review', { params: { actorId } }).then((r) => r.data)

export const getQuestsForReviewByUser = (userId: number, actorId: number) =>
  api
    .get<UserQuestForReview[]>(`/quests/review/user/${userId}`, { params: { actorId } })
    .then((r) => r.data)

export const approveQuest = (userQuestId: number, actorId: number) =>
  api.put(`/quests/review/${userQuestId}/approve`, null, { params: { actorId } }).then((r) => r.data)

export const rejectQuest = (userQuestId: number, actorId: number, reason: string) =>
  api.put(`/quests/review/${userQuestId}/reject`, null, { params: { actorId, reason } }).then((r) => r.data)

export const createQuestWithAudience = (payload: CreateQuestWithAudiencePayload) =>
  api.post('/quests/admin/create', payload).then((r) => r.data)

export const updateQuestAdmin = (
  id: number,
  actorId: number,
  data: {
    title?: string
    description?: string
    rewardCoins?: number
    rewardRating?: number
    deadline?: string
    penaltyCoins?: number
    penaltyRating?: number
    isRepeatable?: boolean 
    cooldownHours?: number | null 
  }
) =>
  api
    .put(`/quests/admin/${id}`, { actorId, ...data })
    .then((r) => r.data)

export const extendQuestDeadline = (id: number, actorId: number, newDeadline: string) =>
  api
    .put(`/quests/admin/${id}/extend-deadline`, null, {
      params: { actorId, newDeadline },
    })
    .then((r) => r.data)

export const getQuestParticipants = (id: number, actorId: number) =>
  api
    .get<AdminQuestParticipant[]>(`/quests/admin/${id}/participants`, {
      params: { actorId },
    })
    .then((r) => r.data)

export const applyQuestPenalty = (id: number, payload: ApplyQuestPenaltyPayload) =>
  api.post(`/quests/admin/${id}/apply-penalty`, payload).then((r) => r.data)

export const getAdminQuestLogs = (actorId: number) =>
  api.get<AdminQuestLog[]>('/quests/admin/logs', { params: { actorId } }).then((r) => r.data)

export const getAvailableQuests = (userId: number) =>
  api.get<QuestListItem[]>('/quests', { params: { userId } }).then((r) => r.data)

export const startQuest = (questId: number, userId: number) =>
  api.post(`/quests/${questId}/start`, null, { params: { userId } }).then((r) => r.data)

export const submitQuest = (questId: number, userId: number) =>
  api.post(`/quests/${questId}/submit`, null, { params: { userId } }).then((r) => r.data)

export const deleteQuest = (questId: number, actorId: number) =>
  api.delete(`/quests/${questId}`, { params: { actorId } }).then((r) => r.data)