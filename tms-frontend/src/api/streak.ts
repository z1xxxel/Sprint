import { api } from './client'

export interface StreakInfo {
  currentStreak: number
  longestStreak: number
  lastActiveDate: string | null
  daysToNextReward: number
  nextRewardAtStreak: number
  daysToMonthBonus: number
  nextMonthBonusAtStreak: number
  earnedRatingToday: number
}

export const touchStreak = (userId: number) =>
  api.post<StreakInfo>('/streak/touch', null, { params: { userId } }).then((r) => r.data)

export const getStreak = (userId: number) =>
  api.get<StreakInfo>(`/streak/${userId}`).then((r) => r.data)