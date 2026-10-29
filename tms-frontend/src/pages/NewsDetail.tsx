import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../store/auth'
import {
  getNewsById,
  viewNews,
  rateNews,
  deleteNews,
  archiveNews,
  restoreNews,
  type NewsDto,
} from '../api/news'
import { can } from '../lib/permissions'
import { notify } from '../lib/notify'
import { confirmDialog } from '../lib/confirm'
import NewsModal from '../components/NewsModal'
import NewsContent from '../components/NewsContent'
import StarRating from '../components/StarRating'
import {
  IconArrowLeft,
  IconPin,
  IconEdit,
  IconTrash,
  IconEye,
  IconArchive,
  IconRestore,
  IconClock,
} from '../components/Icons'

export default function NewsDetail() {
  const { id } = useParams<{ id: string }>()
  const newsId = Number(id)
  const user = useAuth((s) => s.user)!
  const nav = useNavigate()

  const [news, setNews] = useState<NewsDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editing, setEditing] = useState(false)
  const [ratingBusy, setRatingBusy] = useState(false)
  const [actionBusy, setActionBusy] = useState(false)

  const canManage = can.manageNews(user.role)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    getNewsById(newsId, user.id)
      .then((n) => {
        if (cancelled) return
        setNews(n)
        const key = `news_viewed_${newsId}`
        if (!sessionStorage.getItem(key)) {
          viewNews(newsId, user.id)
            .then((n2) => {
              if (cancelled) return
              sessionStorage.setItem(key, '1')
              setNews(n2)
            })
            .catch(() => {})
        }
      })
      .catch((e) => !cancelled && setError(e.response?.data || 'Ошибка'))
      .finally(() => !cancelled && setLoading(false))

    return () => {
      cancelled = true
    }
  }, [newsId, user.id])

  async function handleRate(value: number) {
    if (!news || ratingBusy) return
    setRatingBusy(true)
    try {
      const updated = await rateNews(newsId, user.id, value)
      setNews(updated)
      notify.success('Спасибо за оценку!')
    } catch (e) {
      notify.error(e)
    } finally {
      setRatingBusy(false)
    }
  }

  async function handleDelete() {
    if (!news) return
    const ok = await confirmDialog({
      title: 'Удалить новость?',
      message: `«${news.title}» будет удалена безвозвратно.`,
      confirmLabel: 'Удалить',
      danger: true,
    })
    if (!ok) return
    try {
      await deleteNews(news.id, user.id)
      notify.success('Новость удалена')
      nav('/news')
    } catch (e) {
      notify.error(e)
    }
  }

  async function handleArchive() {
    if (!news) return
    const ok = await confirmDialog({
      title: 'Отправить в архив?',
      message: `«${news.title}» перестанет показываться в активных. Останется в архиве.`,
      confirmLabel: 'В архив',
    })
    if (!ok) return
    setActionBusy(true)
    try {
      const updated = await archiveNews(news.id, user.id)
      setNews(updated)
      notify.success('Новость в архиве')
    } catch (e) {
      notify.error(e)
    } finally {
      setActionBusy(false)
    }
  }

  async function handleRestore() {
    if (!news) return
    setActionBusy(true)
    try {
      const updated = await restoreNews(news.id, user.id)
      setNews(updated)
      notify.success('Новость восстановлена')
    } catch (e) {
      notify.error(e)
    } finally {
      setActionBusy(false)
    }
  }

  if (loading) return <div className="text-slate-500">Загрузка...</div>
  if (error) return <div className="text-red-600">{error}</div>
  if (!news) return <div className="text-slate-500">Новость не найдена</div>

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <Link
          to="/news"
          className="text-sm text-brand-600 dark:text-brand-400 hover:underline inline-flex items-center gap-1"
        >
          <IconArrowLeft size={14} /> Ко всем новостям
        </Link>
        {canManage && (
          <div className="flex gap-2 flex-wrap">
            {news.isArchived ? (
              <button
                onClick={handleRestore}
                disabled={actionBusy}
                className="text-xs px-3 py-1.5 border border-brand-300 dark:border-brand-500/30 rounded-md text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-500/10 transition inline-flex items-center gap-1.5 disabled:opacity-50"
              >
                <IconRestore size={12} /> Восстановить
              </button>
            ) : (
              <button
                onClick={handleArchive}
                disabled={actionBusy}
                className="text-xs px-3 py-1.5 border border-amber-300 dark:border-amber-500/30 rounded-md text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/10 transition inline-flex items-center gap-1.5 disabled:opacity-50"
              >
                <IconArchive size={12} /> В архив
              </button>
            )}
            <button
              onClick={() => setEditing(true)}
              className="text-xs px-3 py-1.5 border border-slate-300 dark:border-[#30363d] rounded-md text-slate-700 dark:text-slate-300 hover:border-brand-500 transition inline-flex items-center gap-1.5"
            >
              <IconEdit size={12} /> Редактировать
            </button>
            <button
              onClick={handleDelete}
              className="text-xs px-3 py-1.5 border border-red-300 dark:border-red-500/30 rounded-md text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition inline-flex items-center gap-1.5"
            >
              <IconTrash size={12} /> Удалить
            </button>
          </div>
        )}
      </div>

      <article className="bg-white dark:bg-[#161b22] rounded-2xl border border-slate-200 dark:border-[#30363d] overflow-hidden">
        {news.coverUrl && (
          <div className="aspect-video bg-slate-100 dark:bg-[#0d1117]">
            <img src={news.coverUrl} alt={news.title} className="w-full h-full object-cover" />
          </div>
        )}

        <div className="p-6 sm:p-8 space-y-4">
          <div className="flex flex-wrap gap-2">
            {news.isArchived && (
              <span className="inline-flex items-center gap-1 bg-slate-100 dark:bg-[#0d1117] text-slate-700 dark:text-slate-300 text-xs px-2 py-1 rounded-full border border-slate-200 dark:border-[#30363d] font-medium">
                <IconArchive size={12} />
                В архиве
                {news.archivedAt && (
                  <span className="text-slate-400 dark:text-slate-500">
                    · с {new Date(news.archivedAt).toLocaleDateString('ru-RU')}
                  </span>
                )}
              </span>
            )}
            {news.isPinned && !news.isArchived && (
              <span className="inline-flex items-center gap-1 bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs px-2 py-1 rounded-full border border-amber-200 dark:border-amber-500/30 font-medium">
                <IconPin size={12} />
                Закреплено
              </span>
            )}
            {news.expiresAt && !news.isArchived && (
              <span className="inline-flex items-center gap-1 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 text-xs px-2 py-1 rounded-full border border-blue-200 dark:border-blue-500/30 font-medium">
                <IconClock size={12} />
                Актуально до{' '}
                {new Date(news.expiresAt).toLocaleDateString('ru-RU', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            {news.title}
          </h1>

          <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500 dark:text-slate-400 pb-4 border-b border-slate-100 dark:border-[#30363d]">
            <span>{news.authorName}</span>
            <span>·</span>
            <span>
              {new Date(news.createdAt).toLocaleString('ru-RU', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
            {news.updatedAt && news.updatedAt !== news.createdAt && (
              <span className="text-xs">· изменено</span>
            )}
            <span className="inline-flex items-center gap-1 ml-auto">
              <IconEye size={14} />
              {news.views}
            </span>
          </div>

          <NewsContent content={news.content} />

          <div className="pt-6 border-t border-slate-100 dark:border-[#30363d] space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <StarRating value={news.averageRating ?? 0} size={20} readOnly />
                {news.averageRating !== null ? (
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">
                    {news.averageRating.toFixed(1)}
                  </span>
                ) : (
                  <span className="text-sm text-slate-400 dark:text-slate-500">—</span>
                )}
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  ({news.ratingsCount} {pluralRating(news.ratingsCount)})
                </span>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-[#0d1117] rounded-lg p-4 space-y-2">
              <div className="text-sm font-medium text-slate-900 dark:text-white">
                {news.myRating !== null
                  ? `Ваша оценка — ${news.myRating} из 5. Можно изменить:`
                  : 'Оцените новость:'}
              </div>
              <StarRating
                value={news.myRating ?? 0}
                onChange={handleRate}
                size={28}
                readOnly={ratingBusy}
              />
            </div>
          </div>
        </div>
      </article>

      {editing && (
        <NewsModal
          news={news}
          onClose={() => setEditing(false)}
          onSaved={() => {
            setEditing(false)
            window.location.reload()
          }}
        />
      )}
    </div>
  )
}

function pluralRating(n: number) {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod100 >= 11 && mod100 <= 14) return 'оценок'
  if (mod10 === 1) return 'оценка'
  if (mod10 >= 2 && mod10 <= 4) return 'оценки'
  return 'оценок'
}