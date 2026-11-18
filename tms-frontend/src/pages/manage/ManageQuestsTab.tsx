import { useState, useMemo } from 'react'
import { useAuth } from '../../store/auth'
import { useFetch } from '../../hooks/useFetch'
import {
  getQuestsForReview,
  approveQuest,
  rejectQuest,
  getAvailableQuests,
  deleteQuest,
  getAdminQuestLogs,
  type UserQuestForReview,
} from '../../api/quests'
import { notify } from '../../lib/notify'
import { confirmDialog } from '../../lib/confirm'
import CreateQuestModal from '../../components/CreateQuestModal'
import EditQuestModal from '../../components/EditQuestModal'
import ApplyQuestPenaltyModal from '../../components/ApplyQuestPenaltyModal'
import ExtendDeadlineModal from '../../components/ExtendDeadlineModal'
import ExtendUserQuestDeadlineModal from '../../components/ExtendUserQuestDeadlineModal'
import Avatar from '../../components/Avatar'
import { IconPlus, IconSearch } from '../../components/Icons'
import type { QuestListItem, AdminQuestLog } from '../../types'
import ForceRejectUserQuestModal from '../../components/ForceRejectUserQuestModal'

type Tab = 'review' | 'templates' | 'progress'

const STATUS_LABEL: Record<string, string> = {
  IN_PROGRESS: 'В работе',
  PENDING_REVIEW: 'На проверке',
  COMPLETED: 'Выполнен',
  REJECTED: 'Отклонён',
  CANCELLED: 'Отменён',
}

const STATUS_COLOR: Record<string, string> = {
  IN_PROGRESS: 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400',
  PENDING_REVIEW: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
  COMPLETED: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
  REJECTED: 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400',
  CANCELLED: 'bg-slate-100 text-slate-600 dark:bg-slate-500/10 dark:text-slate-400',
}

