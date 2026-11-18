import { api } from './client'
import type {
  KnowledgeCategory,
  KnowledgeArticleListItem,
  KnowledgeArticle,
  KnowledgeSubmission,
} from '../types'

// ==========================================
// === КАТЕГОРИИ
// ==========================================
export const getKnowledgeCategories = () =>
  api.get<KnowledgeCategory[]>('/knowledge/categories').then((r) => r.data)

export const createKnowledgeCategory = (data: {
  actorId: number
  name: string
  description?: string
  sortOrder?: number
}) =>
  api
    .post<KnowledgeCategory>('/knowledge/categories', data)
    .then((r) => r.data)

// ==========================================
// === СТАТЬИ
// ==========================================
export const getKnowledgeArticles = (params: {
  query?: string
  categoryId?: number
}) =>
  api
    .get<KnowledgeArticleListItem[]>('/knowledge/articles', { params })
    .then((r) => r.data)

export const getKnowledgeArticle = (id: number) =>
  api.get<KnowledgeArticle>(`/knowledge/articles/${id}`).then((r) => r.data)

// ==========================================
// === ЗАЯВКИ
// ==========================================
export const createKnowledgeSubmission = (data: {
  actorId: number
  targetArticleId: number | null
  title: string
  content: string
  categoryId: number
  commentFromAuthor?: string | null
}) =>
  api
    .post<KnowledgeSubmission>('/knowledge/submissions', data)
    .then((r) => r.data)

export const getMyKnowledgeSubmissions = (userId: number) =>
  api
    .get<KnowledgeSubmission[]>('/knowledge/submissions/my', { params: { userId } })
    .then((r) => r.data)

export const getPendingKnowledgeSubmissions = (actorId: number) =>
  api
    .get<KnowledgeSubmission[]>('/knowledge/submissions/pending', {
      params: { actorId },
    })
    .then((r) => r.data)

export const getKnowledgeSubmissionDetails = (id: number, actorId: number) =>
  api
    .get<KnowledgeSubmission>(`/knowledge/submissions/${id}`, {
      params: { actorId },
    })
    .then((r) => r.data)

export const reviewKnowledgeSubmission = (
  id: number,
  data: {
    actorId: number
    approve: boolean
    rewardCoins: number | null
    rewardRating: number | null
    rejectionReason: string | null
  }
) =>
  api
    .post<KnowledgeSubmission>(`/knowledge/submissions/${id}/review`, data)
    .then((r) => r.data)

export const deleteKnowledgeSubmission = (id: number, actorId: number) =>
  api
    .delete(`/knowledge/submissions/${id}`, { params: { actorId } })
    .then((r) => r.data)