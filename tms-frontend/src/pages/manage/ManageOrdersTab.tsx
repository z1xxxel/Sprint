import { useState } from 'react'
import { useAuth } from '../../store/auth'
import { useFetch } from '../../hooks/useFetch'
import {
  getPendingOrders,
  approveOrder,
  rejectOrder,
  completeOrder,
  getAllOrders,
} from '../../api/shop'
import { notify } from '../../lib/notify'
import RejectOrderModal from '../../components/RejectOrderModal'
import type { OrderResponse } from '../../types'

type Tab = 'pending' | 'approved' | 'history'

const STATUS_LABEL: Record<string, string> = {
  PENDING: 'Ожидает',
  APPROVED: 'Одобрен',
  COMPLETED: 'Выдан',
  REJECTED: 'Отклонён',
  CANCELLED: 'Отменён',
}

const STATUS_COLOR: Record<string, string> = {
  PENDING: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
  APPROVED: 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400',
  COMPLETED: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
  REJECTED: 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400',
  CANCELLED: 'bg-slate-100 text-slate-600 dark:bg-slate-500/10 dark:text-slate-400',
}

export default function ManageOrdersTab() {
  const user = useAuth((s) => s.user)!
  const pendingData = useFetch(() => getPendingOrders(user.id), [user.id])
  const allData = useFetch(() => getAllOrders(user.id), [user.id])

  const [pending, setPending] = useState<OrderResponse[] | null>(null)
  const [all, setAll] = useState<OrderResponse[] | null>(null)
  const [processing, setProcessing] = useState<number | null>(null)
  const [rejectingOrder, setRejectingOrder] = useState<OrderResponse | null>(null)
  const [tab, setTab] = useState<Tab>('pending')

  const pendingList = pending ?? pendingData.data ?? []
  const allList = all ?? allData.data ?? []

  const queue = pendingList.filter((o) => o.status === 'PENDING')
  const approved = allList.filter((o) => o.status === 'APPROVED')
  const history = allList.filter(
    (o) => o.status === 'COMPLETED' || o.status === 'REJECTED' || o.status === 'CANCELLED'
  )

  async function handleApprove(orderId: number, productName: string) {
    setProcessing(orderId)
    try {
      const updated = await approveOrder(orderId, user.id)
      setPending(pendingList.filter((o) => o.id !== orderId))
      setAll([...allList, updated])
      notify.success(`Заказ одобрен · ${productName}`)
    } catch (e) {
      notify.error(e)
    } finally {
      setProcessing(null)
    }
  }

  async function handleComplete(orderId: number, productName: string) {
    setProcessing(orderId)
    try {
      const updated = await completeOrder(orderId, user.id)
      setAll(allList.map((o) => (o.id === updated.id ? updated : o)))
      notify.success(`Заказ выдан · ${productName}`)
    } catch (e) {
      notify.error(e)
    } finally {
      setProcessing(null)
    }
  }

  async function handleReject(reason: string) {
    if (!rejectingOrder) return
    const orderId = rejectingOrder.id
    const productName = rejectingOrder.productName
    setProcessing(orderId)
    try {
      const updated = await rejectOrder(orderId, user.id, reason)
      setPending(pendingList.filter((o) => o.id !== orderId))
      setAll(allList.map((o) => (o.id === updated.id ? updated : o)))
      setRejectingOrder(null)
      notify.info(`Заказ отклонён · ${productName}`)
    } catch (e) {
      notify.error(e)
    } finally {
      setProcessing(null)
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          Заказы сотрудников
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Обрабатывайте заказы из магазина и выдавайте товары
        </p>
      </div>

      <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-[#0d1117]">
        <button
          onClick={() => setTab('pending')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition ${
            tab === 'pending'
              ? 'bg-white dark:bg-[#161b22] text-brand-700 dark:text-brand-400 shadow-sm'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          В очереди
          {queue.length > 0 && (
            <span className="text-xs px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 font-semibold min-w-[20px] text-center">
              {queue.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setTab('approved')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition ${
            tab === 'approved'
              ? 'bg-white dark:bg-[#161b22] text-brand-700 dark:text-brand-400 shadow-sm'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Готовы к выдаче
          {approved.length > 0 && (
            <span className="text-xs px-1.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 font-semibold min-w-[20px] text-center">
              {approved.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setTab('history')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition ${
            tab === 'history'
              ? 'bg-white dark:bg-[#161b22] text-brand-700 dark:text-brand-400 shadow-sm'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          История
          <span className="text-xs px-1.5 py-0.5 rounded-full bg-slate-200 dark:bg-[#21262d] text-slate-600 dark:text-slate-400 font-semibold min-w-[20px] text-center">
            {history.length}
          </span>
        </button>
      </div>

      {(pendingData.loading || allData.loading) && (
        <div className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-[#30363d] p-8 text-center text-slate-500">
          Загрузка...
        </div>
      )}

      {/* Пустые состояния */}
      {tab === 'pending' && !pendingData.loading && queue.length === 0 && (
        <EmptyState
          title="Очередь пуста"
          subtitle="Нет заказов, ожидающих обработки"
        />
      )}
      {tab === 'approved' && !allData.loading && approved.length === 0 && (
        <EmptyState
          title="Нет заказов к выдаче"
          subtitle="Одобренные заказы будут ждать вас здесь"
        />
      )}
      {tab === 'history' && !allData.loading && history.length === 0 && (
        <EmptyState
          title="История пуста"
          subtitle="Завершённые и отклонённые заказы появятся здесь"
        />
      )}

      {/* Pending */}
      {tab === 'pending' && queue.length > 0 && (
        <div className="space-y-2.5">
          {queue.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              actions={
                <>
                  <button
                    onClick={() => handleApprove(order.id, order.productName)}
                    disabled={processing === order.id}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-sm px-4 py-2 rounded-lg font-medium disabled:opacity-50 transition"
                  >
                    Одобрить
                  </button>
                  <button
                    onClick={() => setRejectingOrder(order)}
                    disabled={processing === order.id}
                    className="flex-1 border border-slate-300 dark:border-[#30363d] text-slate-600 dark:text-slate-300 hover:border-red-400 hover:text-red-600 dark:hover:text-red-400 text-sm px-4 py-2 rounded-lg font-medium disabled:opacity-50 transition"
                  >
                    Отклонить
                  </button>
                </>
              }
            />
          ))}
        </div>
      )}

      {/* Approved */}
      {tab === 'approved' && approved.length > 0 && (
        <div className="space-y-2.5">
          {approved.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              statusBadge={STATUS_LABEL.APPROVED}
              statusColor={STATUS_COLOR.APPROVED}
              actions={
                <button
                  onClick={() => handleComplete(order.id, order.productName)}
                  disabled={processing === order.id}
                  className="w-full bg-brand-600 hover:bg-brand-700 text-white text-sm px-4 py-2 rounded-lg font-medium disabled:opacity-50 transition"
                >
                  {processing === order.id ? '...' : 'Выдать заказ'}
                </button>
              }
            />
          ))}
        </div>
      )}

      {/* History */}
      {tab === 'history' && history.length > 0 && (
        <div className="space-y-2.5">
          {history.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              statusBadge={STATUS_LABEL[order.status]}
              statusColor={STATUS_COLOR[order.status]}
            />
          ))}
        </div>
      )}

      {rejectingOrder && (
        <RejectOrderModal
          productName={rejectingOrder.productName}
          onClose={() => setRejectingOrder(null)}
          onReject={handleReject}
        />
      )}
    </div>
  )
}

function OrderCard({
  order,
  statusBadge,
  statusColor,
  actions,
}: {
  order: OrderResponse
  statusBadge?: string
  statusColor?: string
  actions?: React.ReactNode
}) {
  return (
    <div className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-[#30363d] p-4">
      <div className="flex items-start justify-between gap-3 mb-3 flex-wrap">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-slate-900 dark:text-white">
              {order.productName}
              <span className="text-sm text-slate-500 dark:text-slate-400 font-normal ml-1.5">
                × {order.quantity}
              </span>
            </h3>
            {statusBadge && (
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${statusColor}`}>
                {statusBadge}
              </span>
            )}
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-300 mt-1">
            <span className="font-medium">{order.userName}</span>
            {' · '}
            <span className="text-amber-600 dark:text-amber-400 font-semibold">
              {order.totalPrice.toFixed(0)} монет
            </span>
            {order.variantSize && (
              <span className="text-slate-500 dark:text-slate-400">
                {' · '}
                {order.variantSize}
                {order.variantColor ? ` / ${order.variantColor}` : ''}
              </span>
            )}
          </div>
          <div className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
            {new Date(order.createdAt).toLocaleString('ru-RU')}
          </div>
        </div>
      </div>

      {order.userComment && (
        <div className="text-sm px-3 py-2 rounded-lg bg-slate-50 dark:bg-[#0d1117] text-slate-700 dark:text-slate-300 mb-3">
          <span className="font-medium">Комментарий клиента: </span>
          {order.userComment}
        </div>
      )}
      {order.adminComment && (
        <div
          className={`text-sm px-3 py-2 rounded-lg mb-3 ${
            order.status === 'REJECTED'
              ? 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400'
              : 'bg-slate-50 dark:bg-[#0d1117] text-slate-700 dark:text-slate-300'
          }`}
        >
          <span className="font-medium">
            {order.status === 'REJECTED' ? 'Причина: ' : 'Ответ: '}
          </span>
          {order.adminComment}
        </div>
      )}

      {actions && <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-[#30363d]">{actions}</div>}
    </div>
  )
}

function EmptyState({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-[#30363d] p-10 text-center">
      <div className="text-sm font-semibold text-slate-600 dark:text-slate-300">{title}</div>
      <div className="text-xs text-slate-400 dark:text-slate-500 mt-1">{subtitle}</div>
    </div>
  )
}