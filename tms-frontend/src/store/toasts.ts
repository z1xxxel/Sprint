import { create } from 'zustand'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface Toast {
  id: number
  type: ToastType
  title?: string
  message: string
  duration: number
}

interface State {
  toasts: Toast[]
  push: (t: Omit<Toast, 'id' | 'duration'> & { duration?: number }) => number
  remove: (id: number) => void
  clear: () => void
}

let nextId = 1

export const useToasts = create<State>((set, get) => ({
  toasts: [],
  push: ({ type, title, message, duration }) => {
    const id = nextId++
    const toast: Toast = {
      id,
      type,
      title,
      message,
      duration: duration ?? 4000,
    }
    set((s) => ({ toasts: [...s.toasts, toast] }))

    if (toast.duration > 0) {
      setTimeout(() => {
        get().remove(id)
      }, toast.duration)
    }

    return id
  },
  remove: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
  clear: () => set({ toasts: [] }),
}))