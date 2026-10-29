import { api } from './client'
import type { SeasonInfo } from '../types'

export const getCurrentSeason = (actorId?: number) =>
  api
    .get<SeasonInfo>('/seasons/current', { params: actorId ? { actorId } : {} })
    .then((r) => r.data)