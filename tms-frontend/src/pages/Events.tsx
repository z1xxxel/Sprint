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
import { confirmDialog } from '../lib/confirm'
import { notify } from '../lib/notify'
import {
  IconCalendar,
  IconPin,
  IconUser,
  IconSearch,
  IconCheck,
  IconX,
  IconClock,
  IconTarget,
  IconChevronDown,
} from '../components/Icons'
import type { EventDto } from '../types'

// ==========================================
// === Статусы событий ===
// ==========================================
type Tab = 'available' | 'mine' | 'past' | 'moderation'

const STATUS_META: Record<string, { label: string; className: string }> = {
  NEW: {
    label: 'На модерации',
    className:
      'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30',
  },
  ASSIGNED: {
    label: 'Открыта запись',
    className:
      'bg-brand-50 text-brand-700 border-brand-200 dark:bg-brand-500/10 dark:text-brand-400 dark:border-brand-500/30',
  },
  COMPLETED: {
    label: 'Завершено',
    className:
      'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/30',
  },
  CANCELLED: {
    label: 'Отменено',
    className:
      'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/30',
  },
}

// ==========================================
// === Утилиты для дат ===
// ==========================================
function startOfDay(d: Date) {
  const c = new Date(d)
  c.setHours(0, 0, 0, 0)
  return c
}

function groupByDate(events: EventDto[]) {
  const now = new Date()
  const today = startOfDay(now)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const endOfWeek = new Date(today)
  endOfWeek.setDate(endOfWeek.getDate() + 7)

  const groups: { title: string; items: EventDto[] }[] = [
    { title: 'Сегодня', items: [] },
    { title: 'Завтра', items: [] },
    { title: 'На этой неделе', items: [] },
    { title: 'Позже', items: [] },
  ]

  events.forEach((e) => {
    const d = new Date(e.fromTime)
    if (d < tomorrow) groups[0].items.push(e)
    else if (d < new Date(tomorrow.getTime() + 86400000)) groups[1].items.push(e)
    else if (d < endOfWeek) groups[2].items.push(e)
    else groups[3].items.push(e)
  })

  return groups.filter((g) => g.items.length > 0)
}

function whenLabel(startIso: string, endIso: string): { text: string; tone: 'soon' | 'live' | 'normal' } {
  const now = Date.now()
  const start = new Date(startIso).getTime()
  const end = new Date(endIso).getTime()
  if (now > end) return { text: '', tone: 'normal' }
  if (now >= start) return { text: 'Идёт сейчас', tone: 'live' }
  const diffMin = (start - now) / 60000
  if (diffMin < 60) return { text: `Через ${Math.round(diffMin)} мин.`, tone: 'soon' }
  if (diffMin < 24 * 60) return { text: `Через ${Math.round(diffMin / 60)} ч.`, tone: 'soon' }
  return { text: '', tone: 'normal' }
}

