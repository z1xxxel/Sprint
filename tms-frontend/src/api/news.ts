import { api } from './client'

export interface NewsDto {
  id: number
  title: string
  content: string
  coverUrl: string | null
  isPinned: boolean
  authorId: number
  authorName: string
  views: number
  averageRating: number | null
  ratingsCount: number
  myRating: number | null
  expiresAt: string | null
  isArchived: boolean
  archivedAt: string | null
  createdAt: string
  updatedAt: string | null
}

export interface CreateNewsPayload {
  title: string
  content: string
  coverUrl?: string | null
  isPinned?: boolean
  expiresAt?: string | null
}

export const getAllNews = (actorId?: number) =>
  api.get<NewsDto[]>('/news', { params: actorId ? { actorId } : {} }).then((r) => r.data)

export const getArchivedNews = (actorId?: number) =>
  api.get<NewsDto[]>('/news/archive', { params: actorId ? { actorId } : {} }).then((r) => r.data)

export const getLatestNews = (limit = 5, actorId?: number) =>
  api
    .get<NewsDto[]>('/news/latest', {
      params: { limit, ...(actorId ? { actorId } : {}) },
    })
    .then((r) => r.data)

export const getNewsById = (id: number, actorId?: number) =>
  api
    .get<NewsDto>(`/news/${id}`, { params: actorId ? { actorId } : {} })
    .then((r) => r.data)

export const viewNews = (id: number, actorId?: number) =>
  api
    .post<NewsDto>(`/news/${id}/view`, null, {
      params: actorId ? { actorId } : {},
    })
    .then((r) => r.data)

export const rateNews = (id: number, actorId: number, value: number) =>
  api
    .post<NewsDto>(`/news/${id}/rate`, { value }, { params: { actorId } })
    .then((r) => r.data)

export const archiveNews = (id: number, actorId: number) =>
  api.post<NewsDto>(`/news/${id}/archive`, null, { params: { actorId } }).then((r) => r.data)

export const restoreNews = (id: number, actorId: number) =>
  api.post<NewsDto>(`/news/${id}/restore`, null, { params: { actorId } }).then((r) => r.data)

export const createNews = (actorId: number, data: CreateNewsPayload) =>
  api.post<NewsDto>('/news', data, { params: { actorId } }).then((r) => r.data)

export const updateNews = (id: number, actorId: number, data: CreateNewsPayload) =>
  api.put<NewsDto>(`/news/${id}`, data, { params: { actorId } }).then((r) => r.data)

export const deleteNews = (id: number, actorId: number) =>
  api.delete<string>(`/news/${id}`, { params: { actorId } }).then((r) => r.data)