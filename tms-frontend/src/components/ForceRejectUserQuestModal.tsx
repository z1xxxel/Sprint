import { useState } from 'react'
import { useAuth } from '../store/auth'
import { forceRejectUserQuest } from '../api/quests'
import { notify } from '../lib/notify'

interface Props {
  userQuestId: number
  userName: string
  questTitle: string
  penaltyCoins: number | null
  penaltyRating: number | null
  onClose: () => void
  onDone: () => void
}

export default function ForceRejectUserQuestModal({
  userQuestId,
  userName,
  questTitle,
  penaltyCoins,
  penaltyRating,
  onClose,
  onDone,
}: Props) {
  const me = useAuth((s) => s.user)!

  const hasCoinsPenalty = penaltyCoins != null && penaltyCoins > 0
  const hasRatingPenalty = penaltyRating != null && penaltyRating > 0
  const hasPenalty = hasCoinsPenalty || hasRatingPenalty

  const [applyPenalty, setApplyPenalty] = useState(hasPenalty)
  const [reason, setReason] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!reason.trim()) {
      setError('Укажите причину')
      return
    }
    setBusy(true)
    setError('')
    try {
      await forceRejectUserQuest(userQuestId, me.id, applyPenalty && hasPenalty, reason.trim())
      notify.warning(
        `Квест провален${applyPenalty && hasPenalty ? ' со штрафом' : ''} · ${userName}`
      )
      onDone()
    } catch (e: any) {
      setError(e.response?.data || 'Не удалось завершить квест')
    } finally {
      setBusy(false)
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
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Принудительно завершить квест
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {userName} · {questTitle}
          </p>
        </div>

        <div className="bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 text-sm p-3 rounded">
          Квест будет <strong>провален</strong> для этого пользователя. Действие
          необратимо.
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 text-sm p-3 rounded">
            {error}
          </div>
        )}

        {/* Переключатель штрафа — только если штраф предусмотрен */}
        {hasPenalty ? (
          <label className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 dark:border-[#30363d] cursor-pointer hover:bg-slate-50 dark:hover:bg-[#0d1117] transition">
            <input
              type="checkbox"
              checked={applyPenalty}
              onChange={(e) => setApplyPenalty(e.target.checked)}
              className="mt-0.5"
            />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-slate-900 dark:text-white">
                Применить штраф
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex flex-wrap gap-2">
                {hasCoinsPenalty && (
                  <span className="text-red-600 dark:text-red-400 font-semibold">
                    −{penaltyCoins!.toFixed(0)} монет
                  </span>
                )}
                {hasRatingPenalty && (
                  <span className="text-red-600 dark:text-red-400 font-semibold">
                    −{penaltyRating!.toFixed(1)} рейтинга
                  </span>
                )}
              </div>
            </div>
          </label>
        ) : (
          <div className="text-xs text-slate-500 dark:text-slate-400 italic bg-slate-50 dark:bg-[#0d1117] p-3 rounded">
            Для этого квеста штраф не предусмотрен — завершение пройдёт без списаний.
          </div>
        )}

        <div>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Причина *
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            placeholder="Например: дедлайн истёк, квест не выполнен"
            required
            className="w-full border border-slate-300 dark:border-[#30363d] dark:bg-[#0d1117] dark:text-white rounded-md px-3 py-2 mt-1 text-sm resize-none focus:outline-none focus:border-brand-500"
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
            disabled={busy}
            className="bg-red-600 hover:bg-red-700 text-white rounded-md px-4 py-2 text-sm font-medium disabled:opacity-50 transition"
          >
            {busy ? '...' : applyPenalty && hasPenalty ? 'Провалить со штрафом' : 'Провалить'}
          </button>
        </div>
      </form>
    </div>
  )
}