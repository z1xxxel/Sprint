import { api } from './client'
import type { Department } from '../types'

export const getDepartments = () =>
  api.get<Department[]>('/departments').then((r) => r.data)