import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../store/auth'
import { useFetch } from '../hooks/useFetch'
import { getBalanceHistory, getAllUsers } from '../api/users'
import { createTicket } from '../api/support'
import { notify } from '../lib/notify'
import {
  IconArrowLeft, IconGift, IconCalendar, IconTrophy, IconBag,
  IconStar, IconUser, IconArrowDown, IconTarget, IconX,
  IconCheck, IconSupport,
} from '../components/Icons'
import type { CoinTx } from '../types'

// ==========================================
// === Типы операций: названия, иконки, цвета ===
// ==========================================
const TYPE_META: Record<
  string,
  { label: string; icon: React.ReactNode; color: string; bg: string }
> = {
  PEER_THANKS: {
    label: 'Благодарность', icon: <IconGift size={16} />,
    color: 'text-brand-600 dark:text-brand-400',
    bg: 'bg-brand-50 dark:bg-brand-500/10',
  },
  EVENT_REWARD: {
    label: 'Награда за событие', icon: <IconCalendar size={16} />,
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-500/10',
  },
  MANAGER_BONUS: {
    label: 'Бонус от руководителя', icon: <IconTrophy size={16} />,
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-500/10',
  },
  PURCHASE: {
    label: 'Покупка в магазине', icon: <IconBag size={16} />,
    color: 'text-orange-600 dark:text-orange-400',
    bg: 'bg-orange-50 dark:bg-orange-500/10',
  },
  ACHIEVEMENT: {
    label: 'Награда за достижение', icon: <IconStar size={16} />,
    color: 'text-yellow-600 dark:text-yellow-400',
    bg: 'bg-yellow-50 dark:bg-yellow-500/10',
  },
  ADMIN_ADJUSTMENT: {
    label: 'Начисление от администратора', icon: <IconUser size={16} />,
    color: 'text-slate-600 dark:text-slate-400',
    bg: 'bg-slate-100 dark:bg-slate-500/10',
  },
  REFUND: {
    label: 'Возврат средств', icon: <IconArrowDown size={16} />,
    color: 'text-cyan-600 dark:text-cyan-400',
    bg: 'bg-cyan-50 dark:bg-cyan-500/10',
  },
  SEASON_REWARD: {
    label: 'Награда за сезон', icon: <IconTrophy size={16} />,
    color: 'text-purple-600 dark:text-purple-400',
    bg: 'bg-purple-50 dark:bg-purple-500/10',
  },
  QUEST_REWARD: {
    label: 'Награда за квест', icon: <IconTarget size={16} />,
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-500/10',
  },
  PENALTY: {
    label: 'Штраф', icon: <IconX size={16} />,
    color: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-50 dark:bg-red-500/10',
  },
}

// ==========================================
// === Фильтры ===
// ==========================================
type Filter = 'all' | 'incoming' | 'outgoing' | 'penalty' | 'cancelled'

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'Все' },
  { id: 'incoming', label: 'Поступления' },
  { id: 'outgoing', label: 'Списания' },
  { id: 'penalty', label: 'Штрафы' },
  { id: 'cancelled', label: 'Отменённые' },
]

