import { useEffect, useRef, useState, useMemo, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../store/auth'
import { can } from '../lib/permissions'
import { getMyChats } from '../api/chats'
import { getPendingTickets } from '../api/support'
import { getPendingOrders } from '../api/shop'
import { getQuestsForReview } from '../api/quests'
import { getEvents } from '../api/events'
import {
  getMyNotifications,
  getUnreadNotificationsCount,
  markAllNotificationsRead,
  type UserNotification,
} from '../api/notifications'
import {
  IconBell,
  IconChat,
  IconBag,
  IconCalendar,
  IconTarget,
  IconSupport,
  IconCheck,
  IconTrophy,
  IconX,
} from './Icons'

type ItemColor = 'brand' | 'amber' | 'blue' | 'purple' | 'red'

interface Item {
  key: string
  icon: React.ReactNode
  label: string
  count: number
  path: string
  color: ItemColor
}

const COLOR_CLASSES: Record<ItemColor, string> = {
  brand: 'bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400',
  amber: 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400',
  blue: 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400',
  purple: 'bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400',
  red: 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400',
}

const NOTIF_STYLE: Record<string, { icon: React.ReactNode; color: ItemColor }> = {
  PENALTY: { icon: <IconX size={16} />, color: 'red' },
  BONUS: { icon: <IconTrophy size={16} />, color: 'amber' },
  REFUND: { icon: <IconCheck size={16} />, color: 'brand' },
  SYSTEM: { icon: <IconBell size={16} />, color: 'blue' },
}

export function refreshNotifications() {
  window.dispatchEvent(new CustomEvent('tms:notifications-refresh'))
}

export default function NotificationBell() {
  const me = useAuth((s) => s.user)!
  const nav = useNavigate()
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)

  // обычные счётчики
  const [chats, setChats] = useState(0)
  const [pendingTickets, setPendingTickets] = useState(0)
  const [pendingOrders, setPendingOrders] = useState(0)
  const [pendingQuests, setPendingQuests] = useState(0)
  const [pendingEvents, setPendingEvents] = useState(0)

  // системные уведомления
  const [notifications, setNotifications] = useState<UserNotification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  const storageKey = `tms:notifications:seen:${me.id}`
  const [seenTotal, setSeenTotal] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(storageKey)
      return saved ? Number(saved) : 0
    } catch {
      return 0
    }
  })

  const isSupport = can.manageTickets(me.role)
  const isManager = can.manageOrders(me.role)
  const isHr = can.approveEvents(me.role)
  const isQuestManager = can.manageQuests(me.role) && me.role !== 'SUPPORT'

  const wrapperRef = useRef<HTMLDivElement>(null)
  const cancelledRef = useRef(false)

  const load = useCallback(async () => {
    cancelledRef.current = false
    const tasks: Promise<void>[] = []

    // системные уведомления — для всех ролей
    tasks.push(
      getMyNotifications(me.id)
        .then((list) => {
          if (!cancelledRef.current) setNotifications(list.slice(0, 10))
        })
        .catch(() => {})
    )
    tasks.push(
      getUnreadNotificationsCount(me.id)
        .then((c) => {
          if (!cancelledRef.current) setUnreadCount(c)
        })
        .catch(() => {})
    )

    // чаты
    tasks.push(
      getMyChats(me.id)
        .then((list) => {
          if (!cancelledRef.current) {
            setChats(list.reduce((s, c) => s + c.unreadCount, 0))
          }
        })
        .catch(() => {})
    )

    if (isSupport) {
      tasks.push(
        getPendingTickets()
          .then((t) => !cancelledRef.current && setPendingTickets(t.length))
          .catch(() => {})
      )
    }
    if (isManager) {
      tasks.push(
        getPendingOrders(me.id)
          .then((o) => !cancelledRef.current && setPendingOrders(o.length))
          .catch(() => {})
      )
    }
    if (isQuestManager) {
      tasks.push(
        getQuestsForReview(me.id)
          .then((q) => !cancelledRef.current && setPendingQuests(q.length))
          .catch(() => {})
      )
    }
    if (isHr) {
      tasks.push(
        getEvents(me.id)
          .then((events) => {
            if (!cancelledRef.current) {
              setPendingEvents(events.filter((e) => e.eventStatus === 'NEW').length)
            }
          })
          .catch(() => {})
      )
    }

    await Promise.all(tasks)
  }, [me.id, isSupport, isManager, isQuestManager, isHr])

  useEffect(() => {
    load()
    return () => {
      cancelledRef.current = true
    }
  }, [load, pathname])

  useEffect(() => {
    const handler = () => load()
    window.addEventListener('tms:notifications-refresh', handler)
    return () => window.removeEventListener('tms:notifications-refresh', handler)
  }, [load])

  useEffect(() => {
    const id = setInterval(load, 30_000)
    return () => clearInterval(id)
  }, [load])

  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [open])

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  const items = useMemo<Item[]>(() => {
    const arr: Item[] = []
    if (chats > 0) {
      arr.push({
        key: 'chats',
        icon: <IconChat size={16} />,
        label: 'Новых сообщений в чатах',
        count: chats,
        path: '/chats',
        color: 'brand',
      })
    }
    if (pendingOrders > 0) {
      arr.push({
        key: 'orders',
        icon: <IconBag size={16} />,
        label: 'Заказы на модерации',
        count: pendingOrders,
        path: '/manage?tab=orders',
        color: 'amber',
      })
    }
    if (pendingEvents > 0) {
      arr.push({
        key: 'events',
        icon: <IconCalendar size={16} />,
        label: 'События на модерации',
        count: pendingEvents,
        path: '/manage?tab=events',
        color: 'blue',
      })
    }
    if (pendingQuests > 0) {
      arr.push({
        key: 'quests',
        icon: <IconTarget size={16} />,
        label: 'Квесты на проверке',
        count: pendingQuests,
        path: '/manage?tab=quests',
        color: 'purple',
      })
    }
    if (pendingTickets > 0) {
      arr.push({
        key: 'tickets',
        icon: <IconSupport size={16} />,
        label: 'Обращения в поддержку',
        count: pendingTickets,
        path: '/support',
        color: 'red',
      })
    }
    return arr
  }, [chats, pendingOrders, pendingEvents, pendingQuests, pendingTickets])

  const itemsTotal = items.reduce((s, i) => s + i.count, 0)
  const total = itemsTotal + unreadCount

  // подрезка localStorage при снижении количества
  useEffect(() => {
    if (total < seenTotal) {
      setSeenTotal(total)
      try {
        localStorage.setItem(storageKey, String(total))
      } catch {
        // ignore
      }
    }
  }, [total, seenTotal, storageKey])

  const badgeCount = Math.max(0, total - seenTotal)

  function handleBellClick() {
    if (!open) {
      setSeenTotal(total)
      try {
        localStorage.setItem(storageKey, String(total))
      } catch {
        // ignore
      }
      // помечаем системные уведомления прочитанными на сервере
      if (unreadCount > 0) {
        markAllNotificationsRead(me.id)
          .then(() => {
            setUnreadCount(0)
            setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
          })
          .catch(() => {})
      }
    }
    setOpen((v) => !v)
  }

  function handleItemClick(path: string) {
    setOpen(false)
    nav(path)
  }

  function openNotification(n: UserNotification) {
    setOpen(false)
    if (n.type === 'PENALTY' || n.type === 'BONUS' || n.type === 'REFUND') {
      nav('/history/coins')
    }
  }

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        type="button"
        onClick={handleBellClick}
        title="Уведомления"
        className={`relative p-2 rounded-md transition ${
          open
            ? 'bg-slate-100 dark:bg-[#21262d] text-slate-900 dark:text-white'
            : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#21262d] hover:text-slate-900 dark:hover:text-white'
        }`}
      >
        <IconBell size={18} />
        {badgeCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 bg-red-500 text-white text-[10px] font-medium rounded-full flex items-center justify-center">
            {badgeCount > 99 ? '99+' : badgeCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-[#30363d] shadow-xl z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-200 dark:border-[#30363d] flex items-center justify-between">
            <div className="font-semibold text-sm text-slate-900 dark:text-white">
              Уведомления
            </div>
            {total > 0 && (
              <div className="text-xs text-slate-500 dark:text-slate-400">{total}</div>
            )}
          </div>

          <div className="max-h-[500px] overflow-y-auto">
            {/* Системные уведомления */}
            {notifications.length > 0 && (
              <div className="border-b border-slate-200 dark:border-[#30363d]">
                <div className="px-4 pt-3 pb-1 text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-semibold">
                  От системы
                </div>
                {notifications.map((n) => {
                  const style = NOTIF_STYLE[n.type] ?? NOTIF_STYLE.SYSTEM
                  return (
                    <button
                      key={n.id}
                      onClick={() => openNotification(n)}
                      className={`w-full flex items-start gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-[#0d1117] transition text-left border-b border-slate-100 dark:border-[#30363d] last:border-0 ${
                        !n.isRead ? 'bg-brand-50/40 dark:bg-brand-500/5' : ''
                      }`}
                    >
                      <div
                        className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${COLOR_CLASSES[style.color]}`}
                      >
                        {style.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-slate-900 dark:text-white truncate">
                          {n.title}
                          {!n.isRead && (
                            <span className="ml-1.5 inline-block w-1.5 h-1.5 rounded-full bg-brand-500 align-middle" />
                          )}
                        </div>
                        {n.message && (
                          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                            {n.message}
                          </div>
                        )}
                        <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                          {new Date(n.createdAt).toLocaleString('ru-RU', {
                            day: '2-digit',
                            month: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}

            {/* Очереди и чаты */}
            {items.length > 0 ? (
              <>
                {notifications.length > 0 && (
                  <div className="px-4 pt-3 pb-1 text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-semibold">
                    Требует внимания
                  </div>
                )}
                {items.map((item) => (
                  <button
                    key={item.key}
                    onClick={() => handleItemClick(item.path)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-[#0d1117] transition text-left border-b border-slate-100 dark:border-[#30363d] last:border-0"
                  >
                    <div
                      className={`shrink-0 w-9 h-9 rounded-lg flex items-center justify-center ${COLOR_CLASSES[item.color]}`}
                    >
                      {item.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-slate-900 dark:text-white font-medium truncate">
                        {item.label}
                      </div>
                    </div>
                    <div className="shrink-0 text-sm font-semibold text-slate-900 dark:text-white">
                      {item.count}
                    </div>
                  </button>
                ))}
              </>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <div className="flex justify-center mb-2 text-brand-400">
                  <IconCheck size={32} />
                </div>
                <div className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                  Всё под контролем
                </div>
                <div className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                  Новых уведомлений нет
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  )
}