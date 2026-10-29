import { api } from './client'

interface TransferResponse {
  id: number
  fromUserId: number
  toUserId: number
  amount: number
  type: string
  comment: string
  tag: string | null
  createdAt: string
}

export const sendThanks = (params: {
  fromUserId: number
  toUserId: number
  amount: number
  comment: string
  tag?: string
}) => api.post<TransferResponse>('/transfers', params).then((r) => r.data)

export const grantCoins = (params: {
  actorId: number
  toUserId: number
  amount: number
  comment: string
}) => api.post<TransferResponse>('/transfers/grant', params).then((r) => r.data)