import { useState } from 'react'
import { assignEvent } from '../api/events'
import type { EventDto } from '../types'

interface Props {
  event: EventDto
  actorId: number
  onClose: () => void
  onApproved: () => void
}

export default function ApproveEventModal({ event, actorId, onClose, onApproved }: Props) {
  const [paidInCoins, setPaidInCoins] = useState(false)
  const [rewardCoins, setRewardCoins] = useState(100)
  const [rewardRating, setRewardRating] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (paidInCoins) {
      if (rewardCoins <= 0) return setError('Сумма монет должна быть > 0')
      if (rewardRating < 0) return setError('Рейтинг не может быть отрицательным')
    }
    setLoading(true)
    try {
      await assignEvent(event.id, actorId, {
        paidInCoins,
        rewardCoins: paidInCoins ? rewardCoins : undefined,
        rewardRating: paidInCoins ? rewardRating : undefined,
      })
      onApproved()
    } catch (e: any) {
      setError(e.response?.data || 'Ошибка одобрения')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 overflow-y-auto"
      onClick={onClose}
    >
      <form
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-[#161b22] rounded-xl w-full max-w-md p-6 space-y-4 my-8"
      >
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Одобрить событие
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{event.nameEvent}</p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 text-sm p-3 rounded border border-red-100 dark:border-red-500/20">
            {error}
          </div>
        )}

        {/* Пожелания пользователя */}
        {event.commentToAdmin && (
          <div className="bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs p-3 rounded border border-amber-200 dark:border-amber-500/30">
            <div className="font-medium mb-1">Пожелания организатора:</div>
            <div>{event.commentToAdmin}</div>
          </div>
        )}

        <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
          <input
            type="checkbox"
            checked={paidInCoins}
            onChange={(e) => setPaidInCoins(e.target.checked)}
          />
          Начислить награду участникам
        </label>

        {paidInCoins && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Монет каждому
              </label>
              <input
                type="number"
                value={rewardCoins}
                onChange={(e) => setRewardCoins(Number(e.target.value))}
                min={1}
                className="w-full border border-slate-300 dark:border-[#30363d] dark:bg-[#0d1117] dark:text-white rounded-md px-3 py-2 mt-1 text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Рейтинга каждому
              </label>
              <input
                type="number"
                value={rewardRating}
                onChange={(e) => setRewardRating(Number(e.target.value))}
                min={0}
                step={0.5}
                className="w-full border border-slate-300 dark:border-[#30363d] dark:bg-[#0d1117] dark:text-white rounded-md px-3 py-2 mt-1 text-sm"
              />
            </div>
          </div>
        )}

        {paidInCoins && (
          <div className="bg-slate-50 dark:bg-[#0d1117] text-xs text-slate-500 dark:text-slate-400 p-2 rounded">
            Награда будет списана из казны компании.
          </div>
        )}

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
            {loading ? '...' : 'Одобрить'}
          </button>
        </div>
      </form>
    </div>
  )
}