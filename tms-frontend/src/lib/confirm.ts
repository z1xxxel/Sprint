import { create } from 'zustand'
import type { ConfirmOptions } from '../components/ConfirmModal'

interface PendingConfirm extends ConfirmOptions {
  resolve: (ok: boolean) => void
}

interface State {
  pending: PendingConfirm | null
  open: (options: ConfirmOptions) => Promise<boolean>
  resolve: (ok: boolean) => void
}

export const useConfirm = create<State>((set, get) => ({
  pending: null,
  open: (options) =>
    new Promise<boolean>((resolve) => {
      set({ pending: { ...options, resolve } })
    }),
  resolve: (ok) => {
    const p = get().pending
    if (p) p.resolve(ok)
    set({ pending: null })
  },
}))

/**
 * Красивая замена `window.confirm()`.
 * Возвращает Promise<boolean>.
 *
 * @example
 * if (await confirmDialog({ title: 'Удалить?', danger: true })) { ... }
 */
export function confirmDialog(options: ConfirmOptions): Promise<boolean> {
  return useConfirm.getState().open(options)
}