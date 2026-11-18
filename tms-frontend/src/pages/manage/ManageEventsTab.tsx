import { useState } from 'react'
import { useAuth } from '../../store/auth'
import { useFetch } from '../../hooks/useFetch'
import { getEvents, cancelEvent, getParticipants } from '../../api/events'
import { notify } from '../../lib/notify'
import { confirmDialog } from '../../lib/confirm'
import CreateEventModal from '../../components/CreateEventModal'
import ApproveEventModal from '../../components/ApproveEventModal'
import RollbackRewardsModal from '../../components/RollbackRewardsModal'
import Avatar from '../../components/Avatar'
import { IconPlus } from '../../components/Icons'
import type { EventDto, ParticipantDto } from '../../types'

type Tab = 'pending' | 'rewards' | 'past'

const STATUS_META: Record<string, { label: string; className: string }> = {
  NEW: {
    label: 'На модерации',
    className: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
  },
  ASSIGNED: {
    label: 'Открыта запись',
    className: 'bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-400',
  },
  COMPLETED: {
    label: 'Завершено',
    className: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
  },
  CANCELLED: {
    label: 'Отменено',
    className: 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400',
  },
}

/**
 * Разбирает commentToAdmin на две части.
 * EventService.rollbackRewards добавляет к commentToAdmin:
 *   `${original}\n[ОТКАТ НАГРАД] ${reason}`
 * Значит после парсинга:
 *   - original — пожелания организатора (до rollback)
 *   - rollbackReason — причина отмены (после маркера)
 */
function parseEventComment(commentToAdmin: string | null): {
  original: string | null
  rollbackReason: string | null
} {
  if (!commentToAdmin) return { original: null, rollbackReason: null }

  const lines = commentToAdmin.split('\n')
  const originalLines: string[] = []
  const rollbackLines: string[] = []

  for (const line of lines) {
    if (line.includes('[ОТКАТ НАГРАД]')) {
      const cleaned = line.replace('[ОТКАТ НАГРАД]', '').trim()
      if (cleaned) rollbackLines.push(cleaned)
    } else {
      originalLines.push(line)
    }
  }

  return {
    original: originalLines.join('\n').trim() || null,
    rollbackReason: rollbackLines.join('\n').trim() || null,
  }
}

