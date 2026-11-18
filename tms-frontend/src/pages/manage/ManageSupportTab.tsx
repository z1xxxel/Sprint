import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../store/auth'
import { useFetch } from '../../hooks/useFetch'
import {
  getPendingTickets,
  getAssignedTickets,
  takeTicket,
  type TicketStatus,
} from '../../api/support'

const STATUS_LABEL: Record<TicketStatus, string> = {
  PENDING: 'Ожидает',
  IN_PROGRESS: 'В работе',
  COMPLETED: 'Завершено',
}

const STATUS_COLOR: Record<TicketStatus, string> = {
  PENDING: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
  IN_PROGRESS: 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400',
  COMPLETED: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

type Tab = 'pending' | 'mine'

export default function ManageSupportTab() {
  const me = useAuth((s) => s.user)!
  const nav = useNavigate()
  const [tab, setTab] = useState<Tab>('pending')
  const [processing, setProcessing] = useState<number | null>(null)

  const pending = useFetch(() => getPendingTickets(), [])
  const mine = useFetch(() => getAssignedTickets(me.id), [me.id])

  async function handleTake(ticketId: number) {
    setProcessing(ticketId)
    try {
      await takeTicket(ticketId, me.id)
      nav(`/support/tickets/${ticketId}`)
    } catch (e: any) {
      alert(e.response?.data || 'Ошибка')
      setProcessing(null)
    }
  }

  const pendingCount = pending.data?.length ?? 0
  const mineCount = mine.data?.length ?? 0

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          Обращения сотрудников
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Возьмите обращение из очереди или продолжите работу с назначенными
        </p>
      </div>

      <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-[#0d1117]">
        <button
          onClick={() => setTab('pending')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition ${
            tab === 'pending'
              ? 'bg-white dark:bg-[#161b22] text-brand-700 dark:text-brand-400 shadow-sm'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Очередь
          {pendingCount > 0 && (
            <span className="text-xs px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 font-semibold min-w-[20px] text-center">
              {pendingCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setTab('mine')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition ${
            tab === 'mine'
              ? 'bg-white dark:bg-[#161b22] text-brand-700 dark:text-brand-400 shadow-sm'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Мои обращения
          {mineCount > 0 && (
            <span className="text-xs px-1.5 py-0.5 rounded-full bg-brand-100 dark:bg-brand-500/20 text-brand-700 dark:text-brand-400 font-semibold min-w-[20px] text-center">
              {mineCount}
            </span>
          )}
        </button>
      </div>

      {tab === 'pending' && (
        <>
          {pending.loading && (
            <div className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-[#30363d] p-8 text-center text-slate-500">
              Загрузка...
            </div>
          )}

          {!pending.loading && pendingCount === 0 && (
            <div className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-[#30363d] p-10 text-center">
              <div className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                Очередь пуста
              </div>
              <div className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                Все обращения взяты в работу
              </div>
            </div>
          )}

          <div className="space-y-2.5">
            {pending.data?.map((t) => (
              <div
                key={t.id}
                className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-[#30363d] p-4"
              >
                <div className="flex items-start justify-between gap-2 mb-1 flex-wrap">
                  <div className="font-semibold text-slate-900 dark:text-white">
                    {t.topic}
                  </div>
                  {t.isQuestRequest && (
                    <span className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold uppercase tracking-wider">
                      Запрос квеста
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                  {t.creatorName} · {formatDate(t.createdAt)}
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2 mb-3">
                  {t.description}
                </p>
                <button
                  onClick={() => handleTake(t.id)}
                  disabled={processing === t.id}
                  className="w-full bg-brand-600 hover:bg-brand-700 text-white text-sm px-4 py-2 rounded-lg font-medium disabled:opacity-50 transition"
                >
                  {processing === t.id ? '...' : 'Взять в работу'}
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {tab === 'mine' && (
        <>
          {mine.loading && (
            <div className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-[#30363d] p-8 text-center text-slate-500">
              Загрузка...
            </div>
          )}

          {!mine.loading && mineCount === 0 && (
            <div className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-[#30363d] p-10 text-center">
              <div className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                У вас нет назначенных обращений
              </div>
              <div className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                Возьмите тикет из очереди
              </div>
            </div>
          )}

          <div className="space-y-2.5">
            {mine.data?.map((t) => (
              <button
                key={t.id}
                onClick={() => nav(`/support/tickets/${t.id}`)}
                className="w-full text-left bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-[#30363d] p-4 hover:border-brand-400 dark:hover:border-brand-500/50 transition"
              >
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-slate-900 dark:text-white truncate">
                      {t.topic}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {t.creatorName} · {formatDate(t.createdAt)}
                      {t.rating !== null && (
                        <span className="text-amber-600 dark:text-amber-400 font-medium">
                          {' · '}Оценка {t.rating}/5
                        </span>
                      )}
                    </div>
                  </div>
                  <span
                    className={`shrink-0 text-[10px] px-2 py-0.5 rounded-full font-semibold ${STATUS_COLOR[t.status]}`}
                  >
                    {STATUS_LABEL[t.status]}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}