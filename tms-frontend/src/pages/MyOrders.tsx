import { useAuth } from '../store/auth'
import { useFetch } from '../hooks/useFetch'
import { getUserOrders } from '../api/shop'
import { Link } from 'react-router-dom'

const STATUS_LABEL: Record<string, string> = {
  PENDING: 'Ожидает',
  APPROVED: 'Одобрен',
  COMPLETED: 'Выдан',
  REJECTED: 'Отклонён',
  CANCELLED: 'Отменён',
}

const STATUS_COLOR: Record<string, string> = {
  PENDING: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30',
  APPROVED: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/30',
  COMPLETED: 'bg-brand-50 text-brand-700 border-brand-200 dark:bg-brand-500/10 dark:text-brand-400 dark:border-brand-500/30',
  REJECTED: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/30',
  CANCELLED: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/30',
}

export default function MyOrders() {
  const user = useAuth((s) => s.user)!
  const { data, loading, error } = useFetch(() => getUserOrders(user.id), [user.id])

  if (loading) return <div className="text-slate-500">Загрузка...</div>
  if (error) return <div className="text-red-600">{error}</div>
  if (!data) return null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white tracking-tight">Мои заказы</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">История покупок в магазине</p>
      </div>

      {data.length === 0 ? (
        <div className="bg-white dark:bg-[#161b22] rounded-lg border border-slate-200 dark:border-[#30363d] p-8 sm:p-12 text-center">
          <div className="text-slate-400 text-sm mb-4">Пока нет заказов</div>
          <Link to="/catalog" className="inline-block bg-brand-600 hover:bg-brand-700 text-white rounded-md px-4 py-2 text-sm font-medium transition">Перейти в магазин</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {data.map((order) => (
            <div key={order.id} className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-[#30363d] p-4 sm:p-5">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="min-w-0">
                  <div className="font-medium text-slate-900 dark:text-white">{order.productName}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Количество: {order.quantity}
                    {order.variantSize && ` · ${order.variantSize}`}
                    {order.variantColor && ` / ${order.variantColor}`}
                  </div>
                </div>
                <span className={`shrink-0 text-xs px-2 py-1 rounded border font-medium ${STATUS_COLOR[order.status] || STATUS_COLOR.PENDING}`}>
                  {STATUS_LABEL[order.status] || order.status}
                </span>
              </div>

              <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 dark:border-[#30363d]">
                <div className="text-xs text-slate-400 dark:text-slate-500">
                  {new Date(order.createdAt).toLocaleString('ru-RU')}
                </div>
                <div className="font-semibold text-slate-900 dark:text-white">
                  {order.totalPrice.toFixed(0)} монет
                </div>
              </div>

              {/* Комментарии */}
              {order.userComment && (
                <div className="mt-3 text-sm px-3 py-2 rounded bg-slate-50 dark:bg-[#0d1117] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-[#30363d]">
                  <span className="font-medium">Ваш комментарий: </span>
                  {order.userComment}
                </div>
              )}

              {order.adminComment && (
                <div className={`mt-3 text-sm px-3 py-2 rounded border ${
                  order.status === 'REJECTED' 
                    ? 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/30'
                    : 'bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-400 border-brand-200 dark:border-brand-500/30'
                }`}>
                  <span className="font-medium">{order.status === 'REJECTED' ? 'Причина отклонения: ' : 'Ответ менеджера: '}</span>
                  {order.adminComment}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}