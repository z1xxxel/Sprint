import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '../../store/auth'
import { getAllUsers } from '../../api/users'
import { applyPenalty } from '../../api/admin'
import { notify } from '../../lib/notify'
import Avatar from '../../components/Avatar'
import { IconSearch } from '../../components/Icons'
import type { UserListItem } from '../../types'

const PRESET_REASONS = [
  'Нарушение KPI',
  'Опоздание',
  'Нарушение регламента',
  'Невыполнение задач',
  'Другое',
]

export default function ManagePenaltiesTab() {
  const user = useAuth((s) => s.user)!
  const [users, setUsers] = useState<UserListItem[]>([])
  const [query, setQuery] = useState('')
  const [selectedUser, setSelectedUser] = useState<UserListItem | null>(null)
  const [coins, setCoins] = useState(0)
  const [rating, setRating] = useState(0)
  const [reasonPreset, setReasonPreset] = useState('')
  const [reasonCustom, setReasonCustom] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    getAllUsers()
      .then((d) => setUsers(d.filter((u) => u.id !== user.id)))
      .catch(() => {})
  }, [user.id])

  const filtered = useMemo(() => {
    if (!query.trim()) return users.slice(0, 8)
    const q = query.toLowerCase()
    return users.filter(
      (u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    )
  }, [users, query])

  const finalReason =
    reasonPreset === 'Другое' || (!reasonPreset && reasonCustom)
      ? reasonCustom
      : reasonPreset

  const balanceAfter = selectedUser ? selectedUser.balance - coins : 0
  const ratingAfter = selectedUser ? Math.max(0, selectedUser.currentRating - rating) : 0
  const notEnoughCoins = selectedUser != null && coins > selectedUser.balance
  const nothingToApply = coins === 0 && rating === 0
  const canSubmit =
    selectedUser && !nothingToApply && !notEnoughCoins && finalReason.trim() && !loading

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit || !selectedUser) return

    setError('')
    setSuccess('')
    setLoading(true)
    try {
      await applyPenalty({
        actorId: user.id,
        userId: selectedUser.id,
        coins,
        rating,
        reason: finalReason || 'Нарушение',
      })
      notify.success(`Штраф применён · ${selectedUser.name}`)
      setSuccess(
        `Штраф применён: ${coins > 0 ? `−${coins} монет ` : ''}${rating > 0 ? `−${rating} рейтинга` : ''}`
      )
      setCoins(0)
      setRating(0)
      setReasonPreset('')
      setReasonCustom('')
      setTimeout(() => setSuccess(''), 4000)
    } catch (e: any) {
      const msg = e.response?.data || 'Не удалось применить'
      setError(msg)
      notify.error(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          Наложение штрафов
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Списание монет и рейтинга у сотрудника
        </p>
      </div>

      {success && (
        <div className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-sm p-3 rounded-lg border border-emerald-200 dark:border-emerald-500/30">
          ✓ {success}
        </div>
      )}
      {error && (
        <div className="bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 text-sm p-3 rounded-lg border border-red-200 dark:border-red-500/30">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Левая: выбор сотрудника */}
        <div className="lg:col-span-2 space-y-3">
          <div className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-[#30363d] p-4">
            <div className="text-sm font-medium text-slate-900 dark:text-white mb-2">
              Сотрудник
            </div>
            <div className="relative mb-3">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                <IconSearch size={14} />
              </div>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Поиск по имени или email"
                className="w-full border border-slate-300 dark:border-[#30363d] dark:bg-[#0d1117] dark:text-white rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-brand-500"
              />
            </div>

            <div className="space-y-1.5 max-h-[360px] overflow-y-auto">
              {filtered.length === 0 && (
                <div className="text-xs text-slate-400 text-center py-4">Не найдено</div>
              )}
              {filtered.map((u) => {
                const isSelected = selectedUser?.id === u.id
                return (
                  <button
                    key={u.id}
                    onClick={() => setSelectedUser(u)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition text-left ${
                      isSelected
                        ? 'bg-brand-50 dark:bg-brand-500/10 ring-1 ring-brand-300 dark:ring-brand-500/40'
                        : 'hover:bg-slate-50 dark:hover:bg-[#0d1117]'
                    }`}
                  >
                    <Avatar name={u.name} size="sm" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-slate-900 dark:text-white truncate">
                        {u.name}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {u.balance.toFixed(0)} монет · {u.currentRating.toFixed(1)} рейтинг
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Правая: форма */}
        <form onSubmit={submit} className="lg:col-span-3 space-y-3">
          {!selectedUser ? (
            <div className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-[#30363d] p-10 text-center">
              <div className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                Выберите сотрудника
              </div>
              <div className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                Он появится в этой форме
              </div>
            </div>
          ) : (
            <>
              {/* Карточка выбранного */}
              <div className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-[#30363d] p-4">
                <div className="flex items-center gap-3">
                  <Avatar name={selectedUser.name} size="md" />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-slate-900 dark:text-white truncate">
                      {selectedUser.name}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {selectedUser.email}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-3">
                  <div className="bg-slate-50 dark:bg-[#0d1117] rounded-lg px-3 py-2">
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Баланс
                    </div>
                    <div className="text-base font-bold text-slate-900 dark:text-white">
                      {selectedUser.balance.toFixed(0)}
                    </div>
                  </div>
                  <div className="bg-slate-50 dark:bg-[#0d1117] rounded-lg px-3 py-2">
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Рейтинг
                    </div>
                    <div className="text-base font-bold text-slate-900 dark:text-white">
                      {selectedUser.currentRating.toFixed(1)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Суммы */}
              <div className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-[#30363d] p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      Списать монет
                    </label>
                    <input
                      type="number"
                      value={coins}
                      onChange={(e) => setCoins(Math.max(0, Number(e.target.value)))}
                      min={0}
                      max={selectedUser.balance}
                      className={`w-full border rounded-lg px-3 py-2 mt-1 text-sm focus:outline-none ${
                        notEnoughCoins
                          ? 'border-red-400 dark:border-red-500/50 dark:bg-[#0d1117] dark:text-white'
                          : 'border-slate-300 dark:border-[#30363d] dark:bg-[#0d1117] dark:text-white focus:border-brand-500'
                      }`}
                    />
                    {notEnoughCoins && (
                      <div className="text-xs text-red-600 dark:text-red-400 mt-1">
                        Превышает баланс ({selectedUser.balance.toFixed(0)})
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      Списать рейтинга
                    </label>
                    <input
                      type="number"
                      value={rating}
                      onChange={(e) => setRating(Math.max(0, Number(e.target.value)))}
                      min={0}
                      step={0.5}
                      className="w-full border border-slate-300 dark:border-[#30363d] dark:bg-[#0d1117] dark:text-white rounded-lg px-3 py-2 mt-1 text-sm focus:outline-none focus:border-brand-500"
                    />
                  </div>
                </div>

                {/* Превью */}
                {!nothingToApply && (
                  <div className="bg-slate-50 dark:bg-[#0d1117] rounded-lg p-3 space-y-1.5">
                    <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                      После штрафа
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">Баланс</span>
                      <span className="font-semibold">
                        <span className="text-slate-900 dark:text-white">
                          {selectedUser.balance.toFixed(0)}
                        </span>
                        <span className="text-slate-400 mx-1.5">→</span>
                        <span
                          className={
                            balanceAfter < 0
                              ? 'text-red-600 dark:text-red-400'
                              : 'text-emerald-600 dark:text-emerald-400'
                          }
                        >
                          {balanceAfter.toFixed(0)}
                        </span>
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">Рейтинг</span>
                      <span className="font-semibold">
                        <span className="text-slate-900 dark:text-white">
                          {selectedUser.currentRating.toFixed(1)}
                        </span>
                        <span className="text-slate-400 mx-1.5">→</span>
                        <span className="text-amber-600 dark:text-amber-400">
                          {ratingAfter.toFixed(1)}
                        </span>
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Причина */}
              <div className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-[#30363d] p-4 space-y-3">
                <div className="text-sm font-medium text-slate-900 dark:text-white">
                  Причина
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_REASONS.map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setReasonPreset(r === reasonPreset ? '' : r)}
                      className={`text-xs px-3 py-1.5 rounded-lg border transition ${
                        reasonPreset === r
                          ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-400 font-medium'
                          : 'border-slate-300 dark:border-[#30363d] text-slate-600 dark:text-slate-300 hover:border-brand-400'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
                {(reasonPreset === 'Другое' || !reasonPreset) && (
                  <textarea
                    value={reasonCustom}
                    onChange={(e) => setReasonCustom(e.target.value)}
                    rows={2}
                    placeholder="Опишите причину штрафа"
                    className="w-full border border-slate-300 dark:border-[#30363d] dark:bg-[#0d1117] dark:text-white rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:border-brand-500"
                  />
                )}
              </div>

              <button
                type="submit"
                disabled={!canSubmit}
                className="w-full bg-red-600 hover:bg-red-700 text-white rounded-lg py-2.5 font-medium text-sm disabled:opacity-50 transition"
              >
                {loading ? 'Применение...' : 'Применить штраф'}
              </button>
            </>
          )}
        </form>
      </div>
    </div>
  )
}