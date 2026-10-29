import { api } from './client'
import type { ChatSummary, ChatDetail, ChatMessage } from '../types'

export const getMyChats = (userId: number) =>
  api.get<ChatSummary[]>('/chats/my', { params: { userId } }).then((r) => r.data)

export const startChat = (myId: number, otherUserId: number) =>
  api.post<ChatSummary>('/chats/start', { myId, otherUserId }).then((r) => r.data)

export const getChat = (chatId: number, userId: number) =>
  api.get<ChatDetail>(`/chats/${chatId}`, { params: { userId } }).then((r) => r.data)

export const sendChatMessage = (
  chatId: number,
  senderId: number,
  text: string,
  attachmentUrl?: string,
  replyToId?: number
) =>
  api
    .post<ChatMessage>(`/chats/${chatId}/messages`, {
      senderId,
      text,
      attachmentUrl: attachmentUrl ?? null,
      replyToId: replyToId ?? null,
    })
    .then((r) => r.data)

export const editChatMessage = (
  chatId: number,
  messageId: number,
  userId: number,
  text: string
) =>
  api
    .put<ChatMessage>(
      `/chats/${chatId}/messages/${messageId}`,
      { text },
      { params: { userId } }
    )
    .then((r) => r.data)

export const deleteChatMessage = (
  chatId: number,
  messageId: number,
  userId: number
) =>
  api
    .delete(`/chats/${chatId}/messages/${messageId}`, { params: { userId } })
    .then((r) => r.data)