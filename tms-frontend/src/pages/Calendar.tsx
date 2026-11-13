import { useState, useMemo, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../store/auth'
import { useFetch } from '../hooks/useFetch'
import {
  getEvents,
  getEventsByOrganizer,
  getMyParticipations,
  cancelEvent,
} from '../api/events'
import { getAvailableQuests, startQuest } from '../api/quests'
import { getSurveys, getPassedSurveyIds } from '../api/surveys'
import type { Survey } from '../api/surveys'
import { can } from '../lib/permissions'
import { confirmDialog } from '../lib/confirm'
import { notify } from '../lib/notify'
import CreateEventModal from '../components/CreateEventModal'
import CreateQuestModal from '../components/CreateQuestModal'
import SurveyCreateModal from '../components/SurveyCreateModal'
import {
  IconChevronDown,
  IconTarget,
  IconCalendar,
  IconPin,
  IconUser,
  IconX,
  IconTrophy,
  IconClock,
  IconChart,
} from '../components/Icons'
import type { EventDto, QuestListItem } from '../types'

const DAY_NAMES = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
const HOUR_HEIGHT = 60

function startOfWeek(d: Date) {
  const copy = new Date(d)
  const day = copy.getDay() || 7
  copy.setDate(copy.getDate() - day + 1)
  copy.setHours(0, 0, 0, 0)
  return copy
}

function addDays(d: Date, n: number) {
  const c = new Date(d)
  c.setDate(c.getDate() + n)
  return c
}

function sameDay(a: Date, b: Date) {
  return (
    a.getDate() === b.getDate() &&
    a.getMonth() === b.getMonth() &&
    a.getFullYear() === b.getFullYear()
  )
}

function minutesFromMidnight(d: Date) {
  return d.getHours() * HOUR_HEIGHT + (d.getMinutes() / 60) * HOUR_HEIGHT
}

interface LayoutSlot {
  column: number
  totalColumns: number
}

function layoutDayEvents(events: EventDto[]): Map<number, LayoutSlot> {
  const result = new Map<number, LayoutSlot>()
  if (events.length === 0) return result

  const sorted = [...events].sort((a, b) => {
    const sa = new Date(a.fromTime).getTime()
    const sb = new Date(b.fromTime).getTime()
    if (sa !== sb) return sa - sb
    const ea = new Date(a.toTime).getTime()
    const eb = new Date(b.toTime).getTime()
    return eb - ea
  })

  const clusters: EventDto[][] = []
  let cluster: EventDto[] = [sorted[0]]
  let clusterMaxEnd = new Date(sorted[0].toTime).getTime()

  for (let i = 1; i < sorted.length; i++) {
    const ev = sorted[i]
    const start = new Date(ev.fromTime).getTime()
    const end = new Date(ev.toTime).getTime()
    if (start < clusterMaxEnd) {
      cluster.push(ev)
      clusterMaxEnd = Math.max(clusterMaxEnd, end)
    } else {
      clusters.push(cluster)
      cluster = [ev]
      clusterMaxEnd = end
    }
  }
  clusters.push(cluster)

  clusters.forEach((group) => {
    const endTimes: number[] = []
    group.forEach((ev) => {
      const start = new Date(ev.fromTime).getTime()
      const end = new Date(ev.toTime).getTime()
      let col = -1
      for (let c = 0; c < endTimes.length; c++) {
        if (endTimes[c] <= start) {
          col = c
          endTimes[c] = end
          break
        }
      }
      if (col === -1) {
        col = endTimes.length
        endTimes.push(end)
      }
      result.set(ev.id, { column: col, totalColumns: 0 })
    })
    const total = endTimes.length
    group.forEach((ev) => {
      const slot = result.get(ev.id)
      if (slot) slot.totalColumns = total
    })
  })

  return result
}

const QUEST_STYLES = {
  available: {
    bg: 'bg-accent-50 dark:bg-accent-500/10',
    text: 'text-accent-700 dark:text-accent-400',
    badge:
      'bg-accent-50 text-accent-700 border-accent-200 dark:bg-accent-500/10 dark:text-accent-400 dark:border-accent-500/30',
  },
  IN_PROGRESS: {
    bg: 'bg-brand-50 dark:bg-brand-500/10',
    text: 'text-brand-700 dark:text-brand-400',
    badge:
      'bg-brand-50 text-brand-700 border-brand-200 dark:bg-brand-500/10 dark:text-brand-400 dark:border-brand-500/30',
  },
  PENDING_REVIEW: {
    bg: 'bg-amber-50 dark:bg-amber-500/10',
    text: 'text-amber-700 dark:text-amber-400',
    badge:
      'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30',
  },
  REJECTED: {
    bg: 'bg-red-50 dark:bg-red-500/10',
    text: 'text-red-700 dark:text-red-400',
    badge:
      'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/30',
  },
  COMPLETED: {
    bg: 'bg-emerald-50 dark:bg-emerald-500/10',
    text: 'text-emerald-700 dark:text-emerald-400',
    badge:
      'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30',
  },
  EXPIRED_PENALTY: {
    bg: 'bg-red-100 dark:bg-red-500/20',
    text: 'text-red-800 dark:text-red-300',
    badge:
      'bg-red-100 text-red-800 border-red-300 dark:bg-red-500/20 dark:text-red-300 dark:border-red-500/40',
  },
  EXPIRED_NEUTRAL: {
    bg: 'bg-slate-100 dark:bg-slate-500/10',
    text: 'text-slate-600 dark:text-slate-400',
    badge:
      'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/30',
  },
}

type QuestStyleKey = keyof typeof QUEST_STYLES

function getQuestStyle(
  q: QuestListItem,
  nowMs: number
): { key: QuestStyleKey; style: (typeof QUEST_STYLES)[QuestStyleKey]; label: string } {
  if (q.myStatus === 'COMPLETED') {
    return { key: 'COMPLETED', style: QUEST_STYLES.COMPLETED, label: 'Выполнен · награда получена' }
  }

  const deadline = q.deadline ? new Date(q.deadline).getTime() : Infinity
  const isPast = deadline < nowMs

  if (isPast) {
    if (q.isMandatory && ((q.penaltyCoins ?? 0) > 0 || (q.penaltyRating ?? 0) > 0)) {
      return { key: 'EXPIRED_PENALTY', style: QUEST_STYLES.EXPIRED_PENALTY, label: 'Просрочен · штраф' }
    }
    return { key: 'EXPIRED_NEUTRAL', style: QUEST_STYLES.EXPIRED_NEUTRAL, label: 'Просрочен' }
  }

  if (q.myStatus === 'PENDING_REVIEW') {
    return { key: 'PENDING_REVIEW', style: QUEST_STYLES.PENDING_REVIEW, label: 'На проверке' }
  }
  if (q.myStatus === 'IN_PROGRESS') {
    return { key: 'IN_PROGRESS', style: QUEST_STYLES.IN_PROGRESS, label: 'В работе' }
  }
  if (q.myStatus === 'REJECTED') {
    return { key: 'REJECTED', style: QUEST_STYLES.REJECTED, label: 'Отклонён' }
  }
  return { key: 'available', style: QUEST_STYLES.available, label: 'Доступен' }
}

interface PreviewBlock {
  from: Date
  to: Date
  title: string
}

interface CreateAnchor {
  from: Date
  to: Date
  rect: { top: number; left: number; width: number; height: number }
}

type CreateType = 'event' | 'quest' | 'survey'

export default function Calendar() {
  const user = useAuth((s) => s.user)!
  const nav = useNavigate()
  const canModerate = can.approveEvents(user.role)
  const canCreateQuest = can.manageQuests(user.role)
  const canCreateSurvey = can.manageUsers(user.role) || can.approveEvents(user.role)

  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()))
  const [mode, setMode] = useState<'personal' | 'moderation'>('personal')
  const [now, setNow] = useState(() => new Date())
  const [createAnchor, setCreateAnchor] = useState<CreateAnchor | null>(null)
  const [createType, setCreateType] = useState<CreateType>('event')
  const [previewBlock, setPreviewBlock] = useState<PreviewBlock | null>(null)
  const [detailEvent, setDetailEvent] = useState<EventDto | null>(null)
  const [detailQuest, setDetailQuest] = useState<QuestListItem | null>(null)
  const [detailSurvey, setDetailSurvey] = useState<Survey | null>(null)

  useEffect(() => {
    const tick = () => setNow(new Date())
    const t = setInterval(tick, 10_000)
    const onVisible = () => {
      if (document.visibilityState === 'visible') tick()
    }
    document.addEventListener('visibilitychange', onVisible)
    window.addEventListener('focus', tick)
    return () => {
      clearInterval(t)
      document.removeEventListener('visibilitychange', onVisible)
      window.removeEventListener('focus', tick)
    }
  }, [])

  const events = useFetch(() => getEvents(user.id), [user.id])
  const myEvents = useFetch(() => getEventsByOrganizer(user.id, user.id), [user.id])
  const parts = useFetch(() => getMyParticipations(user.id), [user.id])
  const quests = useFetch(() => getAvailableQuests(user.id), [user.id])
  const surveys = useFetch(() => getSurveys(), [])

  const participationSet = useMemo(() => new Set(parts.data ?? []), [parts.data])
  const passedSurveyIds = useMemo(() => getPassedSurveyIds(user.id), [user.id])

  const mergedEvents = useMemo(() => {
    const map = new Map<number, EventDto>()
    ;(events.data ?? []).forEach((e) => map.set(e.id, e))
    ;(myEvents.data ?? []).forEach((e) => map.set(e.id, e))
    return Array.from(map.values())
  }, [events.data, myEvents.data])

  const eventsForCalendar = useMemo(() => {
    if (mode === 'moderation') {
      return mergedEvents.filter((e) => e.eventStatus === 'NEW')
    }
    return mergedEvents.filter(
      (e) =>
        (e.eventStatus === 'ASSIGNED' ||
          e.eventStatus === 'NEW' ||
          e.eventStatus === 'COMPLETED') &&
        (e.organizerId === user.id || participationSet.has(e.id))
    )
  }, [mergedEvents, mode, user.id, participationSet])

  const questsForCalendar = useMemo(() => {
    if (mode === 'moderation') return []
    return (quests.data ?? []).filter(
      (q) => q.deadline && q.myStatus !== 'CANCELLED'
    )
  }, [quests.data, mode])

  const surveysForCalendar = useMemo(() => {
    if (mode === 'moderation') return []
    return (surveys.data ?? []).filter((s) => s.deadline)
  }, [surveys.data, mode])

  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart]
  )

  function prevWeek() {
    setWeekStart(addDays(weekStart, -7))
  }
  function nextWeek() {
    setWeekStart(addDays(weekStart, 7))
  }
  function goToday() {
    setWeekStart(startOfWeek(new Date()))
  }

  function handleSlotClick(day: Date, hour: number, e: React.MouseEvent<HTMLDivElement>) {
    if (mode === 'moderation') return
    const rect = e.currentTarget.getBoundingClientRect()
    const y = e.clientY - rect.top
    const minutes = Math.max(0, Math.min(59, Math.floor(y)))
    const from = new Date(day)
    from.setHours(hour, minutes, 0, 0)
    if (from.getTime() < Date.now()) return
    const to = new Date(from)
    to.setHours(to.getHours() + 1)

    setCreateAnchor({
      from,
      to,
      rect: {
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      },
    })
    setCreateType('event')
    setPreviewBlock({ from, to, title: '' })
  }

  function closeCreate() {
    setCreateAnchor(null)
    setPreviewBlock(null)
    setCreateType('event')
  }

  function handleSwitchType(type: CreateType) {
    setCreateType(type)
    if (type !== 'event') setPreviewBlock(null)
    else if (createAnchor) {
      setPreviewBlock({ from: createAnchor.from, to: createAnchor.to, title: '' })
    }
  }

  const handlePreviewChange = useCallback(
    (from: Date | null, to: Date | null, title: string) => {
      if (from && to) setPreviewBlock({ from, to, title })
      else setPreviewBlock(null)
    },
    []
  )

  const nowTop = minutesFromMidnight(now)
  const isNowVisibleInThisWeek = weekDays.some((d) => sameDay(d, now))
  const nowMs = now.getTime()

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white tracking-tight">
            Календарь
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {mode === 'moderation'
              ? 'События, ожидающие вашего одобрения'
              : 'События, квесты и опросы с дедлайнами'}
          </p>
        </div>

        {canModerate && (
          <div className="inline-flex p-1 rounded-lg bg-slate-100 dark:bg-[#0d1117]">
            <button
              onClick={() => setMode('personal')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition ${
                mode === 'personal'
                  ? 'bg-white dark:bg-[#161b22] text-brand-700 dark:text-brand-400 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              Мои
            </button>
            <button
              onClick={() => setMode('moderation')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition ${
                mode === 'moderation'
                  ? 'bg-white dark:bg-[#161b22] text-brand-700 dark:text-brand-400 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              На модерации
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <button
            onClick={prevWeek}
            className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-[#21262d] text-slate-600 dark:text-slate-300"
            title="Предыдущая неделя"
          >
            <IconChevronDown size={16} className="rotate-90" />
          </button>
          <div className="text-sm font-medium text-slate-900 dark:text-white px-2">
            {weekStart.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })} —{' '}
            {addDays(weekStart, 6).toLocaleDateString('ru-RU', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </div>
          <button
            onClick={nextWeek}
            className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-[#21262d] text-slate-600 dark:text-slate-300"
            title="Следующая неделя"
          >
            <IconChevronDown size={16} className="-rotate-90" />
          </button>
        </div>
        <button
          onClick={goToday}
          className="text-sm px-3 py-1.5 border border-slate-300 dark:border-[#30363d] rounded-md text-slate-700 dark:text-slate-300 hover:border-brand-500 transition"
        >
          Сегодня
        </button>
      </div>

      <div className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-[#30363d]">
        <div className="grid grid-cols-[60px_repeat(7,minmax(0,1fr))] border-b border-slate-200 dark:border-[#30363d] sticky top-16 z-10 bg-white dark:bg-[#161b22] rounded-t-xl">
          <div className="bg-slate-50 dark:bg-[#0d1117] rounded-tl-xl" />
          {weekDays.map((d, i) => {
            const isToday = sameDay(d, now)
            return (
              <div
                key={i}
                className={`px-2 py-2 text-center border-l border-slate-200 dark:border-[#30363d] ${
                  isToday
                    ? 'bg-brand-50 dark:bg-brand-500/10'
                    : 'bg-slate-50 dark:bg-[#0d1117]'
                } ${i === 6 ? 'rounded-tr-xl' : ''}`}
              >
                <div
                  className={`text-[10px] uppercase tracking-wider ${
                    isToday
                      ? 'text-brand-700 dark:text-brand-400 font-semibold'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {DAY_NAMES[i]}
                </div>
                <div
                  className={`text-base font-semibold ${
                    isToday
                      ? 'text-brand-700 dark:text-brand-400'
                      : 'text-slate-900 dark:text-white'
                  }`}
                >
                  {d.getDate()}
                </div>
              </div>
            )
          })}
        </div>

        <div className="relative">
          <div className="grid grid-cols-[60px_repeat(7,minmax(0,1fr))] relative">
            <div>
              {Array.from({ length: 24 }, (_, h) => (
                <div
                  key={h}
                  className="h-[60px] border-b border-slate-100 dark:border-[#30363d] text-[10px] text-slate-400 dark:text-slate-500 pr-2 text-right pt-0.5"
                >
                  {String(h).padStart(2, '0')}:00
                </div>
              ))}
            </div>

            {weekDays.map((d, i) => {
              const isToday = sameDay(d, now)
              const dayEvents = eventsForCalendar.filter((e) =>
                sameDay(new Date(e.fromTime), d)
              )
              const dayQuests = questsForCalendar.filter(
                (q) => q.deadline && sameDay(new Date(q.deadline), d)
              )
              const daySurveys = surveysForCalendar.filter(
                (s) => s.deadline && sameDay(new Date(s.deadline), d)
              )
              const layout = layoutDayEvents(dayEvents)
              const dayPreview =
                previewBlock && sameDay(previewBlock.from, d) ? previewBlock : null

              return (
                <div
                  key={i}
                  className={`relative border-l border-slate-100 dark:border-[#30363d] ${
                    isToday ? 'bg-brand-50/30 dark:bg-brand-500/5' : ''
                  }`}
                >
                  {Array.from({ length: 24 }, (_, h) => {
                    const slotStart = new Date(d)
                    slotStart.setHours(h, 0, 0, 0)
                    const isPast = slotStart.getTime() < Date.now()

                    return (
                      <div
                        key={h}
                        className={`h-[60px] border-b border-slate-100 dark:border-[#30363d] transition ${
                          mode === 'personal' && !isPast
                            ? 'hover:bg-slate-50 dark:hover:bg-[#0d1117] cursor-pointer'
                            : 'cursor-default'
                        }`}
                        onClick={(e) =>
                          mode === 'personal' && !isPast && handleSlotClick(d, h, e)
                        }
                      />
                    )
                  })}

                  {dayEvents.map((ev) => {
                    const from = new Date(ev.fromTime)
                    const to = new Date(ev.toTime)
                    const top = minutesFromMidnight(from)
                    const height = Math.max(
                      30,
                      ((to.getTime() - from.getTime()) / 60000 / 60) * HOUR_HEIGHT
                    )
                    const isModeration = ev.eventStatus === 'NEW'
                    const hasReward =
                      ev.paidInCoins &&
                      ((ev.rewardCoins ?? 0) > 0 || (ev.rewardRating ?? 0) > 0)
                    const isCompletedWithReward =
                      ev.eventStatus === 'COMPLETED' && ev.rewardsGranted && hasReward
                    const isCompletedNoReward =
                      ev.eventStatus === 'COMPLETED' && !hasReward

                    const slot = layout.get(ev.id)
                    const totalCols = slot?.totalColumns ?? 1
                    const col = slot?.column ?? 0
                    const widthPct = 100 / totalCols
                    const leftPct = col * widthPct

                    let styleCls = ''
                    if (isModeration) {
                      styleCls =
                        'bg-slate-100 dark:bg-[#21262d] border border-dashed border-slate-400 dark:border-[#484f58] opacity-60 hover:opacity-90'
                    } else if (isCompletedWithReward) {
                      styleCls =
                        'bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-400 dark:border-emerald-500/50'
                    } else if (isCompletedNoReward) {
                      styleCls =
                        'bg-slate-50 dark:bg-[#0d1117] border border-slate-300 dark:border-[#484f58] opacity-75'
                    } else {
                      styleCls =
                        'bg-white dark:bg-[#30363d] border border-slate-300 dark:border-[#484f58] hover:shadow-md hover:border-brand-500'
                    }

                    const textCls = isModeration
                      ? 'text-slate-500 dark:text-slate-400'
                      : isCompletedWithReward
                      ? 'text-emerald-900 dark:text-emerald-300'
                      : 'text-slate-900 dark:text-white'

                    return (
                      <button
                        key={`ev-${ev.id}`}
                        type="button"
                        className={`absolute rounded-md shadow-sm px-1.5 py-1 overflow-hidden text-left transition z-10 cursor-pointer ${styleCls}`}
                        style={{
                          top,
                          height,
                          left: `calc(${leftPct}% + 2px)`,
                          width: `calc(${widthPct}% - 4px)`,
                        }}
                        title={
                          isModeration
                            ? `${ev.nameEvent} · на модерации`
                            : `${ev.nameEvent} · ${ev.category}`
                        }
                        onClick={(e) => {
                          e.stopPropagation()
                          setDetailEvent(ev)
                        }}
                      >
                        <div className={`text-[10px] font-semibold truncate ${textCls}`}>
                          {ev.nameEvent}
                          {isModeration && (
                            <span className="ml-1 text-[9px] italic font-normal">
                              · модерация
                            </span>
                          )}
                        </div>
                        {totalCols === 1 && height >= 40 && (
                          <div
                            className={`text-[9px] truncate ${
                              isCompletedWithReward
                                ? 'text-emerald-600 dark:text-emerald-500'
                                : 'text-slate-500 dark:text-slate-400'
                            }`}
                          >
                            {from.toLocaleTimeString('ru-RU', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                            {' — '}
                            {to.toLocaleTimeString('ru-RU', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        )}
                        {hasReward && height >= 54 && (
                          <div className="flex flex-wrap gap-1.5 mt-0.5">
                            {ev.rewardCoins && ev.rewardCoins > 0 && (
                              <span
                                className={`text-[9px] font-semibold ${
                                  isCompletedWithReward
                                    ? 'text-emerald-700 dark:text-emerald-400'
                                    : 'text-amber-700 dark:text-amber-400'
                                }`}
                              >
                                {ev.rewardCoins.toFixed(0)} монет
                              </span>
                            )}
                            {ev.rewardRating && ev.rewardRating > 0 && (
                              <span
                                className={`text-[9px] font-semibold ${
                                  isCompletedWithReward
                                    ? 'text-emerald-700 dark:text-emerald-400'
                                    : 'text-brand-700 dark:text-brand-400'
                                }`}
                              >
                                {ev.rewardRating.toFixed(1)} рейтинга
                              </span>
                            )}
                          </div>
                        )}
                      </button>
                    )
                  })}

                  {dayQuests.map((q) => {
                    const dl = new Date(q.deadline!)
                    const top = minutesFromMidnight(dl)
                    const { style, label } = getQuestStyle(q, nowMs)
                    const hasReward = q.rewardCoins > 0 || (q.rewardRating ?? 0) > 0
                    const hasPenalty =
                      q.isMandatory &&
                      ((q.penaltyCoins ?? 0) > 0 || (q.penaltyRating ?? 0) > 0)
                    const showPenalty = hasPenalty && label.includes('штраф')

                    return (
                      <button
                        key={`q-${q.questId}`}
                        type="button"
                        className={`absolute left-1 right-1 rounded ${style.bg} px-1.5 py-0.5 overflow-hidden z-10 text-left hover:brightness-95 transition cursor-pointer`}
                        style={{ top, height: 22 }}
                        title={`Квест · ${label} · ${q.title}`}
                        onClick={(e) => {
                          e.stopPropagation()
                          setDetailQuest(q)
                        }}
                      >
                        <div
                          className={`flex items-center gap-1 text-[10px] font-medium truncate ${style.text}`}
                        >
                          <IconTarget size={9} className="shrink-0" />
                          <span className="truncate">{q.title}</span>
                          {hasReward && (
                            <span className="ml-auto shrink-0 font-semibold">
                              {q.rewardCoins > 0
                                ? `${q.rewardCoins.toFixed(0)}`
                                : `${q.rewardRating} рейтинга`}
                            </span>
                          )}
                          {showPenalty && !hasReward && (
                            <span className="ml-auto shrink-0 font-semibold text-red-600 dark:text-red-400">
                              −{q.penaltyCoins?.toFixed(0) ?? q.penaltyRating}
                            </span>
                          )}
                        </div>
                      </button>
                    )
                  })}

                  {daySurveys.map((s) => {
                    const dl = new Date(s.deadline)
                    const top = minutesFromMidnight(dl)
                    const isPassed = passedSurveyIds.has(s.id)
                    const isExpired = dl.getTime() < nowMs

                    let cls = ''
                    let textCls = ''
                    if (isPassed) {
                      cls = 'bg-emerald-50 dark:bg-emerald-500/10'
                      textCls = 'text-emerald-700 dark:text-emerald-400'
                    } else if (isExpired) {
                      cls = 'bg-slate-100 dark:bg-slate-500/10'
                      textCls = 'text-slate-600 dark:text-slate-400'
                    } else {
                      cls = 'bg-cyan-50 dark:bg-cyan-500/10'
                      textCls = 'text-cyan-700 dark:text-cyan-400'
                    }

                    return (
                      <button
                        key={`s-${s.id}`}
                        type="button"
                        className={`absolute left-1 right-1 rounded ${cls} px-1.5 py-0.5 overflow-hidden z-10 text-left hover:brightness-95 transition cursor-pointer`}
                        style={{ top, height: 22 }}
                        title={`Опрос · ${s.title}`}
                        onClick={(e) => {
                          e.stopPropagation()
                          setDetailSurvey(s)
                        }}
                      >
                        <div
                          className={`flex items-center gap-1 text-[10px] font-medium truncate ${textCls}`}
                        >
                          <IconChart size={9} className="shrink-0" />
                          <span className="truncate">{s.title}</span>
                          {s.rewardRating > 0 && (
                            <span className="ml-auto shrink-0 font-semibold">
                              {s.rewardRating} рейтинга
                            </span>
                          )}
                        </div>
                      </button>
                    )
                  })}

                  {dayPreview && (
                    <div
                      className="absolute left-1 right-1 rounded-md bg-brand-50/70 dark:bg-brand-500/20 border-2 border-dashed border-brand-500 px-1.5 py-1 overflow-hidden z-20 pointer-events-none"
                      style={{
                        top: minutesFromMidnight(dayPreview.from),
                        height: Math.max(
                          30,
                          ((dayPreview.to.getTime() - dayPreview.from.getTime()) /
                            60000 /
                            60) *
                            HOUR_HEIGHT
                        ),
                      }}
                    >
                      <div className="text-[10px] font-semibold text-brand-700 dark:text-brand-400 truncate">
                        {dayPreview.title.trim() || 'Новое событие'}
                      </div>
                      <div className="text-[9px] text-brand-600 dark:text-brand-500 truncate">
                        {dayPreview.from.toLocaleTimeString('ru-RU', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                        {' — '}
                        {dayPreview.to.toLocaleTimeString('ru-RU', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}

            {isNowVisibleInThisWeek && (
              <div
                className="absolute left-[60px] right-0 pointer-events-none z-20"
                style={{ top: nowTop }}
              >
                <div className="flex items-center">
                  <div className="text-[10px] font-bold text-white bg-red-500 rounded px-1.5 py-0.5 -ml-1 shadow-sm whitespace-nowrap">
                    {now.toLocaleTimeString('ru-RU', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                  <div className="flex-1 h-px bg-red-500" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Создание: Событие */}
      {createAnchor && createType === 'event' && (
        <CreateEventModal
          actorId={user.id}
          defaultFrom={createAnchor.from}
          defaultTo={createAnchor.to}
          hideDate
          compact
          anchorRect={createAnchor.rect}
          canCreateQuest={canCreateQuest}
          canCreateSurvey={canCreateSurvey}
          onSwitchType={handleSwitchType}
          onPreviewChange={handlePreviewChange}
          onClose={closeCreate}
          onCreated={() => {
            closeCreate()
            window.location.reload()
          }}
        />
      )}

      {/* Создание: Квест — с автозаполнением дедлайна */}
      {createAnchor && createType === 'quest' && (
        <CreateQuestModal
          defaultDeadline={createAnchor.from}
          onClose={closeCreate}
          onCreated={() => {
            closeCreate()
            window.location.reload()
          }}
        />
      )}

      {/* Создание: Опрос — с автозаполнением дедлайна */}
      {createAnchor && createType === 'survey' && (
        <SurveyCreateModal
          actorId={user.id}
          defaultDeadline={createAnchor.from}
          onClose={closeCreate}
          onCreated={() => {
            closeCreate()
            window.location.reload()
          }}
        />
      )}

      {detailEvent && (
        <EventDetailModal
          event={detailEvent}
          currentUserId={user.id}
          onClose={() => setDetailEvent(null)}
          onCancelled={() => {
            setDetailEvent(null)
            window.location.reload()
          }}
        />
      )}

      {detailQuest && (
        <QuestDetailModal
          quest={detailQuest}
          userId={user.id}
          onClose={() => setDetailQuest(null)}
        />
      )}

      {detailSurvey && (
        <SurveyDetailModal
          survey={detailSurvey}
          isPassed={passedSurveyIds.has(detailSurvey.id)}
          onClose={() => setDetailSurvey(null)}
          onGoToSurveys={() => {
            setDetailSurvey(null)
            nav('/surveys')
          }}
        />
      )}
    </div>
  )
}

// ==========================================
// === Модалка деталей события ===
// ==========================================
function EventDetailModal({
  event,
  currentUserId,
  onClose,
  onCancelled,
}: {
  event: EventDto
  currentUserId: number
  onClose: () => void
  onCancelled: () => void
}) {
  const from = new Date(event.fromTime)
  const to = new Date(event.toTime)
  const isMine = event.organizerId === currentUserId
  const [cancelBusy, setCancelBusy] = useState(false)

  const hasReward =
    event.paidInCoins &&
    ((event.rewardCoins ?? 0) > 0 || (event.rewardRating ?? 0) > 0)
  const isRewardGranted = event.rewardsGranted && hasReward

  const statusMeta = {
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
  }[event.eventStatus]

  const canCancel =
    isMine &&
    (event.eventStatus === 'NEW' || event.eventStatus === 'ASSIGNED')

  async function handleCancel() {
    const ok = await confirmDialog({
      title: 'Отменить событие?',
      message: `«${event.nameEvent}» будет отменено. Участники не смогут записаться.`,
      confirmLabel: 'Отменить',
      danger: true,
    })
    if (!ok) return
    setCancelBusy(true)
    try {
      await cancelEvent(event.id)
      notify.warning('Событие отменено')
      onCancelled()
    } catch (e) {
      notify.error(e)
    } finally {
      setCancelBusy(false)
    }
  }

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
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap mb-1">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {event.category}
              </span>
              {statusMeta && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full border font-medium ${statusMeta.className}`}
                >
                  {statusMeta.label}
                </span>
              )}
              {isRewardGranted && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full border font-medium bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30">
                  Награда получена
                </span>
              )}
            </div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              {event.nameEvent}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-900 dark:hover:text-white p-1"
          >
            <IconX size={18} />
          </button>
        </div>

        {event.description && (
          <p className="text-sm text-slate-600 dark:text-slate-300">
            {event.description}
          </p>
        )}

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <IconCalendar size={16} className="text-slate-400 shrink-0" />
            <span>
              {from.toLocaleDateString('ru-RU', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
              {' · '}
              {from.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
              {' — '}
              {to.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          {event.eventPlace && (
            <div className="flex items-center gap-2 text-sm">
              <IconPin size={16} className="text-slate-400 shrink-0" />
              <span>{event.eventPlace}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-sm">
            <IconUser size={16} className="text-slate-400 shrink-0" />
            <span>
              {isMine ? (
                <span className="text-brand-700 dark:text-brand-400 font-medium">
                  Вы организатор
                </span>
              ) : (
                <>Организатор: {event.organizerName}</>
              )}
            </span>
          </div>
        </div>

        {hasReward && (
          <div className="flex flex-wrap gap-1.5 pt-2">
            {event.rewardCoins && (
              <span
                className={`text-xs border px-2 py-1 rounded-full font-medium ${
                  isRewardGranted
                    ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30'
                    : 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/30'
                }`}
              >
                {isRewardGranted ? '' : '+'}
                {event.rewardCoins.toFixed(0)} монет
              </span>
            )}
            {event.rewardRating && (
              <span
                className={`text-xs border px-2 py-1 rounded-full font-medium ${
                  isRewardGranted
                    ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30'
                    : 'bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-400 border-brand-200 dark:border-brand-500/30'
                }`}
              >
                {isRewardGranted ? '' : '+'}
                {event.rewardRating.toFixed(1)} рейтинга
              </span>
            )}
          </div>
        )}

        {event.commentToAdmin && (
          <div className="text-xs bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 p-3 rounded border border-amber-200 dark:border-amber-500/30">
            <span className="font-medium">Комментарий к событию: </span>
            {event.commentToAdmin}
          </div>
        )}

        <div className="flex justify-between gap-2 pt-2 border-t border-slate-100 dark:border-[#30363d]">
          <div>
            {canCancel && (
              <button
                onClick={handleCancel}
                disabled={cancelBusy}
                className="px-4 py-2 text-sm border border-red-300 dark:border-red-500/30 text-red-600 dark:text-red-400 rounded-md font-medium hover:bg-red-50 dark:hover:bg-red-500/10 transition disabled:opacity-50 inline-flex items-center gap-1.5"
              >
                <IconX size={14} />
                {cancelBusy ? 'Отмена...' : 'Отменить событие'}
              </button>
            )}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-slate-600 dark:text-slate-300"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  )
}

// ==========================================
// === Модалка деталей квеста ===
// ==========================================
function QuestDetailModal({
  quest,
  userId,
  onClose,
}: {
  quest: QuestListItem
  userId: number
  onClose: () => void
}) {
  const [busy, setBusy] = useState(false)
  const nowMs = Date.now()
  const { style, label } = getQuestStyle(quest, nowMs)

  const deadline = quest.deadline ? new Date(quest.deadline) : null
  const canTake =
    (quest.myStatus === null || quest.myStatus === 'REJECTED') &&
    (!deadline || deadline.getTime() > nowMs)

  async function handleTake() {
    setBusy(true)
    try {
      await startQuest(quest.questId, userId)
      notify.success('Квест взят в работу')
      onClose()
      window.location.reload()
    } catch (e) {
      notify.error(e)
      setBusy(false)
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-[#161b22] rounded-xl w-full max-w-md p-6 space-y-4 my-8"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap mb-1">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Квест
              </span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full border font-medium ${style.badge}`}
              >
                {label}
              </span>
            </div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              {quest.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-900 dark:hover:text-white p-1"
          >
            <IconX size={18} />
          </button>
        </div>

        {quest.description && (
          <p className="text-sm text-slate-600 dark:text-slate-300">
            {quest.description}
          </p>
        )}

        {deadline && (
          <div className="flex items-center gap-2 text-sm">
            <IconClock size={16} className="text-slate-400 shrink-0" />
            <span>
              Дедлайн:{' '}
              <span className="font-medium text-slate-900 dark:text-white">
                {deadline.toLocaleDateString('ru-RU', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
                {' · '}
                {deadline.toLocaleTimeString('ru-RU', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </span>
          </div>
        )}

        {(quest.rewardCoins > 0 || (quest.rewardRating ?? 0) > 0) && (
          <div className="flex flex-wrap gap-1.5">
            {quest.rewardCoins > 0 && (
              <span className="inline-flex items-center gap-1 text-xs bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30 px-2 py-1 rounded-full font-medium">
                <IconTrophy size={11} />+{quest.rewardCoins.toFixed(0)} монет
              </span>
            )}
            {(quest.rewardRating ?? 0) > 0 && (
              <span className="inline-flex items-center gap-1 text-xs bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-400 border border-brand-200 dark:border-brand-500/30 px-2 py-1 rounded-full font-medium">
                +{quest.rewardRating!.toFixed(1)} рейтинга
              </span>
            )}
          </div>
        )}

        {quest.isMandatory &&
          ((quest.penaltyCoins ?? 0) > 0 || (quest.penaltyRating ?? 0) > 0) && (
            <div className="bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 text-xs p-3 rounded border border-red-200 dark:border-red-500/30">
              <div className="font-medium mb-0.5">Штраф при невыполнении</div>
              <div className="flex flex-wrap gap-2">
                {(quest.penaltyCoins ?? 0) > 0 && (
                  <span>−{quest.penaltyCoins!.toFixed(0)} монет</span>
                )}
                {(quest.penaltyRating ?? 0) > 0 && (
                  <span>−{quest.penaltyRating!.toFixed(1)} рейтинга</span>
                )}
              </div>
            </div>
          )}

        {quest.myStatus === 'REJECTED' && quest.adminComment && (
          <div className="bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 text-xs p-3 rounded border border-red-200 dark:border-red-500/30">
            <span className="font-medium">Причина отклонения: </span>
            {quest.adminComment}
          </div>
        )}

        {quest.myStatus === 'IN_PROGRESS' && (
          <div className="bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-400 text-xs p-3 rounded border border-brand-200 dark:border-brand-500/30">
            Квест уже взят. Выполните его и сдайте на проверку со страницы «Квесты».
          </div>
        )}
        {quest.myStatus === 'PENDING_REVIEW' && (
          <div className="bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs p-3 rounded border border-amber-200 dark:border-amber-500/30">
            Квест ожидает проверки администратором.
          </div>
        )}
        {quest.myStatus === 'COMPLETED' && (
          <div className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs p-3 rounded border border-emerald-200 dark:border-emerald-500/30">
            Квест выполнен, награда получена.
          </div>
        )}

        <div className="flex justify-between gap-2 pt-2 border-t border-slate-100 dark:border-[#30363d]">
          <div>
            {canTake && (
              <button
                onClick={handleTake}
                disabled={busy}
                className="px-4 py-2 text-sm bg-brand-600 hover:bg-brand-700 text-white rounded-md font-medium disabled:opacity-50 transition inline-flex items-center gap-1.5"
              >
                <IconTarget size={14} />
                {busy
                  ? '...'
                  : quest.myStatus === 'REJECTED'
                  ? 'Взять заново'
                  : 'Взять квест'}
              </button>
            )}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-slate-600 dark:text-slate-300"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  )
}

// ==========================================
// === Модалка деталей опроса ===
// ==========================================
function SurveyDetailModal({
  survey,
  isPassed,
  onClose,
  onGoToSurveys,
}: {
  survey: Survey
  isPassed: boolean
  onClose: () => void
  onGoToSurveys: () => void
}) {
  const deadline = new Date(survey.deadline)
  const isExpired = deadline.getTime() < Date.now()

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-[#161b22] rounded-xl w-full max-w-md p-6 space-y-4 my-8"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap mb-1">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Опрос
              </span>
              {isPassed ? (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full border font-medium bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30">
                  Пройден
                </span>
              ) : isExpired ? (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full border font-medium bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/30">
                  Завершён
                </span>
              ) : (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full border font-medium bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-500/10 dark:text-cyan-400 dark:border-cyan-500/30">
                  Активен
                </span>
              )}
            </div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              {survey.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-900 dark:hover:text-white p-1"
          >
            <IconX size={18} />
          </button>
        </div>

        {survey.description && (
          <p className="text-sm text-slate-600 dark:text-slate-300">
            {survey.description}
          </p>
        )}

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <IconClock size={16} className="text-slate-400 shrink-0" />
            <span>
              Дедлайн:{' '}
              <span className="font-medium text-slate-900 dark:text-white">
                {deadline.toLocaleDateString('ru-RU', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
                {' · '}
                {deadline.toLocaleTimeString('ru-RU', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <IconChart size={16} className="text-slate-400 shrink-0" />
            <span>Вопросов: {survey.questions.length}</span>
          </div>
        </div>

        {(survey.rewardRating > 0 || survey.penaltyRating !== 0) && (
          <div className="flex flex-wrap gap-1.5">
            {survey.rewardRating > 0 && (
              <span className="text-xs bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30 px-2 py-1 rounded-full font-medium">
                +{survey.rewardRating.toFixed(1)} рейтинга
              </span>
            )}
            {survey.penaltyRating !== 0 && (
              <span className="text-xs bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-500/30 px-2 py-1 rounded-full font-medium">
                {survey.penaltyRating.toFixed(1)} за непрохождение
              </span>
            )}
          </div>
        )}

        {isPassed && (
          <div className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs p-3 rounded border border-emerald-200 dark:border-emerald-500/30">
            Вы уже прошли этот опрос.
          </div>
        )}

        <div className="flex justify-between gap-2 pt-2 border-t border-slate-100 dark:border-[#30363d]">
          <div>
            {!isPassed && !isExpired && (
              <button
                onClick={onGoToSurveys}
                className="px-4 py-2 text-sm bg-cyan-600 hover:bg-cyan-700 text-white rounded-md font-medium transition"
              >
                Пройти опрос
              </button>
            )}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-slate-600 dark:text-slate-300"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  )
}