import { api } from './client'
import type { EventDto, ParticipantDto } from '../types'

export const getEvents = (actorId?: number) =>
  api.get<EventDto[]>('/events', { params: actorId ? { actorId } : {} }).then((r) => r.data)

export const getEventsByOrganizer = (organizerId: number, actorId?: number) =>
  api
    .get<EventDto[]>(`/events/organizer/${organizerId}`, {
      params: actorId ? { actorId } : {},
    })
    .then((r) => r.data)

export const createEvent = (data: any) =>
  api.post<EventDto>('/events', data).then((r) => r.data)

export const assignEvent = (
  id: number,
  actorId: number,
  rewards?: { paidInCoins: boolean; rewardCoins?: number; rewardRating?: number }
) =>
  api
    .put<EventDto>(`/events/${id}/assign`, {
      actorId,
      paidInCoins: rewards?.paidInCoins ?? null,
      rewardCoins: rewards?.rewardCoins ?? null,
      rewardRating: rewards?.rewardRating ?? null,
    })
    .then((r) => r.data)

export const rollbackRewards = (id: number, actorId: number, reason: string) =>
  api
    .put<EventDto>(`/events/${id}/rollback-rewards`, { actorId, reason })
    .then((r) => r.data)

export const cancelEvent = (id: number) =>
  api.put<EventDto>(`/events/${id}/cancel`).then((r) => r.data)

export const getParticipants = (eventId: number) =>
  api.get<ParticipantDto[]>(`/events/${eventId}/participants`).then((r) => r.data)

export const registerForEvent = (eventId: number, userId: number) =>
  api.post(`/events/${eventId}/participants`, { userId }).then((r) => r.data)

export const unregisterFromEvent = (eventId: number, userId: number) =>
  api.delete(`/events/${eventId}/participants/${userId}`).then((r) => r.data)

export const getMyParticipations = (userId: number) =>
  api.get<number[]>('/events/my-participations', { params: { userId } }).then((r) => r.data)