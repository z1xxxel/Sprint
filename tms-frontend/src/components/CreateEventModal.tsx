import { useState, useEffect } from 'react'
import { createEvent } from '../api/events'
import { useAuth } from '../store/auth'
import { notify } from '../lib/notify'
import { IconX } from './Icons'
import { can } from '../lib/permissions'

interface AnchorRect {
  top: number
  left: number
  width: number
  height: number
}

interface Props {
  actorId: number
  defaultFrom?: Date
  defaultTo?: Date
  hideDate?: boolean
  compact?: boolean
  anchorRect?: AnchorRect | null
  canCreateQuest?: boolean
  canCreateSurvey?: boolean
  canCreateNote?: boolean
  onSwitchType?: (type: 'event' | 'quest' | 'survey' | 'note') => void
  onPreviewChange?: (from: Date | null, to: Date | null, title: string) => void
  onClose: () => void
  onCreated: () => void
}

const pad = (n: number) => String(n).padStart(2, '0')

function toLocalInput(d?: Date): string {
  if (!d) return ''
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function toHHMM(d?: Date): string {
  if (!d) return ''
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export default function CreateEventModal({
  actorId,
  defaultFrom,
  defaultTo,
  hideDate,
  compact,
  anchorRect,
  canCreateQuest,
  canCreateSurvey,
  canCreateNote,
  onSwitchType,
  onPreviewChange,
  onClose,
  onCreated,
}: Props) {
  const user = useAuth((s) => s.user)!
  const canSetRewards = can.approveEvents(user.role)

  const [nameEvent, setNameEvent] = useState('')
  const [category, setCategory] = useState('IT')
  const [description, setDescription] = useState('')
  const [eventPlace, setEventPlace] = useState('')
  const [fromTime, setFromTime] = useState(toLocalInput(defaultFrom))
  const [toTime, setToTime] = useState(toLocalInput(defaultTo))
  const [fromTimeOnly, setFromTimeOnly] = useState(toHHMM(defaultFrom) || '10:00')
  const [toTimeOnly, setToTimeOnly] = useState(toHHMM(defaultTo) || '11:00')
  const [commentToAdmin, setCommentToAdmin] = useState('')
  const [paidInCoins, setPaidInCoins] = useState(false)
  const [rewardCoins, setRewardCoins] = useState(100)
  const [rewardRating, setRewardRating] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!hideDate || !onPreviewChange) return
    const baseDate = defaultFrom ?? new Date()
    const dateStr = `${baseDate.getFullYear()}-${pad(baseDate.getMonth() + 1)}-${pad(baseDate.getDate())}`
    const from = new Date(`${dateStr}T${fromTimeOnly}:00`)
    const to = new Date(`${dateStr}T${toTimeOnly}:00`)
    if (!isNaN(from.getTime()) && !isNaN(to.getTime()) && from.getTime() < to.getTime()) {
      onPreviewChange(from, to, nameEvent)
    } else {
      onPreviewChange(null, null, nameEvent)
    }
  }, [fromTimeOnly, toTimeOnly, nameEvent, defaultFrom, hideDate, onPreviewChange])

  // ВАЖНО: cleanup удалён — иначе при переключении на "Заметку" preview стирается
  // и блок в календаре пропадает

  useEffect(() => {
    if (!compact) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [compact, onClose])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    let finalFrom: string
    let finalTo: string

    if (hideDate) {
      const baseDate = defaultFrom ?? new Date()
      const dateStr = `${baseDate.getFullYear()}-${pad(baseDate.getMonth() + 1)}-${pad(baseDate.getDate())}`
      if (!fromTimeOnly || !toTimeOnly) {
        setError('Укажите время начала и окончания')
        return
      }
      finalFrom = `${dateStr}T${fromTimeOnly}:00`
      finalTo = `${dateStr}T${toTimeOnly}:00`
      if (finalFrom >= finalTo) {
        setError('Конец должен быть позже начала')
        return
      }
    } else {
      if (!fromTime || !toTime) {
        setError('Укажите даты')
        return
      }
      if (new Date(fromTime) >= new Date(toTime)) {
        setError('Конец должен быть позже начала')
        return
      }
      finalFrom = fromTime.length === 16 ? fromTime + ':00' : fromTime
      finalTo = toTime.length === 16 ? toTime + ':00' : toTime
    }

    setLoading(true)
    try {
      const payload: any = {
        organizerId: actorId,
        fromTime: finalFrom,
        toTime: finalTo,
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

  // Switcher options
  const switcherOptions: { id: 'event' | 'quest' | 'survey' | 'note'; label: string }[] = [
    { id: 'event', label: 'Событие' },
  ]
  if (canCreateQuest) switcherOptions.push({ id: 'quest', label: 'Квест' })
  if (canCreateSurvey) switcherOptions.push({ id: 'survey', label: 'Опрос' })
  if (canCreateNote) switcherOptions.push({ id: 'note', label: 'Заметка' })

  const showSwitcher = switcherOptions.length > 1 && !!onSwitchType

  // ==========================================
  // === Компактный режим (popover)
  // ==========================================
  if (compact) {
    // СНАЧАЛА объявляем winW и winH, ПОТОМ используем
    const winW = typeof window !== 'undefined' ? window.innerWidth : 1200
    const winH = typeof window !== 'undefined' ? window.innerHeight : 800
    const W = 360
    const H = Math.min(620, winH - 32)
    const GAP = 8

    let calculatedLeft = GAP
    let calculatedTop = GAP

    if (anchorRect) {
      calculatedLeft = anchorRect.left + anchorRect.width + GAP
      if (calculatedLeft + W > winW - GAP) {
        calculatedLeft = anchorRect.left - W - GAP
        if (calculatedLeft < GAP) calculatedLeft = Math.max(GAP, (winW - W) / 2)
      }
      calculatedTop = anchorRect.top
      if (calculatedTop + H > winH - GAP) calculatedTop = Math.max(GAP, winH - H - GAP)
      if (calculatedTop < GAP) calculatedTop = GAP
    }

    return (
      <div
        className="fixed z-[60] animate-slide-down"
        style={{ top: calculatedTop, left: calculatedLeft, width: W }}
        onClick={(e) => e.stopPropagation()}
      >
        <form
          onSubmit={submit}
          className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-[#30363d] shadow-2xl p-4 space-y-3 max-h-[calc(100vh-16px)] overflow-y-auto"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                Новое событие
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {defaultFrom?.toLocaleDateString('ru-RU', {
                  day: 'numeric',
                  month: 'long',
                  weekday: 'short',
                })}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-900 dark:hover:text-white p-1 shrink-0"
            >
              <IconX size={16} />
            </button>
          </div>

          {showSwitcher && (
            <div className="flex gap-1 p-1 rounded-lg bg-slate-100 dark:bg-[#0d1117]">
              {switcherOptions.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => opt.id !== 'event' && onSwitchType!(opt.id)}
                  className={`flex-1 py-1.5 text-[11px] font-medium rounded-md transition ${
                    opt.id === 'event'
                      ? 'bg-white dark:bg-[#161b22] text-brand-700 dark:text-brand-400 shadow-sm'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}

          {error && (
            <div className="bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 text-xs p-2 rounded border border-red-200 dark:border-red-500/30">
              {error}
            </div>
          )}

          <div>
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
              Название *
            </label>
            <input
              value={nameEvent}
              onChange={(e) => setNameEvent(e.target.value)}
              required
              autoFocus
              placeholder="Например: Митап по Java"
              className="w-full border border-slate-300 dark:border-[#30363d] dark:bg-[#0d1117] dark:text-white rounded-md px-2.5 py-1.5 mt-1 text-sm focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Начало *
              </label>
              <input
                type="time"
                value={fromTimeOnly}
                onChange={(e) => setFromTimeOnly(e.target.value)}
                required
                className="w-full border border-slate-300 dark:border-[#30363d] dark:bg-[#0d1117] dark:text-white rounded-md px-2.5 py-1.5 mt-1 text-sm focus:outline-none focus:border-brand-500"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Конец *
              </label>
              <input
                type="time"
                value={toTimeOnly}
                onChange={(e) => setToTimeOnly(e.target.value)}
                required
                className="w-full border border-slate-300 dark:border-[#30363d] dark:bg-[#0d1117] dark:text-white rounded-md px-2.5 py-1.5 mt-1 text-sm focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
              Категория *
            </label>
            <input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              className="w-full border border-slate-300 dark:border-[#30363d] dark:bg-[#0d1117] dark:text-white rounded-md px-2.5 py-1.5 mt-1 text-sm focus:outline-none focus:border-brand-500"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
              Место
            </label>
            <input
              value={eventPlace}
              onChange={(e) => setEventPlace(e.target.value)}
              placeholder="Онлайн / офис"
              className="w-full border border-slate-300 dark:border-[#30363d] dark:bg-[#0d1117] dark:text-white rounded-md px-2.5 py-1.5 mt-1 text-sm focus:outline-none focus:border-brand-500"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
              Комментарий админу
            </label>
            <textarea
              value={commentToAdmin}
              onChange={(e) => setCommentToAdmin(e.target.value)}
              rows={2}
              placeholder="Например: прошу начислить 100 монет участникам"
              className="w-full border border-slate-300 dark:border-[#30363d] dark:bg-[#0d1117] dark:text-white rounded-md px-2.5 py-1.5 mt-1 text-sm resize-none focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#21262d] rounded-md transition"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-brand-600 hover:bg-brand-700 text-white rounded-md px-3 py-1.5 text-xs font-medium disabled:opacity-50 transition"
            >
              {loading ? '...' : 'Отправить'}
            </button>
          </div>

          <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center">
            Уйдёт на модерацию HR
          </p>
        </form>
      </div>
    )
  }

  // ==========================================
  // === Полноэкранный режим
  // ==========================================
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
              {hideDate
                ? 'Укажите время'
                : canSetRewards
                ? 'После создания событие можно сразу назначить'
                : 'После создания событие отправится на модерацию'}
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
            autoFocus
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

        {hideDate ? (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Начало *
              </label>
              <input
                type="time"
                value={fromTimeOnly}
                onChange={(e) => setFromTimeOnly(e.target.value)}
                required
                className="w-full border border-slate-300 dark:border-[#30363d] dark:bg-[#0d1117] dark:text-white rounded-md px-3 py-2 mt-1 text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Конец *
              </label>
              <input
                type="time"
                value={toTimeOnly}
                onChange={(e) => setToTimeOnly(e.target.value)}
                required
                className="w-full border border-slate-300 dark:border-[#30363d] dark:bg-[#0d1117] dark:text-white rounded-md px-3 py-2 mt-1 text-sm"
              />
            </div>
          </div>
        ) : (
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
                className="w-full border border-slate-300 dark:border-[#30363d] dark:bg-[#0d1117] dark:text-white rounded-md px-3 py-2 mt-1 text-sm"
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
                className="w-full border border-slate-300 dark:border-[#30363d] dark:bg-[#0d1117] dark:text-white rounded-md px-3 py-2 mt-1 text-sm"
              />
            </div>
          </div>
        )}

        <div>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Место
          </label>
          <input
            value={eventPlace}
            onChange={(e) => setEventPlace(e.target.value)}
            className="w-full border border-slate-300 dark:border-[#30363d] dark:bg-[#0d1117] dark:text-white rounded-md px-3 py-2 mt-1 text-sm"
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
            className="w-full border border-slate-300 dark:border-[#30363d] dark:bg-[#0d1117] dark:text-white rounded-md px-3 py-2 mt-1 text-sm resize-none"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {canSetRewards ? 'Комментарий' : 'Пожелания администратору'}
          </label>
          <textarea
            value={commentToAdmin}
            onChange={(e) => setCommentToAdmin(e.target.value)}
            rows={2}
            className="w-full border border-slate-300 dark:border-[#30363d] dark:bg-[#0d1117] dark:text-white rounded-md px-3 py-2 mt-1 text-sm resize-none"
          />
        </div>

        {canSetRewards && (
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
                  <label className="text-sm font-medium">Монет</label>
                  <input
                    type="number"
                    value={rewardCoins}
                    onChange={(e) => setRewardCoins(Number(e.target.value))}
                    min={1}
                    className="w-full border border-slate-300 rounded-md px-3 py-2 mt-1 text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Рейтинга</label>
                  <input
                    type="number"
                    value={rewardRating}
                    onChange={(e) => setRewardRating(Number(e.target.value))}
                    min={0}
                    step={0.5}
                    className="w-full border border-slate-300 rounded-md px-3 py-2 mt-1 text-sm"
                  />
                </div>
              </div>
            )}
          </>
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
            className="bg-brand-600 hover:bg-brand-700 text-white rounded-md px-4 py-2 text-sm font-medium disabled:opacity-50"
          >
            {loading
              ? 'Создание...'
              : canSetRewards
              ? 'Создать'
              : 'Отправить на модерацию'}
          </button>
        </div>
      </form>
    </div>
  )
}