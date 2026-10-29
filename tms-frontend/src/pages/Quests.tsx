import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '../store/auth'
import { getAvailableQuests, startQuest, submitQuest } from '../api/quests'
import { notify, getErrorMessage } from '../lib/notify'
import type { QuestListItem } from '../types'
import {
  IconTarget,
  IconCheck,
  IconTrophy,
  IconChart,
  IconArrowRight,
  IconClock,
} from '../components/Icons'

type Tab = 'available' | 'in_progress' | 'review' | 'completed' | 'rejected'

const STATUS_META: Record<string, { label: string; className: string }> = {
  IN_PROGRESS: {
    label: 'В работе',
    className:
      'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/30',
  },
  PENDING_REVIEW: {
    label: 'На проверке',
    className:
      'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30',
  },
  COMPLETED: {
    label: 'Выполнен',
    className:
      'bg-brand-50 text-brand-700 border-brand-200 dark:bg-brand-500/10 dark:text-brand-400 dark:border-brand-500/30',
  },
  REJECTED: {
    label: 'Отклонён',
    className:
      'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/30',
  },
  CANCELLED: {
    label: 'Отменён',
    className:
      'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/30',
  },
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
          q.questId === questId ? { ...q, myStatus: 'IN_PROGRESS', nextAvailableAt: null } : q
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
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-500 via-emerald-600 to-teal-700 text-white p-6 sm:p-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="relative">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <IconTarget size={20} className="text-white/80" />
                <span className="text-xs text-white/80 uppercase tracking-wider">
                  Квесты
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold">Задания компании</h1>
              <p className="text-sm text-white/80 mt-1">
                Выполняйте квесты и получайте монеты и рейтинг
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-6">
            <div>
              <div className="text-xs text-white/70 uppercase tracking-wider">
                Выполнено
              </div>
              <div className="text-2xl sm:text-3xl font-bold mt-1">
                {stats.completed}
              </div>
            </div>
            <div>
              <div className="text-xs text-white/70 uppercase tracking-wider">
                В работе
              </div>
              <div className="text-2xl sm:text-3xl font-bold mt-1">
                {stats.active}
              </div>
            </div>
            <div>
              <div className="text-xs text-white/70 uppercase tracking-wider">
                Заработано
              </div>
              <div className="text-2xl sm:text-3xl font-bold mt-1">
                {stats.earned}
                <span className="text-base font-medium text-white/70"> монет</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {loading && <div className="text-slate-500">Загрузка...</div>}
      {error && <div className="text-red-600">{error}</div>}

      {!loading && !error && quests.length > 0 && (
        <div className="border-b border-slate-200 dark:border-[#30363d] overflow-x-auto">
          <div className="flex gap-1 -mb-px">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                disabled={t.count === 0}
                className={`px-4 py-2.5 text-sm font-medium transition border-b-2 whitespace-nowrap flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed ${
                  tab === t.id
                    ? 'border-brand-600 text-brand-700 dark:text-brand-400'
                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {t.label}
                {t.count > 0 && (
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded-full min-w-[20px] text-center ${
                      tab === t.id
                        ? 'bg-brand-100 dark:bg-brand-500/20 text-brand-700 dark:text-brand-400'
                        : 'bg-slate-100 dark:bg-[#21262d] text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {t.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {!loading && !error && currentList.length === 0 && (
        <div className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-[#30363d] p-8 sm:p-12 text-center">
          <div className="text-slate-400 dark:text-slate-500 text-sm">
            {tab === 'available' && 'Нет доступных квестов'}
            {tab === 'in_progress' && 'У вас нет квестов в работе'}
            {tab === 'review' && 'Нет квестов на проверке'}
            {tab === 'completed' && 'Вы пока не выполнили ни одного квеста'}
            {tab === 'rejected' && 'Отклонённых квестов нет'}
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
  const meta = status ? STATUS_META[status] : null

  const isOverdue =
    quest.deadline && new Date(quest.deadline).getTime() < Date.now()
  const days = quest.deadline ? daysLeft(quest.deadline) : null
  const hasPenalty =
    quest.isMandatory && (quest.penaltyCoins || quest.penaltyRating)
  const isMandatory = quest.isMandatory

  return (
    <div
      className={`bg-white dark:bg-[#161b22] rounded-xl border p-5 flex flex-col gap-3 ${
        isMandatory
          ? 'border-red-200 dark:border-red-500/30'
          : 'border-slate-200 dark:border-[#30363d]'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5 flex-wrap min-w-0">
          <h3 className="font-semibold text-slate-900 dark:text-white leading-snug">
            {quest.title}
          </h3>
          {isMandatory && (
            <span className="text-[10px] bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 px-1.5 py-0.5 rounded border border-red-200 dark:border-red-500/30 uppercase tracking-wider font-medium">
              Принудит.
            </span>
          )}
          {quest.isRepeatable && (
            <span className="text-[10px] bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 px-1.5 py-0.5 rounded border border-purple-200 dark:border-purple-500/30 uppercase tracking-wider font-medium flex items-center gap-1">
              <IconClock size={10} /> Повторяемый
            </span>
          )}
        </div>
        {meta && (
          <span
            className={`shrink-0 text-xs px-2 py-0.5 rounded border font-medium ${meta.className}`}
          >
            {meta.label}
          </span>
        )}
      </div>

      {quest.description && (
        <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-3">
          {quest.description}
        </p>
      )}

      {quest.deadline && (
        <div
          className={`text-xs flex items-center gap-1.5 flex-wrap ${
            isOverdue
              ? 'text-red-600 dark:text-red-400 font-medium'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <IconClock size={12} />
          Дедлайн: {formatDeadline(quest.deadline)}
          {isOverdue
            ? ' (просрочен)'
            : days !== null && days > 0 && (
                <span className="text-slate-400 dark:text-slate-500">
                  · осталось {days} {days === 1 ? 'день' : days < 5 ? 'дня' : 'дней'}
                </span>
              )}
        </div>
      )}

      {status === 'REJECTED' && quest.adminComment && (
        <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-md px-3 py-2">
          <div className="text-xs font-medium text-red-700 dark:text-red-400 mb-0.5">
            Причина отклонения
          </div>
          <div className="text-xs text-red-600 dark:text-red-400">
            {quest.adminComment}
          </div>
        </div>
      )}

      {hasPenalty && status !== 'COMPLETED' && status !== 'CANCELLED' && (
        <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-md px-3 py-2">
          <div className="text-xs font-medium text-red-700 dark:text-red-400 mb-0.5">
            Штраф при невыполнении
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

      <div className="flex items-center gap-2 flex-wrap pt-1">
        <div className="inline-flex items-center gap-1.5 bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30 px-2.5 py-1 rounded-md text-sm font-semibold">
          <IconTrophy size={14} />+{quest.rewardCoins.toFixed(0)}
        </div>
        <span className="text-xs text-slate-500 dark:text-slate-400">монет</span>
        {quest.rewardRating && quest.rewardRating > 0 && (
          <span className="inline-flex items-center gap-1 bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-400 border border-brand-200 dark:border-brand-500/30 px-2 py-0.5 rounded text-xs font-medium">
            +{quest.rewardRating.toFixed(1)} рейтинга
          </span>
        )}
      </div>

      <div className="mt-auto pt-2">
        {status === null && (
          <button
            onClick={onStart}
            disabled={processing}
            className="w-full bg-brand-600 hover:bg-brand-700 text-white rounded-md py-2 text-sm font-medium disabled:opacity-50 transition"
          >
            {processing ? '...' : 'Взять квест'}
          </button>
        )}

        {(status === 'IN_PROGRESS' || status === 'REJECTED') && (
          <div className="space-y-2">
            {status === 'IN_PROGRESS' && (
              <div className="text-xs text-slate-500 dark:text-slate-400 text-center">
                Выполните задание и отправьте на проверку
              </div>
            )}
            <button
              onClick={onSubmit}
              disabled={processing}
              className="w-full bg-brand-600 hover:bg-brand-700 text-white rounded-md py-2 text-sm font-medium disabled:opacity-50 transition inline-flex items-center justify-center gap-1"
            >
              {processing ? (
                '...'
              ) : (
                <>
                  {status === 'REJECTED' ? 'Сдать повторно' : 'Сдать на проверку'}
                  <IconArrowRight size={14} />
                </>
              )}
            </button>
          </div>
        )}

        {status === 'PENDING_REVIEW' && (
          <div className="flex items-center justify-center gap-1.5 text-sm text-amber-600 dark:text-amber-400 py-2 bg-amber-50 dark:bg-amber-500/10 rounded-md border border-amber-200 dark:border-amber-500/30">
            <IconChart size={14} />
            Ожидает проверки администратором
          </div>
        )}

        {status === 'COMPLETED' && (
          <>
            {quest.nextAvailableAt ? (
              <div className="flex flex-col items-center justify-center py-2 bg-slate-50 dark:bg-[#0d1117] rounded-md border border-slate-200 dark:border-[#30363d]">
                <div className="flex items-center gap-1.5 text-sm text-brand-700 dark:text-brand-400 font-medium">
                  <IconCheck size={14} /> Выполнен
                </div>
                <div className="text-xs text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1">
                  <IconClock size={12} />
                  Повторно доступен: {new Date(quest.nextAvailableAt).toLocaleString('ru-RU', {
                    day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
                  })}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-1.5 text-sm text-brand-700 dark:text-brand-400 py-2 bg-brand-50 dark:bg-brand-500/10 rounded-md border border-brand-200 dark:border-brand-500/30">
                <IconCheck size={14} /> Квест выполнен
              </div>
            )}
          </>
        )}

        {status === 'CANCELLED' && (
          <div className="flex items-center justify-center text-sm text-slate-500 dark:text-slate-400 py-2 bg-slate-50 dark:bg-[#0d1117] rounded-md border border-slate-200 dark:border-[#30363d]">
            Квест отменён администратором
          </div>
        )}
      </div>
    </div>
  )
}