function fmt(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function ManageQuestsTab() {
  const user = useAuth((s) => s.user)!
  const [tab, setTab] = useState<Tab>('review')

  const review = useFetch(() => getQuestsForReview(user.id), [user.id])
  const templates = useFetch(() => getAvailableQuests(user.id), [user.id])

  const [reviewItems, setReviewItems] = useState<UserQuestForReview[] | null>(null)
  const [processing, setProcessing] = useState<number | null>(null)
  const [rejecting, setRejecting] = useState<UserQuestForReview | null>(null)
  const [reviewDetails, setReviewDetails] = useState<UserQuestForReview | null>(null)

  const [creating, setCreating] = useState(false)
  const [editing, setEditing] = useState<QuestListItem | null>(null)
  const [extendingGlobal, setExtendingGlobal] = useState<QuestListItem | null>(null)
  const [penalizingAll, setPenalizingAll] = useState<QuestListItem | null>(null)
  const [templateDetails, setTemplateDetails] = useState<QuestListItem | null>(null)

  const reviewList = reviewItems ?? review.data ?? []
  const templateList = templates.data ?? []

  async function handleApprove(id: number, title: string) {
    setProcessing(id)
    try {
      await approveQuest(id, user.id)
      setReviewItems(reviewList.filter((q) => q.id !== id))
      setReviewDetails(null)
      notify.success(`Квест принят · ${title}`)
    } catch (e) {
      notify.error(e)
    } finally {
      setProcessing(null)
    }
  }

  async function handleReject(id: number, reason: string, title: string) {
    setProcessing(id)
    try {
      await rejectQuest(id, user.id, reason)
      setReviewItems(reviewList.filter((q) => q.id !== id))
      setRejecting(null)
      setReviewDetails(null)
      notify.info(`Квест отклонён · ${title}`)
    } catch (e) {
      notify.error(e)
    } finally {
      setProcessing(null)
    }
  }

  async function handleDelete(questId: number, title: string) {
    const ok = await confirmDialog({
      title: 'Удалить квест?',
      message: `«${title}» будет деактивирован.`,
      confirmLabel: 'Удалить',
      danger: true,
    })
    if (!ok) return
    try {
      await deleteQuest(questId, user.id)
      notify.success('Квест удалён')
      window.location.reload()
    } catch (e) {
      notify.error(e)
    }
  }

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: 'review', label: 'На проверке', count: reviewList.length },
    { id: 'templates', label: 'Активные квесты', count: templateList.length },  // ← было «Шаблоны»
    { id: 'progress', label: 'Прохождения' },
  ]

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          Проверка квестов
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Одобряйте выполненные задания, управляйте шаблонами и следите за прохождениями
        </p>
      </div>

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-[#0d1117]">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition ${
                tab === t.id
                  ? 'bg-white dark:bg-[#161b22] text-brand-700 dark:text-brand-400 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {t.label}
              {t.count !== undefined && t.count > 0 && (
                <span className="text-xs px-1.5 py-0.5 rounded-full bg-slate-200 dark:bg-[#21262d] text-slate-600 dark:text-slate-400 font-semibold min-w-[20px] text-center">
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {tab === 'templates' && (
          <button
            onClick={() => setCreating(true)}
            className="bg-brand-600 hover:bg-brand-700 text-white rounded-lg px-4 py-2 text-sm font-medium inline-flex items-center gap-1.5 shadow-sm transition"
          >
            <IconPlus size={14} />
            Создать квест
          </button>
        )}
      </div>

      {/* === REVIEW === */}
      {tab === 'review' && (
        <>
          {review.loading && (
            <div className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-[#30363d] p-8 text-center text-slate-500">
              Загрузка...
            </div>
          )}

          {!review.loading && reviewList.length === 0 && (
            <div className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-[#30363d] p-10 text-center">
              <div className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                Всё проверено
              </div>
              <div className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                Сданные квесты появятся здесь
              </div>
            </div>
          )}

          <div className="space-y-2.5">
            {reviewList.map((q) => (
              <div
                key={q.id}
                onClick={() => setReviewDetails(q)}
                className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-[#30363d] p-5 hover:border-brand-400 dark:hover:border-brand-500/50 cursor-pointer transition"
              >
                <div className="flex items-start gap-3 mb-3">
                  <Avatar name={q.userName} size="md" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900 dark:text-white">
                      {q.questTitle}
                    </h3>
                    <div className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                      <span className="text-slate-700 dark:text-slate-300 font-medium">
                        {q.userName}
                      </span>
                      {q.submittedAt && (
                        <>
                          {' · сдано '}
                          {fmt(q.submittedAt)}
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {q.adminComment && (
                  <div className="border-l-2 border-slate-300 dark:border-[#30363d] bg-slate-50 dark:bg-[#0d1117] px-3 py-2 rounded-r-lg mb-3 text-sm text-slate-700 dark:text-slate-300">
                    <span className="font-medium text-slate-500 dark:text-slate-400">
                      Комментарий:{' '}
                    </span>
                    {q.adminComment}
                  </div>
                )}

                <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-[#30363d]">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleApprove(q.id, q.questTitle)
                    }}
                    disabled={processing === q.id}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-sm px-4 py-2 rounded-lg font-medium disabled:opacity-50 transition"
                  >
                    {processing === q.id ? '...' : 'Принять'}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setRejecting(q)
                    }}
                    disabled={processing === q.id}
                    className="flex-1 border border-slate-300 dark:border-[#30363d] text-slate-600 dark:text-slate-300 hover:border-red-400 hover:text-red-600 dark:hover:text-red-400 text-sm px-4 py-2 rounded-lg font-medium disabled:opacity-50 transition"
                  >
                    Отклонить
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* === TEMPLATES === */}
      {tab === 'templates' && (
        <>
          {templates.loading && (
            <div className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-[#30363d] p-8 text-center text-slate-500">
              Загрузка...
            </div>
          )}

          {!templates.loading && templateList.length === 0 && (
            <div className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-[#30363d] p-10 text-center">
              <div className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                Квестов пока нет
              </div>
              <button
                onClick={() => setCreating(true)}
                className="mt-4 bg-brand-600 hover:bg-brand-700 text-white rounded-lg px-4 py-2 text-sm font-medium inline-flex items-center gap-1.5 transition"
              >
                <IconPlus size={14} />
                Создать первый квест
              </button>
            </div>
          )}

          <div className="space-y-2.5">
            {templateList.map((q) => {
              const deadline = q.deadline ? new Date(q.deadline) : null
              const expired = deadline && deadline.getTime() < Date.now()
              return (
                <div
                  key={q.questId}
                  onClick={() => setTemplateDetails(q)}
                  className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-[#30363d] p-5 hover:border-brand-400 dark:hover:border-brand-500/50 cursor-pointer transition"
                >
                  <div className="flex items-start justify-between gap-3 flex-wrap mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="font-semibold text-slate-900 dark:text-white">
                          {q.title}
                        </h3>
                        {q.isMandatory && (
                          <span className="text-[10px] text-red-600 dark:text-red-400 font-semibold uppercase tracking-wider">
                            Обязательный
                          </span>
                        )}
                        {q.isRepeatable && (
                          <span className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold">
                            Повторяемый
                          </span>
                        )}
                        {expired && !q.isRepeatable && (
                          <span className="text-[10px] text-red-600 dark:text-red-400 font-semibold">
                            Истёк
                          </span>
                        )}
                      </div>
                      {q.description && (
                        <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2">
                          {q.description}
                        </p>
                      )}
                    </div>

                    <div
                      className="flex gap-1.5 flex-wrap shrink-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => setEditing(q)}
                        className="text-xs px-3 py-1.5 border border-slate-300 dark:border-[#30363d] rounded-lg text-slate-700 dark:text-slate-300 hover:border-brand-500 transition"
                      >
                        Изменить
                      </button>
                      <button
                        onClick={() => setExtendingGlobal(q)}
                        className="text-xs px-3 py-1.5 border border-slate-300 dark:border-[#30363d] rounded-lg text-slate-700 dark:text-slate-300 hover:border-brand-500 transition"
                      >
                        Продлить
                      </button>
                      <button
                        onClick={() => setPenalizingAll(q)}
                        className="text-xs px-3 py-1.5 border border-slate-300 dark:border-[#30363d] rounded-lg text-slate-700 dark:text-slate-300 hover:border-red-400 hover:text-red-600 transition"
                      >
                        Штраф
                      </button>
                      <button
                        onClick={() => handleDelete(q.questId, q.title)}
                        className="text-xs px-3 py-1.5 border border-slate-300 dark:border-[#30363d] rounded-lg text-slate-700 dark:text-slate-300 hover:border-red-400 hover:text-red-600 transition"
                      >
                        Удалить
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-3 border-t border-slate-100 dark:border-[#30363d]">
                    <div className="bg-amber-50 dark:bg-amber-500/10 rounded-lg px-3 py-2">
                      <div className="text-[10px] text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                        Награда
                      </div>
                      <div className="text-sm font-bold text-amber-700 dark:text-amber-400 mt-0.5">
                        +{q.rewardCoins.toFixed(0)} монет
                      </div>
                    </div>
                    {q.rewardRating && q.rewardRating > 0 && (
                      <div className="bg-brand-50 dark:bg-brand-500/10 rounded-lg px-3 py-2">
                        <div className="text-[10px] text-brand-700 dark:text-brand-400 uppercase tracking-wider">
                          Рейтинг
                        </div>
                        <div className="text-sm font-bold text-brand-700 dark:text-brand-400 mt-0.5">
                          +{q.rewardRating.toFixed(1)}
                        </div>
                      </div>
                    )}
                    <div className="bg-slate-50 dark:bg-[#0d1117] rounded-lg px-3 py-2">
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Дедлайн
                      </div>
                      <div className="text-sm font-semibold text-slate-900 dark:text-white mt-0.5">
                        {deadline
                          ? deadline.toLocaleDateString('ru-RU', {
                              day: '2-digit',
                              month: 'short',
                            })
                          : 'Бессрочно'}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}

      {/* === PROGRESS === */}
      {tab === 'progress' && <ProgressTab />}

      {/* === Модалки === */}
      {creating && (
        <CreateQuestModal
          onClose={() => setCreating(false)}
          onCreated={() => {
            setCreating(false)
            window.location.reload()
          }}
        />
      )}
      {editing && (
        <EditQuestModal
          quest={editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null)
            window.location.reload()
          }}
        />
      )}
      {extendingGlobal && (
        <ExtendDeadlineModal
          quest={extendingGlobal}
          onClose={() => setExtendingGlobal(null)}
          onSaved={() => {
            setExtendingGlobal(null)
            window.location.reload()
          }}
        />
      )}
      {penalizingAll && (
        <ApplyQuestPenaltyModal
          quest={{
            questId: penalizingAll.questId,
            title: penalizingAll.title,
            penaltyCoins: penalizingAll.penaltyCoins,
            penaltyRating: penalizingAll.penaltyRating,
          }}
          onClose={() => setPenalizingAll(null)}
          onApplied={() => {
            setPenalizingAll(null)
            window.location.reload()
          }}
        />
      )}
      {rejecting && (
        <RejectModal
          quest={rejecting}
          onClose={() => setRejecting(null)}
          onReject={(r) => handleReject(rejecting.id, r, rejecting.questTitle)}
        />
      )}
      {reviewDetails && (
        <ReviewDetailsModal
          quest={reviewDetails}
          processing={processing === reviewDetails.id}
          onClose={() => setReviewDetails(null)}
          onApprove={() => handleApprove(reviewDetails.id, reviewDetails.questTitle)}
          onReject={() => {
            setReviewDetails(null)
            setRejecting(reviewDetails)
          }}
        />
      )}
      {templateDetails && (
        <TemplateDetailsModal
          quest={templateDetails}
          onClose={() => setTemplateDetails(null)}
          onEdit={() => {
            setTemplateDetails(null)
            setEditing(templateDetails)
          }}
          onExtend={() => {
            setTemplateDetails(null)
            setExtendingGlobal(templateDetails)
          }}
          onPenalize={() => {
            setTemplateDetails(null)
            setPenalizingAll(templateDetails)
          }}
        />
      )}
    </div>
  )
}

// ==========================================
// === ПРОХОЖДЕНИЯ — красивый дизайн + клик → детали
// ==========================================
function ProgressTab() {
  const me = useAuth((s) => s.user)!
  const { data, loading, error } = useFetch(
    () => getAdminQuestLogs(me.id),
    [me.id]
  )

  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [questFilter, setQuestFilter] = useState<string>('all')
  const [query, setQuery] = useState('')
  const [detail, setDetail] = useState<AdminQuestLog | null>(null)
  const [extendUser, setExtendUser] = useState<AdminQuestLog | null>(null)
  const [forceRejectUser, setForceRejectUser] = useState<AdminQuestLog | null>(null)
  const [penalizeUser, setPenalizeUser] = useState<AdminQuestLog | null>(null)

  const logs: AdminQuestLog[] = data ?? []
  const now = Date.now()

  function effectiveDeadline(l: AdminQuestLog): string | null {
    return l.deadlineOverride ?? l.deadline
  }

  function isOverdue(l: AdminQuestLog): boolean {
    if (l.status !== 'IN_PROGRESS') return false
    const d = effectiveDeadline(l)
    return !!d && new Date(d).getTime() < now
  }

  const counts = useMemo(() => {
    const overdue = logs.filter((l) => {
      if (l.status !== 'IN_PROGRESS') return false
      const d = l.deadlineOverride ?? l.deadline
      return d && new Date(d).getTime() < now
    }).length

    return {
      all: logs.length,
      overdue,
      in_progress: logs.filter((l) => l.status === 'IN_PROGRESS').length,
      pending: logs.filter((l) => l.status === 'PENDING_REVIEW').length,
      completed: logs.filter((l) => l.status === 'COMPLETED').length,
      rejected: logs.filter((l) => l.status === 'REJECTED').length,
    }
  }, [logs, now])

  const quests = useMemo(() => {
    const map = new Map<number, string>()
    logs.forEach((l) => map.set(l.questId, l.questTitle))
    return Array.from(map.entries()).map(([id, title]) => ({ id, title }))
  }, [logs])

  const filtered = useMemo(() => {
    let arr = logs
    if (statusFilter === 'overdue') {
      arr = arr.filter((l) => {
        if (l.status !== 'IN_PROGRESS') return false
        const d = l.deadlineOverride ?? l.deadline
        return d && new Date(d).getTime() < now
      })
    } else if (statusFilter !== 'all') {
      arr = arr.filter((l) => l.status === statusFilter)
    }
    if (questFilter !== 'all') {
      arr = arr.filter((l) => l.questId === Number(questFilter))
    }
    if (query.trim()) {
      const q = query.toLowerCase()
      arr = arr.filter(
        (l) => l.userName.toLowerCase().includes(q) || l.questTitle.toLowerCase().includes(q)
      )
    }
    return arr.sort(
      (a, b) => new Date(b.questCreatedAt).getTime() - new Date(a.questCreatedAt).getTime()
    )
  }, [logs, statusFilter, questFilter, query, now])

  if (loading) {
    return (
      <div className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-[#30363d] p-8 text-center text-slate-500">
        Загрузка...
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
    <div className="space-y-4">
      {/* 4 счётчика — как было */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <button
          onClick={() => setStatusFilter(statusFilter === 'IN_PROGRESS' ? 'all' : 'IN_PROGRESS')}
          className={`text-left bg-white dark:bg-[#161b22] rounded-xl border p-3 transition ${
            statusFilter === 'IN_PROGRESS'
              ? 'border-blue-400 dark:border-blue-500/50 ring-1 ring-blue-300/50 dark:ring-blue-500/30'
              : 'border-slate-200 dark:border-[#30363d] hover:border-blue-300'
          }`}
        >
          <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Выполняют
          </div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
            {counts.in_progress}
          </div>
        </button>
        <button
          onClick={() => setStatusFilter(statusFilter === 'PENDING_REVIEW' ? 'all' : 'PENDING_REVIEW')}
          className={`text-left bg-white dark:bg-[#161b22] rounded-xl border p-3 transition ${
            statusFilter === 'PENDING_REVIEW'
              ? 'border-amber-400 dark:border-amber-500/50 ring-1 ring-amber-300/50 dark:ring-amber-500/30'
              : 'border-slate-200 dark:border-[#30363d] hover:border-amber-300'
          }`}
        >
          <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            На проверке
          </div>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
            {counts.pending}
          </div>
        </button>
        <button
          onClick={() => setStatusFilter(statusFilter === 'COMPLETED' ? 'all' : 'COMPLETED')}
          className={`text-left bg-white dark:bg-[#161b22] rounded-xl border p-3 transition ${
            statusFilter === 'COMPLETED'
              ? 'border-emerald-400 dark:border-emerald-500/50 ring-1 ring-emerald-300/50 dark:ring-emerald-500/30'
              : 'border-slate-200 dark:border-[#30363d] hover:border-emerald-300'
          }`}
        >
          <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Завершили
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            {counts.completed}
          </div>
        </button>
        <button
          onClick={() => setStatusFilter(statusFilter === 'REJECTED' ? 'all' : 'REJECTED')}
          className={`text-left bg-white dark:bg-[#161b22] rounded-xl border p-3 transition ${
            statusFilter === 'REJECTED'
              ? 'border-red-400 dark:border-red-500/50 ring-1 ring-red-300/50 dark:ring-red-500/30'
              : 'border-slate-200 dark:border-[#30363d] hover:border-red-300'
          }`}
        >
          <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Отклонено
          </div>
          <div className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
            {counts.rejected}
          </div>
        </button>
      </div>

      {/* Фильтры */}
      <div className="flex flex-wrap gap-2 items-center">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-slate-300 dark:border-[#30363d] dark:bg-[#161b22] dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-500"
        >
          <option value="all">Все статусы</option>
          <option value="overdue">Просрочены ({counts.overdue})</option>
          <option value="IN_PROGRESS">Выполняют</option>
          <option value="PENDING_REVIEW">На проверке</option>
          <option value="COMPLETED">Завершили</option>
          <option value="REJECTED">Отклонено</option>
          <option value="CANCELLED">Отменено</option>
        </select>
        <select
          value={questFilter}
          onChange={(e) => setQuestFilter(e.target.value)}
          className="border border-slate-300 dark:border-[#30363d] dark:bg-[#161b22] dark:text-white rounded-lg px-3 py-2 text-sm max-w-xs focus:outline-none focus:border-brand-500"
        >
          <option value="all">Все квесты</option>
          {quests.map((q) => (
            <option key={q.id} value={q.id}>
              {q.title}
            </option>
          ))}
        </select>
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            <IconSearch size={14} />
          </div>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск по сотруднику или квесту..."
            className="w-full border border-slate-300 dark:border-[#30363d] dark:bg-[#0d1117] dark:text-white rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-brand-500"
          />
        </div>
        {counts.overdue > 0 && statusFilter !== 'overdue' && (
          <button
            onClick={() => setStatusFilter('overdue')}
            className="text-xs px-3 py-2 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 font-medium hover:bg-red-100 dark:hover:bg-red-500/20 transition"
          >
            Просрочены: {counts.overdue}
          </button>
        )}
      </div>

      {/* Таблица */}
      {filtered.length === 0 ? (
        <div className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-[#30363d] p-10 text-center">
          <div className="text-sm font-semibold text-slate-600 dark:text-slate-300">
            Нет прохождений
          </div>
          <div className="text-xs text-slate-400 dark:text-slate-500 mt-1">
            {statusFilter !== 'all' || questFilter !== 'all' || query
              ? 'Попробуйте изменить фильтры'
              : 'Сотрудники ещё не брали квесты'}
          </div>
        </div>
      ) : (
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
                    Дедлайн
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#30363d]">
                {filtered.map((l) => {
                  const overdue = isOverdue(l)
                  const eff = effectiveDeadline(l)
                  const st = STATUS_COLOR[l.status] || STATUS_COLOR.IN_PROGRESS
                  return (
                    <tr
                      key={l.userQuestId}
                      onClick={() => setDetail(l)}
                      className={`cursor-pointer transition ${
                        overdue
                          ? 'bg-red-50/40 dark:bg-red-500/5 hover:bg-red-50 dark:hover:bg-red-500/10'
                          : 'hover:bg-slate-50 dark:hover:bg-[#0d1117]'
                      }`}
                    >
                      <td className="px-4 py-3 max-w-xs">
                        <div className="font-medium text-slate-900 dark:text-white truncate">
                          {l.questTitle}
                        </div>
                        {l.creatorName && (
                          <div className="text-xs text-slate-400 dark:text-slate-500 truncate">
                            от {l.creatorName}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Avatar name={l.userName} size="sm" />
                          <div className="text-slate-700 dark:text-slate-300 truncate">
                            {l.userName}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-semibold whitespace-nowrap ${st}`}
                          >
                            {STATUS_LABEL[l.status]}
                          </span>
                          {overdue && (
                            <span className="text-[10px] text-red-600 dark:text-red-400 font-semibold">
                              Просрочен
                            </span>
                          )}
                        </div>
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
                      <td className="px-4 py-3 text-right text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        {eff ? new Date(eff).toLocaleDateString('ru-RU') : '—'}
                        {l.deadlineOverride && (
                          <div className="text-[10px] text-slate-400 dark:text-slate-500">
                            продлён
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="text-xs text-slate-400 dark:text-slate-500 text-center">
        Показано {filtered.length} из {counts.all}
      </div>

      {/* Модалка деталей */}
      {detail && (
        <ProgressDetailsModal
          log={detail}
          onClose={() => setDetail(null)}
          onExtend={() => {
            setExtendUser(detail)
            setDetail(null)
          }}
          onPenalize={() => {
            setPenalizeUser(detail)
            setDetail(null)
          }}
          onForceReject={() => {
            setForceRejectUser(detail)
            setDetail(null)
          }}
        />
      )}

      {extendUser && (
        <ExtendUserQuestDeadlineModal
          userQuestId={extendUser.userQuestId}
          userName={extendUser.userName}
          questTitle={extendUser.questTitle}
          currentDeadline={effectiveDeadline(extendUser)}
          onClose={() => setExtendUser(null)}
          onSaved={() => {
            setExtendUser(null)
            window.location.reload()
          }}
        />
      )}

      {penalizeUser && (
        <ApplyQuestPenaltyModal
          quest={{
            questId: penalizeUser.questId,
            title: penalizeUser.questTitle,
            penaltyCoins: penalizeUser.penaltyCoins,
            penaltyRating: penalizeUser.penaltyRating,
          }}
          targetUserId={penalizeUser.userId}
          targetUserName={penalizeUser.userName}
          onClose={() => setPenalizeUser(null)}
          onApplied={() => {
            setPenalizeUser(null)
            window.location.reload()
          }}
        />
      )}

      {forceRejectUser && (
        <ForceRejectUserQuestModal
          userQuestId={forceRejectUser.userQuestId}
         userName={forceRejectUser.userName}
          questTitle={forceRejectUser.questTitle}
          penaltyCoins={forceRejectUser.penaltyCoins}
          penaltyRating={forceRejectUser.penaltyRating}
          onClose={() => setForceRejectUser(null)}
          onDone={() => {
            setForceRejectUser(null)
            window.location.reload()
          }}
        />
      )}
    </div>
  )
}

// ==========================================
// === МОДАЛКА ДЕТАЛЕЙ ПРОХОЖДЕНИЯ
// ==========================================
function ProgressDetailsModal({
  log,
  onClose,
  onExtend,
  onPenalize,
  onForceReject,
}: {
  log: AdminQuestLog
  onClose: () => void
  onExtend: () => void
  onPenalize: () => void
  onForceReject: () => void
}) {
  const now = Date.now()
  const eff = log.deadlineOverride ?? log.deadline
  const overdue =
    log.status === 'IN_PROGRESS' && !!eff && new Date(eff).getTime() < now
  const isActive =
    log.status === 'IN_PROGRESS' || log.status === 'PENDING_REVIEW'
  const canForceReject = isActive
  const canPenalize =
    log.status === 'IN_PROGRESS' ||
    log.status === 'PENDING_REVIEW' ||
    log.status === 'REJECTED'
  const hasPenalty =
    (log.penaltyCoins != null && log.penaltyCoins > 0) ||
    (log.penaltyRating != null && log.penaltyRating > 0)

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-[#161b22] rounded-xl w-full max-w-lg p-6 space-y-4 my-8"
      >
        {/* Header */}
        <div className="flex items-start gap-3">
          <Avatar name={log.userName} size="lg" />
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              {log.questTitle}
            </h2>
            <div className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Выполняет{' '}
              <span className="font-medium text-slate-700 dark:text-slate-300">
                {log.userName}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${STATUS_COLOR[log.status]}`}
              >
                {STATUS_LABEL[log.status]}
              </span>
              {overdue && (
                <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400">
                  Просрочен
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-900 dark:hover:text-white p-1 text-lg"
          >
            ✕
          </button>
        </div>

        {/* Описание */}
        {log.questDescription && (
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              Описание квеста
            </div>
            <div className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
              {log.questDescription}
            </div>
          </div>
        )}

        {log.creatorName && (
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Автор квеста: {log.creatorName}
          </div>
        )}

        {/* Даты */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-slate-50 dark:bg-[#0d1117] rounded-lg px-3 py-2">
            <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Взят
            </div>
            <div className="font-medium text-slate-900 dark:text-white mt-0.5 text-sm">
              {fmt(log.startedAt)}
            </div>
          </div>
          <div
            className={`rounded-lg px-3 py-2 ${
              overdue
                ? 'bg-red-50 dark:bg-red-500/10'
                : 'bg-slate-50 dark:bg-[#0d1117]'
            }`}
          >
            <div
              className={`text-[10px] uppercase tracking-wider ${
                overdue
                  ? 'text-red-700 dark:text-red-400'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              Дедлайн{log.deadlineOverride && ' (продлён)'}
            </div>
            <div
              className={`font-medium mt-0.5 text-sm ${
                overdue
                  ? 'text-red-700 dark:text-red-400'
                  : 'text-slate-900 dark:text-white'
              }`}
            >
              {eff ? fmt(eff) : 'Бессрочно'}
            </div>
          </div>
          {log.submittedAt && (
            <div className="bg-slate-50 dark:bg-[#0d1117] rounded-lg px-3 py-2">
              <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Сдан
              </div>
              <div className="font-medium text-slate-900 dark:text-white mt-0.5 text-sm">
                {fmt(log.submittedAt)}
              </div>
            </div>
          )}
          {log.completedAt && (
            <div className="bg-emerald-50 dark:bg-emerald-500/10 rounded-lg px-3 py-2">
              <div className="text-[10px] text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                Завершён
              </div>
              <div className="font-medium text-emerald-700 dark:text-emerald-400 mt-0.5 text-sm">
                {fmt(log.completedAt)}
              </div>
            </div>
          )}
        </div>

        {/* Награды */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-amber-50 dark:bg-amber-500/10 rounded-lg px-3 py-2">
            <div className="text-[10px] text-amber-700 dark:text-amber-400 uppercase tracking-wider">
              Награда
            </div>
            <div className="font-bold text-amber-700 dark:text-amber-400 mt-0.5">
              +{log.rewardCoins.toFixed(0)} монет
            </div>
            {log.rewardRating && log.rewardRating > 0 && (
              <div className="text-xs text-brand-600 dark:text-brand-400 font-medium">
                +{log.rewardRating.toFixed(1)} рейтинга
              </div>
            )}
          </div>
          {hasPenalty ? (
            <div className="bg-red-50 dark:bg-red-500/10 rounded-lg px-3 py-2">
              <div className="text-[10px] text-red-700 dark:text-red-400 uppercase tracking-wider">
                Штраф при провале
              </div>
              <div className="font-bold text-red-700 dark:text-red-400 mt-0.5">
                {log.penaltyCoins && log.penaltyCoins > 0
                  ? `−${log.penaltyCoins.toFixed(0)} монет`
                  : '—'}
              </div>
              {log.penaltyRating && log.penaltyRating > 0 && (
                <div className="text-xs text-red-600 dark:text-red-400">
                  −{log.penaltyRating.toFixed(1)} рейтинга
                </div>
              )}
            </div>
          ) : (
            <div className="bg-slate-50 dark:bg-[#0d1117] rounded-lg px-3 py-2">
              <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Штраф
              </div>
              <div className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Не предусмотрен
              </div>
            </div>
          )}
        </div>

        {/* Комментарий */}
        {log.adminComment && (
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              Комментарий
            </div>
            <div className="text-sm bg-slate-50 dark:bg-[#0d1117] text-slate-700 dark:text-slate-300 p-3 rounded-lg">
              {log.adminComment}
            </div>
          </div>
        )}

        {/* Действия */}
        {(isActive || canPenalize) && (
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-[#30363d]">
            {canForceReject && (
              <button
                onClick={onForceReject}
                className="w-full border border-red-300 dark:border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 text-sm px-4 py-2.5 rounded-lg font-medium transition"
              >
                Принудительно завершить
              </button>
            )}
            <div className="flex flex-wrap gap-2">
              {isActive && (
                <button
                  onClick={onExtend}
                  className="flex-1 border border-brand-300 dark:border-brand-500/30 text-brand-700 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-500/10 text-sm px-4 py-2 rounded-lg font-medium transition"
                >
                  Продлить дедлайн
                </button>
              )}
              {canPenalize && !canForceReject && (
                <button
                  onClick={onPenalize}
                  className="flex-1 border border-red-300 dark:border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 text-sm px-4 py-2 rounded-lg font-medium transition"
                >
                  Штраф
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ==========================================
// === Модалка деталей сдачи (review)
// ==========================================
function ReviewDetailsModal({
  quest,
  processing,
  onClose,
  onApprove,
  onReject,
}: {
  quest: UserQuestForReview
  processing: boolean
  onClose: () => void
  onApprove: () => void
  onReject: () => void
}) {
  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-[#161b22] rounded-xl w-full max-w-lg p-6 space-y-4 my-8"
      >
        <div className="flex items-start gap-3">
          <Avatar name={quest.userName} size="lg" />
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              {quest.questTitle}
            </h2>
            <div className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Сдал{' '}
              <span className="font-medium text-slate-700 dark:text-slate-300">
                {quest.userName}
              </span>
            </div>
            <span
              className={`inline-block mt-2 text-[10px] px-2 py-0.5 rounded-full font-semibold ${STATUS_COLOR[quest.status]}`}
            >
              {STATUS_LABEL[quest.status]}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-900 dark:hover:text-white p-1 text-lg"
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="bg-slate-50 dark:bg-[#0d1117] rounded-lg px-3 py-2">
            <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Взят
            </div>
            <div className="font-medium text-slate-900 dark:text-white mt-0.5">
              {fmt(quest.startedAt)}
            </div>
          </div>
          <div className="bg-slate-50 dark:bg-[#0d1117] rounded-lg px-3 py-2">
            <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Сдан
            </div>
            <div className="font-medium text-slate-900 dark:text-white mt-0.5">
              {fmt(quest.submittedAt)}
            </div>
          </div>
        </div>

        {quest.adminComment && (
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              Комментарий
            </div>
            <div className="text-sm bg-slate-50 dark:bg-[#0d1117] text-slate-700 dark:text-slate-300 p-3 rounded-lg">
              {quest.adminComment}
            </div>
          </div>
        )}

        <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-[#30363d]">
          <button
            onClick={onApprove}
            disabled={processing}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-sm px-4 py-2.5 rounded-lg font-medium disabled:opacity-50 transition"
          >
            {processing ? '...' : 'Принять'}
          </button>
          <button
            onClick={onReject}
            disabled={processing}
            className="flex-1 border border-slate-300 dark:border-[#30363d] text-slate-600 dark:text-slate-300 hover:border-red-400 hover:text-red-600 dark:hover:text-red-400 text-sm px-4 py-2.5 rounded-lg font-medium disabled:opacity-50 transition"
          >
            Отклонить
          </button>
        </div>
      </div>
    </div>
  )
}

// ==========================================
// === Модалка деталей шаблона
// ==========================================
function TemplateDetailsModal({
  quest,
  onClose,
  onEdit,
  onExtend,
  onPenalize,
}: {
  quest: QuestListItem
  onClose: () => void
  onEdit: () => void
  onExtend: () => void
  onPenalize: () => void
}) {
  const deadline = quest.deadline ? new Date(quest.deadline) : null
  const expired = deadline && deadline.getTime() < Date.now()

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
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              {quest.title}
            </h2>
            <div className="flex flex-wrap gap-2 mt-1.5">
              {quest.isMandatory && (
                <span className="text-[10px] text-red-600 dark:text-red-400 font-semibold uppercase tracking-wider">
                  Обязательный
                </span>
              )}
              {quest.isRepeatable && (
                <span className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold">
                  Повторяемый
                </span>
              )}
              {expired && !quest.isRepeatable && (
                <span className="text-[10px] text-red-600 dark:text-red-400 font-semibold">
                  Истёк
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-900 dark:hover:text-white p-1 text-lg"
          >
            ✕
          </button>
        </div>

        {quest.description && (
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              Описание
            </div>
            <div className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
              {quest.description}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          <div className="bg-amber-50 dark:bg-amber-500/10 rounded-lg px-3 py-2">
            <div className="text-[10px] text-amber-700 dark:text-amber-400 uppercase tracking-wider">
              Награда
            </div>
            <div className="text-sm font-bold text-amber-700 dark:text-amber-400 mt-0.5">
              +{quest.rewardCoins.toFixed(0)} монет
            </div>
          </div>
          {quest.rewardRating && quest.rewardRating > 0 ? (
            <div className="bg-brand-50 dark:bg-brand-500/10 rounded-lg px-3 py-2">
              <div className="text-[10px] text-brand-700 dark:text-brand-400 uppercase tracking-wider">
                Рейтинг
              </div>
              <div className="text-sm font-bold text-brand-700 dark:text-brand-400 mt-0.5">
                +{quest.rewardRating.toFixed(1)}
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 dark:bg-[#0d1117] rounded-lg px-3 py-2">
              <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Рейтинг
              </div>
              <div className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Не начисляется
              </div>
            </div>
          )}
          <div className="bg-slate-50 dark:bg-[#0d1117] rounded-lg px-3 py-2 col-span-2">
            <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Дедлайн
            </div>
            <div className="text-sm font-semibold text-slate-900 dark:text-white mt-0.5">
              {deadline ? fmt(quest.deadline) : 'Бессрочно'}
            </div>
          </div>
        </div>

        {quest.isMandatory && (quest.penaltyCoins || quest.penaltyRating) && (
          <div className="bg-red-50 dark:bg-red-500/10 rounded-lg px-3 py-2">
            <div className="text-[10px] text-red-700 dark:text-red-400 uppercase tracking-wider mb-0.5">
              Штраф при невыполнении
            </div>
            <div className="text-sm text-red-700 dark:text-red-400 flex flex-wrap gap-2">
              {quest.penaltyCoins && quest.penaltyCoins > 0 && (
                <span>−{quest.penaltyCoins} монет</span>
              )}
              {quest.penaltyRating && quest.penaltyRating > 0 && (
                <span>−{quest.penaltyRating} рейтинга</span>
              )}
            </div>
          </div>
        )}

        {quest.isRepeatable && quest.cooldownHours && quest.cooldownHours > 0 && (
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Кулдаун после сдачи: {quest.cooldownHours} ч.
          </div>
        )}

        <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100 dark:border-[#30363d]">
          <button
            onClick={onEdit}
            className="flex-1 border border-slate-300 dark:border-[#30363d] text-slate-700 dark:text-slate-300 hover:border-brand-500 text-sm px-4 py-2 rounded-lg font-medium transition"
          >
            Изменить
          </button>
          <button
            onClick={onExtend}
            className="flex-1 border border-slate-300 dark:border-[#30363d] text-slate-700 dark:text-slate-300 hover:border-brand-500 text-sm px-4 py-2 rounded-lg font-medium transition"
          >
            Продлить
          </button>
          <button
            onClick={onPenalize}
            className="flex-1 border border-slate-300 dark:border-[#30363d] text-slate-700 dark:text-slate-300 hover:border-red-400 hover:text-red-600 text-sm px-4 py-2 rounded-lg font-medium transition"
          >
            Штраф
          </button>
        </div>
      </div>
    </div>
  )
}

// ==========================================
// === Модалка отклонения
// ==========================================
function RejectModal({
  quest,
  onClose,
  onReject,
}: {
  quest: UserQuestForReview
  onClose: () => void
  onReject: (r: string) => void
}) {
  const [reason, setReason] = useState('')
  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (reason.trim()) onReject(reason.trim())
        }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-[#161b22] rounded-xl w-full max-w-md p-6 space-y-4"
      >
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Отклонить квест
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {quest.questTitle} · {quest.userName}
          </p>
        </div>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          placeholder="Укажите причину отклонения"
          required
          className="w-full border border-slate-300 dark:border-[#30363d] dark:bg-[#0d1117] dark:text-white rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:border-brand-500"
        />
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm text-slate-600 dark:text-slate-300"
          >
            Отмена
          </button>
          <button
            type="submit"
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            Отклонить
          </button>
        </div>
      </form>
    </div>
  )
}