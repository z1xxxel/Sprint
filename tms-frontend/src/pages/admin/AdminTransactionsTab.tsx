import { useState, useMemo } from 'react'
import { useFetch } from '../../hooks/useFetch'
import {
  getAdminTransactions,
  cancelTransaction,
} from '../../api/admin'
import type { AdminTransaction } from '../../api/admin'
import { getAllUsers } from '../../api/users'
import { notify } from '../../lib/notify'
import { IconCheck, IconX, IconArrowLeft, IconArrowRight, IconArrowUp, IconArrowDown } from '../../components/Icons'

const TYPE_LABEL: Record<string, string> = {
  PEER_THANKS: 'Благодарность',
  EVENT_REWARD: 'Награда за событие',
  MANAGER_BONUS: 'Бонус от менеджера',
  PURCHASE: 'Покупка в магазине',
  ACHIEVEMENT: 'Награда за ачивку',
  ADMIN_ADJUSTMENT: 'Начисление админом',
  REFUND: 'Возврат',
  SEASON_REWARD: 'Награда за сезон',
  QUEST_REWARD: 'Награда за квест',
  PENALTY: 'Штраф',
}

const TYPE_COLOR: Record<string, string> = {
  PEER_THANKS:
    'bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-400 border-brand-200 dark:border-brand-500/30',
  EVENT_REWARD:
    'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/30',
  MANAGER_BONUS:
    'bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-500/30',
  PURCHASE:
    'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/30',
  ACHIEVEMENT:
    'bg-yellow-50 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-500/30',
  ADMIN_ADJUSTMENT:
    'bg-slate-100 dark:bg-[#0d1117] text-slate-600 dark:text-slate-400 border-slate-200 dark:border-[#30363d]',
  REFUND:
    'bg-cyan-50 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border-cyan-200 dark:border-cyan-500/30',
  SEASON_REWARD:
    'bg-pink-50 dark:bg-pink-500/10 text-pink-700 dark:text-pink-400 border-pink-200 dark:border-pink-500/30',
  QUEST_REWARD:
    'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30',
  PENALTY:
    'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/30',
}

const TAG_LABEL: Record<string, string> = {
  GRATITUDE: 'Благодарность',
  FOR_HELP: 'За помощь',
  INITIATIVE: 'Инициатива',
  MENTORING: 'Наставничество',
  TRANSFER: 'Перевод',
  OTHER: 'Другое',
}

