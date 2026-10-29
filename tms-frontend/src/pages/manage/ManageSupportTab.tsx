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
import { IconCheck, IconSupport } from '../../components/Icons'

const STATUS_LABEL: Record<TicketStatus, string> = {
  PENDING: 'Ожидает',
  IN_PROGRESS: 'В работе',
  COMPLETED: 'Завершено',
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
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
    <div className="space-y-4">
      {/* Табы */}
      <div className="border-b border-slate-200 dark:border-[#30363d]">
        <div className="flex gap-1 -mb-px">
          <button
            onClick={() => setTab('pending')}
            className={`px-4 py-2.5 text-sm font-medium transition border-b-2 flex items-center gap-2 ${
              tab === 'pending'
                ? 'border-brand-600 text-brand-700 dark:text-brand-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Очередь
            {pendingCount > 0 && (
              <span className="text-xs bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                {pendingCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setTab('mine')}
            className={`px-4 py-2.5 text-sm font-medium transition border-b-2 flex items-center gap-2 ${
              tab === 'mine'
                ? 'border-brand-600 text-brand-700 dark:text-brand-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Мои
            {mineCount > 0 && (
              <span className="text-xs bg-brand-100 dark:bg-brand-500/20 text-brand-700 dark:text-brand-400 px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                {mineCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Очередь */}
      {tab === 'pending' && (
        <>
          {pending.loading && <div className="text-slate-500">Загрузка...</div>}
          {pending.error && <div className="text-red-600">{pending.error}</div>}

          {!pending.loading && pendingCount === 0 && (
            <div className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-[#30363d] p-8 sm:p-12 text-center">
              <div className="flex justify-center mb-3 text-brand-400">
                <IconCheck size={40} />
              </div>
              <div className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                Очередь пуста
              </div>
              <div className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                Все обращения взяты в работу
              </div>
            </div>
          )}

          {pendingCount > 0 && (
            <div className="space-y-2">
              {pending.data!.map((t) => (
                <div
                  key={t.id}
                  className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-[#30363d] p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 shrink-0 rounded-lg bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                      <IconSupport size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-slate-900 dark:text-white truncate">
                        {t.topic}
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2 mt-0.5">
                        {t.description}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        От {t.creatorName} · {formatDate(t.createdAt)}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleTake(t.id)}
                    disabled={processing === t.id}
                    className="mt-3 w-full bg-brand-600 hover:bg-brand-700 text-white text-sm px-4 py-2 rounded-md font-medium disabled:opacity-50 transition"
                  >
                    {processing === t.id ? '...' : 'Взять в работу'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Мои */}
      {tab === 'mine' && (
        <>
          {mine.loading && <div className="text-slate-500">Загрузка...</div>}
          {mine.error && <div className="text-red-600">{mine.error}</div>}

          {!mine.loading && mineCount === 0 && (
            <div className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-[#30363d] p-8 sm:p-12 text-center">
              <div className="text-slate-400 dark:text-slate-500 text-sm">
                Вы пока не взяли ни одного обращения
              </div>
            </div>
          )}

          {mineCount > 0 && (
            <div className="space-y-2">
              {mine.data!.map((t) => (
                <button
                  key={t.id}
                  onClick={() => nav(`/support/tickets/${t.id}`)}
                  className="w-full text-left bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-[#30363d] p-4 hover:border-brand-400 dark:hover:border-brand-500/50 transition"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-slate-900 dark:text-white truncate">
                        {t.topic}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        От {t.creatorName}
                      </div>
                    </div>
                    <span
                      className={`shrink-0 text-xs px-2 py-0.5 rounded border font-medium ${
                        t.status === 'COMPLETED'
                          ? 'bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-400 border-brand-200 dark:border-brand-500/30'
                          : 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/30'
                      }`}
                    >
                      {STATUS_LABEL[t.status]}
                    </span>
                  </div>
                  {t.rating !== null && (
                    <div className="text-xs text-amber-600 dark:text-amber-400 mt-2">
                      Оценка: {t.rating}/5
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}