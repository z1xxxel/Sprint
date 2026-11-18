import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useFetch } from '../hooks/useFetch'
import { getKnowledgeArticle } from '../api/knowledge'
import CreateKnowledgeSubmissionModal from '../components/CreateKnowledgeSubmissionModal'
import { IconArrowLeft, IconEdit } from '../components/Icons'

export default function KnowledgeArticleDetail() {
  const { id } = useParams<{ id: string }>()
  const articleId = Number(id)
  const nav = useNavigate()

  const { data, loading, error } = useFetch(
    () => getKnowledgeArticle(articleId),
    [articleId]
  )

  const [editing, setEditing] = useState(false)

  if (loading) return <div className="text-slate-500">Загрузка...</div>
  if (error) return <div className="text-red-600">{error}</div>
  if (!data) return <div className="text-slate-500">Статья не найдена</div>

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <Link
        to="/knowledge"
        className="text-sm text-brand-600 dark:text-brand-400 hover:underline inline-flex items-center gap-1"
      >
        <IconArrowLeft size={14} /> К базе знаний
      </Link>

      <article className="bg-white dark:bg-[#161b22] rounded-2xl border border-slate-200 dark:border-[#30363d] p-6 sm:p-8 space-y-4">
        <div>
          <div className="text-xs text-brand-600 dark:text-brand-400 uppercase tracking-wider font-semibold mb-1">
            {data.categoryName}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            {data.title}
          </h1>
        </div>

        <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500 dark:text-slate-400 pb-4 border-b border-slate-100 dark:border-[#30363d]">
          <span>
            Автор: <strong className="text-slate-700 dark:text-slate-300">{data.authorName}</strong>
          </span>
          <span>
            Опубликовано{' '}
            {new Date(data.publishedAt).toLocaleDateString('ru-RU', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
            })}
          </span>
          {data.updatedAt && data.updatedAt !== data.publishedAt && (
            <span className="text-xs">· обновлено</span>
          )}
        </div>

        <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap break-words">
          {data.content}
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-[#30363d] flex justify-end">
          <button
            onClick={() => setEditing(true)}
            className="text-sm px-4 py-2 border border-slate-300 dark:border-[#30363d] rounded-lg text-slate-700 dark:text-slate-300 hover:border-brand-500 transition inline-flex items-center gap-1.5"
          >
            <IconEdit size={14} />
            Предложить правку
          </button>
        </div>
      </article>

      {editing && (
        <CreateKnowledgeSubmissionModal
          targetArticle={data}
          onClose={() => setEditing(false)}
          onCreated={() => {
            setEditing(false)
            nav('/knowledge')
          }}
        />
      )}
    </div>
  )
}