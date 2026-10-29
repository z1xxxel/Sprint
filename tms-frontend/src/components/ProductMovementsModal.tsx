import { useAuth } from '../store/auth'
import { useFetch } from '../hooks/useFetch'
import { getProductMovements, type ProductMovement } from '../api/shop'

const ACTION_LABEL: Record<string, string> = {
  PRODUCT_CREATED: 'Создание',
  PRODUCT_UPDATED: 'Обновление',
  PRODUCT_RESTOCKED: 'Пополнение',
  STOCK_WRITTEN_OFF: 'Списание',
  PRODUCT_SOLD: 'Продажа',
  ORDER_APPROVED: 'Заказ одобрен',
  ORDER_REJECTED: 'Заказ отклонен',
  ORDER_COMPLETED: 'Заказ завершен',
  PRODUCT_DELETED: 'Скрыт',
}

const ACTION_COLOR: Record<string, string> = {
  PRODUCT_CREATED: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/30',
  PRODUCT_RESTOCKED: 'bg-brand-50 text-brand-700 border-brand-200 dark:bg-brand-500/10 dark:text-brand-400 dark:border-brand-500/30',
  STOCK_WRITTEN_OFF: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/30',
  PRODUCT_SOLD: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30',
  ORDER_REJECTED: 'bg-brand-50 text-brand-700 border-brand-200 dark:bg-brand-500/10 dark:text-brand-400 dark:border-brand-500/30',
}

interface Props {
  productId: number
  productName: string
  onClose: () => void
}

export default function ProductMovementsModal({ productId, productName, onClose }: Props) {
  const user = useAuth((s) => s.user)!
  const { data, loading, error } = useFetch(
    () => getProductMovements(productId, user.id),
    [productId]
  )

  const totalIn = (data ?? [])
    .filter((m) => m.quantityDelta !== null && m.quantityDelta > 0)
    .reduce((s, m) => s + (m.quantityDelta ?? 0), 0)
  const totalOut = (data ?? [])
    .filter((m) => m.quantityDelta !== null && m.quantityDelta < 0)
    .reduce((s, m) => s + Math.abs(m.quantityDelta ?? 0), 0)

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-[#161b22] rounded-xl w-full max-w-2xl p-6 space-y-4 my-8"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              История движений
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{productName}</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-900 dark:hover:text-white p-1"
          >
            ✕
          </button>
        </div>

        {/* Сводка */}
        {data && data.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-brand-50 dark:bg-brand-500/10 p-3 rounded-lg border border-brand-200 dark:border-brand-500/30">
              <div className="text-xs text-brand-700 dark:text-brand-400 uppercase tracking-wider">
                Всего пришло
              </div>
              <div className="text-xl font-semibold text-brand-700 dark:text-brand-400 mt-1">
                +{totalIn}
              </div>
            </div>
            <div className="bg-red-50 dark:bg-red-500/10 p-3 rounded-lg border border-red-200 dark:border-red-500/30">
              <div className="text-xs text-red-700 dark:text-red-400 uppercase tracking-wider">
                Всего ушло
              </div>
              <div className="text-xl font-semibold text-red-700 dark:text-red-400 mt-1">
                −{totalOut}
              </div>
            </div>
          </div>
        )}

        {loading && <div className="text-slate-500 text-sm">Загрузка...</div>}
        {error && <div className="text-red-600 text-sm">{error}</div>}

        {data && data.length === 0 && (
          <div className="text-center text-slate-400 dark:text-slate-500 text-sm py-8">
            Пока нет движений
          </div>
        )}

        {data && data.length > 0 && (
          <div className="divide-y divide-slate-100 dark:divide-[#30363d] max-h-[400px] overflow-y-auto">
            {data.map((m: ProductMovement) => (
              <div key={m.id} className="py-3 flex items-start gap-3">
                <div
                  className={`shrink-0 text-xs px-2 py-1 rounded border font-medium ${
                    ACTION_COLOR[m.action] ||
                    'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/30'
                  }`}
                >
                  {ACTION_LABEL[m.action] || m.action}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-slate-900 dark:text-white">{m.details}</div>
                  <div className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                    {m.actorName} · {new Date(m.createdAt).toLocaleString('ru-RU')}
                  </div>
                </div>
                {m.quantityDelta !== null && (
                  <div
                    className={`shrink-0 text-sm font-semibold ${
                      m.quantityDelta > 0
                        ? 'text-brand-600 dark:text-brand-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}
                  >
                    {m.quantityDelta > 0 ? '+' : ''}
                    {m.quantityDelta}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}