import { useState } from 'react'
import { useAuth } from '../store/auth'
import { sendThanks } from '../api/transfers'
import { notify } from '../lib/notify'
import { IconX } from './Icons'

interface Props {
  toUserId: number
  toUserName: string
  onClose: () => void
  onSuccess: () => void
}

const TAGS = [
  { value: 'FOR_HELP', label: 'За помощь' },
  { value: 'MENTORING', label: 'Наставничество' },
  { value: 'INITIATIVE', label: 'Инициатива' },
  { value: 'GRATITUDE', label: 'Благодарность' },
  { value: 'OTHER', label: 'Другое' },
]

export default function ThanksModal({ toUserId, toUserName, onClose, onSuccess }: Props) {
  const user = useAuth((s) => s.user)!
  const [amount, setAmount] = useState(50)
  const [comment, setComment] = useState('')
  const [tag, setTag] = useState('FOR_HELP')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (amount <= 0) {
      setError('Сумма должна быть больше 0')
      return
    }

    setLoading(true)
    try {
      await sendThanks({
        fromUserId: user.id,
        toUserId,
        amount,
        comment: comment.trim() || 'Спасибо!',
        tag,
      })
      notify.success(`Благодарность отправлена ${toUserName}`)
      onSuccess()
    } catch (err) {
      const msg = (err as any)?.response?.data || 'Не удалось отправить'
      setError(msg)
      notify.error(err)
    } finally {
      setLoading(false)
    }
  }

  const quickAmounts = [10, 50, 100, 200]

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
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Поблагодарить
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Скажите спасибо{' '}
              <span className="font-medium text-slate-700 dark:text-slate-300">
                {toUserName}
              </span>
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
            Сколько монет?
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            min={1}
            max={1000}
            className="w-full border border-slate-300 dark:border-[#30363d] dark:bg-[#0d1117] dark:text-white rounded-md px-3 py-2 mt-1 text-sm focus:outline-none focus:border-brand-500"
            required
          />
          <div className="flex flex-wrap gap-1.5 mt-2">
            {quickAmounts.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setAmount(preset)}
                className={`text-xs px-2.5 py-1 rounded border transition ${
                  amount === preset
                    ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-400'
                    : 'border-slate-300 dark:border-[#30363d] text-slate-600 dark:text-slate-300 hover:border-brand-400'
                }`}
              >
                {preset}
              </button>
            ))}
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5">
            Максимум 1000 монет одному коллеге в день
          </p>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            За что?
          </label>
          <select
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            className="w-full border border-slate-300 dark:border-[#30363d] dark:bg-[#0d1117] dark:text-white rounded-md px-3 py-2 mt-1 text-sm focus:outline-none focus:border-brand-500"
          >
            {TAGS.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Сообщение
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Напишите пару слов..."
            rows={3}
            maxLength={500}
            className="w-full border border-slate-300 dark:border-[#30363d] dark:bg-[#0d1117] dark:text-white rounded-md px-3 py-2 mt-1 text-sm focus:outline-none focus:border-brand-500 resize-none"
          />
          <div className="text-right text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
            {comment.length} / 500
          </div>
        </div>

        <div className="flex gap-2 justify-end pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm text-slate-600 dark:text-slate-300"
          >
            Отмена
          </button>
          <button
            type="submit"
            disabled={loading || amount <= 0}
            className="px-4 py-2 text-sm bg-brand-600 hover:bg-brand-700 text-white rounded-md font-medium disabled:opacity-50 transition"
          >
            {loading ? 'Отправка...' : 'Отправить'}
          </button>
        </div>
      </form>
    </div>
  )
}