import { useState } from 'react'
import { useAuth } from '../store/auth'
import { extendUserQuestDeadline } from '../api/quests'
import { notify } from '../lib/notify'

interface Props {
  userQuestId: number
  userName: string
  questTitle: string
  currentDeadline: string | null
  onClose: () => void
  onSaved: () => void
}

function toLocalInput(iso: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function addDays(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return toLocalInput(d.toISOString())
}

export default function ExtendUserQuestDeadlineModal({
  userQuestId,
  userName,
  questTitle,
  currentDeadline,
  onClose,
  onSaved,
}: Props) {
  const me = useAuth((s) => s.user)!
  const [deadline, setDeadline] = useState(toLocalInput(currentDeadline))
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
      await extendUserQuestDeadline(
        userQuestId,
        me.id,
        deadline.length === 16 ? deadline + ':00' : deadline
      )
      notify.success('Дедлайн продлён')
      onSaved()
    } catch (e: any) {
      setError(e.response?.data || 'Ошибка')
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
            Продлить дедлайн
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {userName} · {questTitle}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 text-sm p-3 rounded">
            {error}
          </div>
        )}

        {currentDeadline && (
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Текущий: {new Date(currentDeadline).toLocaleString('ru-RU')}
          </div>
        )}

        <div className="flex flex-wrap gap-1.5">
          {[1, 3, 7, 14].map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDeadline(addDays(d))}
              className="text-xs px-3 py-1.5 border border-slate-300 dark:border-[#30363d] rounded-lg text-slate-700 dark:text-slate-300 hover:border-brand-500"
            >
              +{d} {d === 1 ? 'день' : d < 5 ? 'дня' : 'дней'}
            </button>
          ))}
        </div>

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