import { useState } from 'react'
import { useAuth } from '../../store/auth'
import { useFetch } from '../../hooks/useFetch'
import {
  getQuestsForReview,
  approveQuest,
  rejectQuest,
  getAvailableQuests,
  deleteQuest,
  type UserQuestForReview,
} from '../../api/quests'
import { notify } from '../../lib/notify'
import { confirmDialog } from '../../lib/confirm'
import CreateQuestModal from '../../components/CreateQuestModal'
import EditQuestModal from '../../components/EditQuestModal'
import ApplyQuestPenaltyModal from '../../components/ApplyQuestPenaltyModal'
import ExtendDeadlineModal from '../../components/ExtendDeadlineModal'
import { IconCheck, IconX, IconPlus } from '../../components/Icons'
import type { QuestListItem } from '../../types'

type Tab = 'templates' | 'review'

export default function ManageQuestsTab() {
  const user = useAuth((s) => s.user)!
  const [tab, setTab] = useState<Tab>('templates')

  const review = useFetch(() => getQuestsForReview(user.id), [user.id])
  const templates = useFetch(() => getAvailableQuests(user.id), [user.id])

  const [reviewItems, setReviewItems] = useState<UserQuestForReview[] | null>(null)
  const [processing, setProcessing] = useState<number | null>(null)
  const [rejecting, setRejecting] = useState<UserQuestForReview | null>(null)

  const [creating, setCreating] = useState(false)
  const [editing, setEditing] = useState<QuestListItem | null>(null)
  const [extending, setExtending] = useState<QuestListItem | null>(null)
  const [penalizing, setPenalizing] = useState<QuestListItem | null>(null)

  const reviewList = reviewItems ?? review.data ?? []
  const templateList = templates.data ?? []

  async function handleApprove(id: number, name: string) {
    setProcessing(id)
    try {
      await approveQuest(id, user.id)
      setReviewItems(reviewList.filter((q) => q.id !== id))
      notify.success(`Квест принят · ${name}`)
    } catch (e) {
      notify.error(e)
    } finally {
      setProcessing(null)
    }
  }

  async function handleReject(id: number, reason: string, name: string) {
    setProcessing(id)
    try {
      await rejectQuest(id, user.id, reason)
      setReviewItems(reviewList.filter((q) => q.id !== id))
      setRejecting(null)
      notify.info(`Квест отклонён · ${name}`)
    } catch (e) {
      notify.error(e)
    } finally {
      setProcessing(null)
    }
  }

  async function handleDelete(questId: number, title: string) {
    const ok = await confirmDialog({
      title: 'Удалить квест?',
      message: `«${title}» будет деактивирован. Назначения останутся в истории.`,
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

  return (
    <div className="space-y-4">
      <div className="border-b border-slate-200 dark:border-[#30363d]">
        <div className="flex gap-1 -mb-px">
          <button
            onClick={() => setTab('templates')}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 ${
              tab === 'templates'
                ? 'border-brand-600 text-brand-700 dark:text-brand-400'
                : 'border-transparent text-slate-500'
            }`}
          >
            Шаблоны ({templateList.length})
          </button>
          <button
            onClick={() => setTab('review')}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 flex items-center gap-2 ${
              tab === 'review'
                ? 'border-brand-600 text-brand-700 dark:text-brand-400'
                : 'border-transparent text-slate-500'
            }`}
          >
            На проверке
            {reviewList.length > 0 && (
              <span className="text-xs bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 px-1.5 rounded-full">
                {reviewList.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {tab === 'templates' && (
        <>
          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-500 dark:text-slate-400">
              Всего квестов: {templateList.length}
            </div>
            <button
              onClick={() => setCreating(true)}
              className="bg-brand-600 hover:bg-brand-700 text-white rounded-md px-4 py-2 text-sm font-medium inline-flex items-center gap-1.5"
            >
              <IconPlus size={14} />
              Создать квест
            </button>
          </div>

          {templates.loading && <div className="text-slate-500">Загрузка...</div>}

          {!templates.loading && templateList.length === 0 && (
            <div className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-[#30363d] p-8 text-center text-sm text-slate-500">
              Квестов пока нет
            </div>
          )}

          <div className="space-y-2">
            {templateList.map((q) => (
              <div
                key={q.questId}
                className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-[#30363d] p-4"
              >
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="font-medium text-slate-900 dark:text-white">
                        {q.title}
                      </div>
                      {q.isMandatory && (
                        <span className="text-xs bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 px-1.5 py-0.5 rounded border border-red-200 dark:border-red-500/30">
                          Принудительный
                        </span>
                      )}
                      {q.deadline && (
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          до {new Date(q.deadline).toLocaleString('ru-RU')}
                        </span>
                      )}
                    </div>
                    {q.description && (
                      <div className="text-sm text-slate-600 dark:text-slate-300 mt-1 line-clamp-2">
                        {q.description}
                      </div>
                    )}
                    <div className="flex flex-wrap gap-3 text-xs text-slate-500 dark:text-slate-400 mt-2">
                      <span className="text-amber-600 dark:text-amber-400 font-medium">
                        +{q.rewardCoins.toFixed(0)} монет
                      </span>
                      {q.rewardRating && q.rewardRating > 0 && (
                        <span className="text-brand-600 dark:text-brand-400">
                          +{q.rewardRating.toFixed(1)} рейтинга
                        </span>
                      )}
                      {q.penaltyCoins && q.penaltyCoins > 0 && (
                        <span className="text-red-600 dark:text-red-400">
                          −{q.penaltyCoins} монет при провале
                        </span>
                      )}
                      {q.penaltyRating && q.penaltyRating > 0 && (
                        <span className="text-red-600 dark:text-red-400">
                          −{q.penaltyRating} рейтинга при провале
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-1.5 flex-wrap shrink-0">
                    <button
                      onClick={() => setEditing(q)}
                      className="text-xs px-2.5 py-1.5 border border-slate-300 dark:border-[#30363d] rounded text-slate-700 dark:text-slate-300 hover:border-brand-500"
                    >
                      Изменить
                    </button>
                    <button
                      onClick={() => setExtending(q)}
                      className="text-xs px-2.5 py-1.5 border border-slate-300 dark:border-[#30363d] rounded text-slate-700 dark:text-slate-300 hover:border-brand-500"
                    >
                      Продлить
                    </button>
                    {q.isMandatory && (q.penaltyCoins || q.penaltyRating) && (
                      <button
                        onClick={() => setPenalizing(q)}
                        className="text-xs px-2.5 py-1.5 border border-red-300 dark:border-red-500/30 rounded text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10"
                      >
                        Штраф
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(q.questId, q.title)}
                      className="text-xs px-2.5 py-1.5 border border-red-300 dark:border-red-500/30 rounded text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10"
                    >
                      Удалить
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {tab === 'review' && (
        <>
          {reviewList.length === 0 ? (
            <div className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-[#30363d] p-8 text-center">
              <div className="flex justify-center mb-2 text-brand-400">
                <IconCheck size={40} />
              </div>
              <div className="text-sm text-slate-500">Всё проверено</div>
            </div>
          ) : (
            <div className="space-y-2">
              {reviewList.map((q) => (
                <div
                  key={q.id}
                  className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-[#30363d] p-4"
                >
                  <div className="font-medium">{q.questTitle}</div>
                  <div className="text-sm text-slate-600 dark:text-slate-300 mt-0.5">
                    Сотрудник: <strong>{q.userName}</strong>
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    Сдан:{' '}
                    {q.submittedAt
                      ? new Date(q.submittedAt).toLocaleString('ru-RU')
                      : '—'}
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => handleApprove(q.id, q.userName)}
                      disabled={processing === q.id}
                      className="flex-1 bg-brand-600 hover:bg-brand-700 text-white text-sm px-3 py-2 rounded-md disabled:opacity-50 inline-flex items-center justify-center gap-1.5"
                    >
                      <IconCheck size={14} /> Принять
                    </button>
                    <button
                      onClick={() => setRejecting(q)}
                      disabled={processing === q.id}
                      className="flex-1 border border-red-300 text-red-600 text-sm px-3 py-2 rounded-md disabled:opacity-50 inline-flex items-center justify-center gap-1.5"
                    >
                      <IconX size={14} /> Отклонить
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

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

      {extending && (
        <ExtendDeadlineModal
          quest={extending}
          onClose={() => setExtending(null)}
          onSaved={() => {
            setExtending(null)
            window.location.reload()
          }}
        />
      )}

      {penalizing && (
        <ApplyQuestPenaltyModal
          quest={penalizing}
          onClose={() => setPenalizing(null)}
          onApplied={() => {
            setPenalizing(null)
            window.location.reload()
          }}
        />
      )}

      {rejecting && (
        <RejectModal
          quest={rejecting}
          onClose={() => setRejecting(null)}
          onReject={(r) => handleReject(rejecting.id, r, rejecting.userName)}
        />
      )}
    </div>
  )
}

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
        <h2 className="text-lg font-semibold">Отклонить квест</h2>
        <div className="text-sm text-slate-500">{quest.questTitle}</div>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          placeholder="Причина отклонения"
          required
          className="w-full border rounded-md px-3 py-2 text-sm resize-none"
        />
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose}>
            Отмена
          </button>
          <button
            type="submit"
            className="bg-red-600 text-white px-4 py-2 rounded-md text-sm"
          >
            Отклонить
          </button>
        </div>
      </form>
    </div>
  )
}