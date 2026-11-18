import { useState, useEffect } from 'react'
import { createNote } from '../api/notes'
import { notify } from '../lib/notify'
import { IconX } from './Icons'

interface AnchorRect {
  top: number
  left: number
  width: number
  height: number
}

interface Props {
  userId: number
  defaultFrom?: Date
  anchorRect?: AnchorRect | null
  canCreateQuest?: boolean
  canCreateSurvey?: boolean
  onSwitchType?: (type: 'event' | 'quest' | 'survey' | 'note') => void
  onPreviewChange?: (from: Date | null, to: Date | null, title: string) => void
  onClose: () => void
  onCreated: () => void
}

const pad = (n: number) => String(n).padStart(2, '0')

function toHHMM(d?: Date): string {
  if (!d) return '10:00'
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function toYMD(d?: Date): string {
  if (!d) return ''
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

const REMIND_OPTIONS = [
  { value: null, label: 'Без напоминания' },
  { value: 5, label: 'За 5 минут' },
  { value: 15, label: 'За 15 минут' },
  { value: 30, label: 'За 30 минут' },
  { value: 60, label: 'За 1 час' },
  { value: 180, label: 'За 3 часа' },
  { value: 1440, label: 'За 1 день' },
]

export default function CreateNoteModal({
  userId,
  defaultFrom,
  anchorRect,
  canCreateQuest,
  canCreateSurvey,
  onSwitchType,
  onPreviewChange,
  onClose,
  onCreated,
}: Props) {
  const [title, setTitle] = useState('')
  const [text, setText] = useState('')
  const [dateValue, setDateValue] = useState(toYMD(defaultFrom) || toYMD(new Date()))
  const [timeOnly, setTimeOnly] = useState(toHHMM(defaultFrom))
  const [remind, setRemind] = useState<number | null>(15)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Emit preview при изменении даты/времени/заголовка
  useEffect(() => {
    if (!onPreviewChange) return
    const from = new Date(`${dateValue}T${timeOnly}:00`)
    if (!isNaN(from.getTime())) {
      const to = new Date(from.getTime() + 30 * 60 * 1000)
      onPreviewChange(from, to, title)
    }
  }, [dateValue, timeOnly, title, onPreviewChange])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!title.trim()) { setError('Введите заголовок'); return }
    if (!dateValue || !timeOnly) { setError('Укажите дату и время'); return }

    const noteTime = `${dateValue}T${timeOnly}:00`

    setLoading(true)
    try {
      await createNote(userId, {
        title: title.trim(),
        text: text.trim() || null,
        noteTime,
        remindMinutesBefore: remind,
      })
      notify.success('Заметка создана')
      onCreated()
    } catch (e: any) {
      setError(e.response?.data || 'Ошибка')
      notify.error(e)
    } finally { setLoading(false) }
  }

  // Switcher
  const switcherOptions: { id: 'event' | 'quest' | 'survey' | 'note'; label: string }[] = [
    { id: 'event', label: 'Событие' },
  ]
  if (canCreateQuest) switcherOptions.push({ id: 'quest', label: 'Квест' })
  if (canCreateSurvey) switcherOptions.push({ id: 'survey', label: 'Опрос' })
  switcherOptions.push({ id: 'note', label: 'Заметка' })
  const showSwitcher = switcherOptions.length > 1 && !!onSwitchType

  // Popover positioning (как у CreateEventModal)
  const W = 360
  const GAP = 8
  const winW = typeof window !== 'undefined' ? window.innerWidth : 1200
  const winH = typeof window !== 'undefined' ? window.innerHeight : 800
  const H = Math.min(620, winH - 32)

  let left = GAP
  let top = GAP
  if (anchorRect) {
    left = anchorRect.left + anchorRect.width + GAP
    if (left + W > winW - GAP) {
      left = anchorRect.left - W - GAP
      if (left < GAP) left = Math.max(GAP, (winW - W) / 2)
    }
    top = anchorRect.top
    if (top + H > winH - GAP) top = Math.max(GAP, winH - H - GAP)
    if (top < GAP) top = GAP
  }

  return (
    <div className="fixed z-[60] animate-slide-down" style={{ top, left, width: W }} onClick={(e) => e.stopPropagation()}>
      <form onSubmit={submit} className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-[#30363d] shadow-2xl p-4 space-y-3 max-h-[calc(100vh-16px)] overflow-y-auto">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">Новая заметка</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Личная заметка</p>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-900 dark:hover:text-white p-1"><IconX size={16} /></button>
        </div>

        {showSwitcher && (
          <div className="flex gap-1 p-1 rounded-lg bg-slate-100 dark:bg-[#0d1117]">
            {switcherOptions.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => opt.id !== 'note' && onSwitchType!(opt.id)}
                className={`flex-1 py-1.5 text-[11px] font-medium rounded-md transition ${
                  opt.id === 'note'
                    ? 'bg-white dark:bg-[#161b22] text-brand-700 dark:text-brand-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}

        {error && <div className="bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 text-xs p-2 rounded border border-red-200 dark:border-red-500/30">{error}</div>}

        <div>
          <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Заголовок *</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            autoFocus
            placeholder="Например: Позвонить клиенту"
            className="w-full border border-slate-300 dark:border-[#30363d] dark:bg-[#0d1117] dark:text-white rounded-md px-2.5 py-1.5 mt-1 text-sm focus:outline-none focus:border-brand-500"
          />
        </div>

        {/* ДАТА + ВРЕМЯ */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Дата *</label>
            <input
              type="date"
              value={dateValue}
              onChange={(e) => setDateValue(e.target.value)}
              required
              className="w-full border border-slate-300 dark:border-[#30363d] dark:bg-[#0d1117] dark:text-white rounded-md px-2.5 py-1.5 mt-1 text-sm focus:outline-none focus:border-brand-500"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Время *</label>
            <input
              type="time"
              value={timeOnly}
              onChange={(e) => setTimeOnly(e.target.value)}
              required
              className="w-full border border-slate-300 dark:border-[#30363d] dark:bg-[#0d1117] dark:text-white rounded-md px-2.5 py-1.5 mt-1 text-sm focus:outline-none focus:border-brand-500"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Описание</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={2}
            placeholder="Детали..."
            className="w-full border border-slate-300 dark:border-[#30363d] dark:bg-[#0d1117] dark:text-white rounded-md px-2.5 py-1.5 mt-1 text-sm resize-none focus:outline-none focus:border-brand-500"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Напомнить</label>
          <select
            value={remind === null ? '' : remind}
            onChange={(e) => setRemind(e.target.value ? Number(e.target.value) : null)}
            className="w-full border border-slate-300 dark:border-[#30363d] dark:bg-[#0d1117] dark:text-white rounded-md px-2.5 py-1.5 mt-1 text-sm focus:outline-none focus:border-brand-500"
          >
            {REMIND_OPTIONS.map((o) => (
              <option key={String(o.value)} value={o.value ?? ''}>{o.label}</option>
            ))}
          </select>
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <button type="button" onClick={onClose} className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#21262d] rounded-md transition">Отмена</button>
          <button type="submit" disabled={loading} className="bg-brand-600 hover:bg-brand-700 text-white rounded-md px-3 py-1.5 text-xs font-medium disabled:opacity-50 transition">{loading ? '...' : 'Сохранить'}</button>
        </div>

        <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center">Заметка видна только вам</p>
      </form>
    </div>
  )
}