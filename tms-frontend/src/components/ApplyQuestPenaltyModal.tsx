import { useState } from 'react'
import { useAuth } from '../store/auth'
import { useFetch } from '../hooks/useFetch'
import { applyQuestPenalty, getQuestParticipants } from '../api/quests'
import { notify } from '../lib/notify'
import { IconX } from './Icons'

interface Props {
  quest: {
    questId: number
    title: string
    penaltyCoins: number | null
    penaltyRating: number | null
  }
  onClose: () => void
  onApplied: () => void
}

export default function ApplyQuestPenaltyModal({ quest, onClose, onApplied }: Props) {
  const me = useAuth((s) => s.user)!
  const { data: participants } = useFetch(
    () => getQuestParticipants(quest.questId, me.id),
    [quest.questId, me.id]
  )

  const [applyCoins, setApplyCoins] = useState((quest.penaltyCoins ?? 0) > 0)
  const [applyRating, setApplyRating] = useState((quest.penaltyRating ?? 0) > 0)
  const [reason, setReason] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const notCompleted = (participants ?? []).filter(
    (p) => p.status !== 'COMPLETED' && p.status !== 'CANCELLED'
  )

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!applyCoins && !applyRating) {
      setError('Выберите хотя бы один штраф')
      return
    }
    if (!reason.trim()) {
      setError('Укажите причину')
      return
    }
    setBusy(true)
    setError('')
    try {
      const result: any = await applyQuestPenalty(quest.questId, {
        actorId: me.id,
        userIds: null,
        applyCoins,
        applyRating,
        reason: reason.trim(),
      })
      notify.success(
        `Штраф: ${result.coinsApplied} монет, ${result.ratingApplied} рейтинга`
      )
      if (result.skipped?.length > 0) {
        notify.warning(`Пропущено: ${result.skipped.join(', ')}`)
      }
      onApplied()
    } catch (e) {
      const msg = (e as any)?.response?.data || 'Не удалось'
      setError(msg)
      notify.error(e)
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
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Применить штраф
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {quest.title}
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

        <div className="bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 text-sm p-3 rounded border border-red-200 dark:border-red-500/30">
          Будет оштрафовано <strong>{notCompleted.length}</strong> сотрудников
          (не выполнивших квест)
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 text-sm p-3 rounded">
            {error}
          </div>
        )}

        <div className="space-y-2">
          {quest.penaltyCoins !== null && quest.penaltyCoins > 0 && (
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={applyCoins}
                onChange={(e) => setApplyCoins(e.target.checked)}
              />
              Списать <strong>{quest.penaltyCoins}</strong> монет
            </label>
          )}
          {quest.penaltyRating !== null && quest.penaltyRating > 0 && (
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={applyRating}
                onChange={(e) => setApplyRating(e.target.checked)}
              />
              Списать <strong>{quest.penaltyRating}</strong> рейтинга
            </label>
          )}
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Причина *
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            placeholder="Например: не выполнен в срок"
            required
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
            disabled={busy || notCompleted.length === 0}
            className="bg-red-600 hover:bg-red-700 text-white rounded-md px-4 py-2 text-sm font-medium disabled:opacity-50"
          >
            {busy ? '...' : 'Применить штраф'}
          </button>
        </div>
      </form>
    </div>
  )
}