export default function AdminTransactionsTab() {
  const [page, setPage] = useState(0)
  const size = 50
  const { data, loading, error } = useFetch(
    () => getAdminTransactions(page, size),
    [page]
  )
  const users = useFetch(() => getAllUsers(), [])

  const userMap = useMemo(() => {
    const m: Record<number, string> = {}
    users.data?.forEach((u) => {
      m[u.id] = u.name
    })
    return m
  }, [users.data])

  const [detailTarget, setDetailTarget] = useState<AdminTransaction | null>(null)
  const [cancelled, setCancelled] = useState<Set<number>>(new Set())

  if (loading) return <div className="text-slate-500">Загрузка...</div>
  if (error) return <div className="text-red-600">{error}</div>
  if (!data) return null

  async function handleCancel(t: AdminTransaction, reason: string) {
    try {
      await cancelTransaction(t.id, reason)
      setCancelled((prev) => new Set(prev).add(t.id))
      setDetailTarget(null)
      notify.warning(`Транзакция отменена · #${t.id}`)
    } catch (e) {
      notify.error(e)
    }
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-slate-500 dark:text-slate-400">
        Всего транзакций: {data.totalElements} · нажмите на строку для подробностей
      </div>

      <div className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-[#30363d] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-[#0d1117] border-b border-slate-200 dark:border-[#30363d]">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
                  Дата
                </th>
                <th className="text-left px-4 py-3 font-medium text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
                  Тип
                </th>
                <th className="text-left px-4 py-3 font-medium text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
                  Комментарий
                </th>
                <th className="text-right px-4 py-3 font-medium text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
                  Сумма
                </th>
                <th className="text-center px-4 py-3 font-medium text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
                  Статус
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#30363d]">
              {data.content.map((t) => {
                const isCancelled = t.isCancelled || cancelled.has(t.id)
                return (
                  <tr
                    key={t.id}
                    onClick={() => setDetailTarget({ ...t, isCancelled })}
                    className={`cursor-pointer hover:bg-slate-50 dark:hover:bg-[#0d1117] transition ${
                      isCancelled ? 'opacity-50' : ''
                    }`}
                  >
                    <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {new Date(t.createdAt).toLocaleString('ru-RU')}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs px-2 py-0.5 rounded border font-medium ${
                          TYPE_COLOR[t.type] || TYPE_COLOR.ADMIN_ADJUSTMENT
                        }`}
                      >
                        {TYPE_LABEL[t.type] || t.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300 max-w-xs truncate">
                      {t.comment || '—'}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-slate-900 dark:text-white whitespace-nowrap">
                      {t.amount.toFixed(0)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {isCancelled ? (
                        <span className="inline-flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
                          <IconX size={12} /> Отменена
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-brand-600 dark:text-brand-400">
                          <IconCheck size={12} /> Активна
                        </span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {data.content.length === 0 && (
          <div className="p-8 text-center text-sm text-slate-500 dark:text-slate-400">
            Транзакций нет
          </div>
        )}
      </div>

      {data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={data.first}
            className="inline-flex items-center gap-1 px-3 py-1.5 border border-slate-300 dark:border-[#30363d] rounded text-sm text-slate-700 dark:text-slate-300 hover:border-brand-500 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            <IconArrowLeft size={14} /> Назад
          </button>
          <span className="text-sm text-slate-500 dark:text-slate-400">
            {page + 1} / {data.totalPages}
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={data.last}
            className="inline-flex items-center gap-1 px-3 py-1.5 border border-slate-300 dark:border-[#30363d] rounded text-sm text-slate-700 dark:text-slate-300 hover:border-brand-500 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            Вперёд <IconArrowRight size={14} />
          </button>
        </div>
      )}

      {detailTarget && (
        <TransactionDetailModal
          tx={detailTarget}
          userMap={userMap}
          onClose={() => setDetailTarget(null)}
          onCancel={(reason) => handleCancel(detailTarget, reason)}
        />
      )}
    </div>
  )
}

function TransactionDetailModal({
  tx,
  userMap,
  onClose,
  onCancel,
}: {
  tx: AdminTransaction
  userMap: Record<number, string>
  onClose: () => void
  onCancel: (reason: string) => void
}) {
  const [mode, setMode] = useState<'view' | 'cancel'>('view')
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')

  const fromName = tx.fromUserId
    ? userMap[tx.fromUserId] || `ID ${tx.fromUserId}`
    : null
  const toName = tx.toUserId ? userMap[tx.toUserId] || `ID ${tx.toUserId}` : null

  const canCancel = !tx.isCancelled && tx.type !== 'PURCHASE' && tx.type !== 'REFUND'

  function handleCancelSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!reason.trim()) {
      setError('Укажите причину')
      return
    }
    onCancel(reason.trim())
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
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Транзакция #{tx.id}
            </h2>
            <div className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              {new Date(tx.createdAt).toLocaleString('ru-RU')}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-900 dark:hover:text-white p-1"
          >
            <IconX size={18} />
          </button>
        </div>

        <div className="flex items-center justify-between gap-3 p-4 rounded-lg bg-slate-50 dark:bg-[#0d1117] border border-slate-200 dark:border-[#30363d]">
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Тип операции
            </div>
            <div
              className={`inline-block mt-1 text-xs px-2 py-0.5 rounded border font-medium ${
                TYPE_COLOR[tx.type] || TYPE_COLOR.ADMIN_ADJUSTMENT
              }`}
            >
              {TYPE_LABEL[tx.type] || tx.type}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Сумма
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {tx.amount.toFixed(0)}
              <span className="text-sm font-medium text-slate-500 ml-1">монет</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {tx.isCancelled ? (
            <span className="inline-flex items-center gap-1 text-sm text-red-600 dark:text-red-400 font-medium">
              <IconX size={16} /> Отменена
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-sm text-brand-600 dark:text-brand-400 font-medium">
              <IconCheck size={16} /> Активна
            </span>
          )}
        </div>

        {tx.isCancelled && tx.cancellationReason && (
          <div className="bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 text-sm p-3 rounded border border-red-200 dark:border-red-500/30">
            <div className="font-medium mb-0.5">Причина отмены</div>
            <div>{tx.cancellationReason}</div>
          </div>
        )}

        <div className="space-y-2">
          <div className="flex items-start gap-2 p-3 rounded-lg border border-slate-200 dark:border-[#30363d]">
            <div className="w-8 h-8 rounded-full bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
              <IconArrowUp size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Списано с
              </div>
              <div className="text-sm font-medium text-slate-900 dark:text-white mt-0.5">
                {fromName || (
                  <span className="text-slate-400 dark:text-slate-500 italic">
                    Система (эмиссия)
                  </span>
                )}
              </div>
              {tx.fromUserId && (
                <div className="text-xs text-slate-400 dark:text-slate-500">
                  ID: {tx.fromUserId}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-start gap-2 p-3 rounded-lg border border-slate-200 dark:border-[#30363d]">
            <div className="w-8 h-8 rounded-full bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center shrink-0">
              <IconArrowDown size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Зачислено на
              </div>
              <div className="text-sm font-medium text-slate-900 dark:text-white mt-0.5">
                {toName || (
                  <span className="text-slate-400 dark:text-slate-500 italic">
                    Сжигание (списание из системы)
                  </span>
                )}
              </div>
              {tx.toUserId && (
                <div className="text-xs text-slate-400 dark:text-slate-500">
                  ID: {tx.toUserId}
                </div>
              )}
            </div>
          </div>
        </div>

        {tx.comment && (
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              Комментарий
            </div>
            <div className="text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-[#0d1117] p-3 rounded border border-slate-200 dark:border-[#30363d]">
              {tx.comment}
            </div>
          </div>
        )}

        {tx.tag && (
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              Тег
            </div>
            <div className="text-sm text-slate-700 dark:text-slate-300">
              {TAG_LABEL[tx.tag] || tx.tag}
            </div>
          </div>
        )}

        {canCancel && mode === 'view' && (
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-[#30363d]">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-600 dark:text-slate-300"
            >
              Закрыть
            </button>
            <button
              onClick={() => setMode('cancel')}
              className="bg-red-600 hover:bg-red-700 text-white rounded-md px-4 py-2 text-sm font-medium transition"
            >
              Отменить транзакцию
            </button>
          </div>
        )}

        {canCancel && mode === 'cancel' && (
          <form
            onSubmit={handleCancelSubmit}
            className="pt-2 border-t border-slate-100 dark:border-[#30363d] space-y-3"
          >
            <div className="bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 text-sm p-3 rounded border border-amber-200 dark:border-amber-500/30">
              Отмена создаст обратную транзакцию и вернёт монеты. Если у получателя
              нет достаточного баланса — операция не выполнится.
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 text-sm p-3 rounded border border-red-200 dark:border-red-500/30">
                {error}
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Причина отмены *
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                placeholder="Например: ошибочное начисление"
                required
                className="w-full border border-slate-300 dark:border-[#30363d] dark:bg-[#0d1117] dark:text-white rounded-md px-3 py-2 mt-1 text-sm resize-none focus:outline-none focus:border-brand-500"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setMode('view')}
                className="px-4 py-2 text-sm text-slate-600 dark:text-slate-300"
              >
                Отмена
              </button>
              <button
                type="submit"
                className="bg-red-600 hover:bg-red-700 text-white rounded-md px-4 py-2 text-sm font-medium transition"
              >
                Отменить транзакцию
              </button>
            </div>
          </form>
        )}

        {!canCancel && (
          <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-[#30363d]">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-600 dark:text-slate-300"
            >
              Закрыть
            </button>
          </div>
        )}
      </div>
    </div>
  )
}