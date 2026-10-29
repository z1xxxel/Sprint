import { useState, useMemo } from 'react'
import { useAuth } from '../../store/auth'
import { useFetch } from '../../hooks/useFetch'
import { getAdminQuestLogs } from '../../api/quests'
import type { AdminQuestLog } from '../../types'
import { IconSearch, IconTarget, IconX } from '../../components/Icons'

const STATUS_LABEL: Record<string, string> = {
  IN_PROGRESS: 'В работе',
  PENDING_REVIEW: 'На проверке',
  COMPLETED: 'Выполнен',
  REJECTED: 'Отклонён',
  CANCELLED: 'Отменён',
}

const STATUS_COLOR: Record<string, string> = {
  IN_PROGRESS:
    'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/30',
  PENDING_REVIEW:
    'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30',
  COMPLETED:
    'bg-brand-50 text-brand-700 border-brand-200 dark:bg-brand-500/10 dark:text-brand-400 dark:border-brand-500/30',
  REJECTED:
    'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/30',
  CANCELLED:
    'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/30',
}

type Tab = 'all' | 'completed' | 'pending' | 'rejected'

export default function AdminQuestLogsTab() {
  const me = useAuth((s) => s.user)!
  const { data, loading, error } = useFetch(() => getAdminQuestLogs(me.id), [me.id])

  const [tab, setTab] = useState<Tab>('all')
  const [query, setQuery] = useState('')
  const [detail, setDetail] = useState<AdminQuestLog | null>(null)

  const list = data ?? []

  const counts = useMemo(
    () => ({
      all: list.length,
      completed: list.filter((l) => l.status === 'COMPLETED').length,
      pending: list.filter((l) => l.status === 'PENDING_REVIEW').length,
      rejected: list.filter((l) => l.status === 'REJECTED').length,
    }),
    [list]
  )

  const filtered = useMemo(() => {
    let arr = list
    if (tab === 'completed') arr = arr.filter((l) => l.status === 'COMPLETED')
    else if (tab === 'pending') arr = arr.filter((l) => l.status === 'PENDING_REVIEW')
    else if (tab === 'rejected') arr = arr.filter((l) => l.status === 'REJECTED')

    if (query.trim()) {
      const q = query.toLowerCase()
      arr = arr.filter(
        (l) =>
          l.questTitle.toLowerCase().includes(q) ||
          l.userName.toLowerCase().includes(q) ||
          (l.creatorName?.toLowerCase().includes(q) ?? false)
      )
    }
    return arr
  }, [list, tab, query])

  if (loading) return <div className="text-slate-500">Загрузка...</div>
  if (error) return <div className="text-red-600">{error}</div>

  return (
    <div className="space-y-4">
      <div className="border-b border-slate-200 dark:border-[#30363d] overflow-x-auto">
        <div className="flex gap-1 -mb-px">
          {(
            [
              { id: 'all', label: 'Все' },
              { id: 'completed', label: 'Выполненные' },
              { id: 'pending', label: 'На проверке' },
              { id: 'rejected', label: 'Отклонённые' },
            ] as { id: Tab; label: string }[]
          ).map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2.5 text-sm font-medium transition border-b-2 whitespace-nowrap flex items-center gap-2 ${
                tab === t.id
                  ? 'border-brand-600 text-brand-700 dark:text-brand-400'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {t.label}
              {counts[t.id] > 0 && (
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-full min-w-[20px] text-center ${
                    tab === t.id
                      ? 'bg-brand-100 dark:bg-brand-500/20 text-brand-700 dark:text-brand-400'
                      : 'bg-slate-100 dark:bg-[#21262d] text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {counts[t.id]}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="relative max-w-md">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
          <IconSearch size={16} />
        </div>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Поиск по квесту, сотруднику, создателю..."
          className="w-full border border-slate-300 dark:border-[#30363d] dark:bg-[#0d1117] dark:text-white rounded-md pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-brand-500"
        />
      </div>

      {filtered.length === 0 && (
        <div className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-[#30363d] p-8 sm:p-12 text-center">
          <div className="flex justify-center mb-3 text-brand-400">
            <IconTarget size={40} />
          </div>
          <div className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {query ? 'Ничего не найдено' : 'Логов пока нет'}
          </div>
        </div>
      )}

      {filtered.length > 0 && (
        <div className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-[#30363d] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-[#0d1117] border-b border-slate-200 dark:border-[#30363d]">
                <tr>
                  <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-medium">
                    Квест
                  </th>
                  <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-medium">
                    Сотрудник
                  </th>
                  <th className="text-center px-4 py-3 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-medium">
                    Статус
                  </th>
                  <th className="text-right px-4 py-3 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-medium">
                    Награда
                  </th>
                  <th className="text-right px-4 py-3 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-medium">
                    Штраф
                  </th>
                  <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-medium">
                    Дата
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#30363d]">
                {filtered.map((l) => (
                  <tr
                    key={l.userQuestId}
                    onClick={() => setDetail(l)}
                    className="hover:bg-slate-50 dark:hover:bg-[#0d1117] cursor-pointer transition"
                  >
                    <td className="px-4 py-3 max-w-xs">
                      <div className="font-medium text-slate-900 dark:text-white truncate">
                        {l.questTitle}
                      </div>
                      {l.creatorName && (
                        <div className="text-xs text-slate-400 dark:text-slate-500">
                          от {l.creatorName}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                      {l.userName}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`text-xs px-2 py-0.5 rounded border font-medium ${STATUS_COLOR[l.status]}`}
                      >
                        {STATUS_LABEL[l.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="text-amber-600 dark:text-amber-400 font-medium">
                        +{l.rewardCoins.toFixed(0)}
                      </div>
                      {l.rewardRating && l.rewardRating > 0 && (
                        <div className="text-xs text-brand-600 dark:text-brand-400">
                          +{l.rewardRating.toFixed(1)} рейтинга
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {l.penaltyCoins && l.penaltyCoins > 0 ? (
                        <div className="text-red-600 dark:text-red-400 font-medium">
                          −{l.penaltyCoins.toFixed(0)}
                        </div>
                      ) : (
                        <span className="text-slate-300 dark:text-slate-600">—</span>
                      )}
                      {l.penaltyRating && l.penaltyRating > 0 && (
                        <div className="text-xs text-red-600 dark:text-red-400">
                          −{l.penaltyRating.toFixed(1)} рейтинга
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {l.completedAt
                        ? new Date(l.completedAt).toLocaleDateString('ru-RU')
                        : l.submittedAt
                        ? new Date(l.submittedAt).toLocaleDateString('ru-RU')
                        : new Date(l.startedAt).toLocaleDateString('ru-RU')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="text-xs text-slate-400 dark:text-slate-500 text-center">
        Всего: {filtered.length}
      </div>

      {detail && <LogDetailModal log={detail} onClose={() => setDetail(null)} />}
    </div>
  )
}

function LogDetailModal({
  log,
  onClose,
}: {
  log: AdminQuestLog
  onClose: () => void
}) {
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
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Лог #{log.userQuestId}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-900 dark:hover:text-white p-1"
          >
            <IconX size={18} />
          </button>
        </div>

        <div>
          <div className="text-xs text-slate-500 uppercase tracking-wider">Квест</div>
          <div className="font-medium text-slate-900 dark:text-white mt-0.5">
            {log.questTitle}
          </div>
          {log.creatorName && (
            <div className="text-xs text-slate-500 mt-0.5">
              Создатель: {log.creatorName}
            </div>
          )}
        </div>

        <div>
          <div className="text-xs text-slate-500 uppercase tracking-wider">Сотрудник</div>
          <div className="font-medium text-slate-900 dark:text-white mt-0.5">
            {log.userName}
          </div>
        </div>

        <div>
          <div className="text-xs text-slate-500 uppercase tracking-wider">Статус</div>
          <div className="mt-1">
            <span
              className={`text-xs px-2 py-0.5 rounded border font-medium ${STATUS_COLOR[log.status]}`}
            >
              {STATUS_LABEL[log.status]}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-amber-50 dark:bg-amber-500/10 rounded-lg p-3 border border-amber-200 dark:border-amber-500/30">
            <div className="text-xs text-amber-700 dark:text-amber-400">Награда</div>
            <div className="text-sm font-semibold text-amber-700 dark:text-amber-400 mt-0.5">
              +{log.rewardCoins.toFixed(0)} монет
            </div>
            {log.rewardRating && log.rewardRating > 0 && (
              <div className="text-xs text-brand-600 dark:text-brand-400 mt-0.5">
                +{log.rewardRating.toFixed(1)} рейтинга
              </div>
            )}
          </div>
          <div className="bg-red-50 dark:bg-red-500/10 rounded-lg p-3 border border-red-200 dark:border-red-500/30">
            <div className="text-xs text-red-700 dark:text-red-400">Штраф</div>
            <div className="text-sm font-semibold text-red-700 dark:text-red-400 mt-0.5">
              {log.penaltyCoins && log.penaltyCoins > 0
                ? `−${log.penaltyCoins.toFixed(0)} монет`
                : '—'}
            </div>
            {log.penaltyRating && log.penaltyRating > 0 && (
              <div className="text-xs text-red-600 dark:text-red-400 mt-0.5">
                −{log.penaltyRating.toFixed(1)} рейтинга
              </div>
            )}
          </div>
        </div>

        <div className="space-y-1.5 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-500">Взят в работу:</span>
            <span className="text-slate-900 dark:text-white">
              {new Date(log.startedAt).toLocaleString('ru-RU')}
            </span>
          </div>
          {log.submittedAt && (
            <div className="flex justify-between">
              <span className="text-slate-500">Сдан:</span>
              <span className="text-slate-900 dark:text-white">
                {new Date(log.submittedAt).toLocaleString('ru-RU')}
              </span>
            </div>
          )}
          {log.completedAt && (
            <div className="flex justify-between">
              <span className="text-slate-500">Завершён:</span>
              <span className="text-brand-600 dark:text-brand-400 font-medium">
                {new Date(log.completedAt).toLocaleString('ru-RU')}
              </span>
            </div>
          )}
        </div>

        {log.adminComment && (
          <div>
            <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">
              Комментарий администратора
            </div>
            <div className="text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-[#0d1117] p-3 rounded border border-slate-200 dark:border-[#30363d]">
              {log.adminComment}
            </div>
          </div>
        )}

        <div className="flex justify-end pt-2">
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