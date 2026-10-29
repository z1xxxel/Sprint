import { useState } from 'react'
import { useAuth } from '../../store/auth'
import { useFetch } from '../../hooks/useFetch'
import {
  getTreasury,
  fundTreasury,
  withdrawTreasury,
  getTreasuryLogs,
  type TreasuryLog,
} from '../../api/treasury'
import { notify } from '../../lib/notify'
import { confirmDialog } from '../../lib/confirm'
import {
  IconTrophy,
  IconPlus,
  IconMinus,
  IconArrowUp,
  IconArrowDown,
  IconArrowLeft,
  IconArrowRight,
  IconLock,
} from '../../components/Icons'

type Mode = 'fund' | 'withdraw'

export default function AdminTreasuryTab() {
  const me = useAuth((s) => s.user)!
  const isAdmin = me.role === 'ADMIN'

  const { data, loading, error } = useFetch(() => getTreasury(), [])

  const [local, setLocal] = useState<number | null>(null)
  const [mode, setMode] = useState<Mode>('fund')
  const [amount, setAmount] = useState(1000)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)

  const balance = local ?? data?.balance ?? 0

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErr('')

    if (amount <= 0) {
      setErr('Сумма должна быть больше 0')
      notify.error('Сумма должна быть больше 0')
      return
    }
    if (mode === 'withdraw' && !isAdmin) {
      setErr('Только администратор может списывать из казны')
      notify.error('Только администратор может списывать из казны')
      return
    }
    if (mode === 'withdraw' && amount > balance) {
      const msg = `В казне только ${balance.toFixed(0)} монет`
      setErr(msg)
      notify.error(msg)
      return
    }

    if (mode === 'withdraw') {
      const ok = await confirmDialog({
        title: 'Списать из казны?',
        message: `Будет списано ${amount} монет. Текущий баланс: ${balance.toFixed(0)} монет.`,
        confirmLabel: 'Списать',
        danger: true,
      })
      if (!ok) return
    }

    setBusy(true)
    try {
      const treasury =
        mode === 'fund'
          ? await fundTreasury(me.id, amount)
          : await withdrawTreasury(me.id, amount)
      setLocal(treasury.balance)
      notify.success(
        mode === 'fund'
          ? `Казна пополнена на ${amount} монет`
          : `Из казны списано ${amount} монет`
      )
      setRefreshKey((k) => k + 1)
    } catch (e) {
      notify.error(e)
    } finally {
      setBusy(false)
    }
  }

  if (loading) return <div className="text-slate-500">Загрузка...</div>
  if (error) return <div className="text-red-600">{error}</div>
  if (!data) return null

  return (
    <div className="space-y-6">
      {/* HERO */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500 via-orange-500 to-rose-600 text-white p-6 sm:p-8">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-24 -mt-24 pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <IconTrophy size={20} className="text-white/90" />
                <span className="text-xs text-white/80 uppercase tracking-wider">
                  Казна компании
                </span>
              </div>
              <div className="text-4xl sm:text-5xl font-bold mt-1">
                {balance.toFixed(0)}
                <span className="text-lg font-medium text-white/70 ml-2">монет</span>
              </div>
              {data.lastFundedAt && (
                <div className="text-xs text-white/70 mt-2">
                  Последнее изменение:{' '}
                  {new Date(data.lastFundedAt).toLocaleString('ru-RU')}
                </div>
              )}
            </div>
            {!isAdmin && (
              <div className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur rounded-full px-3 py-1.5 text-xs">
                <IconLock size={12} />
                HR: только пополнение
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Форма + логи */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-[#30363d] p-5 space-y-4">
            {/* Переключатель */}
            <div className="grid grid-cols-2 gap-2 p-1 rounded-lg bg-slate-100 dark:bg-[#0d1117]">
              <button
                type="button"
                onClick={() => {
                  setMode('fund')
                  setErr('')
                }}
                className={`py-2 px-3 text-sm font-medium rounded-md transition flex items-center justify-center gap-1.5 ${
                  mode === 'fund'
                    ? 'bg-white dark:bg-[#161b22] text-brand-700 dark:text-brand-400 shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <IconPlus size={14} /> Пополнить
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!isAdmin) {
                    notify.error('Только администратор может списывать из казны')
                    return
                  }
                  setMode('withdraw')
                  setErr('')
                }}
                disabled={!isAdmin}
                className={`py-2 px-3 text-sm font-medium rounded-md transition flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed ${
                  mode === 'withdraw'
                    ? 'bg-white dark:bg-[#161b22] text-red-700 dark:text-red-400 shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                title={!isAdmin ? 'Доступно только администратору' : ''}
              >
                {!isAdmin ? <IconLock size={12} /> : <IconMinus size={14} />}
                Списать
              </button>
            </div>

            <p className="text-sm text-slate-500 dark:text-slate-400">
              {mode === 'fund'
                ? 'Сумма будет добавлена в казну'
                : 'Сумма будет списана из казны'}
            </p>

            {err && (
              <div className="bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 text-sm p-3 rounded border border-red-200 dark:border-red-500/30">
                {err}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                min={1}
                required
                className="w-full border border-slate-300 dark:border-[#30363d] dark:bg-[#0d1117] dark:text-white rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-brand-500"
              />
              <div className="flex flex-wrap gap-2">
                {[1000, 5000, 10000, 50000].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setAmount(preset)}
                    className="text-xs px-2.5 py-1.5 border border-slate-300 dark:border-[#30363d] rounded text-slate-700 dark:text-slate-300 hover:border-brand-500 transition"
                  >
                    {mode === 'fund' ? '+' : '−'}
                    {preset}
                  </button>
                ))}
                {mode === 'withdraw' && (
                  <button
                    type="button"
                    onClick={() => setAmount(Math.floor(balance))}
                    className="text-xs px-2.5 py-1.5 border border-red-300 dark:border-red-500/30 rounded text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition"
                  >
                    Всё
                  </button>
                )}
              </div>
              <button
                type="submit"
                disabled={
                  busy || amount <= 0 || (mode === 'withdraw' && (!isAdmin || amount > balance))
                }
                className={`w-full text-white rounded-md py-2.5 text-sm font-medium disabled:opacity-50 transition inline-flex items-center justify-center gap-1.5 ${
                  mode === 'fund'
                    ? 'bg-brand-600 hover:bg-brand-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {mode === 'fund' ? <IconPlus size={14} /> : <IconMinus size={14} />}
                {busy ? '...' : mode === 'fund' ? 'Пополнить' : 'Списать'}
              </button>
            </form>
          </div>

          {/* Справка */}
          <div className="bg-slate-50 dark:bg-[#0d1117] rounded-xl border border-slate-200 dark:border-[#30363d] p-4">
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Как работает
            </div>
            <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5">
              <li className="flex items-start gap-2">
                <IconArrowUp
                  size={12}
                  className="shrink-0 mt-0.5 text-brand-600 dark:text-brand-400"
                />
                <span>
                  <strong>Пополнение</strong> — HR и ADMIN
                </span>
              </li>
              <li className="flex items-start gap-2">
                <IconArrowDown
                  size={12}
                  className="shrink-0 mt-0.5 text-red-600 dark:text-red-400"
                />
                <span>
                  <strong>Списание</strong> — только ADMIN
                </span>
              </li>
              <li className="flex items-start gap-2">
                <IconArrowDown
                  size={12}
                  className="shrink-0 mt-0.5 text-amber-600 dark:text-amber-400"
                />
                <span>
                  <strong>Награды</strong> — автосписание при выдаче
                </span>
              </li>
              <li className="flex items-start gap-2">
                <IconArrowUp
                  size={12}
                  className="shrink-0 mt-0.5 text-blue-600 dark:text-blue-400"
                />
                <span>
                  <strong>Возвраты</strong> — при отмене квестов и транзакций
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Логи */}
        <div className="lg:col-span-3">
          <TreasuryLogsBlock key={refreshKey} actorId={me.id} />
        </div>
      </div>
    </div>
  )
}

// ==========================================
// === Логи казны ===
// ==========================================
function TreasuryLogsBlock({ actorId }: { actorId: number }) {
  const [page, setPage] = useState(0)
  const { data, loading, error } = useFetch(
    () => getTreasuryLogs(actorId, page, 30),
    [actorId, page]
  )

  return (
    <div className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-[#30363d] overflow-hidden h-full flex flex-col">
      <div className="px-5 py-3 border-b border-slate-200 dark:border-[#30363d] flex items-center justify-between">
        <div>
          <div className="font-semibold text-slate-900 dark:text-white">
            Движение казны
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {data ? `Всего операций: ${data.totalElements}` : 'Загрузка...'}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto max-h-[600px]">
        {loading && <div className="p-6 text-sm text-slate-500">Загрузка...</div>}
        {error && <div className="p-6 text-sm text-red-600">{error}</div>}

        {data && data.content.length === 0 && (
          <div className="p-8 text-center text-sm text-slate-500 dark:text-slate-400">
            Пока нет операций
          </div>
        )}

        {data && data.content.length > 0 && (
          <div className="divide-y divide-slate-100 dark:divide-[#30363d]">
            {data.content.map((log) => (
              <LogRow key={log.id} log={log} />
            ))}
          </div>
        )}
      </div>

      {data && data.totalPages > 1 && (
        <div className="border-t border-slate-200 dark:border-[#30363d] px-5 py-3 flex items-center justify-center gap-3">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={data.first}
            className="inline-flex items-center gap-1 px-3 py-1.5 border border-slate-300 dark:border-[#30363d] rounded text-sm text-slate-700 dark:text-slate-300 hover:border-brand-500 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            <IconArrowLeft size={14} />
          </button>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {page + 1} / {data.totalPages}
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={data.last}
            className="inline-flex items-center gap-1 px-3 py-1.5 border border-slate-300 dark:border-[#30363d] rounded text-sm text-slate-700 dark:text-slate-300 hover:border-brand-500 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            <IconArrowRight size={14} />
          </button>
        </div>
      )}
    </div>
  )
}

function LogRow({ log }: { log: TreasuryLog }) {
  const incoming = log.incoming
  return (
    <div className="px-5 py-3 flex items-start gap-3">
      <div
        className={`w-8 h-8 shrink-0 rounded-lg flex items-center justify-center ${
          incoming
            ? 'bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400'
            : 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400'
        }`}
      >
        {incoming ? <IconArrowDown size={16} /> : <IconArrowUp size={16} />}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-0.5">
          <div className="font-medium text-sm text-slate-900 dark:text-white truncate">
            {log.typeLabel}
          </div>
          <div
            className={`text-sm font-semibold shrink-0 ${
              incoming
                ? 'text-brand-600 dark:text-brand-400'
                : 'text-red-600 dark:text-red-400'
            }`}
          >
            {incoming ? '+' : '−'}
            {log.amount.toFixed(0)}
          </div>
        </div>
        {log.description && (
          <div className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
            {log.description}
          </div>
        )}
        <div className="flex items-center justify-between text-xs text-slate-400 dark:text-slate-500 mt-1 gap-2">
          <div className="truncate">
            {log.actorName ? `Автор: ${log.actorName} · ` : ''}
            {new Date(log.createdAt).toLocaleString('ru-RU')}
          </div>
          <div className="shrink-0">Баланс: {log.balanceAfter.toFixed(0)}</div>
        </div>
      </div>
    </div>
  )
}