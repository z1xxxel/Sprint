import { useState } from 'react'
import { useAuth } from '../store/auth'
import { updateQuestAdmin } from '../api/quests'
import { notify } from '../lib/notify'
import { IconX } from './Icons'
import type { QuestListItem } from '../types'

interface Props {
  quest: QuestListItem
  onClose: () => void
  onSaved: () => void
}

export default function EditQuestModal({ quest, onClose, onSaved }: Props) {
  const me = useAuth((s) => s.user)!
  const [title, setTitle] = useState(quest.title)
  const [description, setDescription] = useState(quest.description ?? '')
  const [rewardCoins, setRewardCoins] = useState(quest.rewardCoins)
  const [rewardRating, setRewardRating] = useState(quest.rewardRating ?? 0)
  const [deadline, setDeadline] = useState(
    quest.deadline ? quest.deadline.slice(0, 16) : ''
  )
  const [penaltyCoins, setPenaltyCoins] = useState(quest.penaltyCoins ?? 0)
  const [penaltyRating, setPenaltyRating] = useState(quest.penaltyRating ?? 0)
  
  // Новые поля
  const [isRepeatable, setIsRepeatable] = useState(quest.isRepeatable ?? false)
  const [cooldownHours, setCooldownHours] = useState(quest.cooldownHours ?? 0)

  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      await updateQuestAdmin(quest.questId, me.id, {
        title,
        description,
        rewardCoins,
        rewardRating,
        deadline: deadline ? deadline + ':00' : undefined,
        penaltyCoins,
        penaltyRating,
        isRepeatable,
        cooldownHours: isRepeatable && cooldownHours > 0 ? cooldownHours : 0,
      })
      notify.success('Квест обновлён')
      onSaved()
    } catch (e: any) {
      const msg = e?.response?.data || 'Не удалось сохранить'
      setError(msg)
      notify.error(e)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 overflow-y-auto"
      onClick={onClose}
    >
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-[#161b22] rounded-xl w-full max-w-lg p-6 space-y-4 my-8"
      >
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Редактировать квест
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-900 dark:hover:text-white p-1"
          >
            <IconX size={18} />
          </button>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 text-sm p-3 rounded border border-red-200 dark:border-red-500/30">
            {error}
          </div>
        )}

        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Название"
          required
          className="w-full border border-slate-300 dark:border-[#30363d] dark:bg-[#0d1117] dark:text-white rounded-md px-3 py-2 text-sm"
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder="Описание"
          className="w-full border border-slate-300 dark:border-[#30363d] dark:bg-[#0d1117] dark:text-white rounded-md px-3 py-2 text-sm resize-none"
        />

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-slate-500">Награда, монет</label>
            <input
              type="number"
              value={rewardCoins}
              onChange={(e) => setRewardCoins(Number(e.target.value))}
              min={1}
              className="w-full border border-slate-300 dark:border-[#30363d] dark:bg-[#0d1117] dark:text-white rounded-md px-3 py-2 mt-1 text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-slate-500">Награда, рейтинга (0–5)</label>
            <input
              type="number"
              value={rewardRating}
              onChange={(e) => {
                const v = Number(e.target.value)
                if (v < 0 || v > 5) return
                setRewardRating(v)
              }}
              min={0}
              max={5}
              step={0.5}
              className="w-full border border-slate-300 dark:border-[#30363d] dark:bg-[#0d1117] dark:text-white rounded-md px-3 py-2 mt-1 text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-slate-500">Дедлайн</label>
            <input
              type="datetime-local"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full border border-slate-300 dark:border-[#30363d] dark:bg-[#0d1117] dark:text-white rounded-md px-3 py-2 mt-1 text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-slate-500">Штраф, монет</label>
            <input
              type="number"
              value={penaltyCoins}
              onChange={(e) => setPenaltyCoins(Number(e.target.value))}
              min={0}
              className="w-full border border-slate-300 dark:border-[#30363d] dark:bg-[#0d1117] dark:text-white rounded-md px-3 py-2 mt-1 text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-slate-500">Штраф, рейтинга</label>
            <input
              type="number"
              value={penaltyRating}
              onChange={(e) => setPenaltyRating(Number(e.target.value))}
              min={0}
              step={0.5}
              className="w-full border border-slate-300 dark:border-[#30363d] dark:bg-[#0d1117] dark:text-white rounded-md px-3 py-2 mt-1 text-sm"
            />
          </div>
        </div>

        {/* Повторяемость */}
        <div className="border border-slate-200 dark:border-[#30363d] rounded-lg p-4 space-y-3">
          <label className="flex items-center gap-2 text-sm font-medium text-slate-900 dark:text-white">
            <input
              type="checkbox"
              checked={isRepeatable}
              onChange={(e) => setIsRepeatable(e.target.checked)}
            />
            Повторяемый квест
          </label>

          {isRepeatable && (
            <div className="pl-6">
              <label className="text-xs text-slate-600 dark:text-slate-400">
                Кулдаун после сдачи (в часах)
              </label>
              <input
                type="number"
                value={cooldownHours}
                onChange={(e) => setCooldownHours(Number(e.target.value))}
                min={0}
                placeholder="Например: 24"
                className="w-full border border-slate-300 dark:border-[#30363d] dark:bg-[#0d1117] dark:text-white rounded-md px-2 py-1.5 mt-1 text-sm"
              />
            </div>
          )}
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
            className="bg-brand-600 hover:bg-brand-700 text-white rounded-md px-4 py-2 text-sm font-medium disabled:opacity-50"
          >
            {busy ? 'Сохранение...' : 'Сохранить'}
          </button>
        </div>
      </form>
    </div>
  )
}