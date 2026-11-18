import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '../../store/auth'
import { getAuditLogs } from '../../api/shop'
import Avatar from '../../components/Avatar'
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconCheck,
  IconX,
  IconBag,
  IconArrowUp,
  IconArrowDown,
  IconStar,
  IconSettings,
} from '../../components/Icons'

interface Log {
  id: number
  action: string
  actorId: number
  actorName: string
  productId: number | null
  productName: string | null
  orderId: number | null
  details: string
  createdAt: string
}

type FilterType = 'all' | 'products' | 'orders' | 'categories' | 'discounts'

const ACTION_MAP: Record<
  string,
  { label: string; icon: React.ReactNode; color: string; type: FilterType }
> = {
  PRODUCT_CREATED: {
    label: 'Товар создан',
    icon: <IconPlus size={14} />,
    color: 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400',
    type: 'products',
  },
  PRODUCT_UPDATED: {
    label: 'Товар обновлён',
    icon: <IconEdit size={14} />,
    color: 'bg-slate-100 dark:bg-slate-500/10 text-slate-600 dark:text-slate-400',
    type: 'products',
  },
  PRODUCT_RESTOCKED: {
    label: 'Пополнение склада',
    icon: <IconArrowUp size={14} />,
    color: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    type: 'products',
  },
  STOCK_WRITTEN_OFF: {
    label: 'Списание со склада',
    icon: <IconArrowDown size={14} />,
    color: 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400',
    type: 'products',
  },
  PRODUCT_SOLD: {
    label: 'Товар куплен',
    icon: <IconBag size={14} />,
    color: 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400',
    type: 'products',
  },
  PRODUCT_DELETED: {
    label: 'Товар скрыт',
    icon: <IconEyeOff size={14} />,
    color: 'bg-slate-100 dark:bg-slate-500/10 text-slate-500 dark:text-slate-400',
    type: 'products',
  },
  PRODUCT_HARD_DELETED: {
    label: 'Товар удалён',
    icon: <IconTrash size={14} />,
    color: 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400',
    type: 'products',
  },
  ORDER_APPROVED: {
    label: 'Заказ одобрен',
    icon: <IconCheck size={14} />,
    color: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    type: 'orders',
  },
  ORDER_REJECTED: {
    label: 'Заказ отклонён',
    icon: <IconX size={14} />,
    color: 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400',
    type: 'orders',
  },
  ORDER_COMPLETED: {
    label: 'Заказ выдан',
    icon: <IconCheck size={14} />,
    color: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    type: 'orders',
  },
  CATEGORY_CREATED: {
    label: 'Категория создана',
    icon: <IconPlus size={14} />,
    color: 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400',
    type: 'categories',
  },
  CATEGORY_UPDATED: {
    label: 'Категория обновлена',
    icon: <IconEdit size={14} />,
    color: 'bg-slate-100 dark:bg-slate-500/10 text-slate-600 dark:text-slate-400',
    type: 'categories',
  },
  CATEGORY_DELETED: {
    label: 'Категория удалена',
    icon: <IconTrash size={14} />,
    color: 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400',
    type: 'categories',
  },
  DISCOUNT_CREATED: {
    label: 'Скидка создана',
    icon: <IconStar size={14} />,
    color: 'bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400',
    type: 'discounts',
  },
  DISCOUNT_DELETED: {
    label: 'Скидка удалена',
    icon: <IconX size={14} />,
    color: 'bg-slate-100 dark:bg-slate-500/10 text-slate-500 dark:text-slate-400',
    type: 'discounts',
  },
}

const FILTER_LABELS: Record<FilterType, string> = {
  all: 'Все',
  products: 'Товары',
  orders: 'Заказы',
  categories: 'Категории',
  discounts: 'Скидки',
}