// ==========================================
// === Страница ===
// ==========================================
export default function Events() {
  const user = useAuth((s) => s.user)!

  const events = useFetch(() => getEvents(user.id), [user.id])
  const myEvents = useFetch(() => getEventsByOrganizer(user.id, user.id), [user.id])
  const myParts = useFetch(() => getMyParticipations(user.id), [user.id])

  const [participations, setParticipations] = useState<Set<number>>(new Set())
  const [processing, setProcessing] = useState<number | null>(null)
  const [tab, setTab] = useState<Tab>('available')
  const [createOpen, setCreateOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('')

  useEffect(() => {
    if (myParts.data) setParticipations(new Set(myParts.data))
  }, [myParts.data])

  // === Объединённый список ===
  const merged = useMemo(() => {
    const map = new Map<number, EventDto>()
    ;(events.data ?? []).forEach((e) => map.set(e.id, e))
    ;(myEvents.data ?? []).forEach((e) => map.set(e.id, e))
    return Array.from(map.values())
  }, [events.data, myEvents.data])

  // === Категории ===
  const categories = useMemo(() => {
    const set = new Set<string>()
    merged.forEach((e) => { if (e.category) set.add(e.category) })
    return Array.from(set).sort()
  }, [merged])

  // === Сплит по табам ===
  const split = useMemo(() => {
    const available: EventDto[] = []
    const mine: EventDto[] = []
    const past: EventDto[] = []
    const moderation: EventDto[] = []

    merged.forEach((e) => {
      const isMine = e.organizerId === user.id
      const isParticipant = participations.has(e.id)

      // На модерации видит только организатор
      if (e.eventStatus === 'NEW') {
        if (isMine) moderation.push(e)
        return
      }

      // Прошедшие
      if (e.eventStatus === 'COMPLETED' || e.eventStatus === 'CANCELLED') {
        if (isMine || isParticipant) past.push(e)
        return
      }

      // Активные
      if (e.eventStatus === 'ASSIGNED') {
        if (isMine || isParticipant) {
          mine.push(e)
        } else {
          available.push(e)
        }
      }
    })

    // сортировка
    const asc = (a: EventDto, b: EventDto) =>
      new Date(a.fromTime).getTime() - new Date(b.fromTime).getTime()
    const desc = (a: EventDto, b: EventDto) =>
      new Date(b.fromTime).getTime() - new Date(a.fromTime).getTime()

    available.sort(asc)
    mine.sort(asc)
    past.sort(desc)
    moderation.sort(asc)

    return { available, mine, past, moderation }
  }, [merged, participations, user.id])

  // === Фильтр по поиску + категории ===
  const applyFilters = (list: EventDto[]) => {
    let res = list
    if (query.trim()) {
      const q = query.toLowerCase()
      res = res.filter(
        (e) =>
          e.nameEvent.toLowerCase().includes(q) ||
          (e.description?.toLowerCase().includes(q) ?? false) ||
          (e.eventPlace?.toLowerCase().includes(q) ?? false)
      )
    }
    if (categoryFilter) {
      res = res.filter((e) => e.category === categoryFilter)
    }
    return res
  }

  const currentList = applyFilters(
    tab === 'available'
      ? split.available
      : tab === 'mine'
      ? split.mine
      : tab === 'past'
      ? split.past
      : split.moderation
  )

  // === Действия ===
  async function toggleParticipate(event: EventDto) {
    setProcessing(event.id)
    try {
      if (participations.has(event.id)) {
        await unregisterFromEvent(event.id, user.id)
        const copy = new Set(participations)
        copy.delete(event.id)
        setParticipations(copy)
        notify.info(`Вы отписались от «${event.nameEvent}»`)
      } else {
        await registerForEvent(event.id, user.id)
        setParticipations(new Set(participations).add(event.id))
        notify.success(`Вы записаны на «${event.nameEvent}»`)
      }
    } catch (e) {
      notify.error(e)
    } finally {
      setProcessing(null)
    }
  }

  async function handleCancel(event: EventDto) {
    const ok = await confirmDialog({
      title: 'Отменить событие?',
      message: `«${event.nameEvent}» будет отменено. Участники не смогут записаться.`,
      confirmLabel: 'Отменить',
      danger: true,
    })
    if (!ok) return
    setProcessing(event.id)
    try {
      await cancelEvent(event.id)
      notify.warning('Событие отменено')
      window.location.reload()
    } catch (e) {
      notify.error(e)
    } finally {
      setProcessing(null)
    }
  }

  // === Табы ===
  const tabs: { id: Tab; label: string; count: number; helper: string }[] = [
    {
      id: 'available',
      label: 'Доступные',
      count: split.available.length,
      helper: 'Куда можно записаться',
    },
    {
      id: 'mine',
      label: 'Мои',
      count: split.mine.length,
      helper: 'Вы организатор или участник',
    },
    {
      id: 'past',
      label: 'Прошедшие',
      count: split.past.length,
      helper: 'Завершённые и отменённые',
    },
  ]

  if (split.moderation.length > 0) {
    tabs.push({
      id: 'moderation',
      label: 'На модерации',
      count: split.moderation.length,
      helper: 'Ожидают одобрения HR',
    })
  }

  const loading = events.loading || myEvents.loading
  const activeTab = tabs.find((t) => t.id === tab) ?? tabs[0]

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white tracking-tight">
            События
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Мероприятия компании — записывайтесь, участвуйте, получайте монеты
          </p>
        </div>
        <button
          onClick={() => setCreateOpen(true)}
          className="bg-brand-600 hover:bg-brand-700 text-white rounded-lg px-4 py-2 text-sm font-medium transition"
        >
          + Создать событие
        </button>
      </div>

      {/* Табы */}
      <div className="border-b border-slate-200 dark:border-[#30363d] overflow-x-auto">
        <div className="flex gap-1 -mb-px">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-3 text-sm font-medium transition border-b-2 whitespace-nowrap flex items-center gap-2 ${
                tab === t.id
                  ? 'border-brand-600 text-brand-700 dark:text-brand-400'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {t.label}
              <span
                className={`text-xs px-1.5 py-0.5 rounded-full min-w-[20px] text-center ${
                  tab === t.id
                    ? 'bg-brand-100 dark:bg-brand-500/20 text-brand-700 dark:text-brand-400'
                    : 'bg-slate-100 dark:bg-[#21262d] text-slate-500 dark:text-slate-400'
                }`}
              >
                {t.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Хелпер и фильтры */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            <IconSearch size={16} />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск по названию, месту или описанию..."
            className="w-full border border-slate-300 dark:border-[#30363d] dark:bg-[#161b22] dark:text-white rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-brand-500"
          />
        </div>

        {categories.length > 0 && (
          <div className="relative">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="appearance-none border border-slate-300 dark:border-[#30363d] dark:bg-[#161b22] dark:text-white rounded-lg pl-3 pr-9 py-2 text-sm focus:outline-none focus:border-brand-500 cursor-pointer w-full sm:w-48"
            >
              <option value="">Все категории</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <IconChevronDown
              size={14}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
          </div>
        )}
      </div>

      <div className="text-xs text-slate-500 dark:text-slate-400">
        {activeTab.helper}
        {query && ` · поиск: «${query}»`}
        {categoryFilter && ` · категория: «${categoryFilter}»`}
      </div>

      {/* Контент */}
      {loading && <div className="text-slate-500 text-sm">Загрузка...</div>}
      {events.error && <div className="text-red-600 text-sm">{events.error}</div>}

      {!loading && currentList.length === 0 && (
        <EmptyState tab={tab} onCreate={() => setCreateOpen(true)} hasFilters={!!query || !!categoryFilter} />
      )}

      {/* Группировка по датам (только для активных табов) */}
      {!loading && currentList.length > 0 && (
        <>
          {(tab === 'available' || tab === 'mine' || tab === 'moderation') ? (
            <div className="space-y-6">
              {groupByDate(currentList).map((group) => (
                <div key={group.title}>
                  <h2 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                    {group.title}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {group.items.map((e) => (
                      <EventCard
                        key={e.id}
                        event={e}
                        currentUserId={user.id}
                        isParticipating={participations.has(e.id)}
                        isProcessing={processing === e.id}
                        onToggleParticipate={() => toggleParticipate(e)}
                        onCancel={() => handleCancel(e)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {currentList.map((e) => (
                <EventCard
                  key={e.id}
                  event={e}
                  currentUserId={user.id}
                  isParticipating={participations.has(e.id)}
                  isProcessing={processing === e.id}
                  onToggleParticipate={() => toggleParticipate(e)}
                  onCancel={() => handleCancel(e)}
                  compact
                />
              ))}
            </div>
          )}
        </>
      )}

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

// ==========================================
// === Карточка события ===
// ==========================================
function EventCard({
  event,
  currentUserId,
  isParticipating,
  isProcessing,
  onToggleParticipate,
  onCancel,
  compact,
}: {
  event: EventDto
  currentUserId: number
  isParticipating: boolean
  isProcessing: boolean
  onToggleParticipate: () => void
  onCancel: () => void
  compact?: boolean
}) {
  const me = useAuth((s) => s.user)!
  const [showParticipants, setShowParticipants] = useState(false)
  const participants = useFetch(
    () => (showParticipants ? getParticipants(event.id) : Promise.resolve([])),
    [showParticipants, event.id]
  )

  const from = new Date(event.fromTime)
  const to = new Date(event.toTime)
  const isMine = event.organizerId === currentUserId
  const canParticipate = event.eventStatus === 'ASSIGNED' && !isMine
  const status = STATUS_META[event.eventStatus]
  const when = whenLabel(event.fromTime, event.toTime)

  const monthShort = from.toLocaleDateString('ru-RU', { month: 'short' })
  const dayNum = from.toLocaleDateString('ru-RU', { day: '2-digit' })
  const weekday = from.toLocaleDateString('ru-RU', { weekday: 'short' })

  return (
    <div
      className={`bg-white dark:bg-[#161b22] rounded-xl border p-4 ${
        isParticipating
          ? 'border-brand-300 dark:border-brand-500/40'
          : 'border-slate-200 dark:border-[#30363d]'
      }`}
    >
      <div className="flex gap-4">
        {/* Дата слева */}
        <div
          className={`shrink-0 w-16 rounded-lg flex flex-col items-center justify-center py-2 ${
            event.eventStatus === 'COMPLETED' || event.eventStatus === 'CANCELLED'
              ? 'bg-slate-100 dark:bg-[#0d1117] text-slate-500 dark:text-slate-400'
              : 'bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-400'
          }`}
        >
          <div className="text-[10px] uppercase font-medium">{monthShort}</div>
          <div className="text-2xl font-bold leading-none">{dayNum}</div>
          <div className="text-[10px] uppercase mt-0.5">{weekday}</div>
        </div>

        {/* Тело */}
        <div className="flex-1 min-w-0">
          {/* Заголовок и статус */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {event.category}
                </span>
                {when.text && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                      when.tone === 'live'
                        ? 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400'
                        : 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400'
                    }`}
                  >
                    {when.text}
                  </span>
                )}
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white leading-tight">
                {event.nameEvent}
              </h3>
            </div>
            {status && (
              <span
                className={`shrink-0 text-[10px] px-2 py-0.5 rounded-full border font-medium whitespace-nowrap ${status.className}`}
              >
                {status.label}
              </span>
            )}
          </div>

          {/* Описание */}
          {!compact && event.description && (
            <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2 mt-1.5">
              {event.description}
            </p>
          )}

          {/* Метаданные */}
          <div className="mt-2 space-y-1 text-sm">
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
              <IconClock size={14} className="text-slate-400 shrink-0" />
              <span>
                {from.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                {' — '}
                {to.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            {event.eventPlace && (
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <IconPin size={14} className="text-slate-400 shrink-0" />
                <span className="truncate">{event.eventPlace}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
              <IconUser size={14} className="text-slate-400 shrink-0" />
              <span className="truncate">
                {isMine ? (
                  <span className="text-brand-700 dark:text-brand-400 font-medium">
                    Вы организатор
                  </span>
                ) : (
                  event.organizerName
                )}
              </span>
            </div>
          </div>

          {/* Награда */}
          {event.paidInCoins && (event.rewardCoins || event.rewardRating) && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {event.rewardCoins && (
                <span className="text-[11px] bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30 px-2 py-0.5 rounded-full font-medium">
                  +{event.rewardCoins.toFixed(0)} монет
                </span>
              )}
              {event.rewardRating && (
                <span className="text-[11px] bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-400 border border-brand-200 dark:border-brand-500/30 px-2 py-0.5 rounded-full font-medium">
                  +{event.rewardRating.toFixed(1)} рейтинга
                </span>
              )}
            </div>
          )}

          {/* Действия */}
          <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-[#30363d]">
            {/* Запись */}
            {canParticipate && (
              <button
                onClick={onToggleParticipate}
                disabled={isProcessing}
                className={`text-sm px-3 py-1.5 rounded-md font-medium transition disabled:opacity-50 inline-flex items-center gap-1.5 ${
                  isParticipating
                    ? 'border border-red-300 dark:border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10'
                    : 'bg-brand-600 hover:bg-brand-700 text-white'
                }`}
              >
                {isProcessing ? (
                  '...'
                ) : isParticipating ? (
                  <>
                    <IconX size={14} /> Отписаться
                  </>
                ) : (
                  <>
                    <IconCheck size={14} /> Записаться
                  </>
                )}
              </button>
            )}

            {/* Индикатор «Вы записаны» */}
            {isParticipating && !isMine && event.eventStatus === 'ASSIGNED' && (
              <span className="text-xs text-brand-700 dark:text-brand-400 self-center inline-flex items-center gap-1 font-medium">
                <IconCheck size={12} /> Вы записаны
              </span>
            )}

            {/* Отмена организатором */}
            {(isMine || me.role === 'ADMIN') &&
              (event.eventStatus === 'NEW' || event.eventStatus === 'ASSIGNED') && (
                <button
                  onClick={onCancel}
                  disabled={isProcessing}
                  className="text-sm px-3 py-1.5 border border-slate-300 dark:border-[#30363d] text-slate-600 dark:text-slate-300 rounded-md hover:border-red-500 hover:text-red-600 transition disabled:opacity-50"
                >
                  {event.eventStatus === 'NEW' ? 'Отозвать' : 'Отменить'}
                </button>
              )}

            {/* Участники */}
            <button
              onClick={() => setShowParticipants((v) => !v)}
              className="text-sm px-3 py-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition ml-auto"
            >
              {showParticipants ? 'Скрыть' : 'Участники'}
            </button>
          </div>

          {/* Список участников */}
          {showParticipants && (
            <div className="pt-3 mt-3 border-t border-slate-100 dark:border-[#30363d]">
              {participants.loading && (
                <div className="text-xs text-slate-400">Загрузка...</div>
              )}
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
      </div>
    </div>
  )
}

// ==========================================
// === Empty state ===
// ==========================================
function EmptyState({
  tab,
  onCreate,
  hasFilters,
}: {
  tab: Tab
  onCreate: () => void
  hasFilters: boolean
}) {
  if (hasFilters) {
    return (
      <div className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-[#30363d] p-8 sm:p-12 text-center">
        <div className="text-slate-400 dark:text-slate-500 text-sm">
          Ничего не найдено по выбранным фильтрам
        </div>
        <div className="text-xs text-slate-400 dark:text-slate-500 mt-1">
          Попробуйте изменить поиск или категорию
        </div>
      </div>
    )
  }

  const config = {
    available: {
      title: 'Нет доступных событий',
      subtitle: 'Создайте своё или загляните позже',
      button: '+ Создать событие',
    },
    mine: {
      title: 'Вы пока не записаны ни на что',
      subtitle: 'Загляните в раздел «Доступные» — там есть интересное',
      button: null,
    },
    past: {
      title: 'Прошедших событий нет',
      subtitle: 'Как только вы поучаствуете — они появятся здесь',
      button: null,
    },
    moderation: {
      title: 'Событий на модерации нет',
      subtitle: 'Все ваши события одобрены или отклонены',
      button: null,
    },
  }[tab]

  return (
    <div className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-[#30363d] p-8 sm:p-12 text-center">
      <div className="flex justify-center mb-3 text-brand-400">
        <IconCalendar size={40} />
      </div>
      <div className="text-slate-600 dark:text-slate-300 text-sm font-medium">
        {config.title}
      </div>
      <div className="text-xs text-slate-400 dark:text-slate-500 mt-1">
        {config.subtitle}
      </div>
      {config.button && (
        <button
          onClick={onCreate}
          className="mt-4 inline-block bg-brand-600 hover:bg-brand-700 text-white rounded-md px-4 py-2 text-sm font-medium transition"
        >
          {config.button}
        </button>
      )}
    </div>
  )
}