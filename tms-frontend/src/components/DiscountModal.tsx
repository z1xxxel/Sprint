import { useState } from 'react'
import { createDiscount, deleteDiscount } from '../api/shop'

interface Props {
  productId: number
  productName: string
  hasExisting: boolean
  currentPercent: number | null
  actorId: number
  onClose: () => void
  onSaved: () => void
}

export default function DiscountModal({
  productId,
  productName,
  hasExisting,
  currentPercent,
  actorId,
  onClose,
  onSaved,
}: Props) {
  const [percent, setPercent] = useState(currentPercent ?? 20)
  const [days, setDays] = useState(7)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (percent < 1 || percent > 99) {
      setError('Скидка должна быть от 1 до 99%')
      return
    }
    if (days < 1 || days > 365) {
      setError('Срок должен быть от 1 до 365 дней')
      return
    }
    setLoading(true)
    try {
      // Если была активная скидка — удаляем её перед созданием новой
      if (hasExisting) {
        try {
          await deleteDiscount(productId, actorId)
        } catch {
          // игнорируем, если не было — создадим новую
        }
      }
      const now = new Date()
      const until = new Date(now.getTime() + days * 86400000)
      await createDiscount(productId, actorId, {
        percent,
        validFrom: new Date(now.getTime() - 1000).toISOString().slice(0, 19),
        validTo: until.toISOString().slice(0, 19),
      })
      onSaved()
    } catch (e: any) {
      setError(e.response?.data || 'Не удалось установить скидку')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-[60] p-4"
      onClick={onClose}
    >
      <form
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-[#161b22] rounded-xl w-full max-w-md p-6 space-y-4"
      >
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            {hasExisting ? 'Изменить скидку' : 'Добавить скидку'}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{productName}</p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 text-sm p-3 rounded border border-red-100 dark:border-red-500/20">
            {error}
          </div>
        )}

        {hasExisting && (
          <div className="bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs p-3 rounded border border-amber-200 dark:border-amber-500/30">
            Текущая скидка {currentPercent}% будет заменена новой.
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Скидка, %
            </label>
            <input
              type="number"
              value={percent}
              onChange={(e) => setPercent(Number(e.target.value))}
              min={1}
              max={99}
              required
              className="w-full border border-slate-300 dark:border-[#30363d] dark:bg-[#0d1117] dark:text-white rounded-md px-3 py-2 mt-1 text-sm focus:outline-none focus:border-brand-500"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              На сколько дней
            </label>
            <input
              type="number"
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              min={1}
              max={365}
              required
              className="w-full border border-slate-300 dark:border-[#30363d] dark:bg-[#0d1117] dark:text-white rounded-md px-3 py-2 mt-1 text-sm focus:outline-none focus:border-brand-500"
            />
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-[#0d1117] rounded-lg p-3 text-sm">
          <div className="flex justify-between text-slate-600 dark:text-slate-400">
            <span>Действует до</span>
            <span className="font-medium text-slate-900 dark:text-white">
              {new Date(Date.now() + days * 86400000).toLocaleDateString('ru-RU')}
            </span>
          </div>
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
            disabled={loading}
            className="bg-brand-600 hover:bg-brand-700 text-white rounded-md px-4 py-2 text-sm font-medium disabled:opacity-50"
          >
            {loading ? '...' : hasExisting ? 'Заменить' : 'Применить'}
          </button>
        </div>
      </form>
    </div>
  )
}