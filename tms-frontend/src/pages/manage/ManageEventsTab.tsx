import { useState } from 'react'
import { useAuth } from '../../store/auth'
import { useFetch } from '../../hooks/useFetch'
import { getEvents, cancelEvent, getParticipants } from '../../api/events'
import { notify } from '../../lib/notify'
import { confirmDialog } from '../../lib/confirm'
import CreateEventModal from '../../components/CreateEventModal'
import ApproveEventModal from '../../components/ApproveEventModal'
import RollbackRewardsModal from '../../components/RollbackRewardsModal'
import type { EventDto } from '../../types'

export default function ManageEventsTab() {
  const user = useAuth((s) => s.user)!
  const events = useFetch(() => getEvents(user.id), [user.id])
  const [processing, setProcessing] = useState<number | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [approving, setApproving] = useState<EventDto | null>(null)
  const [rollingBack, setRollingBack] = useState<{ event: EventDto; count: number } | null>(null)

  const [local, setLocal] = useState<EventDto[] | null>(null)
  const list = local ?? events.data ?? []

  async function handleCancel(event: EventDto, mode: 'reject' | 'cancel') {
    const ok = await confirmDialog({
      title: mode === 'reject' ? 'Отклонить событие?' : 'Отменить событие?',
      message:
        mode === 'reject'
          ? `«${event.nameEvent}» не будет опубликовано. Автор увидит отмену.`
          : `«${event.nameEvent}» будет отменено. Участники не смогут записаться.`,
      confirmLabel: mode === 'reject' ? 'Отклонить' : 'Отменить',
      danger: true,
    })
    if (!ok) return

    setProcessing(event.id)
    try {
      const updated = await cancelEvent(event.id)
      setLocal(list.map((e) => (e.id === updated.id ? updated : e)))
      notify.info(
        mode === 'reject'
          ? `Событие отклонено · ${event.nameEvent}`
          : `Событие отменено · ${event.nameEvent}`
      )
    } catch (e) {
      notify.error(e)
    } finally {
      setProcessing(null)
    }
  }

  async function handleRollbackClick(event: EventDto) {
    try {
      const parts = await getParticipants(event.id)
      setRollingBack({ event, count: parts.length })
    } catch {
      setRollingBack({ event, count: 0 })
    }
  }

  const pending = list.filter((e) => e.eventStatus === 'NEW')
  const completed = list.filter(
    (e) => e.eventStatus === 'COMPLETED' && e.paidInCoins && e.rewardsGranted
  )

  return (
    <div className="space-y-6">
      {/* На модерации */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-500 dark:text-slate-400">
            На модерации: {pending.length}
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="bg-brand-600 hover:bg-brand-700 text-white rounded-md px-4 py-2 text-sm font-medium transition"
          >
            + Создать событие
          </button>
        </div>

        {events.loading && <div className="text-slate-500">Загрузка...</div>}
        {events.error && <div className="text-red-600">{events.error}</div>}

        {!events.loading && pending.length === 0 && (
          <div className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-[#30363d] p-6 text-center">
            <div className="text-slate-400 dark:text-slate-500 text-sm">
              Нет событий на модерации
            </div>
          </div>
        )}

        {pending.map((e) => (
          <div
            key={e.id}
            className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-[#30363d] p-4 sm:p-5 flex flex-col gap-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="font-medium text-slate-900 dark:text-white">
                  {e.nameEvent}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                  {e.category} · {e.organizerName}
                </div>
                <div className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                  {new Date(e.fromTime).toLocaleString('ru-RU')} —{' '}
                  {new Date(e.toTime).toLocaleString('ru-RU')}
                </div>
              </div>
            </div>

            {e.commentToAdmin && (
              <div className="bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs p-2 rounded border border-amber-200 dark:border-amber-500/30">
                <span className="font-medium">Пожелания организатора: </span>
                {e.commentToAdmin}
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => setApproving(e)}
                className="flex-1 sm:flex-none bg-brand-600 hover:bg-brand-700 text-white text-sm px-4 py-2 rounded-md font-medium transition"
              >
                Одобрить
              </button>
              <button
                onClick={() => handleCancel(e, 'reject')}
                disabled={processing === e.id}
                className="flex-1 sm:flex-none border border-red-300 dark:border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 text-sm px-4 py-2 rounded-md font-medium disabled:opacity-50 transition"
              >
                {processing === e.id ? '...' : 'Отклонить'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Завершённые с наградами (откат) */}
      {completed.length > 0 && (
        <div className="space-y-3">
          <div className="text-sm text-slate-500 dark:text-slate-400">
            Завершённые с наградами: {completed.length}
          </div>

          {completed.map((e) => (
            <div
              key={e.id}
              className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-[#30363d] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-3"
            >
              <div className="flex-1 min-w-0">
                <div className="font-medium text-slate-900 dark:text-white">
                  {e.nameEvent}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {new Date(e.toTime).toLocaleDateString('ru-RU')} · {e.organizerName}
                </div>
                <div className="text-xs mt-1">
                  {e.rewardCoins && (
                    <span className="text-amber-600 dark:text-amber-400 mr-2">
                      +{e.rewardCoins.toFixed(0)} монет
                    </span>
                  )}
                  {e.rewardRating && (
                    <span className="text-brand-600 dark:text-brand-400">
                      +{e.rewardRating.toFixed(1)} рейтинга
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => handleRollbackClick(e)}
                className="border border-red-300 dark:border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 text-sm px-4 py-2 rounded-md font-medium transition shrink-0"
              >
                Откатить награды
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Модалки */}
      {showCreate && (
        <CreateEventModal
          actorId={user.id}
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            setShowCreate(false)
            notify.success('Событие создано')
            setTimeout(() => window.location.reload(), 400)
          }}
        />
      )}

      {approving && (
        <ApproveEventModal
          event={approving}
          actorId={user.id}
          onClose={() => setApproving(null)}
          onApproved={() => {
            notify.success(`Событие одобрено · ${approving.nameEvent}`)
            setApproving(null)
            setTimeout(() => window.location.reload(), 400)
          }}
        />
      )}

      {rollingBack && (
        <RollbackRewardsModal
          event={rollingBack.event}
          participantCount={rollingBack.count}
          actorId={user.id}
          onClose={() => setRollingBack(null)}
          onRolledBack={() => {
            notify.warning(`Награды откачены · ${rollingBack.event.nameEvent}`)
            setRollingBack(null)
            setTimeout(() => window.location.reload(), 400)
          }}
        />
      )}
    </div>
  )
}