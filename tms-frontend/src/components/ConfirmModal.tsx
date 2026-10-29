import { useState } from 'react'

export interface ConfirmOptions {
  title: string
  message?: string
  confirmLabel?: string
  cancelLabel?: string
  danger?: boolean
}

interface Props {
  options: ConfirmOptions
  onConfirm: () => void | Promise<void>
  onCancel: () => void
}

export default function ConfirmModal({ options, onConfirm, onCancel }: Props) {
  const [loading, setLoading] = useState(false)

  async function handleConfirm() {
    setLoading(true)
    try {
      await onConfirm()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-[90] p-4"
      onClick={loading ? undefined : onCancel}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-[#161b22] rounded-xl w-full max-w-md p-6 space-y-4"
      >
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            {options.title}
          </h2>
          {options.message && (
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {options.message}
            </p>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 text-sm text-slate-600 dark:text-slate-300 disabled:opacity-50"
          >
            {options.cancelLabel ?? 'Отмена'}
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className={`text-white rounded-md px-4 py-2 text-sm font-medium disabled:opacity-50 transition ${
              options.danger
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-brand-600 hover:bg-brand-700'
            }`}
          >
            {loading ? '...' : (options.confirmLabel ?? 'Подтвердить')}
          </button>
        </div>
      </div>
    </div>
  )
}