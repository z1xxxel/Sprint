import { useState } from 'react'
import { createTicket, type SupportTicket } from '../api/support'
import { IconX, IconTarget } from './Icons'

interface Props {
  userId: number
  onClose: () => void
  onCreated: (ticket: SupportTicket) => void
}

export default function CreateTicketModal({ userId, onClose, onCreated }: Props) {
  const [topic, setTopic] = useState('')
  const [description, setDescription] = useState('')
  const [isQuestRequest, setIsQuestRequest] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!topic.trim() || !description.trim()) {
      setError('Заполните все поля')
      return
    }
    setLoading(true)
    setError('')
    try {
      const ticket = await createTicket(
        userId,
        topic.trim(),
        description.trim(),
        isQuestRequest
      )
      onCreated(ticket)
    } catch (e: any) {
      setError(e.response?.data || 'Не удалось создать обращение')
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
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-[#161b22] rounded-xl w-full max-w-md p-6 space-y-4"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Новое обращение
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Опишите проблему — поддержка ответит
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
            Тема *
          </label>
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            maxLength={100}
            placeholder="Кратко о проблеме"
            required
            className="w-full border border-slate-300 dark:border-[#30363d] dark:bg-[#0d1117] dark:text-white rounded-md px-3 py-2 mt-1 text-sm focus:outline-none focus:border-brand-500"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Описание *
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={1000}
            rows={4}
            placeholder="Подробно опишите ситуацию"
            required
            className="w-full border border-slate-300 dark:border-[#30363d] dark:bg-[#0d1117] dark:text-white rounded-md px-3 py-2 mt-1 text-sm focus:outline-none focus:border-brand-500 resize-none"
          />
        </div>

        {/* Чекбокс "Запрос на квест" */}
        <label
          className={`flex items-start gap-3 px-3 py-3 rounded-lg border cursor-pointer transition ${
            isQuestRequest
              ? 'border-amber-400 dark:border-amber-500/50 bg-amber-50 dark:bg-amber-500/10'
              : 'border-slate-200 dark:border-[#30363d] hover:border-amber-300 dark:hover:border-amber-500/30'
          }`}
        >
          <input
            type="checkbox"
            checked={isQuestRequest}
            onChange={(e) => setIsQuestRequest(e.target.checked)}
            className="mt-0.5 shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 text-sm font-medium text-slate-900 dark:text-white">
              <IconTarget size={14} className="text-amber-600 dark:text-amber-400" />
              Запрос на принятие квеста
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Поддержка увидит ваши квесты на проверке и сможет их принять прямо из обращения
            </div>
          </div>
        </label>

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
            {loading ? 'Отправка...' : 'Отправить'}
          </button>
        </div>
      </form>
    </div>
  )
}