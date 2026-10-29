import { useState } from 'react'
import { useFetch } from '../../hooks/useFetch'
import {
  getAdminQuests,
  approveAdminQuest,
  rejectAdminQuest,
  cancelCompletedQuest,
} from '../../api/admin'
import type { AdminQuest } from '../../api/admin'
import { notify } from '../../lib/notify'
import { IconCheck, IconX } from '../../components/Icons'

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

type FilterTab = 'pending' | 'all'

export default function AdminQuestsTab() {
  const { data, loading, error } = useFetch(() => getAdminQuests(), [])
  const [tab, setTab] = useState<FilterTab>('pending')
  const [local, setLocal] = useState<AdminQuest[] | null>(null)
  const [busy, setBusy] = useState<number | null>(null)
  const [rejectTarget, setRejectTarget] = useState<AdminQuest | null>(null)
  const [cancelTarget, setCancelTarget] = useState<AdminQuest | null>(null)

  const list = local ?? data ?? []
  const pending = list.filter((q) => q.status === 'PENDING_REVIEW')
  const displayed = tab === 'pending' ? pending : list

  async function handleApprove(q: AdminQuest) {
    setBusy(q.userQuestId)
    try {
      await approveAdminQuest(q.userQuestId)
      setLocal(
        list.map((x) =>
          x.userQuestId === q.userQuestId ? { ...x, status: 'COMPLETED' as const } : x
        )
      )
      notify.success(`Квест принят · ${q.questTitle}`)
    } catch (e) {
      notify.error(e)
    } finally {
      setBusy(null)
    }
  }

  async function handleReject(q: AdminQuest, reason: string) {
    setBusy(q.userQuestId)
    try {
      await rejectAdminQuest(q.userQuestId, reason)
      setLocal(
        list.map((x) =>
          x.userQuestId === q.userQuestId
            ? { ...x, status: 'REJECTED' as const, adminComment: reason }
            : x
        )
      )
      setRejectTarget(null)
      notify.info(`Квест отклонён · ${q.questTitle}`)
    } catch (e) {
      notify.error(e)
    } finally {
      setBusy(null)
    }
  }

  async function handleCancelCompleted(q: AdminQuest, reason: string) {
    setBusy(q.userQuestId)
    try {
      await cancelCompletedQuest(q.userQuestId, reason)
      setLocal(
        list.map((x) =>
          x.userQuestId === q.userQuestId
            ? { ...x, status: 'CANCELLED' as const, adminComment: reason }
            : x
        )
      )
      setCancelTarget(null)
      notify.warning(`Квест отменён · ${q.questTitle}`)
    } catch (e) {
      notify.error(e)
    } finally {
      setBusy(null)
    }
  }

  if (loading) return <div className="text-slate-500">Загрузка...</div>
  if (error) return <div className="text-red-600">{error}</div>

  return (
    <div className="space-y-4">
      <div className="border-b border-slate-200 dark:border-[#30363d]">
        <div className="flex gap-1 -mb-px">
          <button
            onClick={() => setTab('pending')}
            className={`px-4 py-2.5 text-sm font-medium transition border-b-2 flex items-center gap-2 ${
              tab === 'pending'
                ? 'border-brand-600 text-brand-700 dark:text-brand-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            На проверке
            {pending.length > 0 && (
              <span className="text-xs bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 px-1.5 py-0.5 rounded-full">
                {pending.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setTab('all')}
            className={`px-4 py-2.5 text-sm font-medium transition border-b-2 ${
              tab === 'all'
                ? 'border-brand-600 text-brand-700 dark:text-brand-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Все ({list.length})
          </button>
        </div>
      </div>

      {displayed.length === 0 && (
        <div className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-[#30363d] p-8 text-center">
          <div className="flex justify-center mb-2 text-brand-400">
            <IconCheck size={40} />
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400">
            {tab === 'pending' ? 'Нет квестов на проверке' : 'Квестов пока нет'}
          </div>
        </div>
      )}

      <div className="space-y-2">
        {displayed.map((q) => {
          const isPending = q.status === 'PENDING_REVIEW'
          const isCompleted = q.status === 'COMPLETED'
          return (
            <div
              key={q.userQuestId}
              className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-[#30363d] p-4"
            >
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-slate-900 dark:text-white">
                    {q.questTitle}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-300 mt-0.5">
                    Сотрудник: <span className="font-medium">{q.userName}</span>
                  </div>
                  <div className="text-xs text-slate-400 dark:text-slate-500 mt-1 flex flex-wrap gap-x-3">
                    <span>
                      Сдан:{' '}
                      {q.submittedAt
                        ? new Date(q.submittedAt).toLocaleString('ru-RU')
                        : '—'}
                    </span>
                    {q.completedAt && (
                      <span>
                        Завершён:{' '}
                        {new Date(q.completedAt).toLocaleDateString('ru-RU')}
                      </span>
                    )}
                  </div>
                  {q.adminComment && (
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Комментарий: {q.adminComment}
                    </div>
                  )}
                </div>
                <span
                  className={`shrink-0 text-xs px-2 py-0.5 rounded border font-medium ${
                    STATUS_COLOR[q.status] || STATUS_COLOR.IN_PROGRESS
                  }`}
                >
                  {STATUS_LABEL[q.status] || q.status}
                </span>
              </div>

              {(isPending || isCompleted) && (
                <div className="flex gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-[#30363d]">
                  {isPending && (
                    <>
                      <button
                        onClick={() => handleApprove(q)}
                        disabled={busy === q.userQuestId}
                        className="flex-1 bg-brand-600 hover:bg-brand-700 text-white text-sm px-3 py-2 rounded-md font-medium disabled:opacity-50 transition inline-flex items-center justify-center gap-1.5"
                      >
                        <IconCheck size={14} /> Принять
                      </button>
                      <button
                        onClick={() => setRejectTarget(q)}
                        disabled={busy === q.userQuestId}
                        className="flex-1 border border-red-300 dark:border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 text-sm px-3 py-2 rounded-md font-medium disabled:opacity-50 transition inline-flex items-center justify-center gap-1.5"
                      >
                        <IconX size={14} /> Отклонить
                      </button>
                    </>
                  )}
                  {isCompleted && (
                    <button
                      onClick={() => setCancelTarget(q)}
                      disabled={busy === q.userQuestId}
                      className="w-full border border-amber-300 dark:border-amber-500/30 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/10 text-sm px-3 py-2 rounded-md font-medium disabled:opacity-50 transition inline-flex items-center justify-center gap-1.5"
                    >
                      Отменить выполненный квест
                    </button>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {rejectTarget && (
        <ReasonModal
          title="Отклонить квест"
          subtitle={`${rejectTarget.questTitle} · ${rejectTarget.userName}`}
          placeholder="Например: недостаточно подтверждений"
          actionLabel="Отклонить"
          danger
          onClose={() => setRejectTarget(null)}
          onSubmit={(reason) => handleReject(rejectTarget, reason)}
        />
      )}

      {cancelTarget && (
        <ReasonModal
          title="Отменить выполненный квест"
          subtitle={`${cancelTarget.questTitle} · ${cancelTarget.userName}`}
          placeholder="Например: квест не был выполнен фактически"
          actionLabel="Отменить квест"
          danger
          hint="Монеты будут возвращены из баланса сотрудника в казну компании. Если сотрудник уже потратил их — операция не выполнится."
          onClose={() => setCancelTarget(null)}
          onSubmit={(reason) => handleCancelCompleted(cancelTarget, reason)}
        />
      )}
    </div>
  )
}

function ReasonModal({
  title,
  subtitle,
  placeholder,
  actionLabel,
  hint,
  danger,
  onClose,
  onSubmit,
}: {
  title: string
  subtitle: string
  placeholder: string
  actionLabel: string
  hint?: string
  danger?: boolean
  onClose: () => void
  onSubmit: (reason: string) => void
}) {
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!reason.trim()) {
      setError('Укажите причину')
      return
    }
    onSubmit(reason.trim())
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <form
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-[#161b22] rounded-xl w-full max-w-md p-6 space-y-4"
      >
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            {title}
          </h2>
          <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {subtitle}
          </div>
        </div>

        {hint && (
          <div className="bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 text-sm p-3 rounded border border-amber-200 dark:border-amber-500/30">
            {hint}
          </div>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 text-sm p-3 rounded border border-red-200 dark:border-red-500/30">
            {error}
          </div>
        )}

        <div>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Причина *
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            placeholder={placeholder}
            required
            className="w-full border border-slate-300 dark:border-[#30363d] dark:bg-[#0d1117] dark:text-white rounded-md px-3 py-2 mt-1 text-sm resize-none focus:outline-none focus:border-brand-500"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm text-slate-600 dark:text-slate-300"
          >
            Отмена
          </button>
          <button
            type="submit"
            className={`rounded-md px-4 py-2 text-sm font-medium text-white transition ${
              danger ? 'bg-red-600 hover:bg-red-700' : 'bg-brand-600 hover:bg-brand-700'
            }`}
          >
            {actionLabel}
          </button>
        </div>
      </form>
    </div>
  )
}