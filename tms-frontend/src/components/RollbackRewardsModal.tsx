import { useState } from 'react'
import { rollbackRewards } from '../api/events'
import type { EventDto } from '../types'

interface Props {
  event: EventDto
  participantCount: number
  actorId: number
  onClose: () => void
  onRolledBack: () => void
}

export default function RollbackRewardsModal({
  event,
  participantCount,
  actorId,
  onClose,
  onRolledBack,
}: Props) {
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!reason.trim()) return setError('Укажите причину')
    setLoading(true)
    setError('')
    try {
      await rollbackRewards(event.id, actorId, reason.trim())
      onRolledBack()
    } catch (e: any) {
      setError(e.response?.data || 'Не удалось откатить')
    } finally {
      setLoading(false)
    }
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
            Откатить награды
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{event.nameEvent}</p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 text-sm p-3 rounded border border-red-100 dark:border-red-500/20">
            {error}
          </div>
        )}

        <div className="bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 text-sm p-3 rounded border border-red-200 dark:border-red-500/30 space-y-1">
          <div className="font-medium">У {participantCount} участников будут списаны:</div>
          {event.rewardCoins && <div>• {event.rewardCoins.toFixed(0)} монет</div>}
          {event.rewardRating && <div>• {event.rewardRating.toFixed(1)} рейтинга</div>}
          <div className="text-xs mt-1 opacity-80">
            Событие перейдёт в статус «Отменено». Действие необратимо.
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Причина отката *
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            placeholder="Например: событие не состоялось"
            className="w-full border border-slate-300 dark:border-[#30363d] dark:bg-[#0d1117] dark:text-white rounded-md px-3 py-2 mt-1 text-sm resize-none focus:outline-none focus:border-brand-500"
            required
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
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 text-white rounded-md px-4 py-2 text-sm font-medium disabled:opacity-50"
          >
            {loading ? '...' : 'Откатить награды'}
          </button>
        </div>
      </form>
    </div>
  )
}