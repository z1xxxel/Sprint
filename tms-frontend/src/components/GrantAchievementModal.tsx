import { useState } from 'react'
import { useFetch } from '../hooks/useFetch'
import { getAllAchievements, grantAchievement } from '../api/achievements'

interface Props {
  userId: number
  userName: string
  actorId: number
  onClose: () => void
  onGranted: () => void
}

export default function GrantAchievementModal({
  userId,
  userName,
  actorId,
  onClose,
  onGranted,
}: Props) {
  const { data, loading, error } = useFetch(() => getAllAchievements(), [])
  const [selectedCode, setSelectedCode] = useState<string>('')
  const [submitting, setSubmitting] = useState(false)
  const [err, setErr] = useState('')

  const manualAchievements = (data ?? []).filter((a) => a.type === 'MANUAL')
  const selected = manualAchievements.find((a) => a.code === selectedCode)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedCode) {
      setErr('Выберите ачивку')
      return
    }
    setSubmitting(true)
    setErr('')
    try {
      await grantAchievement(actorId, userId, selectedCode)
      onGranted()
    } catch (e: any) {
      setErr(e.response?.data || 'Не удалось выдать')
    } finally {
      setSubmitting(false)
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
            Выдать ачивку
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{userName}</p>
        </div>

        {(err || error) && (
          <div className="bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 text-sm p-3 rounded border border-red-200 dark:border-red-500/30">
            {err || error}
          </div>
        )}

        {loading && <div className="text-slate-500 text-sm">Загрузка...</div>}

        {!loading && manualAchievements.length === 0 && (
          <div className="bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 text-sm p-3 rounded border border-amber-200 dark:border-amber-500/30">
            В системе пока нет ручных ачивок. Перезапустите бэкенд, чтобы засеять.
          </div>
        )}

        {manualAchievements.length > 0 && (
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Ачивка
            </label>
            <select
              value={selectedCode}
              onChange={(e) => setSelectedCode(e.target.value)}
              className="w-full border border-slate-300 dark:border-[#30363d] dark:bg-[#0d1117] dark:text-white rounded-md px-3 py-2 mt-1 text-sm focus:outline-none focus:border-brand-500"
            >
              <option value="">— Выберите —</option>
              {manualAchievements.map((a) => (
                <option key={a.id} value={a.code}>
                  {a.name}
                  {a.rewardCoins > 0 ? ` (+${a.rewardCoins} монет)` : ''}
                </option>
              ))}
            </select>

            {selected?.description && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                {selected.description}
              </p>
            )}

            {selected && selected.rewardCoins > 0 && (
              <div className="mt-2 inline-flex items-center gap-1 text-xs bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 px-2 py-1 rounded border border-amber-200 dark:border-amber-500/30 font-medium">
                +{selected.rewardCoins} монет
              </div>
            )}
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
            disabled={submitting || !selectedCode}
            className="bg-brand-600 hover:bg-brand-700 text-white rounded-md px-4 py-2 text-sm font-medium disabled:opacity-50 transition"
          >
            {submitting ? 'Выдача...' : 'Выдать'}
          </button>
        </div>
      </form>
    </div>
  )
}