import { useState, useEffect } from 'react'
import { useAuth } from '../../store/auth'
import { getAllUsers } from '../../api/users'
import { applyPenalty } from '../../api/admin'
import type { UserListItem } from '../../types'

export default function ManagePenaltiesTab() {
  const user = useAuth((s) => s.user)!
  const [users, setUsers] = useState<UserListItem[]>([])
  const [userId, setUserId] = useState<number | null>(null)
  const [coins, setCoins] = useState(0)
  const [rating, setRating] = useState(0)
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    getAllUsers()
      .then((d) => setUsers(d.filter((u) => u.id !== user.id)))
      .catch(() => {})
  }, [user.id])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!userId) return
    setError('')
    setSuccess('')
    setLoading(true)
    try {
      await applyPenalty({
        actorId: user.id,
        userId,
        coins,
        rating,
        reason: reason || 'Нарушение',
      })
      setSuccess('Штраф применён')
      setCoins(0)
      setRating(0)
      setReason('')
      setTimeout(() => setSuccess(''), 3000)
    } catch (e: any) {
      setError(e.response?.data || 'Не удалось применить')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl">
      <form
        onSubmit={submit}
        className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-[#30363d] p-5 sm:p-6 space-y-4"
      >
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Наложить штраф</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Списать монеты и/или рейтинг у сотрудника
          </p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 text-sm p-3 rounded-md border border-red-100 dark:border-red-500/20">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-400 text-sm p-3 rounded-md border border-brand-200 dark:border-brand-500/20">
            {success}
          </div>
        )}

        <div>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Сотрудник
          </label>
          <select
            value={userId ?? ''}
            onChange={(e) => setUserId(e.target.value ? Number(e.target.value) : null)}
            className="w-full border border-slate-300 dark:border-[#30363d] dark:bg-[#0d1117] dark:text-white rounded-md px-3 py-2 mt-1 text-sm focus:outline-none focus:border-brand-500"
            required
          >
            <option value="">— Выберите —</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.email})
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Монеты
            </label>
            <input
              type="number"
              value={coins}
              onChange={(e) => setCoins(Number(e.target.value))}
              min={0}
              className="w-full border border-slate-300 dark:border-[#30363d] dark:bg-[#0d1117] dark:text-white rounded-md px-3 py-2 mt-1 text-sm focus:outline-none focus:border-brand-500"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Рейтинг
            </label>
            <input
              type="number"
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              min={0}
              step={0.5}
              className="w-full border border-slate-300 dark:border-[#30363d] dark:bg-[#0d1117] dark:text-white rounded-md px-3 py-2 mt-1 text-sm focus:outline-none focus:border-brand-500"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Причина
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={2}
            placeholder="Например: нарушение регламента"
            className="w-full border border-slate-300 dark:border-[#30363d] dark:bg-[#0d1117] dark:text-white rounded-md px-3 py-2 mt-1 text-sm focus:outline-none focus:border-brand-500 resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !userId}
          className="w-full bg-red-600 hover:bg-red-700 text-white rounded-md py-2.5 font-medium text-sm disabled:opacity-50 transition"
        >
          {loading ? 'Применение...' : 'Применить штраф'}
        </button>
      </form>
    </div>
  )
}