// ==========================================
// === Основная страница ===
// ==========================================
export default function CoinsHistory() {
  const me = useAuth((s) => s.user)!
  const history = useFetch(() => getBalanceHistory(me.id, 500), [me.id])
  const users = useFetch(() => getAllUsers(), [])

  const [filter, setFilter] = useState<Filter>('all')
  const [detail, setDetail] = useState<CoinTx | null>(null)

  // map userId → имя
  const nameMap = useMemo(() => {
    const m: Record<number, string> = {}
    users.data?.forEach((u) => { m[u.id] = u.name })
    return m
  }, [users.data])

  // направление операции относительно меня
  const getDirection = (t: CoinTx) => {
    if (t.toUserId === me.id) return 'in'
    if (t.fromUserId === me.id) return 'out'
    return 'other'
  }

  // фильтруем список
  const filtered = useMemo(() => {
    if (!history.data) return []
    return history.data.filter((t) => {
      const dir = getDirection(t)
      if (filter === 'incoming') return dir === 'in'
      if (filter === 'outgoing') return dir === 'out'
      if (filter === 'penalty') return t.type === 'PENALTY'
      if (filter === 'cancelled') return t.isCancelled
      return true
    })
  }, [history.data, filter, me.id])

  const counts = useMemo(() => {
    const all = history.data ?? []
    return {
      all: all.length,
      incoming: all.filter((t) => getDirection(t) === 'in').length,
      outgoing: all.filter((t) => getDirection(t) === 'out').length,
      penalty: all.filter((t) => t.type === 'PENALTY').length,
      cancelled: all.filter((t) => t.isCancelled).length,
    }
  }, [history.data, me.id])

  if (history.loading) return <div className="text-slate-500">Загрузка...</div>
  if (history.error) return <div className="text-red-600">{history.error}</div>

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <Link to="/profile" className="text-sm text-brand-600 hover:underline inline-flex items-center gap-1">
          <IconArrowLeft size={14} /> К профилю
        </Link>
        <div className="flex items-start justify-between gap-3 flex-wrap mt-2">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-white tracking-tight">
              История монет
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Все операции с балансом и их причины
            </p>
          </div>
          <Link
            to="/economy"
            className="text-xs text-brand-600 dark:text-brand-400 hover:underline inline-flex items-center gap-1 mt-1"
          >
            <IconSupport size={12} />
            Как работает экономика?
          </Link>
        </div>
      </div>

      {/* Фильтры */}
      <div className="border-b border-slate-200 dark:border-[#30363d] overflow-x-auto">
        <div className="flex gap-1 -mb-px">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-4 py-2.5 text-sm font-medium transition border-b-2 whitespace-nowrap flex items-center gap-2 ${
                filter === f.id
                  ? 'border-brand-600 text-brand-700 dark:text-brand-400'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {f.label}
              {counts[f.id] > 0 && (
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-full min-w-[20px] text-center ${
                    filter === f.id
                      ? 'bg-brand-100 dark:bg-brand-500/20 text-brand-700 dark:text-brand-400'
                      : 'bg-slate-100 dark:bg-[#21262d] text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {counts[f.id]}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-[#30363d] p-8 text-center text-slate-400 text-sm">
          {filter === 'all'
            ? 'Пока нет операций'
            : filter === 'penalty'
            ? 'Штрафов нет — отличная работа!'
            : filter === 'cancelled'
            ? 'Отменённых операций нет'
            : 'Нет операций в этой категории'}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((t) => (
            <TxCard
              key={t.id}
              tx={t}
              meId={me.id}
              nameMap={nameMap}
              onClick={() => setDetail(t)}
            />
          ))}
        </div>
      )}

      {detail && (
        <TxDetailModal
          tx={detail}
          meId={me.id}
          nameMap={nameMap}
          onClose={() => setDetail(null)}
        />
      )}
    </div>
  )
}

