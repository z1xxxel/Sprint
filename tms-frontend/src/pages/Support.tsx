import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../store/auth'
import { useFetch } from '../hooks/useFetch'
import {
  getMyTickets,
  getPendingTickets,
  getAssignedTickets,
  takeTicket,
  type SupportTicket,
  type TicketStatus,
} from '../api/support'
import { can } from '../lib/permissions'
import CreateTicketModal from '../components/CreateTicketModal'
import {
  IconSupport,
  IconPlus,
  IconArrowRight,
  IconCheck,
  IconTarget,
} from '../components/Icons'

const STATUS_META: Record<TicketStatus, { label: string; className: string }> = {
  PENDING: {
    label: 'Ожидает',
    className:
      'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30',
  },
  IN_PROGRESS: {
    label: 'В работе',
    className:
      'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/30',
  },
  COMPLETED: {
    label: 'Завершено',
    className:
      'bg-brand-50 text-brand-700 border-brand-200 dark:bg-brand-500/10 dark:text-brand-400 dark:border-brand-500/30',
  },
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

type Tab = 'mine' | 'queue' | 'assigned'

export default function Support() {
  const user = useAuth((s) => s.user)!
  const nav = useNavigate()
  const isSupport = can.manageTickets(user.role)

  const [tab, setTab] = useState<Tab>(isSupport ? 'queue' : 'mine')
  const [creating, setCreating] = useState(false)
  const [processing, setProcessing] = useState<number | null>(null)

  const mine = useFetch(() => getMyTickets(user.id), [user.id])
  const pending = useFetch(
    () => (isSupport ? getPendingTickets() : Promise.resolve([])),
    [isSupport]
  )
  const assigned = useFetch(
    () => (isSupport ? getAssignedTickets(user.id) : Promise.resolve([])),
    [isSupport, user.id]
  )

  const mineList = mine.data ?? []
  const pendingList = pending.data ?? []
  const assignedList = assigned.data ?? []

  const mineActive = mineList.filter((t) => t.status !== 'COMPLETED')
  const mineCompleted = mineList.filter((t) => t.status === 'COMPLETED')
  const assignedActive = assignedList.filter((t) => t.status !== 'COMPLETED')
  const assignedCompleted = assignedList.filter((t) => t.status === 'COMPLETED')

  async function handleTake(ticketId: number) {
    setProcessing(ticketId)
    try {
      await takeTicket(ticketId, user.id)
      nav(`/support/tickets/${ticketId}`)
    } catch (e: any) {
      alert(e.response?.data || 'Ошибка')
      setProcessing(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* HERO */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 text-white p-6 sm:p-8">
        <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="relative">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <IconSupport size={20} className="text-white/80" />
                <span className="text-xs text-white/80 uppercase tracking-wider">
                  Поддержка
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold">
                {isSupport ? 'Центр поддержки' : 'Обращения'}
              </h1>
              <p className="text-sm text-white/80 mt-1">
                {isSupport
                  ? 'Обрабатывайте обращения сотрудников'
                  : 'Задайте вопрос — служба поддержки ответит'}
              </p>
            </div>
            <button
              onClick={() => setCreating(true)}
              className="shrink-0 bg-white/15 hover:bg-white/25 backdrop-blur rounded-md px-4 py-2 text-sm font-medium transition inline-flex items-center gap-1.5"
            >
              <IconPlus size={14} /> Новое обращение
            </button>
          </div>

          {isSupport && (
            <div className="mt-6 grid grid-cols-3 gap-4">
              <div>
                <div className="text-xs text-white/70 uppercase tracking-wider">Очередь</div>
                <div className="text-2xl sm:text-3xl font-bold mt-1">{pendingList.length}</div>
              </div>
              <div>
                <div className="text-xs text-white/70 uppercase tracking-wider">
                  У меня в работе
                </div>
                <div className="text-2xl sm:text-3xl font-bold mt-1">
                  {assignedActive.filter((t) => t.status === 'IN_PROGRESS').length}
                </div>
              </div>
              <div>
                <div className="text-xs text-white/70 uppercase tracking-wider">
                  Завершено мной
                </div>
                <div className="text-2xl sm:text-3xl font-bold mt-1">
                  {assignedCompleted.length}
                </div>
              </div>
            </div>
          )}

          {!isSupport && !mine.loading && mineList.length > 0 && (
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-white/70 uppercase tracking-wider">Активные</div>
                <div className="text-2xl sm:text-3xl font-bold mt-1">{mineActive.length}</div>
              </div>
              <div>
                <div className="text-xs text-white/70 uppercase tracking-wider">
                  Завершено
                </div>
                <div className="text-2xl sm:text-3xl font-bold mt-1">
                  {mineCompleted.length}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Табы */}
      {isSupport && (
        <div className="border-b border-slate-200 dark:border-[#30363d]">
          <div className="flex gap-1 -mb-px overflow-x-auto">
            <SupportTab active={tab === 'queue'} onClick={() => setTab('queue')}>
              Очередь
              {pendingList.length > 0 && <Badge>{pendingList.length}</Badge>}
            </SupportTab>
            <SupportTab active={tab === 'assigned'} onClick={() => setTab('assigned')}>
              У меня
              {assignedActive.length > 0 && <Badge>{assignedActive.length}</Badge>}
            </SupportTab>
            <SupportTab active={tab === 'mine'} onClick={() => setTab('mine')}>
              Созданные мной
            </SupportTab>
          </div>
        </div>
      )}

      {/* === Очередь === */}
      {isSupport && tab === 'queue' && (
        <>
          {pending.loading && <div className="text-slate-500">Загрузка...</div>}
          {pending.error && <div className="text-red-600">{pending.error}</div>}
          {!pending.loading && pendingList.length === 0 && (
            <EmptyState
              icon={<IconCheck size={40} />}
              title="Очередь пуста"
              subtitle="Все обращения взяты в работу"
            />
          )}
          {pendingList.length > 0 && (
            <div className="space-y-2">
              {pendingList.map((t) => (
                <QueueCard
                  key={t.id}
                  ticket={t}
                  processing={processing === t.id}
                  onTake={() => handleTake(t.id)}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* === У меня (support) === */}
      {isSupport && tab === 'assigned' && (
        <>
          {assigned.loading && <div className="text-slate-500">Загрузка...</div>}
          {assigned.error && <div className="text-red-600">{assigned.error}</div>}
          {!assigned.loading && assignedList.length === 0 && (
            <EmptyState
              icon={<IconSupport size={40} />}
              title="Вы пока не взяли ни одного обращения"
              subtitle="Возьмите тикет из очереди"
            />
          )}

          {assignedActive.length > 0 && (
            <div>
              <SectionTitle>Активные ({assignedActive.length})</SectionTitle>
              <div className="space-y-2">
                {assignedActive.map((t) => (
                  <TicketRow
                    key={t.id}
                    ticket={t}
                    onOpen={() => nav(`/support/tickets/${t.id}`)}
                  />
                ))}
              </div>
            </div>
          )}

          {assignedCompleted.length > 0 && (
            <div>
              <SectionTitle>
                Завершённые ({assignedCompleted.length})
              </SectionTitle>
              <div className="space-y-2">
                {assignedCompleted.map((t) => (
                  <TicketRow
                    key={t.id}
                    ticket={t}
                    onOpen={() => nav(`/support/tickets/${t.id}`)}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* === Мои созданные === */}
      {(!isSupport || tab === 'mine') && (
        <>
          {mine.loading && <div className="text-slate-500">Загрузка...</div>}
          {mine.error && <div className="text-red-600">{mine.error}</div>}
          {!mine.loading && mineList.length === 0 && (
            <div className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-[#30363d] p-8 sm:p-12 text-center">
              <div className="flex justify-center mb-3 text-slate-300 dark:text-slate-600">
                <IconSupport size={40} />
              </div>
              <div className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-4">
                У вас пока нет обращений
              </div>
              <button
                onClick={() => setCreating(true)}
                className="inline-flex items-center gap-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-md px-4 py-2 text-sm font-medium transition"
              >
                <IconPlus size={14} /> Создать обращение
              </button>
            </div>
          )}

          {mineActive.length > 0 && (
            <div>
              <SectionTitle>Активные ({mineActive.length})</SectionTitle>
              <div className="space-y-2">
                {mineActive.map((t) => (
                  <TicketRow
                    key={t.id}
                    ticket={t}
                    onOpen={() => nav(`/support/tickets/${t.id}`)}
                  />
                ))}
              </div>
            </div>
          )}

          {mineCompleted.length > 0 && (
            <div>
              <SectionTitle>Завершённые ({mineCompleted.length})</SectionTitle>
              <div className="space-y-2">
                {mineCompleted.map((t) => (
                  <TicketRow
                    key={t.id}
                    ticket={t}
                    onOpen={() => nav(`/support/tickets/${t.id}`)}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {creating && (
        <CreateTicketModal
          userId={user.id}
          onClose={() => setCreating(false)}
          onCreated={(ticket) => {
            setCreating(false)
            nav(`/support/tickets/${ticket.id}`)
          }}
        />
      )}
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 mt-4">
      {children}
    </div>
  )
}

function SupportTab({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2.5 text-sm font-medium transition border-b-2 whitespace-nowrap flex items-center gap-2 ${
        active
          ? 'border-brand-600 text-brand-700 dark:text-brand-400'
          : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
      }`}
    >
      {children}
    </button>
  )
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-xs bg-brand-100 dark:bg-brand-500/20 text-brand-700 dark:text-brand-400 px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
      {children}
    </span>
  )
}

function EmptyState({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode
  title: string
  subtitle: string
}) {
  return (
    <div className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-[#30363d] p-8 sm:p-12 text-center">
      <div className="flex justify-center mb-3 text-brand-400">{icon}</div>
      <div className="text-slate-500 dark:text-slate-400 text-sm font-medium">{title}</div>
      <div className="text-xs text-slate-400 dark:text-slate-500 mt-1">{subtitle}</div>
    </div>
  )
}

function QueueCard({
  ticket,
  processing,
  onTake,
}: {
  ticket: SupportTicket
  processing: boolean
  onTake: () => void
}) {
  return (
    <div className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-[#30363d] p-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 shrink-0 rounded-lg bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
          <IconSupport size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2 flex-wrap">
            <div className="font-medium text-slate-900 dark:text-white truncate flex-1 min-w-0">
              {ticket.topic}
            </div>
            {ticket.isQuestRequest && (
              <span className="shrink-0 inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded border font-medium bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/30">
                <IconTarget size={12} />
                Запрос квеста
              </span>
            )}
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2 mt-0.5">
            {ticket.description}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            От {ticket.creatorName} · {formatDate(ticket.createdAt)}
          </div>
        </div>
      </div>
      <button
        onClick={onTake}
        disabled={processing}
        className="mt-3 w-full bg-brand-600 hover:bg-brand-700 text-white text-sm px-4 py-2 rounded-md font-medium disabled:opacity-50 transition"
      >
        {processing ? '...' : 'Взять в работу'}
      </button>
    </div>
  )
}

function TicketRow({
  ticket,
  onOpen,
}: {
  ticket: SupportTicket
  onOpen: () => void
}) {
  const meta = STATUS_META[ticket.status]
  return (
    <button
      onClick={onOpen}
      className="w-full text-left bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-[#30363d] p-4 hover:border-brand-400 dark:hover:border-brand-500/50 hover:shadow-sm transition"
    >
      <div className="flex items-start gap-3">
        <div
          className={`shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
            ticket.status === 'COMPLETED'
              ? 'bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400'
              : 'bg-slate-100 dark:bg-[#0d1117] text-slate-500 dark:text-slate-400'
          }`}
        >
          {ticket.status === 'COMPLETED' ? (
            <IconCheck size={18} />
          ) : (
            <IconSupport size={18} />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 flex-wrap min-w-0">
              <div className="font-medium text-slate-900 dark:text-white truncate">
                {ticket.topic}
              </div>
              {ticket.isQuestRequest && (
                <span className="shrink-0 inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded border font-medium bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/30">
                  <IconTarget size={10} />
                  Квест
                </span>
              )}
            </div>
            <span
              className={`shrink-0 text-xs px-2 py-0.5 rounded border font-medium ${meta.className}`}
            >
              {meta.label}
            </span>
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-300 line-clamp-1 mt-1">
            {ticket.description}
          </div>
          <div className="text-xs text-slate-400 dark:text-slate-500 mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5">
            <span>Создано: {formatDate(ticket.createdAt)}</span>
            {ticket.assigneeName && <span>Исполнитель: {ticket.assigneeName}</span>}
            {ticket.rating !== null && (
              <span className="text-amber-600 dark:text-amber-400">
                Оценка: {ticket.rating}/5
              </span>
            )}
          </div>
        </div>
        <IconArrowRight
          size={16}
          className="shrink-0 text-slate-300 dark:text-slate-600 mt-2"
        />
      </div>
    </button>
  )
}