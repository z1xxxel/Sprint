import { useState, useEffect } from 'react'
import { useAuth } from '../../store/auth'
import { getAuditLogs } from '../../api/shop'
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
import Avatar from '../../components/Avatar'

// Словарь для красивого отображения действий
const ACTION_MAP: Record<
  string,
  { label: string; icon: React.ReactNode; color: string }
> = {
  PRODUCT_CREATED: {
    label: 'Товар создан',
    icon: <IconPlus size={16} />,
    color: 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/30',
  },
  PRODUCT_UPDATED: {
    label: 'Товар обновлен',
    icon: <IconEdit size={16} />,
    color: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/30',
  },
  PRODUCT_RESTOCKED: {
    label: 'Пополнение склада',
    icon: <IconArrowUp size={16} />,
    color: 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30',
  },
  STOCK_WRITTEN_OFF: {
    label: 'Списание со склада',
    icon: <IconArrowDown size={16} />,
    color: 'bg-red-50 text-red-600 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/30',
  },
  PRODUCT_SOLD: {
    label: 'Товар куплен',
    icon: <IconBag size={16} />,
    color: 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30',
  },
  ORDER_APPROVED: {
    label: 'Заказ одобрен',
    icon: <IconCheck size={16} />,
    color: 'bg-brand-50 text-brand-600 border-brand-200 dark:bg-brand-500/10 dark:text-brand-400 dark:border-brand-500/30',
  },
  ORDER_REJECTED: {
    label: 'Заказ отклонен',
    icon: <IconX size={16} />,
    color: 'bg-red-50 text-red-600 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/30',
  },
  ORDER_COMPLETED: {
    label: 'Заказ завершен',
    icon: <IconCheck size={16} />,
    color: 'bg-brand-50 text-brand-600 border-brand-200 dark:bg-brand-500/10 dark:text-brand-400 dark:border-brand-500/30',
  },
  PRODUCT_DELETED: {
    label: 'Товар скрыт',
    icon: <IconTrash size={16} />,
    color: 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-500/10 dark:text-slate-500 dark:border-slate-500/30',
  },
  DISCOUNT_CREATED: {
    label: 'Скидка создана',
    icon: <IconStar size={16} />,
    color: 'bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/30',
  },
  DISCOUNT_DELETED: {
    label: 'Скидка удалена',
    icon: <IconX size={16} />,
    color: 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-500/10 dark:text-slate-500 dark:border-slate-500/30',
  },
  CATEGORY_CREATED: {
    label: 'Категория создана',
    icon: <IconPlus size={16} />,
    color: 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/30',
  },
  CATEGORY_UPDATED: {
    label: 'Категория обновлена',
    icon: <IconEdit size={16} />,
    color: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/30',
  },
  CATEGORY_DELETED: {
    label: 'Категория удалена',
    icon: <IconTrash size={16} />,
    color: 'bg-red-50 text-red-600 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/30',
  },
}

export default function ManageShopLogs() {
  const user = useAuth((s) => s.user)!
  
  const [logs, setLogs] = useState<any[]>([])
  const [page, setPage] = useState(0)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function loadData(pageNum: number) {
    try {
      if (pageNum === 0) setLoading(true)
      else setLoadingMore(true)
      
      setError(null)
      const res = await getAuditLogs(user.id, pageNum, 30)

      if (pageNum === 0) {
        setLogs(res.content)
      } else {
        setLogs((prev) => [...prev, ...res.content])
      }
      
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

  function formatDate(iso: string) {
    const d = new Date(iso)
    return d.toLocaleString('ru-RU', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading) return <div className="text-slate-500 p-6 text-center">Загрузка логов...</div>
  if (error) return <div className="text-red-600 p-6 text-center">{error}</div>

  if (logs.length === 0) {
    return (
      <div className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-[#30363d] p-12 text-center">
        <div className="flex justify-center mb-3 text-slate-300 dark:text-slate-600">
          <IconSettings size={48} />
        </div>
        <div className="text-sm font-medium text-slate-500 dark:text-slate-400">
          Пока нет действий
        </div>
        <div className="text-xs text-slate-400 dark:text-slate-500 mt-1">
          Здесь будет отображаться история изменений в магазине
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl space-y-4">
      <div className="text-sm text-slate-500 dark:text-slate-400 mb-4 px-1">
        История всех действий с товарами, заказами и категориями
      </div>

      <div className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-[#30363d] overflow-hidden">
        <div className="divide-y divide-slate-100 dark:divide-[#30363d]">
          {logs.map((log, index) => {
            const meta = ACTION_MAP[log.action] || {
              label: log.action,
              icon: <IconSettings size={16} />,
              color: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/30',
            }

            return (
              <div
                key={`${log.id}-${index}`}
                className="p-4 sm:p-5 flex gap-4 hover:bg-slate-50 dark:hover:bg-[#0d1117]/50 transition"
              >
                <div className="shrink-0 mt-0.5">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center border ${meta.color}`}
                  >
                    {meta.icon}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div className="font-medium text-sm text-slate-900 dark:text-white">
                      {meta.label}
                      {log.productName && (
                        <span className="text-slate-500 dark:text-slate-400 font-normal">
                          {' · '}
                          <span className="font-medium text-slate-700 dark:text-slate-300">
                            {log.productName}
                          </span>
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400 dark:text-slate-500 shrink-0">
                      {formatDate(log.createdAt)}
                    </div>
                  </div>

                  {log.details && (
                    <div className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                      {log.details}
                    </div>
                  )}

                  <div className="flex items-center gap-2 mt-2">
                    <Avatar name={log.actorName} size="sm" />
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      Автор: <span className="font-medium text-slate-700 dark:text-slate-300">{log.actorName}</span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {hasMore && (
        <div className="flex justify-center pt-2">
          <button
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="px-6 py-2 bg-white dark:bg-[#161b22] border border-slate-300 dark:border-[#30363d] rounded-full text-sm font-medium text-slate-700 dark:text-slate-300 hover:border-brand-500 hover:text-brand-600 transition disabled:opacity-50"
          >
            {loadingMore ? 'Загрузка...' : 'Показать ещё'}
          </button>
        </div>
      )}
    </div>
  )
}