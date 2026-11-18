import { useState } from 'react'
import { useAuth } from '../../store/auth'
import { useFetch } from '../../hooks/useFetch'
import {
  getPendingKnowledgeSubmissions,
  reviewKnowledgeSubmission,
  deleteKnowledgeSubmission,
  getKnowledgeSubmissionDetails,
} from '../../api/knowledge'
import { notify } from '../../lib/notify'
import { confirmDialog } from '../../lib/confirm'
import type { KnowledgeSubmission } from '../../types'
import TextDiff from '../../components/TextDiff'

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function ManageKnowledgeTab() {
  const me = useAuth((s) => s.user)!
  const submissions = useFetch(() => getPendingKnowledgeSubmissions(me.id), [me.id])

  const [local, setLocal] = useState<KnowledgeSubmission[] | null>(null)
  const [reviewing, setReviewing] = useState<KnowledgeSubmission | null>(null)

  const list = local ?? submissions.data ?? []

  async function handleDelete(s: KnowledgeSubmission) {
    const ok = await confirmDialog({
      title: 'Удалить заявку?',
      message: `«${s.title}» будет удалена безвозвратно.`,
      confirmLabel: 'Удалить',
      danger: true,
    })
    if (!ok) return
    try {
      await deleteKnowledgeSubmission(s.id, me.id)
      setLocal(list.filter((x) => x.id !== s.id))
      notify.success('Заявка удалена')
    } catch (e) {
      notify.error(e)
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          Модерация базы знаний
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Проверяйте статьи и правки, назначайте награду авторам
        </p>
      </div>

      {submissions.loading && (
        <div className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-[#30363d] p-8 text-center text-slate-500">
          Загрузка...
        </div>
      )}

      {!submissions.loading && list.length === 0 && (
        <div className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-[#30363d] p-10 text-center">
          <div className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Очередь пуста
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Новые статьи и правки появятся здесь
          </div>
        </div>
      )}

      <div className="space-y-2.5">
        {list.map((s) => (
          <div
            key={s.id}
            className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-[#30363d] p-5"
          >
            <div className="flex items-start justify-between gap-3 flex-wrap mb-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h3 className="font-semibold text-slate-900 dark:text-white">
                    {s.title}
                  </h3>
                  {s.targetArticleId && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 font-semibold">
                      Правка
                    </span>
                  )}
                  {!s.targetArticleId && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 font-semibold">
                      Новая
                    </span>
                  )}
                </div>
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  {s.authorName} · {s.categoryName} · {formatDate(s.createdAt)}
                </div>
              </div>
            </div>

            {s.commentFromAuthor && (
              <div className="text-xs bg-slate-50 dark:bg-[#0d1117] text-slate-600 dark:text-slate-400 p-2.5 rounded mb-2">
                <strong>От автора:</strong> {s.commentFromAuthor}
              </div>
            )}

            {s.targetArticleTitle && (
              <div className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                Правка к статье: <strong>{s.targetArticleTitle}</strong>
              </div>
            )}

            <div className="text-sm text-slate-700 dark:text-slate-300 line-clamp-3 mb-3">
              {s.content}
            </div>

            <div className="flex gap-2 pt-3 border-t border-slate-100 dark:border-[#30363d]">
              <button
                onClick={() => setReviewing(s)}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-sm px-4 py-2 rounded-lg font-medium transition"
              >
                Рассмотреть
              </button>
              <button
                onClick={() => handleDelete(s)}
                className="px-4 py-2 border border-slate-300 dark:border-[#30363d] text-slate-600 dark:text-slate-300 hover:border-red-400 hover:text-red-600 text-sm rounded-lg font-medium transition"
              >
                Удалить
              </button>
            </div>
          </div>
        ))}
      </div>

      {reviewing && (
        <ReviewKnowledgeModal
          submission={reviewing}
          onClose={() => setReviewing(null)}
          onDone={() => {
            setReviewing(null)
            setLocal(list.filter((x) => x.id !== reviewing.id))
          }}
        />
      )}
    </div>
  )
}

function ReviewKnowledgeModal({
  submission,
  onClose,
  onDone,
}: {
  submission: KnowledgeSubmission
  onClose: () => void
  onDone: () => void
}) {
  const me = useAuth((s) => s.user)!

  // Загружаем полные детали (с originalContent) — в списке его нет
  const details = useFetch(
    () => getKnowledgeSubmissionDetails(submission.id, me.id),
    [submission.id, me.id]
  )

  const s = details.data ?? submission
  const isEdit = s.targetArticleId !== null
  const hasOriginal = isEdit && !!s.targetOriginalContent

  const [rewardCoins, setRewardCoins] = useState(isEdit ? 100 : 300)
  const [rewardRating, setRewardRating] = useState(isEdit ? 1 : 2)
  const [rejectionReason, setRejectionReason] = useState('')
  const [mode, setMode] = useState<'approve' | 'reject'>('approve')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function handleApprove() {
    if (rewardCoins < 0 || rewardRating < 0) {
      setError('Награды не могут быть отрицательными')
      return
    }
    setBusy(true)
    setError('')
    try {
      await reviewKnowledgeSubmission(s.id, {
        actorId: me.id,
        approve: true,
        rewardCoins,
        rewardRating,
        rejectionReason: null,
      })
      notify.success(
        `${isEdit ? 'Правка' : 'Статья'} одобрена${
          rewardCoins > 0 ? ` · +${rewardCoins} монет автору` : ''
        }`
      )
      onDone()
    } catch (e: any) {
      setError(e.response?.data || 'Не удалось одобрить')
    } finally {
      setBusy(false)
    }
  }

  async function handleReject() {
    if (!rejectionReason.trim()) {
      setError('Укажите причину отклонения')
      return
    }
    setBusy(true)
    setError('')
    try {
      await reviewKnowledgeSubmission(s.id, {
        actorId: me.id,
        approve: false,
        rewardCoins: null,
        rewardRating: null,
        rejectionReason: rejectionReason.trim(),
      })
      notify.info('Заявка отклонена')
      onDone()
    } catch (e: any) {
      setError(e.response?.data || 'Не удалось отклонить')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-[#161b22] rounded-xl w-full max-w-4xl p-6 space-y-4 my-8 max-h-[90vh] overflow-y-auto"
      >
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            {isEdit ? 'Рассмотрение правки' : 'Рассмотрение статьи'}
          </h2>
          <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {s.authorName} · {s.categoryName}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 text-sm p-3 rounded">
            {error}
          </div>
        )}

        {/* Заголовок */}
        <div>
          <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
            Заголовок
          </div>
          <div className="text-base font-semibold text-slate-900 dark:text-white">
            {s.title}
          </div>
        </div>

        {s.commentFromAuthor && (
          <div className="bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 text-sm p-3 rounded">
            <strong>Комментарий автора:</strong> {s.commentFromAuthor}
          </div>
        )}

        {/* Diff или полный контент */}
        {details.loading ? (
          <div className="bg-slate-50 dark:bg-[#0d1117] border border-slate-200 dark:border-[#30363d] rounded-lg p-8 text-center text-slate-500 text-sm">
            Загрузка содержимого...
          </div>
        ) : isEdit && hasOriginal ? (
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Изменения в тексте
            </div>
            <TextDiff
              oldText={s.targetOriginalContent ?? ''}
              newText={s.content}
              oldTitle={s.targetArticleTitle ?? undefined}
              newTitle={s.title}
            />
          </div>
        ) : isEdit && !hasOriginal ? (
          <div>
            <div className="bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 text-sm p-3 rounded mb-2">
              Не удалось получить исходную версию статьи — показываем только
              новое содержимое
            </div>
            <div className="bg-slate-50 dark:bg-[#0d1117] border border-slate-200 dark:border-[#30363d] rounded-lg p-3 text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap max-h-[400px] overflow-y-auto">
              {s.content}
            </div>
          </div>
        ) : (
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              Содержание
            </div>
            <div className="bg-slate-50 dark:bg-[#0d1117] border border-slate-200 dark:border-[#30363d] rounded-lg p-3 text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap max-h-[400px] overflow-y-auto">
              {s.content}
            </div>
          </div>
        )}

        {/* Переключатель режима */}
        <div className="grid grid-cols-2 gap-2 p-1 rounded-lg bg-slate-100 dark:bg-[#0d1117]">
          <button
            onClick={() => setMode('approve')}
            className={`py-2 text-sm font-medium rounded-md transition ${
              mode === 'approve'
                ? 'bg-white dark:bg-[#161b22] text-emerald-700 dark:text-emerald-400 shadow-sm'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            Одобрить
          </button>
          <button
            onClick={() => setMode('reject')}
            className={`py-2 text-sm font-medium rounded-md transition ${
              mode === 'reject'
                ? 'bg-white dark:bg-[#161b22] text-red-700 dark:text-red-400 shadow-sm'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            Отклонить
          </button>
        </div>

        {mode === 'approve' ? (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Монет автору
                </label>
                <input
                  type="number"
                  value={rewardCoins}
                  onChange={(e) => setRewardCoins(Math.max(0, Number(e.target.value)))}
                  min={0}
                  className="w-full border border-slate-300 dark:border-[#30363d] dark:bg-[#0d1117] dark:text-white rounded-md px-3 py-2 mt-1 text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Рейтинга автору
                </label>
                <input
                  type="number"
                  value={rewardRating}
                  onChange={(e) => setRewardRating(Math.max(0, Number(e.target.value)))}
                  min={0}
                  step={0.5}
                  className="w-full border border-slate-300 dark:border-[#30363d] dark:bg-[#0d1117] dark:text-white rounded-md px-3 py-2 mt-1 text-sm"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {[isEdit ? 100 : 300, isEdit ? 200 : 500, isEdit ? 50 : 100].map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setRewardCoins(v)}
                  className="text-xs px-3 py-1.5 border border-slate-300 dark:border-[#30363d] rounded-lg text-slate-700 dark:text-slate-300 hover:border-brand-500 transition"
                >
                  {v} монет
                </button>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={onClose}
                disabled={busy}
                className="px-4 py-2 text-sm text-slate-600 dark:text-slate-300 disabled:opacity-50"
              >
                Отмена
              </button>
              <button
                onClick={handleApprove}
                disabled={busy || details.loading}
                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-md px-4 py-2 text-sm font-medium disabled:opacity-50 transition"
              >
                {busy ? '...' : 'Одобрить и начислить'}
              </button>
            </div>
          </>
        ) : (
          <>
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Причина отклонения *
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={3}
                placeholder="Например: недостаточно деталей, не по теме, дублирует существующую статью"
                className="w-full border border-slate-300 dark:border-[#30363d] dark:bg-[#0d1117] dark:text-white rounded-md px-3 py-2 mt-1 text-sm resize-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={onClose}
                disabled={busy}
                className="px-4 py-2 text-sm text-slate-600 dark:text-slate-300 disabled:opacity-50"
              >
                Отмена
              </button>
              <button
                onClick={handleReject}
                disabled={busy || !rejectionReason.trim() || details.loading}
                className="bg-red-600 hover:bg-red-700 text-white rounded-md px-4 py-2 text-sm font-medium disabled:opacity-50 transition"
              >
                {busy ? '...' : 'Отклонить'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}