function formatDayLabel(iso: string) {
  const d = new Date(iso)
  const today = new Date()
  const yesterday = new Date()
  yesterday.setDate(today.getDate() - 1)

  const sameDay = (a: Date, b: Date) =>
    a.getDate() === b.getDate() &&
    a.getMonth() === b.getMonth() &&
    a.getFullYear() === b.getFullYear()

  if (sameDay(d, today)) return 'Сегодня'
  if (sameDay(d, yesterday)) return 'Вчера'
  return d.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function ManageShopLogs() {
  const user = useAuth((s) => s.user)!

  const [logs, setLogs] = useState<Log[]>([])
  const [page, setPage] = useState(0)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<FilterType>('all')

  async function loadData(pageNum: number) {
    try {
      if (pageNum === 0) setLoading(true)
      else setLoadingMore(true)
      setError(null)
      const res = await getAuditLogs(user.id, pageNum, 30)
      if (pageNum === 0) setLogs(res.content)
      else setLogs((prev) => [...prev, ...res.content])
      setHasMore(!res.last)
    } catch (e: any) {
      setError(e.response?.data || 'Ошибка загрузки логов')
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  useEffect(() => {
    loadData(0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.id])

  function handleLoadMore() {
    const nextPage = page + 1
    setPage(nextPage)
    loadData(nextPage)
  }

  const filtered = useMemo(() => {
    if (filter === 'all') return logs
    return logs.filter((l) => ACTION_MAP[l.action]?.type === filter)
  }, [logs, filter])

  const grouped = useMemo(() => {
    const g: Record<string, Log[]> = {}
    filtered.forEach((log) => {
      const key = formatDayLabel(log.createdAt)
      if (!g[key]) g[key] = []
      g[key].push(log)
    })
    return g
  }, [filtered])

  const counts = useMemo(() => {
    const c: Record<FilterType, number> = {
      all: logs.length,
      products: 0,
      orders: 0,
      categories: 0,
      discounts: 0,
    }
    logs.forEach((l) => {
      const type = ACTION_MAP[l.action]?.type
      if (type) c[type]++
    })
    return c
  }, [logs])

  if (loading) {
    return (
      <div className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-[#30363d] p-8 text-center text-slate-500">
        Загрузка логов...
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 rounded-xl border border-red-200 dark:border-red-500/30 p-4 text-sm">
        {error}
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          История действий
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Все изменения каталога, заказов и склада
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-1.5 flex-wrap">
        {(Object.keys(FILTER_LABELS) as FilterType[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition border ${
              filter === f
                ? 'bg-brand-600 border-brand-600 text-white shadow-sm'
                : 'bg-white dark:bg-[#161b22] border-slate-200 dark:border-[#30363d] text-slate-600 dark:text-slate-300 hover:border-brand-400'
            }`}
          >
            {FILTER_LABELS[f]}
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                filter === f
                  ? 'bg-white/25 text-white'
                  : 'bg-slate-100 dark:bg-[#21262d] text-slate-500 dark:text-slate-400'
              }`}
            >
              {counts[f]}
            </span>
          </button>
        ))}
      </div>

      {/* Empty */}
      {filtered.length === 0 && (
        <div className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-[#30363d] p-10 text-center">
          <div className="flex justify-center mb-3 text-brand-400">
            <IconSettings size={40} />
          </div>
          <div className="text-sm font-semibold text-slate-600 dark:text-slate-300">
            {logs.length === 0 ? 'Пока нет действий' : 'В этом фильтре ничего нет'}
          </div>
          <div className="text-xs text-slate-400 dark:text-slate-500 mt-1">
            {logs.length === 0
              ? 'Здесь появится история изменений'
              : 'Попробуйте другой фильтр'}
          </div>
        </div>
      )}

      {/* Timeline */}
      {filtered.length > 0 && (
        <div className="space-y-6">
          {Object.entries(grouped).map(([day, items]) => (
            <div key={day}>
              <div className="flex items-center gap-3 mb-3">
                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {day}
                </div>
                <div className="flex-1 h-px bg-slate-200 dark:bg-[#30363d]" />
                <div className="text-xs text-slate-400 dark:text-slate-500">
                  {items.length}
                </div>
              </div>

              <div className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-[#30363d] divide-y divide-slate-100 dark:divide-[#30363d] overflow-hidden">
                {items.map((log) => {
                  const meta = ACTION_MAP[log.action] ?? {
                    label: log.action,
                    icon: <IconSettings size={14} />,
                    color: 'bg-slate-100 dark:bg-slate-500/10 text-slate-600 dark:text-slate-400',
                    type: 'products' as FilterType,
                  }
                  return (
                    <div
                      key={log.id}
                      className="px-4 py-3 flex items-start gap-3 hover:bg-slate-50 dark:hover:bg-[#0d1117]/50 transition"
                    >
                      <div
                        className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${meta.color}`}
                      >
                        {meta.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 flex-wrap">
                          <div className="text-sm font-medium text-slate-900 dark:text-white">
                            {meta.label}
                            {log.productName && (
                              <span className="text-slate-500 dark:text-slate-400 font-normal">
                                {' · '}
                                <span className="text-slate-700 dark:text-slate-300 font-medium">
                                  {log.productName}
                                </span>
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-400 dark:text-slate-500 shrink-0">
                            {formatTime(log.createdAt)}
                          </div>
                        </div>
                        {log.details && (
                          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                            {log.details}
                          </div>
                        )}
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <Avatar name={log.actorName} size="sm" />
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            {log.actorName}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Load more */}
      {hasMore && filtered.length > 0 && (
        <div className="flex justify-center pt-2">
          <button
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="px-6 py-2 bg-white dark:bg-[#161b22] border border-slate-300 dark:border-[#30363d] rounded-full text-sm font-medium text-slate-700 dark:text-slate-300 hover:border-brand-500 transition disabled:opacity-50"
          >
            {loadingMore ? 'Загрузка...' : 'Показать ещё'}
          </button>
        </div>
      )}
    </div>
  )
}

// Локальный хелпер для иконки "скрыт" (если нет в Icons.tsx)
function IconEyeOff({ size = 16, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  )
}