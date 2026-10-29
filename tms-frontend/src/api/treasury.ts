import { api } from './client'
import type { Treasury } from '../types'

export type TreasuryTxType =
  | 'FUND'
  | 'WITHDRAW'
  | 'REWARD_PAYOUT'
  | 'QUEST_PAYOUT'
  | 'EVENT_PAYOUT'
  | 'SEASON_PAYOUT'
  | 'PENALTY_RETURN'
  | 'QUEST_CANCEL_RETURN'
  | 'TRANSACTION_CANCEL_RETURN'
  | 'OTHER'

export interface TreasuryLog {
  id: number
  type: TreasuryTxType
  typeLabel: string
  incoming: boolean
  amount: number
  description: string | null
  actorId: number | null
  actorName: string | null
  balanceAfter: number
  createdAt: string
}

export interface Page<T> {
  content: T[]
  totalElements: number
  totalPages: number
  number: number
  size: number
  first: boolean
  last: boolean
}

export const getTreasury = () =>
  api.get<Treasury>('/treasury').then((r) => r.data)

export const fundTreasury = (actorId: number, amount: number) =>
  api
    .post<Treasury>('/treasury/fund', null, { params: { actorId, amount } })
    .then((r) => r.data)

export const withdrawTreasury = (actorId: number, amount: number) =>
  api
    .post<Treasury>('/treasury/withdraw', null, { params: { actorId, amount } })
    .then((r) => r.data)

export const getTreasuryLogs = (actorId: number, page = 0, size = 30) =>
  api
    .get<Page<TreasuryLog>>('/treasury/logs', { params: { actorId, page, size } })
    .then((r) => r.data)