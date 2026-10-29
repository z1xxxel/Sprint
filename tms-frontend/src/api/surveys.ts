import { api } from './client'

export interface SurveyOption {
  id: number
  text: string
  value: number
}

export interface SurveyQuestion {
  id: number
  text: string
  options: SurveyOption[]
}

export interface Survey {
  id: number
  title: string
  description: string | null
  isActive: boolean
  deadline: string
  rewardRating: number
  penaltyRating: number
  creator: { id: number; name: string }
  createdAt: string
  questions: SurveyQuestion[]
}

export interface SurveyStatsOption {
  optionId: number
  optionText: string
  value: number
  count: number
  percentage: number
}

export interface SurveyStatsQuestion {
  questionId: number
  questionText: string
  totalAnswers: number
  averageValue: number
  options: SurveyStatsOption[]
}

export interface SurveyStats {
  surveyId: number
  title: string
  deadline: string
  isActive: boolean
  totalUsers: number
  respondedUsers: number
  responseRatePercent: number
  questions: SurveyStatsQuestion[]
}

export interface SurveyUserAnswer {
  questionText: string
  optionText: string
  value: number
}

export interface SurveyUserResponse {
  userId: number
  userName: string
  userEmail: string
  answeredAt: string
  answers: SurveyUserAnswer[]
}

export interface SurveyCreateOption {
  text: string
  value: number
}

export interface SurveyCreateQuestion {
  text: string
  options: SurveyCreateOption[]
}

export interface CreateSurveyPayload {
  creatorId: number
  title: string
  description: string
  deadline: string
  rewardRating: number
  penaltyRating: number
  questions: SurveyCreateQuestion[]
}


export const getSurveys = (isActive?: boolean) =>
  api
    .get<Survey[]>('/surveys', { params: isActive !== undefined ? { isActive } : {} })
    .then((r) => r.data)

export const createSurvey = (payload: CreateSurveyPayload) =>
  api.post<Survey>('/surveys', payload).then((r) => r.data)

export const deleteSurvey = (surveyId: number) =>
  api.delete(`/surveys/${surveyId}`).then((r) => r.data)

export const submitSurvey = (
  surveyId: number,
  userId: number,
  answers: Record<number, number>
) =>
  api
    .post<string>(`/surveys/${surveyId}/submit`, { userId, answers })
    .then((r) => r.data)

export const getSurveyStats = (surveyId: number) =>
  api.get<SurveyStats>(`/surveys/${surveyId}/stats`).then((r) => r.data)

export const getSurveyDetailedResponses = (surveyId: number) =>
  api
    .get<SurveyUserResponse[]>(`/surveys/${surveyId}/responses`)
    .then((r) => r.data)

export const saveSurveyAsTemplate = (surveyId: number, templateName: string) =>
  api
    .post(`/surveys/${surveyId}/save-as-template`, null, {
      params: { templateName },
    })
    .then((r) => r.data)

const LS_KEY = (userId: number) => `survey_passed_${userId}`

export function getPassedSurveyIds(userId: number): Set<number> {
  try {
    const raw = localStorage.getItem(LS_KEY(userId))
    if (!raw) return new Set()
    const arr = JSON.parse(raw) as number[]
    return new Set(arr)
  } catch {
    return new Set()
  }
}

export function markSurveyPassed(userId: number, surveyId: number) {
  const set = getPassedSurveyIds(userId)
  set.add(surveyId)
  localStorage.setItem(LS_KEY(userId), JSON.stringify(Array.from(set)))
}