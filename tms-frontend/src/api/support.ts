import { api } from './client'

export type TicketStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'

export interface SupportTicket {
  id: number
  topic: string
  description: string
  creatorId: number
  creatorName: string
  assigneeId: number | null
  assigneeName: string | null
  status: TicketStatus
  isQuestRequest: boolean
  createdAt: string
  closedAt: string | null
  rating: number | null
  reviewComment: string | null
}

export interface TicketMessage {
  id: number
  senderId: number
  senderName: string
  text: string
  attachmentUrl: string | null
  replyToId: number | null
  editedAt: string | null
  createdAt: string
}

export interface TicketChat {
  ticketId: number
  creatorId: number
  assigneeId: number | null
  topic: string
  description: string
  creatorName: string
  assigneeName: string | null
  status: TicketStatus
  isQuestRequest: boolean
  createdAt: string
  rating: number | null
  reviewComment: string | null
  messages: TicketMessage[]
}

export const createTicket = (
  userId: number,
  topic: string,
  description: string,
  isQuestRequest: boolean
) =>
  api
    .post<SupportTicket>('/support/tickets', {
      userId,
      topic,
      description,
      isQuestRequest,
    })
    .then((r) => r.data)

export const getMyTickets = (userId: number) =>
  api.get<SupportTicket[]>(`/support/tickets/my/${userId}`).then((r) => r.data)

export const getPendingTickets = () =>
  api.get<SupportTicket[]>('/support/tickets/pending').then((r) => r.data)

export const getAssignedTickets = (supportId: number) =>
  api
    .get<SupportTicket[]>(`/support/tickets/assigned/${supportId}`)
    .then((r) => r.data)

export const takeTicket = (ticketId: number, supportId: number) =>
  api
    .put<SupportTicket>(`/support/tickets/${ticketId}/take`, null, {
      params: { supportId },
    })
    .then((r) => r.data)

export const completeTicket = (ticketId: number, supportId: number) =>
  api
    .put<SupportTicket>(`/support/tickets/${ticketId}/complete`, null, {
      params: { supportId },
    })
    .then((r) => r.data)

export const getTicketChat = (ticketId: number, actorId: number) =>
  api
    .get<TicketChat>(`/support/tickets/${ticketId}/chat`, { params: { actorId } })
    .then((r) => r.data)

export const sendTicketMessage = (
  ticketId: number,
  senderId: number,
  text: string,
  attachmentUrl?: string,
  replyToId?: number
) =>
  api
    .post<TicketMessage>(`/support/tickets/${ticketId}/messages`, {
      senderId,
      text,
      attachmentUrl: attachmentUrl ?? null,
      replyToId: replyToId ?? null,
    })
    .then((r) => r.data)

export const editTicketMessage = (
  ticketId: number,
  messageId: number,
  userId: number,
  text: string
) =>
  api
    .put<TicketMessage>(
      `/support/tickets/${ticketId}/messages/${messageId}`,
      { text },
      { params: { userId } }
    )
    .then((r) => r.data)

export const deleteTicketMessage = (
  ticketId: number,
  messageId: number,
  userId: number
) =>
  api
    .delete(`/support/tickets/${ticketId}/messages/${messageId}`, {
      params: { userId },
    })
    .then((r) => r.data)

export const leaveTicketReview = (
  ticketId: number,
  userId: number,
  rating: number,
  comment: string
) =>
  api
    .post<SupportTicket>(`/support/tickets/${ticketId}/review`, {
      userId,
      rating,
      comment,
    })
    .then((r) => r.data)

export const grantTicketAchievement = (
  ticketId: number,
  supportId: number,
  achievementCode: string
) =>
  api
    .post<string>(`/support/tickets/${ticketId}/grant-achievement`, null, {
      params: { supportId, achievementCode },
    })
    .then((r) => r.data)