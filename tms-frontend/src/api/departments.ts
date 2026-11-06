import { api } from './client'
import type { Department } from '../types'

export const getDepartments = () =>
  api.get<Department[]>('/departments').then((r) => r.data)

export const assignUserToDepartment = (deptId: number, userId: number) =>
  api.put(`/departments/${deptId}/users/${userId}`).then((r) => r.data)

export const removeUserFromDepartment = (userId: number) =>
  api.delete(`/departments/users/${userId}`).then((r) => r.data)