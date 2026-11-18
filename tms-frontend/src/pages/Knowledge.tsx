import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../store/auth'
import { useFetch } from '../hooks/useFetch'
import {
  getKnowledgeCategories,
  getKnowledgeArticles,
  getMyKnowledgeSubmissions,
  deleteKnowledgeSubmission,
} from '../api/knowledge'
import { notify } from '../lib/notify'
import { confirmDialog } from '../lib/confirm'
import CreateKnowledgeSubmissionModal from '../components/CreateKnowledgeSubmissionModal'
import { IconPlus, IconSearch } from '../components/Icons'
import type { KnowledgeArticleListItem, KnowledgeSubmission } from '../types'

type Tab = 'catalog' | 'my'

const STATUS_LABEL: Record<string, string> = {
  PENDING: 'На модерации',
  APPROVED: 'Одобрено',
  REJECTED: 'Отклонено',
}

const STATUS_COLOR: Record<string, string> = {
  PENDING: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
  APPROVED: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
  REJECTED: 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400',
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export default function Knowledge() {
  const me = useAuth((s) => s.user)!
  const [tab, setTab] = useState<Tab>('catalog')

  const [query, setQuery] = useState('')
  const [categoryId, setCategoryId] = useState<number | null>(null)

  const categories = useFetch(() => getKnowledgeCategories(), [])
  const articles = useFetch(
    () =>
      getKnowledgeArticles({
        query: query.trim() || undefined,
        categoryId: categoryId ?? undefined,
      }),
    [query, categoryId]
  )
  const mySubmissions = useFetch(() => getMyKnowledgeSubmissions(me.id), [me.id])

  const [creating, setCreating] = useState(false)
  const [localSubmissions, setLocalSubmissions] = useState<KnowledgeSubmission[] | null>(
    null
  )

  const list = articles.data ?? []
  const myList = localSubmissions ?? mySubmissions.data ?? []

  async function handleDeleteSubmission(s: KnowledgeSubmission) {
    const ok = await confirmDialog({
      title: 'Удалить заявку?',
      message: `«${s.title}» будет удалена безвозвратно.`,
      confirmLabel: 'Удалить',
      danger: true,
    })
    if (!ok) return
    try {
      await deleteKnowledgeSubmission(s.id, me.id)
      setLocalSubmissions(myList.filter((x) => x.id !== s.id))
      notify.success('Заявка удалена')
    } catch (e) {
      notify.error(e)
    }
  }

  const myPendingCount = myList.filter((s) => s.status === 'PENDING').length

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white tracking-tight">
            База знаний
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Внутренние статьи, гайды и лайфхаки от коллег
          </p>
        </div>
        <button
          onClick={() => setCreating(true)}
          className="bg-brand-600 hover:bg-brand-700 text-white rounded-lg px-4 py-2 text-sm font-medium inline-flex items-center gap-1.5 transition"
        >
          <IconPlus size={14} />
          Новая статья
        </button>
      </div>

      {/* Табы */}
      <div className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-[#30363d] p-1.5 flex gap-1">
        <button
          onClick={() => setTab('catalog')}
          className={`flex-1 px-4 py-2.5 text-sm font-medium rounded-lg transition ${
            tab === 'catalog'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#21262d]'
          }`}
        >
          Все статьи
          {list.length > 0 && (
            <span className="ml-1.5 text-xs opacity-70">{list.length}</span>
          )}
        </button>
        <button
          onClick={() => setTab('my')}
          className={`flex-1 px-4 py-2.5 text-sm font-medium rounded-lg transition ${
            tab === 'my'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#21262d]'
          }`}
        >
          Мои заявки
          {myPendingCount > 0 && (
            <span className="ml-1.5 text-xs opacity-70">· {myPendingCount} новых</span>
          )}
        </button>
      </div>

      {/* === CATALOG === */}
      {tab === 'catalog' && (
        <>
          {/* Поиск и категории */}
          <div className="space-y-3">
            <div className="relative max-w-md">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                <IconSearch size={14} />
              </div>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Поиск по статьям..."
                className="w-full border border-slate-300 dark:border-[#30363d] dark:bg-[#0d1117] dark:text-white rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-brand-500"
              />
            </div>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setCategoryId(null)}
                className={`text-xs px-3 py-1.5 rounded-lg border transition ${
                  categoryId === null
                    ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-400 font-medium'
                    : 'border-slate-300 dark:border-[#30363d] text-slate-600 dark:text-slate-300 hover:border-brand-400'
                }`}
              >
                Все
              </button>
              {(categories.data ?? []).map((c) => (
                <button
                  key={c.id}
                  onClick={() => setCategoryId(categoryId === c.id ? null : c.id)}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition ${
                    categoryId === c.id
                      ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-400 font-medium'
                      : 'border-slate-300 dark:border-[#30363d] text-slate-600 dark:text-slate-300 hover:border-brand-400'
                  }`}
                >
                  {c.name} <span className="opacity-60">({c.articleCount})</span>
                </button>
              ))}
            </div>
          </div>

          {articles.loading && (
            <div className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-[#30363d] p-8 text-center text-slate-500">
              Загрузка...
            </div>
          )}

          {!articles.loading && list.length === 0 && (
            <div className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-[#30363d] p-10 text-center">
              <div className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {query || categoryId ? 'Ничего не нашли' : 'Пока нет статей'}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                {query || categoryId
                  ? 'Попробуйте изменить запрос или категорию'
                  : 'Станьте первым автором — поделитесь знанием'}
              </div>
              {!query && !categoryId && (
                <button
                  onClick={() => setCreating(true)}
                  className="bg-brand-600 hover:bg-brand-700 text-white rounded-lg px-4 py-2 text-sm font-medium"
                >
                  Написать первую статью
                </button>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {list.map((a) => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </div>
        </>
      )}

      {/* === MY SUBMISSIONS === */}
      {tab === 'my' && (
        <>
          {mySubmissions.loading && (
            <div className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-[#30363d] p-8 text-center text-slate-500">
              Загрузка...
            </div>
          )}

          {!mySubmissions.loading && myList.length === 0 && (
            <div className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-[#30363d] p-10 text-center">
              <div className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Заявок пока нет
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                Создайте статью или предложите правку существующей
              </div>
              <button
                onClick={() => setCreating(true)}
                className="bg-brand-600 hover:bg-brand-700 text-white rounded-lg px-4 py-2 text-sm font-medium"
              >
                Новая статья
              </button>
            </div>
          )}

          <div className="space-y-2.5">
            {myList.map((s) => (
              <div
                key={s.id}
                className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-[#30363d] p-4"
              >
                <div className="flex items-start justify-between gap-2 mb-2 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-semibold text-slate-900 dark:text-white truncate">
                        {s.title}
                      </h3>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                          STATUS_COLOR[s.status]
                        }`}
                      >
                        {STATUS_LABEL[s.status]}
                      </span>
                      {s.targetArticleId && (
                        <span className="text-[10px] text-slate-500 dark:text-slate-400">
                          правка статьи
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {s.categoryName} · {formatDate(s.createdAt)}
                    </div>
                  </div>
                </div>

                <div className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2 mb-2">
                  {s.content}
                </div>

                {s.status === 'APPROVED' && (s.rewardCoins ?? 0) + (s.rewardRating ?? 0) > 0 && (
                  <div className="text-xs bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 px-2.5 py-1.5 rounded mb-2 inline-block">
                    Награда:{' '}
                    {s.rewardCoins && s.rewardCoins > 0 && (
                      <strong>+{s.rewardCoins} монет</strong>
                    )}
                    {s.rewardCoins && s.rewardCoins > 0 && s.rewardRating && s.rewardRating > 0 && ', '}
                    {s.rewardRating && s.rewardRating > 0 && (
                      <strong>+{s.rewardRating} рейтинга</strong>
                    )}
                  </div>
                )}

                {s.status === 'REJECTED' && s.rejectionReason && (
                  <div className="text-xs bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 p-2.5 rounded mb-2">
                    <strong>Причина:</strong> {s.rejectionReason}
                  </div>
                )}

                {s.status === 'PENDING' && (
                  <button
                    onClick={() => handleDeleteSubmission(s)}
                    className="text-xs px-2.5 py-1 rounded-md text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition"
                  >
                    Отозвать заявку
                  </button>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {creating && (
        <CreateKnowledgeSubmissionModal
          onClose={() => setCreating(false)}
          onCreated={() => {
            setCreating(false)
            setLocalSubmissions(null)
            setTab('my')
            window.location.reload()
          }}
        />
      )}
    </div>
  )
}

function ArticleCard({ article: a }: { article: KnowledgeArticleListItem }) {
  return (
    <Link
      to={`/knowledge/${a.id}`}
      className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-[#30363d] p-5 hover:border-brand-400 dark:hover:border-brand-500/50 hover:shadow-sm transition block"
    >
      <div className="text-[10px] text-brand-600 dark:text-brand-400 uppercase tracking-wider font-semibold mb-1">
        {a.categoryName}
      </div>
      <h3 className="font-semibold text-slate-900 dark:text-white mb-2 line-clamp-2">
        {a.title}
      </h3>
      <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-3 mb-3">
        {a.excerpt}
      </p>
      <div className="flex items-center justify-between text-xs text-slate-400 dark:text-slate-500 pt-3 border-t border-slate-100 dark:border-[#30363d]">
        <span>{a.authorName}</span>
        <span>{formatDate(a.publishedAt)}</span>
      </div>
    </Link>
  )
}