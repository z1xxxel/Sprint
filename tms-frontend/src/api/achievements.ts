import { api } from './client'
import type { AchievementType } from '../types'

export interface Achievement {
  id: number
  code: string
  name: string
  description: string | null
  type: AchievementType
  requiredProgress: number | null
  iconUrl: string | null
  rewardCoins: number
  groupCode: string | null
  level: number | null
}

export const getAllAchievements = () =>
  api.get<Achievement[]>('/achievements/all').then((r) => r.data)

export const grantAchievement = (actorId: number, userId: number, achievementCode: string) =>
  api
    .post<string>('/achievements/grant', { actorId, userId, achievementCode })
    .then((r) => r.data)