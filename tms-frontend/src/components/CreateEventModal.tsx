import { useState } from 'react'
import { createEvent } from '../api/events'
import { useAuth } from '../store/auth'
import { notify } from '../lib/notify'
import { IconX } from './Icons'

interface Props {
  actorId: number
  onClose: () => void
  onCreated: () => void
}

export default function CreateEventModal({ actorId, onClose, onCreated }: Props) {
  const user = useAuth((s) => s.user)!
  const canSetRewards = ['ADMIN', 'HR'].includes(user.role)

  const [nameEvent, setNameEvent] = useState('')
  const [category, setCategory] = useState('IT')
  const [description, setDescription] = useState('')
  const [eventPlace, setEventPlace] = useState('')
  const [fromTime, setFromTime] = useState('')
  const [toTime, setToTime] = useState('')
  const [commentToAdmin, setCommentToAdmin] = useState('')
  const [paidInCoins, setPaidInCoins] = useState(false)
  const [rewardCoins, setRewardCoins] = useState(100)
  const [rewardRating, setRewardRating] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!fromTime || !toTime) {
      setError('Укажите даты')
      return
    }
    if (new Date(fromTime) >= new Date(toTime)) {
      setError('Конец должен быть позже начала')
      return
    }
    setLoading(true)
    try {
      const payload: any = {
        organizerId: actorId,
        fromTime: fromTime.length === 16 ? fromTime + ':00' : fromTime,
        toTime: toTime.length === 16 ? toTime + ':00' : toTime,
        category,
        nameEvent,
        description,
        eventPlace,
        commentToAdmin,
      }
      if (canSetRewards) {
        payload.paidInCoins = paidInCoins
        payload.rewardCoins = paidInCoins ? rewardCoins : null
        payload.rewardRating = paidInCoins ? rewardRating : null
      }
      await createEvent(payload)
      notify.success('Событие создано')
      onCreated()
    } catch (e: any) {
      const msg = e.response?.data || 'Ошибка создания'
      setError(msg)
      notify.error(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 overflow-y-auto"
      onClick={onClose}
    >
      <form
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-[#161b22] rounded-xl w-full max-w-lg p-6 space-y-4 my-8"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Новое событие
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {canSetRewards
                ? 'После создания событие можно сразу назначить'
                : 'После создания событие отправится на модерацию. Награду назначит администратор.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-900 dark:hover:text-white p-1"
          >
            <IconX size={18} />
          </button>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 text-sm p-3 rounded border border-red-200 dark:border-red-500/30">
            {error}
          </div>
        )}

        <div>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Название *
          </label>
          <input
            value={nameEvent}
            onChange={(e) => setNameEvent(e.target.value)}
            required
            className="w-full border border-slate-300 dark:border-[#30363d] dark:bg-[#0d1117] dark:text-white rounded-md px-3 py-2 mt-1 text-sm focus:outline-none focus:border-brand-500"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Категория *
          </label>
          <input
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
            className="w-full border border-slate-300 dark:border-[#30363d] dark:bg-[#0d1117] dark:text-white rounded-md px-3 py-2 mt-1 text-sm focus:outline-none focus:border-brand-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Начало *
            </label>
            <input
              type="datetime-local"
              value={fromTime}
              onChange={(e) => setFromTime(e.target.value)}
              required
              className="w-full border border-slate-300 dark:border-[#30363d] dark:bg-[#0d1117] dark:text-white rounded-md px-3 py-2 mt-1 text-sm focus:outline-none focus:border-brand-500"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Конец *
            </label>
            <input
              type="datetime-local"
              value={toTime}
              onChange={(e) => setToTime(e.target.value)}
              required
              className="w-full border border-slate-300 dark:border-[#30363d] dark:bg-[#0d1117] dark:text-white rounded-md px-3 py-2 mt-1 text-sm focus:outline-none focus:border-brand-500"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Место
          </label>
          <input
            value={eventPlace}
            onChange={(e) => setEventPlace(e.target.value)}
            className="w-full border border-slate-300 dark:border-[#30363d] dark:bg-[#0d1117] dark:text-white rounded-md px-3 py-2 mt-1 text-sm focus:outline-none focus:border-brand-500"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Описание
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="w-full border border-slate-300 dark:border-[#30363d] dark:bg-[#0d1117] dark:text-white rounded-md px-3 py-2 mt-1 text-sm resize-none focus:outline-none focus:border-brand-500"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {canSetRewards ? 'Комментарий' : 'Пожелания администратору по награде'}
          </label>
          <textarea
            value={commentToAdmin}
            onChange={(e) => setCommentToAdmin(e.target.value)}
            rows={2}
            placeholder={
              canSetRewards
                ? 'Например: прошу согласовать бюджет'
                : 'Например: прошу начислить 100 монет и 1 рейтинг каждому участнику'
            }
            className="w-full border border-slate-300 dark:border-[#30363d] dark:bg-[#0d1117] dark:text-white rounded-md px-3 py-2 mt-1 text-sm resize-none focus:outline-none focus:border-brand-500"
          />
        </div>

        {canSetRewards ? (
          <>
            <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={paidInCoins}
                onChange={(e) => setPaidInCoins(e.target.checked)}
              />
              Начислить награду участникам
            </label>

            {paidInCoins && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Монет
                  </label>
                  <input
                    type="number"
                    value={rewardCoins}
                    onChange={(e) => setRewardCoins(Number(e.target.value))}
                    min={1}
                    className="w-full border border-slate-300 dark:border-[#30363d] dark:bg-[#0d1117] dark:text-white rounded-md px-3 py-2 mt-1 text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Рейтинга
                  </label>
                  <input
                    type="number"
                    value={rewardRating}
                    onChange={(e) => setRewardRating(Number(e.target.value))}
                    min={0}
                    step={0.5}
                    className="w-full border border-slate-300 dark:border-[#30363d] dark:bg-[#0d1117] dark:text-white rounded-md px-3 py-2 mt-1 text-sm"
                  />
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="bg-slate-50 dark:bg-[#0d1117] text-xs text-slate-500 dark:text-slate-400 p-3 rounded border border-slate-200 dark:border-[#30363d]">
            Награду (монеты и рейтинг) назначает администратор или HR при одобрении события.
          </div>
        )}

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
            disabled={loading}
            className="bg-brand-600 hover:bg-brand-700 text-white rounded-md px-4 py-2 text-sm font-medium disabled:opacity-50 transition"
          >
            {loading ? 'Создание...' : canSetRewards ? 'Создать' : 'Отправить на модерацию'}
          </button>
        </div>
      </form>
    </div>
  )
}