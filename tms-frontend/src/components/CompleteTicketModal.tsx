import { useState } from 'react'
import { IconCheck, IconX } from './Icons'

interface Props {
  ticketTitle: string
  onClose: () => void
  onConfirm: () => Promise<void>
}

export default function CompleteTicketModal({ ticketTitle, onClose, onConfirm }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await onConfirm()
    } catch (e: any) {
      setError(e?.response?.data || 'Не удалось завершить')
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-[#161b22] rounded-xl w-full max-w-md p-6 space-y-4"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Завершить обращение
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {ticketTitle}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-900 dark:hover:text-white p-1"
          >
            <IconX size={18} />
          </button>
        </div>

        <div className="bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 text-sm p-3 rounded border border-amber-200 dark:border-amber-500/30">
          После завершения переписка станет недоступна для ответа. Автор обращения
          сможет оставить оценку вашей работе.
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 text-sm p-3 rounded border border-red-200 dark:border-red-500/30">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm text-slate-600 dark:text-slate-300 disabled:opacity-50"
          >
            Отмена
          </button>
          <button
            type="submit"
            disabled={loading}
            className="bg-brand-600 hover:bg-brand-700 text-white rounded-md px-4 py-2 text-sm font-medium disabled:opacity-50 transition inline-flex items-center gap-1.5"
          >
            <IconCheck size={14} />
            {loading ? 'Завершение...' : 'Завершить'}
          </button>
        </div>
      </form>
    </div>
  )
}