import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '../store/auth'
import { getAvailableQuests, startQuest, submitQuest } from '../api/quests'
import { notify, getErrorMessage } from '../lib/notify'
import type { QuestListItem } from '../types'

type Tab = 'available' | 'in_progress' | 'review' | 'completed' | 'rejected'

const STATUS_BADGES: Record<string, string> = {
  IN_PROGRESS:
    'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400',
  PENDING_REVIEW:
    'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400',
  COMPLETED:
    'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
  REJECTED:
    'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400',
  CANCELLED:
    'bg-slate-100 dark:bg-slate-500/10 text-slate-600 dark:text-slate-400',
}

const STATUS_LABELS: Record<string, string> = {
  IN_PROGRESS: 'В работе',
  PENDING_REVIEW: 'На проверке',
  COMPLETED: 'Выполнен',
  REJECTED: 'Отклонён',
  CANCELLED: 'Отменён',
}

function formatDeadline(iso: string) {
  return new Date(iso).toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function daysLeft(iso: string) {
  const diff = new Date(iso).getTime() - Date.now()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export default function Quests() {
  const user = useAuth((s) => s.user)!

  const [quests, setQuests] = useState<QuestListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tab, setTab] = useState<Tab>('available')
  const [processing, setProcessing] = useState<number | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    getAvailableQuests(user.id)
      .then((data) => !cancelled && setQuests(data))
      .catch((e) => !cancelled && setError(getErrorMessage(e)))
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [user.id])

  const grouped = useMemo(() => {
    const g: Record<Tab, QuestListItem[]> = {
      available: [],
      in_progress: [],
      review: [],
      completed: [],
      rejected: [],
    }
    quests.forEach((q) => {
      if (q.myStatus === null) g.available.push(q)
      else if (q.myStatus === 'IN_PROGRESS') g.in_progress.push(q)
      else if (q.myStatus === 'PENDING_REVIEW') g.review.push(q)
      else if (q.myStatus === 'COMPLETED') g.completed.push(q)
      else g.rejected.push(q)
    })
    Object.values(g).forEach((arr) =>
      arr.sort((a, b) => b.rewardCoins - a.rewardCoins || a.title.localeCompare(b.title))
    )
    return g
  }, [quests])

  const stats = useMemo(() => {
    const completed = grouped.completed.length
    const active = grouped.in_progress.length + grouped.review.length
    const earned = grouped.completed.reduce((sum, q) => sum + q.rewardCoins, 0)
    return { completed, active, earned }
  }, [grouped])

  async function handleStart(questId: number) {
    setProcessing(questId)
    try {
      await startQuest(questId, user.id)
      setQuests((prev) =>
        prev.map((q) =>
          q.questId === questId
            ? { ...q, myStatus: 'IN_PROGRESS', nextAvailableAt: null }
            : q
        )
      )
      notify.success('Квест взят в работу')
    } catch (e) {
      notify.error(e)
    } finally {
      setProcessing(null)
    }
  }

  async function handleSubmit(questId: number) {
    setProcessing(questId)
    try {
      await submitQuest(questId, user.id)
      setQuests((prev) =>
        prev.map((q) =>
          q.questId === questId ? { ...q, myStatus: 'PENDING_REVIEW' } : q
        )
      )
      notify.success('Квест отправлен на проверку')
    } catch (e) {
      notify.error(e)
    } finally {
      setProcessing(null)
    }
  }

  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: 'available', label: 'Доступные', count: grouped.available.length },
    { id: 'in_progress', label: 'В работе', count: grouped.in_progress.length },
    { id: 'review', label: 'На проверке', count: grouped.review.length },
    { id: 'completed', label: 'Выполненные', count: grouped.completed.length },
    { id: 'rejected', label: 'Отклонённые', count: grouped.rejected.length },
  ]

  const currentList = grouped[tab]

  return (
    <div className="space-y-6">
      {/* HERO */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-500 via-brand-600 to-accent-600 text-white p-6 sm:p-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="relative">
          <div className="text-xs text-white/80 uppercase tracking-wider font-medium mb-1.5">
            Квесты компании
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold">Задания и челленджи</h1>
          <p className="text-sm text-white/85 mt-1.5 max-w-lg">
            Выполняйте квесты, получайте монеты и рейтинг, прокачивайте свой профиль
          </p>

          <div className="grid grid-cols-3 gap-3 sm:gap-5 mt-7">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/20">
              <div className="text-[11px] text-white/70 uppercase tracking-wider">
                Выполнено
              </div>
              <div className="text-2xl sm:text-3xl font-bold mt-0.5">
                {stats.completed}
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/20">
              <div className="text-[11px] text-white/70 uppercase tracking-wider">
                Активных
              </div>
              <div className="text-2xl sm:text-3xl font-bold mt-0.5">
                {stats.active}
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/20">
              <div className="text-[11px] text-white/70 uppercase tracking-wider">
                Заработано
              </div>
              <div className="text-2xl sm:text-3xl font-bold mt-0.5">
                {stats.earned}
                <span className="text-sm font-medium text-white/70 ml-1">монет</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {loading && (
        <div className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-[#30363d] p-8 text-center text-slate-500">
          Загрузка квестов...
        </div>
      )}
      {error && (
        <div className="bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 rounded-xl border border-red-200 dark:border-red-500/30 p-4 text-sm">
          {error}
        </div>
      )}

      {!loading && !error && quests.length > 0 && (
        <div className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-[#30363d] p-1.5 flex gap-1 overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              disabled={t.count === 0 && t.id !== 'available'}
              className={`flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition disabled:opacity-40 disabled:cursor-not-allowed ${
                tab === t.id
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#21262d]'
              }`}
            >
              <span>{t.label}</span>
              {t.count > 0 && (
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-full min-w-[20px] text-center ${
                    tab === t.id
                      ? 'bg-white/25 text-white'
                      : 'bg-slate-100 dark:bg-[#21262d] text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {!loading && !error && currentList.length === 0 && (
        <div className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-[#30363d] p-10 sm:p-14 text-center">
          <div className="text-slate-600 dark:text-slate-300 text-sm font-medium">
            {tab === 'available' && 'Нет доступных квестов'}
            {tab === 'in_progress' && 'Нет квестов в работе'}
            {tab === 'review' && 'Нет квестов на проверке'}
            {tab === 'completed' && 'Вы пока не выполнили ни одного квеста'}
            {tab === 'rejected' && 'Отклонённых квестов нет'}
          </div>
          <div className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-xs mx-auto">
            {tab === 'available' && 'Как только появятся новые задания — они отобразятся здесь'}
            {tab === 'in_progress' && 'Возьмите квест из раздела «Доступные»'}
            {tab === 'completed' && 'Начните выполнять квесты, чтобы получать награды'}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {currentList.map((q) => (
          <QuestCard
            key={q.questId}
            quest={q}
            processing={processing === q.questId}
            onStart={() => handleStart(q.questId)}
            onSubmit={() => handleSubmit(q.questId)}
          />
        ))}
      </div>
    </div>
  )
}

// ==========================================
// === Карточка квеста
// ==========================================
function QuestCard({
  quest,
  processing,
  onStart,
  onSubmit,
}: {
  quest: QuestListItem
  processing: boolean
  onStart: () => void
  onSubmit: () => void
}) {
  const status = quest.myStatus
  const isOverdue = quest.deadline && new Date(quest.deadline).getTime() < Date.now()
  const days = quest.deadline ? daysLeft(quest.deadline) : null
  const isUrgent = days !== null && days >= 0 && days <= 2 && !isOverdue

  return (
    <div
      className={`bg-white dark:bg-[#161b22] rounded-xl border p-5 flex flex-col ${
        quest.isMandatory
          ? 'border-red-200 dark:border-red-500/30'
          : 'border-slate-200 dark:border-[#30363d]'
      }`}
    >
      {/* Заголовок и статус */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap mb-1">
            {quest.isMandatory && (
              <span className="text-[10px] bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold">
                Обязательный
              </span>
            )}
            {quest.isRepeatable && (
              <span className="text-[10px] bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 px-2 py-0.5 rounded-full font-semibold">
                Повторяемый
              </span>
            )}
          </div>
          <h3 className="font-semibold text-slate-900 dark:text-white leading-snug">
            {quest.title}
          </h3>
        </div>
        {status && (
          <span
            className={`shrink-0 text-[10px] px-2 py-1 rounded-full font-semibold ${
              STATUS_BADGES[status]
            }`}
          >
            {STATUS_LABELS[status]}
          </span>
        )}
      </div>

      {quest.description && (
        <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-3 mb-3">
          {quest.description}
        </p>
      )}

      {quest.deadline && (
        <div
          className={`text-xs mb-3 ${
            isOverdue
              ? 'text-red-600 dark:text-red-400 font-semibold'
              : isUrgent
              ? 'text-amber-600 dark:text-amber-400 font-medium'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          {isOverdue
            ? 'Просрочен · '
            : days !== null && days > 0
            ? `${days} ${days === 1 ? 'день' : days < 5 ? 'дня' : 'дней'} до конца · `
            : 'Заканчивается сегодня · '}
          {formatDeadline(quest.deadline)}
        </div>
      )}

      {/* Награда */}
      <div className="flex flex-wrap gap-2 mb-3">
        <div className="bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 px-3 py-1.5 rounded-lg text-sm font-semibold">
          +{quest.rewardCoins.toFixed(0)}{' '}
          <span className="text-xs font-medium">монет</span>
        </div>
        {quest.rewardRating && quest.rewardRating > 0 && (
          <div className="bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-400 px-3 py-1.5 rounded-lg text-xs font-semibold">
            +{quest.rewardRating.toFixed(1)} рейтинга
          </div>
        )}
      </div>

      {/* Штраф */}
      {quest.isMandatory &&
        (quest.penaltyCoins || quest.penaltyRating) &&
        status !== 'COMPLETED' &&
        status !== 'CANCELLED' && (
          <div className="bg-red-50 dark:bg-red-500/10 rounded-lg px-3 py-2 mb-3">
            <div className="text-[11px] font-semibold text-red-700 dark:text-red-400 mb-0.5 uppercase tracking-wider">
              При провале
            </div>
            <div className="text-xs text-red-600 dark:text-red-400 flex flex-wrap gap-2">
              {quest.penaltyCoins && quest.penaltyCoins > 0 && (
                <span>−{quest.penaltyCoins} монет</span>
              )}
              {quest.penaltyRating && quest.penaltyRating > 0 && (
                <span>−{quest.penaltyRating} рейтинга</span>
              )}
            </div>
          </div>
        )}

      {/* Причина отклонения */}
      {status === 'REJECTED' && quest.adminComment && (
        <div className="bg-red-50 dark:bg-red-500/10 rounded-lg px-3 py-2 mb-3">
          <div className="text-[11px] font-semibold text-red-700 dark:text-red-400 mb-0.5">
            Причина отклонения
          </div>
          <div className="text-xs text-red-600 dark:text-red-400">
            {quest.adminComment}
          </div>
        </div>
      )}

      {/* Кнопка действия */}
      <div className="mt-auto pt-3 border-t border-slate-100 dark:border-[#30363d]">
        {status === null && (
          <button
            onClick={onStart}
            disabled={processing}
            className="w-full bg-brand-600 hover:bg-brand-700 text-white rounded-lg py-2.5 text-sm font-semibold disabled:opacity-50 transition"
          >
            {processing ? 'Загрузка...' : 'Взять квест'}
          </button>
        )}

        {(status === 'IN_PROGRESS' || status === 'REJECTED') && (
          <button
            onClick={onSubmit}
            disabled={processing}
            className="w-full bg-brand-600 hover:bg-brand-700 text-white rounded-lg py-2.5 text-sm font-semibold disabled:opacity-50 transition"
          >
            {processing
              ? 'Загрузка...'
              : status === 'REJECTED'
              ? 'Сдать повторно'
              : 'Отправить на проверку'}
          </button>
        )}

        {status === 'PENDING_REVIEW' && (
          <div className="text-sm text-amber-600 dark:text-amber-400 py-2.5 bg-amber-50 dark:bg-amber-500/10 rounded-lg font-medium text-center">
            Ожидает проверки
          </div>
        )}

        {status === 'COMPLETED' && (
          <div className="text-sm text-emerald-600 dark:text-emerald-400 py-2.5 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg font-semibold text-center">
            Выполнено · награда получена
          </div>
        )}

        {status === 'CANCELLED' && (
          <div className="text-sm text-slate-500 dark:text-slate-400 py-2.5 bg-slate-50 dark:bg-[#0d1117] rounded-lg font-medium text-center">
            Квест отменён
          </div>
        )}
      </div>
    </div>
  )
}