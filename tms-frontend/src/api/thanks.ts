import { api } from './client'

export type ThanksTag =
  | 'GRATITUDE'
  | 'FOR_HELP'
  | 'INITIATIVE'
  | 'MENTORING'
  | 'TRANSFER'
  | 'OTHER'

export interface ThanksFeed {
  transactionId: number
  fromUserName: string
  toUserName: string
  amount: number
  tag: ThanksTag
  comment: string | null
  createdAt: string
}

export interface UserThanks {
  transactionId: number
  fromUserId: number
  fromUserName: string
  toUserId: number
  toUserName: string
  amount: number
  tag: ThanksTag
  comment: string | null
  createdAt: string
}

export interface ThanksStats {
  totalReceived: number
  totalSent: number
  totalCoinsReceived: number
  totalCoinsSent: number
  topThankers: { userName: string; count: number }[]
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

export const getThanksFeed = () =>
  api.get<ThanksFeed[]>('/thanks/feed').then((r) => r.data)

export const getUserThanks = (
  userId: number,
  direction: 'received' | 'sent',
  page = 0,
  size = 20
) =>
  api
    .get<Page<UserThanks>>(`/thanks/user/${userId}`, {
      params: { direction, page, size },
    })
    .then((r) => r.data)

export const getThanksStats = (userId: number) =>
  api.get<ThanksStats>(`/thanks/user/${userId}/stats`).then((r) => r.data)

export interface TopThanked {
  userId: number
  userName: string
  avatarUrl: string | null
  count: number
}

export const getTopThankedWeek = (limit = 3) =>
  api.get<TopThanked[]>('/thanks/top-week', { params: { limit } }).then((r) => r.data)