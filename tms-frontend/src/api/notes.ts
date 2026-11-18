import { api } from './client'

export interface CalendarNote {
  id: number
  title: string
  text: string | null
  noteTime: string
  remindMinutesBefore: number | null
  createdAt: string
}

export interface CreateNotePayload {
  title: string
  text: string | null
  noteTime: string
  remindMinutesBefore: number | null
}

export const getMyNotes = (userId: number) =>
  api.get<CalendarNote[]>(`/notes/user/${userId}`).then((r) => r.data)

export const createNote = (userId: number, data: CreateNotePayload) =>
  api.post<CalendarNote>(`/notes/user/${userId}`, data).then((r) => r.data)

export const updateNote = (noteId: number, userId: number, data: CreateNotePayload) =>
  api.put<CalendarNote>(`/notes/${noteId}/user/${userId}`, data).then((r) => r.data)

export const deleteNote = (noteId: number, userId: number) =>
  api.delete(`/notes/${noteId}/user/${userId}`).then((r) => r.data)

/** Заметки, по которым нужно показать toast */
export const getPendingToasts = (userId: number) =>
  api.get<CalendarNote[]>(`/notes/user/${userId}/pending-toasts`).then((r) => r.data)

/** Отметить, что toast показан */
export const markToastShown = (noteId: number, userId: number) =>
  api.put(`/notes/${noteId}/user/${userId}/toast-shown`).then((r) => r.data)