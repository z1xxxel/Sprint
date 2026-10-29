import { useState } from 'react'
import { useAuth } from '../store/auth'
import { extendQuestDeadline } from '../api/quests'
import { notify } from '../lib/notify'
import { IconX } from './Icons'

interface Props {
  quest: { questId: number; title: string; deadline: string | null }
  onClose: () => void
  onSaved: () => void
}

export default function ExtendDeadlineModal({ quest, onClose, onSaved }: Props) {
  const me = useAuth((s) => s.user)!
  const [deadline, setDeadline] = useState(
    quest.deadline ? quest.deadline.slice(0, 16) : ''
  )
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!deadline) {
      setError('Укажите новый дедлайн')
      return
    }
    setBusy(true)
    setError('')
    try {
      await extendQuestDeadline(quest.questId, me.id, deadline + ':00')
      notify.success('Дедлайн продлён')
      onSaved()
    } catch (e) {
      const msg = (e as any)?.response?.data || 'Ошибка'
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
        className="bg-white dark:bg-[#161b22] rounded-xl w-full max-w-sm p-6 space-y-4"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Продлить дедлайн
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

        {quest.deadline && (
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Текущий: {new Date(quest.deadline).toLocaleString('ru-RU')}
          </div>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 text-sm p-3 rounded">
            {error}
          </div>
        )}

        <input
          type="datetime-local"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          required
          className="w-full border border-slate-300 dark:border-[#30363d] dark:bg-[#0d1117] dark:text-white rounded-md px-3 py-2 text-sm"
        />

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
            {busy ? '...' : 'Продлить'}
          </button>
        </div>
      </form>
    </div>
  )
}