export default function ManageEventsTab() {
  const user = useAuth((s) => s.user)!
  const events = useFetch(() => getEvents(user.id), [user.id])
  const [processing, setProcessing] = useState<number | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [approving, setApproving] = useState<EventDto | null>(null)
  const [rollingBack, setRollingBack] = useState<{ event: EventDto; count: number } | null>(null)
  const [local, setLocal] = useState<EventDto[] | null>(null)
  const [tab, setTab] = useState<Tab>('pending')

  // Раскрытые участники: eventId → список (или 'loading')
  const [participants, setParticipants] = useState<Record<number, ParticipantDto[] | 'loading'>>({})

  const list = local ?? events.data ?? []
  const pending = list.filter((e) => e.eventStatus === 'NEW')
  const rewards = list.filter(
    (e) => e.eventStatus === 'COMPLETED' && e.paidInCoins && e.rewardsGranted
  )
  const past = [...list]
    .filter((e) => e.eventStatus === 'COMPLETED' || e.eventStatus === 'CANCELLED')
    .sort((a, b) => new Date(b.toTime).getTime() - new Date(a.toTime).getTime())

  const displayed =
    tab === 'pending' ? pending : tab === 'rewards' ? rewards : past

  async function handleCancel(event: EventDto) {
    const ok = await confirmDialog({
      title: 'Отклонить событие?',
      message: `«${event.nameEvent}» не будет опубликовано.`,
      confirmLabel: 'Отклонить',
      danger: true,
    })
    if (!ok) return

    setProcessing(event.id)
    try {
      const updated = await cancelEvent(event.id)
      setLocal(list.map((e) => (e.id === updated.id ? updated : e)))
      notify.info(`Событие отклонено · ${event.nameEvent}`)
    } catch (e) {
      notify.error(e)
    } finally {
      setProcessing(null)
    }
  }

  async function handleRollbackClick(event: EventDto) {
    try {
      const parts = await getParticipants(event.id)
      setRollingBack({ event, count: parts.length })
    } catch {
      setRollingBack({ event, count: 0 })
    }
  }

  async function toggleParticipants(event: EventDto) {
    const existing = participants[event.id]
    if (existing && existing !== 'loading') {
      setParticipants((prev) => {
        const copy = { ...prev }
        delete copy[event.id]
        return copy
      })
      return
    }
    if (existing === 'loading') return

    setParticipants((prev) => ({ ...prev, [event.id]: 'loading' }))
    try {
      const parts = await getParticipants(event.id)
      setParticipants((prev) => ({ ...prev, [event.id]: parts }))
    } catch {
      setParticipants((prev) => ({ ...prev, [event.id]: [] }))
    }
  }

  function emptyText() {
    if (tab === 'pending') return 'События, ожидающие одобрения, появятся здесь'
    if (tab === 'rewards') return 'События с выданными наградами появятся здесь'
    return 'Прошедшие события появятся здесь'
  }

  function emptyTitle() {
    if (tab === 'pending') return 'Всё проверено'
    if (tab === 'rewards') return 'Нет событий с выданной наградой'
    return 'Прошедших событий пока нет'
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          Модерация событий
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Одобряйте события, управляйте наградами и смотрите историю
        </p>
      </div>

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-[#0d1117]">
          <button
            onClick={() => setTab('pending')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition ${
              tab === 'pending'
                ? 'bg-white dark:bg-[#161b22] text-brand-700 dark:text-brand-400 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            На модерации
            {pending.length > 0 && (
              <span className="text-xs px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 font-semibold min-w-[20px] text-center">
                {pending.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setTab('rewards')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition ${
              tab === 'rewards'
                ? 'bg-white dark:bg-[#161b22] text-brand-700 dark:text-brand-400 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            С наградой
            <span className="text-xs px-1.5 py-0.5 rounded-full bg-slate-200 dark:bg-[#21262d] text-slate-600 dark:text-slate-400 font-semibold min-w-[20px] text-center">
              {rewards.length}
            </span>
          </button>
          <button
            onClick={() => setTab('past')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition ${
              tab === 'past'
                ? 'bg-white dark:bg-[#161b22] text-brand-700 dark:text-brand-400 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Прошедшие
            <span className="text-xs px-1.5 py-0.5 rounded-full bg-slate-200 dark:bg-[#21262d] text-slate-600 dark:text-slate-400 font-semibold min-w-[20px] text-center">
              {past.length}
            </span>
          </button>
        </div>

        <button
          onClick={() => setShowCreate(true)}
          className="bg-brand-600 hover:bg-brand-700 text-white rounded-lg px-4 py-2 text-sm font-medium inline-flex items-center gap-1.5 shadow-sm transition"
        >
          <IconPlus size={14} />
          Создать событие
        </button>
      </div>

      {events.loading && (
        <div className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-[#30363d] p-8 text-center text-slate-500">
          Загрузка...
        </div>
      )}

      {events.error && (
        <div className="bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 rounded-xl border border-red-200 dark:border-red-500/30 p-4 text-sm">
          {events.error}
        </div>
      )}

      {!events.loading && displayed.length === 0 && (
        <div className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-[#30363d] p-10 text-center">
          <div className="text-sm font-semibold text-slate-600 dark:text-slate-300">
            {emptyTitle()}
          </div>
          <div className="text-xs text-slate-400 dark:text-slate-500 mt-1">
            {emptyText()}
          </div>
        </div>
      )}

      {/* === PENDING === */}
      {tab === 'pending' && pending.length > 0 && (
        <div className="space-y-2.5">
          {pending.map((e) => (
            <div
              key={e.id}
              className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-[#30363d] p-5"
            >
              <div className="flex items-start gap-3 mb-3">
                <Avatar name={e.organizerName} size="md" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="font-semibold text-slate-900 dark:text-white">
                      {e.nameEvent}
                    </h3>
                    <span className="text-[10px] bg-slate-100 dark:bg-[#0d1117] text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-full font-medium">
                      {e.category}
                    </span>
                  </div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">
                    Организатор:{' '}
                    <span className="text-slate-700 dark:text-slate-300 font-medium">
                      {e.organizerName}
                    </span>
                  </div>
                </div>
              </div>

              {e.description && (
                <div className="bg-slate-50 dark:bg-[#0d1117] rounded-lg p-3 mb-3">
                  <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                    Описание
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                    {e.description}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                <div className="bg-slate-50 dark:bg-[#0d1117] rounded-lg px-3 py-2">
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Когда
                  </div>
                  <div className="text-sm text-slate-900 dark:text-white font-medium mt-0.5">
                    {new Date(e.fromTime).toLocaleDateString('ru-RU', {
                      day: '2-digit',
                      month: 'short',
                    })}
                    {' · '}
                    {new Date(e.fromTime).toLocaleTimeString('ru-RU', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                    {' — '}
                    {new Date(e.toTime).toLocaleTimeString('ru-RU', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
                <div className="bg-slate-50 dark:bg-[#0d1117] rounded-lg px-3 py-2">
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Где
                  </div>
                  <div className="text-sm text-slate-900 dark:text-white font-medium mt-0.5 truncate">
                    {e.eventPlace || 'Не указано'}
                  </div>
                </div>
              </div>

              {e.commentToAdmin && (
                <div className="border-l-2 border-brand-400 bg-brand-50/40 dark:bg-brand-500/5 px-3 py-2 rounded-r-lg mb-3">
                  <div className="text-[11px] font-semibold text-brand-700 dark:text-brand-400 uppercase tracking-wider mb-0.5">
                    Пожелания организатора
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    {e.commentToAdmin}
                  </p>
                </div>
              )}

              <div className="flex gap-2 pt-3 border-t border-slate-100 dark:border-[#30363d]">
                <button
                  onClick={() => setApproving(e)}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-sm px-4 py-2 rounded-lg font-medium transition"
                >
                  Одобрить
                </button>
                <button
                  onClick={() => handleCancel(e)}
                  disabled={processing === e.id}
                  className="flex-1 border border-slate-300 dark:border-[#30363d] text-slate-600 dark:text-slate-300 hover:border-red-400 hover:text-red-600 dark:hover:text-red-400 text-sm px-4 py-2 rounded-lg font-medium disabled:opacity-50 transition"
                >
                  {processing === e.id ? '...' : 'Отклонить'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* === REWARDS (только COMPLETED + rewardsGranted) === */}
      {tab === 'rewards' && rewards.length > 0 && (
        <div className="space-y-2.5">
          {rewards.map((e) => {
            const partsState = participants[e.id]
            const partsList = Array.isArray(partsState) ? partsState : null
            const isLoadingParts = partsState === 'loading'
            const { original } = parseEventComment(e.commentToAdmin)

            return (
              <div
                key={e.id}
                className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-[#30363d] p-5"
              >
                <div className="flex items-start justify-between gap-3 flex-wrap mb-2">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <Avatar name={e.organizerName} size="md" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-900 dark:text-white">
                        {e.nameEvent}
                      </h3>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {new Date(e.toTime).toLocaleDateString('ru-RU', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric',
                        })}
                        {' · '}
                        {e.organizerName}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5 shrink-0">
                    {e.rewardCoins && (
                      <span className="text-xs bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 px-2.5 py-1 rounded-full font-semibold">
                        +{e.rewardCoins.toFixed(0)} монет
                      </span>
                    )}
                    {e.rewardRating && (
                      <span className="text-xs bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-400 px-2.5 py-1 rounded-full font-semibold">
                        +{e.rewardRating.toFixed(1)} рейтинга
                      </span>
                    )}
                  </div>
                </div>

                {e.description && (
                  <div className="text-sm text-slate-600 dark:text-slate-300 mb-2 line-clamp-2">
                    {e.description}
                  </div>
                )}

                {original && (
                  <div className="mt-2 bg-slate-50 dark:bg-[#0d1117] border border-slate-200 dark:border-[#30363d] rounded-lg px-3 py-2 text-sm">
                    <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-0.5">
                      Пожелания организатора
                    </div>
                    <div className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                      {original}
                    </div>
                  </div>
                )}

                {partsList && (
                  <div className="mt-3 bg-slate-50 dark:bg-[#0d1117] rounded-lg p-3">
                    <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                      Получили награду ({partsList.length})
                    </div>
                    {partsList.length === 0 ? (
                      <div className="text-xs text-slate-400 dark:text-slate-500 italic">
                        На момент выдачи участников не было
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {partsList.map((p) => (
                          <span
                            key={p.userId}
                            className="text-xs px-2 py-1 bg-white dark:bg-[#161b22] text-slate-700 dark:text-slate-300 rounded border border-slate-200 dark:border-[#30363d]"
                          >
                            {p.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between gap-2 pt-2 mt-2 border-t border-slate-100 dark:border-[#30363d]">
                  <button
                    onClick={() => toggleParticipants(e)}
                    disabled={isLoadingParts}
                    className="text-sm text-brand-600 dark:text-brand-400 hover:underline font-medium disabled:opacity-50"
                  >
                    {partsList
                      ? 'Скрыть участников'
                      : isLoadingParts
                      ? 'Загрузка...'
                      : 'Показать участников'}
                  </button>
                  <button
                    onClick={() => handleRollbackClick(e)}
                    className="text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 px-3 py-1.5 rounded-lg font-medium transition"
                  >
                    Откатить награды
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* === PAST (все COMPLETED + CANCELLED) === */}
      {tab === 'past' && past.length > 0 && (
        <div className="space-y-2.5">
          {past.map((e) => {
            const partsState = participants[e.id]
            const partsList = Array.isArray(partsState) ? partsState : null
            const isLoadingParts = partsState === 'loading'
            const meta = STATUS_META[e.eventStatus] || STATUS_META.COMPLETED
            const isCancelled = e.eventStatus === 'CANCELLED'
            const hasRewards = e.paidInCoins && e.rewardsGranted
            const { original, rollbackReason } = parseEventComment(e.commentToAdmin)

            return (
              <div
                key={e.id}
                className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-[#30363d] p-5"
              >
                <div className="flex items-start justify-between gap-3 flex-wrap mb-2">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <Avatar name={e.organizerName} size="md" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="font-semibold text-slate-900 dark:text-white">
                          {e.nameEvent}
                        </h3>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${meta.className}`}
                        >
                          {meta.label}
                        </span>
                        <span className="text-[10px] bg-slate-100 dark:bg-[#0d1117] text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-full font-medium">
                          {e.category}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {new Date(e.toTime).toLocaleDateString('ru-RU', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric',
                        })}
                        {' · '}
                        {e.organizerName}
                      </div>
                    </div>
                  </div>
                  {hasRewards && (
                    <div className="flex flex-wrap gap-1.5 shrink-0">
                      {e.rewardCoins && (
                        <span className="text-xs bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 px-2.5 py-1 rounded-full font-semibold">
                          +{e.rewardCoins.toFixed(0)} монет
                        </span>
                      )}
                      {e.rewardRating && (
                        <span className="text-xs bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-400 px-2.5 py-1 rounded-full font-semibold">
                          +{e.rewardRating.toFixed(1)} рейтинга
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {e.description && (
                  <div className="text-sm text-slate-600 dark:text-slate-300 mb-2 line-clamp-2">
                    {e.description}
                  </div>
                )}

                {/* Причина отмены — ТОЛЬКО для CANCELLED с rollback */}
                {isCancelled && rollbackReason && (
                  <div className="mt-2 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-lg px-3 py-2 text-sm">
                    <div className="text-[11px] font-semibold text-red-700 dark:text-red-400 uppercase tracking-wider mb-0.5">
                      Причина отмены
                    </div>
                    <div className="text-red-700 dark:text-red-400 whitespace-pre-wrap">
                      {rollbackReason}
                    </div>
                  </div>
                )}

                {/* Пожелания организатора — ТОЛЬКО для COMPLETED (не для отменённых) */}
                {!isCancelled && original && (
                  <div className="mt-2 bg-slate-50 dark:bg-[#0d1117] border border-slate-200 dark:border-[#30363d] rounded-lg px-3 py-2 text-sm">
                    <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-0.5">
                      Пожелания организатора
                    </div>
                    <div className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                      {original}
                    </div>
                  </div>
                )}

                {partsList && (
                  <div className="mt-3 bg-slate-50 dark:bg-[#0d1117] rounded-lg p-3">
                    <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                      Участники ({partsList.length})
                    </div>
                    {partsList.length === 0 ? (
                      <div className="text-xs text-slate-400 dark:text-slate-500 italic">
                        Записей не было
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {partsList.map((p) => (
                          <span
                            key={p.userId}
                            className="text-xs px-2 py-1 bg-white dark:bg-[#161b22] text-slate-700 dark:text-slate-300 rounded border border-slate-200 dark:border-[#30363d]"
                          >
                            {p.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between gap-2 pt-2 mt-2 border-t border-slate-100 dark:border-[#30363d]">
                  <button
                    onClick={() => toggleParticipants(e)}
                    disabled={isLoadingParts}
                    className="text-sm text-brand-600 dark:text-brand-400 hover:underline font-medium disabled:opacity-50"
                  >
                    {partsList
                      ? 'Скрыть участников'
                      : isLoadingParts
                      ? 'Загрузка...'
                      : 'Показать участников'}
                  </button>
                  {!isCancelled && hasRewards && (
                    <button
                      onClick={() => handleRollbackClick(e)}
                      className="text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 px-3 py-1.5 rounded-lg font-medium transition"
                    >
                      Откатить награды
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {showCreate && (
        <CreateEventModal
          actorId={user.id}
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            setShowCreate(false)
            notify.success('Событие создано')
            setTimeout(() => window.location.reload(), 400)
          }}
        />
      )}
      {approving && (
        <ApproveEventModal
          event={approving}
          actorId={user.id}
          onClose={() => setApproving(null)}
          onApproved={() => {
            notify.success(`Событие одобрено · ${approving.nameEvent}`)
            setApproving(null)
            setTimeout(() => window.location.reload(), 400)
          }}
        />
      )}
      {rollingBack && (
        <RollbackRewardsModal
          event={rollingBack.event}
          participantCount={rollingBack.count}
          actorId={user.id}
          onClose={() => setRollingBack(null)}
          onRolledBack={() => {
            notify.warning(`Награды откачены · ${rollingBack.event.nameEvent}`)
            setRollingBack(null)
            setTimeout(() => window.location.reload(), 400)
          }}
        />
      )}
    </div>
  )
}