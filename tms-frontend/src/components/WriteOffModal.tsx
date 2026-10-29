import { useState } from 'react'

interface Props {
  productName: string
  maxStock: number
  onClose: () => void
  onWriteOff: (data: { quantity: number; reason: string; comment?: string }) => void
}

const REASONS = [
  { value: 'DAMAGED', label: 'Повреждение / брак' },
  { value: 'GIFT', label: 'Подарок' },
  { value: 'LOST', label: 'Потеря' },
  { value: 'OTHER', label: 'Другое' },
]

export default function WriteOffModal({ productName, maxStock, onClose, onWriteOff }: Props) {
  const [quantity, setQuantity] = useState(1)
  const [reason, setReason] = useState('GIFT')
  const [comment, setComment] = useState('')
  const [error, setError] = useState('')

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (quantity < 1) return setError('Количество должно быть > 0')
    if (quantity > maxStock) return setError(`На складе только ${maxStock} шт.`)
    onWriteOff({ quantity, reason, comment: comment.trim() || undefined })
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <form
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-[#161b22] rounded-xl w-full max-w-md p-6 space-y-4"
      >
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Списать со склада
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{productName}</p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 text-sm p-3 rounded border border-red-100 dark:border-red-500/20">
            {error}
          </div>
        )}

        <div>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Количество *
          </label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            min={1}
            max={maxStock}
            className="w-full border border-slate-300 dark:border-[#30363d] dark:bg-[#0d1117] dark:text-white rounded-md px-3 py-2 mt-1 text-sm focus:outline-none focus:border-brand-500"
          />
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
            В наличии: {maxStock} шт.
          </p>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Причина *
          </label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full border border-slate-300 dark:border-[#30363d] dark:bg-[#0d1117] dark:text-white rounded-md px-3 py-2 mt-1 text-sm"
          >
            {REASONS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Комментарий
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={2}
            placeholder="Кому выдан, что случилось"
            className="w-full border border-slate-300 dark:border-[#30363d] dark:bg-[#0d1117] dark:text-white rounded-md px-3 py-2 mt-1 text-sm resize-none"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm text-slate-600 dark:text-slate-300"
          >
            Отмена
          </button>
          <button
            type="submit"
            className="bg-red-600 hover:bg-red-700 text-white rounded-md px-4 py-2 text-sm font-medium"
          >
            Списать −{quantity}
          </button>
        </div>
      </form>
    </div>
  )
}