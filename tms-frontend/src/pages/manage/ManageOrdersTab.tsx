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
}

export default function ManageOrdersTab() {
  const user = useAuth((s) => s.user)!
  const pendingData = useFetch(() => getPendingOrders(user.id), [user.id])
  const allData = useFetch(() => getAllOrders(user.id), [user.id])

  const [pending, setPending] = useState<OrderResponse[] | null>(null)
  const [all, setAll] = useState<OrderResponse[] | null>(null)
  const [processing, setProcessing] = useState<number | null>(null)
  const [rejectingOrder, setRejectingOrder] = useState<OrderResponse | null>(null)

  const pendingList = pending ?? pendingData.data ?? []
  const allList = all ?? allData.data ?? []

  const queue = pendingList.filter((o) => o.status === 'PENDING')
  const history = allList.filter((o) => o.status !== 'PENDING')

  async function handleApprove(orderId: number, productName: string) {
    setProcessing(orderId)
    try {
      const updated = await approveOrder(orderId, user.id)
      setPending(pendingList.filter((o) => o.id !== orderId))
      setAll(allList.map((o) => (o.id === updated.id ? updated : o)))
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
      setPending(pendingList.filter((o) => o.id !== orderId))
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
    <div className="space-y-6">
      {/* Очередь */}
      <div>
        <div className="text-sm text-slate-500 dark:text-slate-400 mb-3">В очереди: {queue.length}</div>

        {pendingData.loading && <div className="text-slate-500">Загрузка...</div>}
        {pendingData.error && <div className="text-red-600">{pendingData.error}</div>}

        {!pendingData.loading && queue.length === 0 && (
          <div className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-[#30363d] p-8 sm:p-12 text-center">
            <div className="text-slate-400 dark:text-slate-500 text-sm">Нет заказов в очереди</div>
          </div>
        )}

        <div className="space-y-3">
          {queue.map((order) => (
            <div key={order.id} className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-[#30363d] p-4 sm:p-5 flex flex-col gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="font-medium text-slate-900 dark:text-white">{order.productName}</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">× {order.quantity}</span>
                  {order.variantSize && <span className="text-xs text-slate-500 dark:text-slate-400">({order.variantSize}{order.variantColor ? ` / ${order.variantColor}` : ''})</span>}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-300">
                  <span className="font-medium">{order.userName}</span> · {order.totalPrice.toFixed(0)} монет
                </div>
                <div className="text-xs text-slate-400 dark:text-slate-500 mt-1">{new Date(order.createdAt).toLocaleString('ru-RU')}</div>

                {/* Комментарий пользователя */}
                {order.userComment && (
                  <div className="mt-2 text-sm px-3 py-2 rounded bg-slate-50 dark:bg-[#0d1117] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#30363d]">
                    <span className="font-medium text-slate-900 dark:text-white">Комментарий: </span>
                    {order.userComment}
                  </div>
                )}
              </div>

              <div className="flex gap-2 shrink-0 self-end">
                <button onClick={() => handleApprove(order.id, order.productName)} disabled={processing === order.id} className="bg-brand-600 hover:bg-brand-700 text-white text-sm px-4 py-2 rounded-md font-medium disabled:opacity-50">Одобрить</button>
                <button onClick={() => setRejectingOrder(order)} disabled={processing === order.id} className="border border-red-300 dark:border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 text-sm px-4 py-2 rounded-md font-medium disabled:opacity-50">Отклонить</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* История */}
      <div>
        <div className="text-sm text-slate-500 dark:text-slate-400 mb-3">История заказов: {history.length}</div>

        {allData.loading && <div className="text-slate-500">Загрузка...</div>}

        {!allData.loading && history.length === 0 && (
          <div className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-[#30363d] p-6 text-center">
            <div className="text-slate-400 dark:text-slate-500 text-sm">Пока нет обработанных заказов</div>
          </div>
        )}

        <div className="space-y-2">
          {history.map((order) => (
            <div key={order.id} className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-[#30363d] p-4 flex flex-col gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="font-medium text-sm text-slate-900 dark:text-white">{order.productName}</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">× {order.quantity}</span>
                  <span className={`text-xs px-2 py-0.5 rounded border font-medium ${STATUS_COLOR[order.status] || STATUS_COLOR.PENDING}`}>
                    {STATUS_LABEL[order.status] || order.status}
                  </span>
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-300">
                  <span className="font-medium">{order.userName}</span> · {order.totalPrice.toFixed(0)} монет
                </div>
                <div className="text-xs text-slate-400 dark:text-slate-500 mt-1">{new Date(order.createdAt).toLocaleString('ru-RU')}</div>

                {/* Комментарии */}
                {order.userComment && (
                  <div className="mt-2 text-xs px-2 py-1.5 rounded bg-slate-50 dark:bg-[#0d1117] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-[#30363d]">
                    <span className="font-medium">Комментарий клиента: </span>{order.userComment}
                  </div>
                )}
                {order.adminComment && (
                  <div className={`mt-2 text-xs px-2 py-1.5 rounded border ${
                    order.status === 'REJECTED' ? 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/30' 
                    : 'bg-slate-50 dark:bg-[#0d1117] text-slate-600 dark:text-slate-400 border-slate-200 dark:border-[#30363d]'}`}>
                    <span className="font-medium">{order.status === 'REJECTED' ? 'Причина: ' : 'Комментарий: '}</span>{order.adminComment}
                  </div>
                )}
              </div>

              {order.status === 'APPROVED' && (
                <button onClick={() => handleComplete(order.id, order.productName)} disabled={processing === order.id} className="self-end bg-brand-600 hover:bg-brand-700 text-white text-sm px-4 py-2 rounded-md font-medium disabled:opacity-50 shrink-0">Завершить</button>
              )}
            </div>
          ))}
        </div>
      </div>

      {rejectingOrder && (
        <RejectOrderModal productName={rejectingOrder.productName} onClose={() => setRejectingOrder(null)} onReject={handleReject} />
      )}
    </div>
  )
}