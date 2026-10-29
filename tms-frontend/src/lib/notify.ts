import axios from 'axios'
import { useToasts, type ToastType } from '../store/toasts'

function push(type: ToastType, message: string, title?: string, duration?: number) {
  useToasts.getState().push({ type, message, title, duration })
}

export function getErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data
    if (typeof data === 'string' && data.length > 0) return data
    if (data && typeof data === 'object' && 'message' in data) {
      return String((data as { message: unknown }).message)
    }
    if (err.response?.status === 401) return 'Требуется авторизация'
    if (err.response?.status === 403) return 'Нет доступа'
    if (err.message) return err.message
  }
  if (err instanceof Error) return err.message
  return 'Что-то пошло не так'
}

export const notify = {
  success: (message: string, title?: string) =>
    push('success', message, title),

  error: (messageOrErr: string | unknown, title?: string) =>
    push(
      'error',
      typeof messageOrErr === 'string'
        ? messageOrErr
        : getErrorMessage(messageOrErr),
      title,
      5000
    ),

  info: (message: string, title?: string) =>
    push('info', message, title),

  warning: (message: string, title?: string) =>
    push('warning', message, title),
}