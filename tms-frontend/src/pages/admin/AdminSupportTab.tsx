import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../store/auth'
import { useFetch } from '../../hooks/useFetch'
import { getAllTickets } from '../../api/admin'
import {
  takeTicket,
  type SupportTicket,
  type TicketStatus,
} from '../../api/support'
import { notify } from '../../lib/notify'
import { refreshNotifications } from '../../components/NotificationBell'
import {
  IconCheck,
  IconSupport,
  IconSearch,
  IconArrowRight,
  IconUser,
} from '../../components/Icons'

const STATUS_LABEL: Record<TicketStatus, string> = {
  PENDING: 'Ожидает',
  IN_PROGRESS: 'В работе',
  COMPLETED: 'Завершено',
}

const STATUS_COLOR: Record<TicketStatus, string> = {
  PENDING:
    'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30',
  IN_PROGRESS:
    'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/30',
  COMPLETED:
    'bg-brand-50 text-brand-700 border-brand-200 dark:bg-brand-500/10 dark:text-brand-400 dark:border-brand-500/30',
}

type FilterTab = 'all' | 'pending' | 'in_progress' | 'completed'

export default function AdminSupportTab() {
  const me = useAuth((s) => s.user)!
  const nav = useNavigate()

  const { data, loading, error } = useFetch(() => getAllTickets(me.id), [me.id])
  const [local, setLocal] = useState<SupportTicket[] | null>(null)
  const [tab, setTab] = useState<FilterTab>('all')
  const [query, setQuery] = useState('')
  const [processing, setProcessing] = useState<number | null>(null)

  const list = local ?? data ?? []

  const counts = useMemo(
    () => ({
      all: list.length,
      pending: list.filter((t) => t.status === 'PENDING').length,
      in_progress: list.filter((t) => t.status === 'IN_PROGRESS').length,
      completed: list.filter((t) => t.status === 'COMPLETED').length,
    }),
    [list]
  )

  const filtered = useMemo(() => {
    let arr = list
    if (tab === 'pending') arr = arr.filter((t) => t.status === 'PENDING')
    else if (tab === 'in_progress') arr = arr.filter((t) => t.status === 'IN_PROGRESS')
    else if (tab === 'completed') arr = arr.filter((t) => t.status === 'COMPLETED')

    if (query.trim()) {
      const q = query.toLowerCase()
      arr = arr.filter(
        (t) =>
          t.topic.toLowerCase().includes(q) ||
          t.creatorName.toLowerCase().includes(q) ||
          (t.assigneeName?.toLowerCase().includes(q) ?? false)
      )
    }

    return [...arr].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  }, [list, tab, query])

  async function handleTake(ticket: SupportTicket) {
    setProcessing(ticket.id)
    try {
      await takeTicket(ticket.id, me.id)
      setLocal(
        list.map((t) =>
          t.id === ticket.id
            ? { ...t, assigneeId: me.id, assigneeName: me.name, status: 'IN_PROGRESS' as TicketStatus }
            : t
        )
      )
      notify.success(`Взято в работу · ${ticket.topic}`)
      refreshNotifications()
      nav(`/support/tickets/${ticket.id}`)
    } catch (e) {
      notify.error(e)
    } finally {
      setProcessing(null)
    }
  }

  function openTicket(ticket: SupportTicket) {
    nav(`/support/tickets/${ticket.id}`)
  }

  if (loading) return <div className="text-slate-500">Загрузка...</div>
  if (error) return <div className="text-red-600">{error}</div>

  return (
    <div className="space-y-4">
      {/* Табы фильтров */}
      <div className="border-b border-slate-200 dark:border-[#30363d] overflow-x-auto">
        <div className="flex gap-1 -mb-px">
          {(
            [
              { id: 'all', label: 'Все' },
              { id: 'pending', label: 'Ожидают' },
              { id: 'in_progress', label: 'В работе' },
              { id: 'completed', label: 'Завершённые' },
            ] as { id: FilterTab; label: string }[]
          ).map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2.5 text-sm font-medium transition border-b-2 whitespace-nowrap flex items-center gap-2 ${
                tab === t.id
                  ? 'border-brand-600 text-brand-700 dark:text-brand-400'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {t.label}
              {counts[t.id] > 0 && (
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-full min-w-[20px] text-center ${
                    tab === t.id
                      ? 'bg-brand-100 dark:bg-brand-500/20 text-brand-700 dark:text-brand-400'
                      : 'bg-slate-100 dark:bg-[#21262d] text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {counts[t.id]}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Поиск */}
      <div className="relative max-w-md">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
          <IconSearch size={16} />
        </div>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Поиск по теме, автору, исполнителю..."
          className="w-full border border-slate-300 dark:border-[#30363d] dark:bg-[#0d1117] dark:text-white rounded-md pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-brand-500"
        />
      </div>

      {/* Пусто */}
      {filtered.length === 0 && (
        <div className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-[#30363d] p-8 sm:p-12 text-center">
          <div className="flex justify-center mb-3 text-brand-400">
            <IconSupport size={40} />
          </div>
          <div className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {query ? 'Ничего не найдено' : 'Обращений нет'}
          </div>
        </div>
      )}

      {/* Таблица */}
      {filtered.length > 0 && (
        <div className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-[#30363d] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-[#0d1117] border-b border-slate-200 dark:border-[#30363d]">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
                    Тема
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
                    Автор
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
                    Исполнитель
                  </th>
                  <th className="text-center px-4 py-3 font-medium text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
                    Статус
                  </th>
                  <th className="text-right px-4 py-3 font-medium text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#30363d]">
                {filtered.map((t) => {
                  const isPending = t.status === 'PENDING'
                  const canTake = isPending && !t.assigneeId
                  return (
                    <tr
                      key={t.id}
                      onClick={() => openTicket(t)}
                      className="hover:bg-slate-50 dark:hover:bg-[#0d1117] transition cursor-pointer"
                    >
                      <td className="px-4 py-3 max-w-xs">
                        <div className="font-medium text-slate-900 dark:text-white truncate">
                          {t.topic}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                          {t.description}
                        </div>
                        {t.isQuestRequest && (
                          <span className="inline-block mt-1 text-[10px] bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-500/30">
                            Запрос квеста
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-slate-700 dark:text-slate-300">
                          {t.creatorName}
                        </div>
                        <div className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                          {new Date(t.createdAt).toLocaleDateString('ru-RU', {
                            day: '2-digit',
                            month: '2-digit',
                          })}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {t.assigneeName ? (
                          <div className="inline-flex items-center gap-1.5 text-sm text-slate-700 dark:text-slate-300">
                            <IconUser size={12} />
                            {t.assigneeName}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 dark:text-slate-500 italic">
                            Не назначен
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`text-xs px-2 py-0.5 rounded border font-medium ${STATUS_COLOR[t.status]}`}
                        >
                          {STATUS_LABEL[t.status]}
                        </span>
                        {t.rating !== null && (
                          <div className="text-[10px] text-amber-600 dark:text-amber-400 mt-1">
                            Оценка: {t.rating}/5
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div
                          className="flex justify-end gap-1.5 flex-wrap"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {canTake && (
                            <button
                              onClick={() => handleTake(t)}
                              disabled={processing === t.id}
                              className="text-xs px-2.5 py-1 bg-brand-600 hover:bg-brand-700 text-white rounded font-medium disabled:opacity-50 transition inline-flex items-center gap-1"
                            >
                              <IconCheck size={12} />
                              {processing === t.id ? '...' : 'Взять'}
                            </button>
                          )}
                          <button
                            onClick={() => openTicket(t)}
                            className="text-xs px-2.5 py-1 border border-slate-300 dark:border-[#30363d] rounded text-slate-700 dark:text-slate-300 hover:border-brand-500 transition inline-flex items-center gap-1"
                          >
                            Открыть <IconArrowRight size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}