import { useState } from 'react'
import { useAuth } from '../store/auth'
import { grantCoins } from '../api/transfers'
import { notify } from '../lib/notify'
import { IconX, IconTrophy } from './Icons'

interface Props {
  toUserId: number
  toUserName: string
  onClose: () => void
  onSuccess: () => void
}

export default function GrantCoinsModal({ toUserId, toUserName, onClose, onSuccess }: Props) {
  const me = useAuth((s) => s.user)!
  const [amount, setAmount] = useState(500)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (amount <= 0) return setError('Сумма должна быть больше 0')

    setLoading(true)
    try {
      await grantCoins({
        actorId: me.id,
        toUserId,
        amount,
        comment: comment.trim() || 'Бонус от руководителя',
      })
      notify.success(`Начислено ${amount} монет (из казны)`)
      onSuccess()
    } catch (err: any) {
      setError(err.response?.data || 'Не удалось начислить')
    } finally {
      setLoading(false)
    }
  }

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
              Начислить бонус
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Сотруднику: <span className="font-medium text-slate-700 dark:text-slate-300">{toUserName}</span>
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

        <div className="bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs p-3 rounded border border-amber-200 dark:border-amber-500/30">
          Монеты будут списаны из <strong>Казны компании</strong>. Дневной лимит: до 2000 монет одному сотруднику.
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 text-sm p-3 rounded border border-red-200 dark:border-red-500/30">
            {error}
          </div>
        )}

        <div>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Сумма монет
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            min={1}
            max={2000}
            className="w-full border border-slate-300 dark:border-[#30363d] dark:bg-[#0d1117] dark:text-white rounded-md px-3 py-2 mt-1 text-sm focus:outline-none focus:border-brand-500 font-mono"
            required
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Комментарий
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="За что начисляется бонус..."
            rows={2}
            maxLength={200}
            className="w-full border border-slate-300 dark:border-[#30363d] dark:bg-[#0d1117] dark:text-white rounded-md px-3 py-2 mt-1 text-sm focus:outline-none focus:border-brand-500 resize-none"
          />
        </div>

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
            className="bg-brand-600 hover:bg-brand-700 text-white rounded-md px-4 py-2 text-sm font-medium disabled:opacity-50 transition inline-flex items-center gap-1.5"
          >
            <IconTrophy size={14} />
            {loading ? 'Начисление...' : 'Начислить'}
          </button>
        </div>
      </form>
    </div>
  )
}