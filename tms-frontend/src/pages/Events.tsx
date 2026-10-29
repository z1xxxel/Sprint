import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '../store/auth'
import { useFetch } from '../hooks/useFetch'
import {
  getEvents,
  getEventsByOrganizer,
  getMyParticipations,
  registerForEvent,
  unregisterFromEvent,
  cancelEvent,
  getParticipants,
} from '../api/events'
import CreateEventModal from '../components/CreateEventModal'
import { IconCalendar, IconPin, IconUser } from '../components/Icons'
import type { EventDto } from '../types'

const STATUS_LABEL: Record<string, string> = {
  NEW: 'На модерации',
  ASSIGNED: 'Активно',
  COMPLETED: 'Завершено',
  CANCELLED: 'Отменено',
}

const STATUS_COLOR: Record<string, string> = {
  NEW: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30',
  ASSIGNED:
    'bg-brand-50 text-brand-700 border-brand-200 dark:bg-brand-500/10 dark:text-brand-400 dark:border-brand-500/30',
  COMPLETED:
    'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/30',
  CANCELLED:
    'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/30',
}

type Tab = 'all' | 'mine' | 'attended'

export default function Events() {
  const user = useAuth((s) => s.user)!
  const events = useFetch(() => getEvents(user.id), [user.id])
  const myEvents = useFetch(() => getEventsByOrganizer(user.id, user.id), [user.id])
  const myParts = useFetch(() => getMyParticipations(user.id), [user.id])

  const [participations, setParticipations] = useState<Set<number>>(new Set())
  const [processing, setProcessing] = useState<number | null>(null)
  const [tab, setTab] = useState<Tab>('all')
  const [createOpen, setCreateOpen] = useState(false)

  useEffect(() => {
    if (myParts.data) setParticipations(new Set(myParts.data))
  }, [myParts.data])

  async function toggleParticipate(eventId: number) {
    setProcessing(eventId)
    try {
      if (participations.has(eventId)) {
        await unregisterFromEvent(eventId, user.id)
        const copy = new Set(participations)
        copy.delete(eventId)
        setParticipations(copy)
      } else {
        await registerForEvent(eventId, user.id)
        setParticipations(new Set(participations).add(eventId))
      }
    } catch (e: any) {
      alert(e.response?.data || 'Ошибка')
    } finally {
      setProcessing(null)
    }
  }

  async function handleCancel(eventId: number) {
    if (!confirm('Отменить событие?')) return
    setProcessing(eventId)
    try {
      await cancelEvent(eventId)
      window.location.reload()
    } catch (e: any) {
      alert(e.response?.data || 'Ошибка')
      setProcessing(null)
    }
  }

  // Объединяем общий список + мои события (без дублей)
  const merged = useMemo(() => {
    const map = new Map<number, EventDto>()
    ;(events.data ?? []).forEach((e) => map.set(e.id, e))
    ;(myEvents.data ?? []).forEach((e) => map.set(e.id, e))
    return Array.from(map.values())
  }, [events.data, myEvents.data])

  // Скрываем чужие NEW
  const visible = useMemo(
    () => merged.filter((e) => (e.eventStatus === 'NEW' ? e.organizerId === user.id : true)),
    [merged, user.id]
  )

  // Считаем количество для бейджей на вкладках
  const counts = useMemo(
    () => ({
      all: visible.filter((e) => e.eventStatus === 'ASSIGNED').length,
      mine: visible.filter((e) => e.organizerId === user.id).length,
      attended: visible.filter((e) => participations.has(e.id)).length,
    }),
    [visible, participations, user.id]
  )

  // Формируем список для активной вкладки
  const list = useMemo(() => {
    const asc = (a: EventDto, b: EventDto) =>
      new Date(a.fromTime).getTime() - new Date(b.fromTime).getTime()
    const desc = (a: EventDto, b: EventDto) =>
      new Date(b.fromTime).getTime() - new Date(a.fromTime).getTime()

    if (tab === 'mine') {
      return visible.filter((e) => e.organizerId === user.id).sort(asc)
    }
    if (tab === 'attended') {
      return visible.filter((e) => participations.has(e.id)).sort(desc)
    }
    // all — только активные
    return visible.filter((e) => e.eventStatus === 'ASSIGNED').sort(asc)
  }, [visible, tab, participations, user.id])

  const canCancel = (e: EventDto) =>
    e.organizerId === user.id || user.role === 'ADMIN' || user.role === 'HR'

  const loading = events.loading || myEvents.loading

  const emptyText =
    tab === 'all'
      ? 'Активных событий пока нет'
      : tab === 'mine'
      ? 'Вы ещё не создавали событий'
      : 'Вы пока не записывались на события'

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white tracking-tight">
            События
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Корпоративные мероприятия компании
          </p>
        </div>
        <button
          onClick={() => setCreateOpen(true)}
          className="bg-brand-600 hover:bg-brand-700 text-white rounded-md px-4 py-2 text-sm font-medium transition"
        >
          + Создать событие
        </button>
      </div>

      {/* Табы */}
      <div className="border-b border-slate-200 dark:border-[#30363d]">
        <div className="flex gap-1 -mb-px overflow-x-auto">
          {(
            [
              { id: 'all', label: 'Активные' },
              { id: 'mine', label: 'Мои события' },
              { id: 'attended', label: 'Посещённые' },
            ] as { id: Tab; label: string }[]
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
              <span
                className={`text-xs px-1.5 py-0.5 rounded-full ${
                  tab === t.id
                    ? 'bg-brand-100 dark:bg-brand-500/20 text-brand-700 dark:text-brand-400'
                    : 'bg-slate-100 dark:bg-[#21262d] text-slate-500 dark:text-slate-400'
                }`}
              >
                {counts[t.id]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {loading && <div className="text-slate-500">Загрузка...</div>}
      {events.error && <div className="text-red-600">{events.error}</div>}

      {!loading && list.length === 0 && (
        <div className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-[#30363d] p-8 sm:p-12 text-center">
          <div className="text-slate-400 dark:text-slate-500 text-sm mb-4">{emptyText}</div>
          {tab === 'all' && (
            <button
              onClick={() => setCreateOpen(true)}
              className="inline-block bg-brand-600 hover:bg-brand-700 text-white rounded-md px-4 py-2 text-sm font-medium transition"
            >
              + Создать событие
            </button>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {list.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            currentUserId={user.id}
            isParticipating={participations.has(event.id)}
            canCancel={canCancel(event)}
            processing={processing === event.id}
            onToggleParticipate={() => toggleParticipate(event.id)}
            onCancel={() => handleCancel(event.id)}
          />
        ))}
      </div>

      {createOpen && (
        <CreateEventModal
          actorId={user.id}
          onClose={() => setCreateOpen(false)}
          onCreated={() => {
            setCreateOpen(false)
            window.location.reload()
          }}
        />
      )}
    </div>
  )
}

function EventCard({
  event,
  currentUserId,
  isParticipating,
  canCancel,
  processing,
  onToggleParticipate,
  onCancel,
}: {
  event: EventDto
  currentUserId: number
  isParticipating: boolean
  canCancel: boolean
  processing: boolean
  onToggleParticipate: () => void
  onCancel: () => void
}) {
  const [showParticipants, setShowParticipants] = useState(false)
  const participants = useFetch(
    () => (showParticipants ? getParticipants(event.id) : Promise.resolve([])),
    [showParticipants, event.id]
  )

  const from = new Date(event.fromTime)
  const to = new Date(event.toTime)
  const isMine = event.organizerId === currentUserId
  const canParticipate = event.eventStatus === 'ASSIGNED' && !isMine

  return (
    <div className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-[#30363d] p-5 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            {event.category}
            {isMine && (
              <span className="ml-2 text-[10px] bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-400 px-1.5 py-0.5 rounded normal-case tracking-normal">
                Моё
              </span>
            )}
          </div>
          <h3 className="font-semibold text-slate-900 dark:text-white mt-0.5">
            {event.nameEvent}
          </h3>
        </div>
        <span
          className={`shrink-0 text-xs px-2 py-0.5 rounded border font-medium ${
            STATUS_COLOR[event.eventStatus] || STATUS_COLOR.ASSIGNED
          }`}
        >
          {STATUS_LABEL[event.eventStatus] || event.eventStatus}
        </span>
      </div>

      {event.description && (
        <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2">
          {event.description}
        </p>
      )}

      <div className="space-y-1.5 text-sm">
        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
          <span className="text-slate-400 dark:text-slate-500">
            <IconCalendar size={16} />
          </span>
          <span>
            {from.toLocaleDateString('ru-RU', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            })}
            ,{' '}
            {from.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
            {' – '}
            {to.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        {event.eventPlace && (
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
            <span className="text-slate-400 dark:text-slate-500">
              <IconPin size={16} />
            </span>
            <span>{event.eventPlace}</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
          <span className="text-slate-400 dark:text-slate-500">
            <IconUser size={16} />
          </span>
          <span>
            Организатор:{' '}
            <span className="text-slate-900 dark:text-white">{event.organizerName}</span>
          </span>
        </div>
      </div>

      {event.paidInCoins && (event.rewardCoins || event.rewardRating) && (
        <div className="flex gap-2 text-xs">
          {event.rewardCoins && (
            <span className="bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 px-2 py-1 rounded border border-amber-200 dark:border-amber-500/30">
              +{event.rewardCoins.toFixed(0)} монет
            </span>
          )}
          {event.rewardRating && (
            <span className="bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-400 px-2 py-1 rounded border border-brand-200 dark:border-brand-500/30">
              +{event.rewardRating.toFixed(1)} рейтинга
            </span>
          )}
        </div>
      )}

      <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100 dark:border-[#30363d]">
        {canParticipate && (
          <button
            onClick={onToggleParticipate}
            disabled={processing}
            className={`text-sm px-3 py-1.5 rounded-md font-medium transition disabled:opacity-50 ${
              isParticipating
                ? 'border border-red-300 dark:border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10'
                : 'bg-brand-600 hover:bg-brand-700 text-white'
            }`}
          >
            {processing ? '...' : isParticipating ? 'Отписаться' : 'Записаться'}
          </button>
        )}

        {isMine && event.eventStatus === 'ASSIGNED' && (
          <span className="text-xs text-slate-500 dark:text-slate-400 self-center">
            Вы организатор — запись недоступна
          </span>
        )}

        {canCancel && (event.eventStatus === 'NEW' || event.eventStatus === 'ASSIGNED') && (
          <button
            onClick={onCancel}
            disabled={processing}
            className="text-sm px-3 py-1.5 border border-slate-300 dark:border-[#30363d] text-slate-600 dark:text-slate-300 rounded-md hover:border-red-500 hover:text-red-600 transition disabled:opacity-50"
          >
            {event.eventStatus === 'NEW' ? 'Отозвать' : 'Отменить'}
          </button>
        )}

        <button
          onClick={() => setShowParticipants((v) => !v)}
          className="text-sm px-3 py-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition"
        >
          {showParticipants ? 'Скрыть' : 'Участники'}
        </button>
      </div>

      {showParticipants && (
        <div className="pt-2 border-t border-slate-100 dark:border-[#30363d]">
          {participants.loading && <div className="text-xs text-slate-400">Загрузка...</div>}
          {participants.data && participants.data.length === 0 && (
            <div className="text-xs text-slate-400">Пока никто не записался</div>
          )}
          {participants.data && participants.data.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {participants.data.map((p) => (
                <span
                  key={p.userId}
                  className="text-xs px-2 py-0.5 bg-slate-100 dark:bg-[#0d1117] text-slate-700 dark:text-slate-300 rounded"
                >
                  {p.name}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}