import { useState } from 'react'
import { useAuth } from '../store/auth'
import { useFetch } from '../hooks/useFetch'
import {
  getKnowledgeCategories,
  createKnowledgeSubmission,
} from '../api/knowledge'
import { notify } from '../lib/notify'
import type { KnowledgeArticle } from '../types'

interface Props {
  targetArticle?: KnowledgeArticle
  onClose: () => void
  onCreated: () => void
}

export default function CreateKnowledgeSubmissionModal({
  targetArticle,
  onClose,
  onCreated,
}: Props) {
  const me = useAuth((s) => s.user)!
  const categories = useFetch(() => getKnowledgeCategories(), [])

  const isEdit = !!targetArticle

  const [title, setTitle] = useState(targetArticle?.title ?? '')
  const [content, setContent] = useState(targetArticle?.content ?? '')
  const [categoryId, setCategoryId] = useState<number | undefined>(
    targetArticle?.categoryId ?? undefined
  )
  const [comment, setComment] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!title.trim() || title.trim().length < 3) {
      setError('Заголовок должен быть не короче 3 символов')
      return
    }
    if (!content.trim() || content.trim().length < 20) {
      setError('Содержание должно быть не короче 20 символов')
      return
    }
    if (!categoryId) {
      setError('Выберите категорию')
      return
    }

    setBusy(true)
    try {
      await createKnowledgeSubmission({
        actorId: me.id,
        targetArticleId: targetArticle?.id ?? null,
        title: title.trim(),
        content: content.trim(),
        categoryId,
        commentFromAuthor: comment.trim() || null,
      })
      notify.success(
        isEdit ? 'Правка отправлена на модерацию' : 'Статья отправлена на модерацию'
      )
      onCreated()
    } catch (e: any) {
      setError(e.response?.data || 'Не удалось отправить')
    } finally {
      setBusy(false)
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
        className="bg-white dark:bg-[#161b22] rounded-xl w-full max-w-2xl p-6 space-y-4 my-8 max-h-[90vh] overflow-y-auto"
      >
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            {isEdit ? 'Предложить правку' : 'Новая статья'}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {isEdit
              ? 'Правки отправятся на модерацию — после одобрения статья обновится'
              : 'Поделитесь знанием или лайфхаком — после модерации получите награду'}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 text-sm p-3 rounded">
            {error}
          </div>
        )}

        <div>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Заголовок *
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={300}
            required
            placeholder="Например: Как настроить VPN"
            className="w-full border border-slate-300 dark:border-[#30363d] dark:bg-[#0d1117] dark:text-white rounded-md px-3 py-2 mt-1 text-sm focus:outline-none focus:border-brand-500"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Категория *
          </label>
          <select
            value={categoryId ?? ''}
            onChange={(e) =>
              setCategoryId(e.target.value ? Number(e.target.value) : undefined)
            }
            required
            className="w-full border border-slate-300 dark:border-[#30363d] dark:bg-[#0d1117] dark:text-white rounded-md px-3 py-2 mt-1 text-sm focus:outline-none focus:border-brand-500"
          >
            <option value="">— Выберите —</option>
            {(categories.data ?? []).map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Содержание *
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={12}
            required
            placeholder="Опишите шаги, команды, ссылки — всё, что поможет коллеге"
            className="w-full border border-slate-300 dark:border-[#30363d] dark:bg-[#0d1117] dark:text-white rounded-md px-3 py-2 mt-1 text-sm resize-none focus:outline-none focus:border-brand-500 font-mono"
          />
          <div className="text-xs text-slate-400 dark:text-slate-500 mt-1 text-right">
            {content.length} / 20000
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Комментарий модератору
          </label>
          <input
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            maxLength={500}
            placeholder={isEdit ? 'Что именно устарело и почему вы это правите' : 'Необязательно'}
            className="w-full border border-slate-300 dark:border-[#30363d] dark:bg-[#0d1117] dark:text-white rounded-md px-3 py-2 mt-1 text-sm focus:outline-none focus:border-brand-500"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="px-4 py-2 text-sm text-slate-600 dark:text-slate-300 disabled:opacity-50"
          >
            Отмена
          </button>
          <button
            type="submit"
            disabled={busy}
            className="bg-brand-600 hover:bg-brand-700 text-white rounded-md px-4 py-2 text-sm font-medium disabled:opacity-50 transition"
          >
            {busy ? '...' : 'На модерацию'}
          </button>
        </div>
      </form>
    </div>
  )
}