// ==========================================
// === Карточка транзакции ===
// ==========================================
function TxCard({
  tx, meId, nameMap, onClick,
}: {
  tx: CoinTx
  meId: number
  nameMap: Record<number, string>
  onClick: () => void
}) {
  const meta = TYPE_META[tx.type] ?? {
    label: tx.type, icon: <IconUser size={16} />,
    color: 'text-slate-600', bg: 'bg-slate-100',
  }
  const isIn = tx.toUserId === meId
  const counterpartId = isIn ? tx.fromUserId : tx.toUserId
  const counterpartName = counterpartId ? nameMap[counterpartId] ?? `ID ${counterpartId}` : 'Система'

  return (
    <button
      onClick={onClick}
      className={`w-full text-left bg-white dark:bg-[#161b22] rounded-xl border transition p-4 hover:border-brand-400 dark:hover:border-brand-500/50 ${
        tx.isCancelled
          ? 'border-slate-200 dark:border-[#30363d] opacity-60'
          : 'border-slate-200 dark:border-[#30363d]'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${meta.bg} ${meta.color}`}>
          {meta.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="text-sm font-medium text-slate-900 dark:text-white truncate">
                {meta.label}
                {tx.isCancelled && (
                  <span className="ml-2 text-[10px] uppercase tracking-wider text-red-600 dark:text-red-400 font-semibold">
                    отменено
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                {isIn ? `От: ${counterpartName}` : `Кому: ${counterpartName}`}
                {' · '}
                {new Date(tx.createdAt).toLocaleString('ru-RU', {
                  day: '2-digit', month: '2-digit', year: 'numeric',
                  hour: '2-digit', minute: '2-digit',
                })}
              </div>
            </div>
            <div className={`shrink-0 text-base font-semibold ${
              tx.isCancelled
                ? 'text-slate-400 dark:text-slate-500 line-through'
                : isIn
                ? 'text-brand-600 dark:text-brand-400'
                : 'text-red-600 dark:text-red-400'
            }`}>
              {isIn ? '+' : '−'}{tx.amount.toFixed(0)}
            </div>
          </div>
          {tx.comment && (
            <div className="text-sm text-slate-700 dark:text-slate-300 mt-1.5 line-clamp-2">
              {tx.comment}
            </div>
          )}
          {tx.isCancelled && tx.cancellationReason && (
            <div className="text-xs text-red-600 dark:text-red-400 mt-1 italic">
              Причина отмены: {tx.cancellationReason}
            </div>
          )}
        </div>
      </div>
    </button>
  )
}

// ==========================================
// === Детальная модалка + оспаривание штрафа ===
// ==========================================
function TxDetailModal({
  tx, meId, nameMap, onClose,
}: {
  tx: CoinTx
  meId: number
  nameMap: Record<number, string>
  onClose: () => void
}) {
  const nav = useNavigate()
  const [appealing, setAppealing] = useState(false)
  const isIn = tx.toUserId === meId
  const fromName = tx.fromUserId ? nameMap[tx.fromUserId] ?? `ID ${tx.fromUserId}` : 'Система'
  const toName = tx.toUserId ? nameMap[tx.toUserId] ?? `ID ${tx.toUserId}` : 'Система'
  const meta = TYPE_META[tx.type]

  // можно оспорить только входящий штраф и только если он не отменён
  const canAppeal = tx.type === 'PENALTY' && isIn && !tx.isCancelled

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-[#161b22] rounded-xl w-full max-w-lg p-6 space-y-4 my-8"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              {meta?.label ?? tx.type}
            </h2>
            <div className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              {new Date(tx.createdAt).toLocaleString('ru-RU')}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-900 dark:hover:text-white p-1"
          >
            <IconX size={18} />
          </button>
        </div>

        {/* Сумма и статус */}
        <div className={`rounded-lg p-4 flex items-center justify-between ${
          tx.isCancelled
            ? 'bg-slate-50 dark:bg-[#0d1117] border border-slate-200 dark:border-[#30363d]'
            : isIn
            ? 'bg-brand-50 dark:bg-brand-500/10 border border-brand-200 dark:border-brand-500/30'
            : 'bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30'
        }`}>
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {isIn ? 'Зачислено' : 'Списано'}
            </div>
            <div className={`text-2xl font-bold mt-0.5 ${
              tx.isCancelled
                ? 'text-slate-400 line-through'
                : isIn
                ? 'text-brand-700 dark:text-brand-400'
                : 'text-red-700 dark:text-red-400'
            }`}>
              {isIn ? '+' : '−'}{tx.amount.toFixed(0)} <span className="text-sm font-medium">монет</span>
            </div>
          </div>
          {tx.isCancelled && (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-red-600 dark:text-red-400">
              <IconX size={14} /> Отменено
            </span>
          )}
        </div>

        {/* Кто */}
        <div className="space-y-2">
          <div className="flex items-start gap-2 p-3 rounded-lg border border-slate-200 dark:border-[#30363d]">
            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-[#0d1117] text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0">
              <IconUser size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs text-slate-500 dark:text-slate-400">Отправитель</div>
              <div className="text-sm font-medium text-slate-900 dark:text-white mt-0.5">
                {fromName}
              </div>
            </div>
          </div>
          <div className="flex items-start gap-2 p-3 rounded-lg border border-slate-200 dark:border-[#30363d]">
            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-[#0d1117] text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0">
              <IconUser size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs text-slate-500 dark:text-slate-400">Получатель</div>
              <div className="text-sm font-medium text-slate-900 dark:text-white mt-0.5">
                {toName}
              </div>
            </div>
          </div>
        </div>

        {/* Комментарий / причина */}
        {tx.comment && (
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              Комментарий
            </div>
            <div className="text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-[#0d1117] p-3 rounded border border-slate-200 dark:border-[#30363d] whitespace-pre-wrap">
              {tx.comment}
            </div>
          </div>
        )}

        {tx.isCancelled && tx.cancellationReason && (
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              Причина отмены
            </div>
            <div className="text-sm text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-500/10 p-3 rounded border border-red-200 dark:border-red-500/30">
              {tx.cancellationReason}
            </div>
          </div>
        )}

        {/* Действия */}
        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-[#30363d]">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-slate-600 dark:text-slate-300"
          >
            Закрыть
          </button>
          {canAppeal && (
            <button
              onClick={() => setAppealing(true)}
              className="bg-amber-500 hover:bg-amber-600 text-white rounded-md px-4 py-2 text-sm font-medium transition inline-flex items-center gap-1.5"
            >
              <IconSupport size={14} />
              Оспорить штраф
            </button>
          )}
        </div>

        {appealing && (
          <AppealModal
            tx={tx}
            meId={meId}
            onClose={() => setAppealing(false)}
            onCreated={(ticketId) => {
              setAppealing(false)
              onClose()
              notify.success('Обращение создано', 'Служба поддержки рассмотрит ваш запрос')
              nav(`/support/tickets/${ticketId}`)
            }}
          />
        )}
      </div>
    </div>
  )
}

// ==========================================
// === Модалка «Оспорить штраф» ===
// ==========================================
function AppealModal({
  tx, meId, onClose, onCreated,
}: {
  tx: CoinTx
  meId: number
  onClose: () => void
  onCreated: (ticketId: number) => void
}) {
  const [reason, setReason] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!reason.trim()) {
      setError('Опишите, почему считаете штраф несправедливым')
      return
    }
    setBusy(true)
    setError('')
    try {
      const ticket = await createTicket(
        meId,
        `Оспаривание штрафа #${tx.id}`,
        `Штраф на ${tx.amount.toFixed(0)} монет от ${new Date(tx.createdAt).toLocaleString('ru-RU')}.\n\nПричина в системе: ${tx.comment}\n\nМои пояснения: ${reason.trim()}`,
        true // isQuestRequest — переиспользуем флаг «требует проверки вручную»
      )
      onCreated(ticket.id)
    } catch (e) {
      setError((e as any)?.response?.data || 'Не удалось создать обращение')
      notify.error(e)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4"
      onClick={onClose}
    >
      <form
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-[#161b22] rounded-xl w-full max-w-md p-6 space-y-4"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Оспорить штраф
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Создадим обращение в поддержку. Ответ придёт в чат.
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

        <div className="text-xs bg-slate-50 dark:bg-[#0d1117] rounded-md p-3 border border-slate-200 dark:border-[#30363d] text-slate-600 dark:text-slate-400">
          <div className="font-medium text-slate-900 dark:text-white mb-1">
            Оспариваемый штраф
          </div>
          <div>Сумма: <strong>−{tx.amount.toFixed(0)} монет</strong></div>
          <div>Дата: {new Date(tx.createdAt).toLocaleString('ru-RU')}</div>
          {tx.comment && <div className="mt-1 italic">«{tx.comment}»</div>}
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 text-sm p-3 rounded border border-red-200 dark:border-red-500/30">
            {error}
          </div>
        )}

        <div>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Почему считаете штраф несправедливым? *
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={4}
            placeholder="Опишите ситуацию: например, задача была выполнена в срок, но не отмечена в системе"
            required
            maxLength={1000}
            className="w-full border border-slate-300 dark:border-[#30363d] dark:bg-[#0d1117] dark:text-white rounded-md px-3 py-2 mt-1 text-sm resize-none focus:outline-none focus:border-brand-500"
          />
          <div className="text-right text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
            {reason.length} / 1000
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="px-4 py-2 text-sm text-slate-600 dark:text-slate-300 disabled:opacity-50"
          >
            Отмена
          </button>
          <button
            type="submit"
            disabled={busy || !reason.trim()}
            className="bg-amber-500 hover:bg-amber-600 text-white rounded-md px-4 py-2 text-sm font-medium disabled:opacity-50 transition"
          >
            {busy ? 'Отправка...' : 'Создать обращение'}
          </button>
        </div>
      </form>
    </div>
  )
}