import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../store/auth'
import { useFetch } from '../hooks/useFetch'
import {
  getAllNews,
  getArchivedNews,
  archiveNews,
  restoreNews,
  deleteNews,
  type NewsDto,
} from '../api/news'
import { can } from '../lib/permissions'
import { notify } from '../lib/notify'
import { confirmDialog } from '../lib/confirm'
import NewsModal from '../components/NewsModal'
import {
  IconPlus,
  IconPin,
  IconTrash,
  IconEdit,
  IconEye,
  IconArchive,
  IconRestore,
  IconClock,
  IconStarFilled,
} from '../components/Icons'

type Tab = 'active' | 'archive'

export default function News() {
  const user = useAuth((s) => s.user)!
  const active = useFetch(() => getAllNews(user.id), [user.id])
  const archive = useFetch(() => getArchivedNews(user.id), [user.id])

  const [tab, setTab] = useState<Tab>('active')
  const [localActive, setLocalActive] = useState<NewsDto[] | null>(null)
  const [localArchive, setLocalArchive] = useState<NewsDto[] | null>(null)
  const [creating, setCreating] = useState(false)
  const [editing, setEditing] = useState<NewsDto | null>(null)

  const activeList = localActive ?? active.data ?? []
  const archiveList = localArchive ?? archive.data ?? []
  const list = tab === 'active' ? activeList : archiveList

  const canManage = can.manageNews(user.role)

  async function handleDelete(news: NewsDto) {
    const ok = await confirmDialog({
      title: 'Удалить новость?',
      message: `«${news.title}» будет удалена безвозвратно.`,
      confirmLabel: 'Удалить',
      danger: true,
    })
    if (!ok) return
    try {
      await deleteNews(news.id, user.id)
      if (news.isArchived) {
        setLocalArchive(archiveList.filter((n) => n.id !== news.id))
      } else {
        setLocalActive(activeList.filter((n) => n.id !== news.id))
      }
      notify.success('Новость удалена')
    } catch (e) {
      notify.error(e)
    }
  }

  async function handleArchive(news: NewsDto) {
    const ok = await confirmDialog({
      title: 'Отправить в архив?',
      message: `«${news.title}» перестанет показываться на главной и в активных. Останется в архиве.`,
      confirmLabel: 'В архив',
    })
    if (!ok) return
    try {
      await archiveNews(news.id, user.id)
      setLocalActive(activeList.filter((n) => n.id !== news.id))
      setLocalArchive(null)
      notify.success('Новость в архиве')
    } catch (e) {
      notify.error(e)
    }
  }

  async function handleRestore(news: NewsDto) {
    try {
      const restored = await restoreNews(news.id, user.id)
      setLocalArchive(archiveList.filter((n) => n.id !== news.id))
      setLocalActive([restored, ...activeList])
      notify.success('Новость восстановлена')
    } catch (e) {
      notify.error(e)
    }
  }

  function refresh() {
    setLocalActive(null)
    setLocalArchive(null)
    window.location.reload()
  }

  const loading = tab === 'active' ? active.loading : archive.loading
  const error = tab === 'active' ? active.error : archive.error

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white tracking-tight">
            Новости компании
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Что нового происходит в компании
          </p>
        </div>
        {canManage && (
          <button
            onClick={() => setCreating(true)}
            className="bg-brand-600 hover:bg-brand-700 text-white rounded-md px-4 py-2 text-sm font-medium transition inline-flex items-center gap-1.5"
          >
            <IconPlus size={14} /> Новая новость
          </button>
        )}
      </div>

      <div className="border-b border-slate-200 dark:border-[#30363d]">
        <div className="flex gap-1 -mb-px">
          <TabBtn active={tab === 'active'} onClick={() => setTab('active')}>
            Активные
            {activeList.length > 0 && (
              <span
                className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
                  tab === 'active'
                    ? 'bg-brand-100 dark:bg-brand-500/20 text-brand-700 dark:text-brand-400'
                    : 'bg-slate-100 dark:bg-[#21262d] text-slate-500 dark:text-slate-400'
                }`}
              >
                {activeList.length}
              </span>
            )}
          </TabBtn>
          <TabBtn active={tab === 'archive'} onClick={() => setTab('archive')}>
            Архив
            {archiveList.length > 0 && (
              <span
                className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
                  tab === 'archive'
                    ? 'bg-brand-100 dark:bg-brand-500/20 text-brand-700 dark:text-brand-400'
                    : 'bg-slate-100 dark:bg-[#21262d] text-slate-500 dark:text-slate-400'
                }`}
              >
                {archiveList.length}
              </span>
            )}
          </TabBtn>
        </div>
      </div>

      {loading && <div className="text-slate-500">Загрузка...</div>}
      {error && <div className="text-red-600">{error}</div>}

      {!loading && list.length === 0 && (
        <div className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-[#30363d] p-8 sm:p-12 text-center">
          <div className="text-slate-400 dark:text-slate-500 text-sm">
            {tab === 'active' ? 'Пока нет новостей' : 'Архив пуст'}
          </div>
          {tab === 'active' && canManage && (
            <button
              onClick={() => setCreating(true)}
              className="mt-4 inline-block bg-brand-600 hover:bg-brand-700 text-white rounded-md px-4 py-2 text-sm font-medium transition"
            >
              Создать первую новость
            </button>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {list.map((n) => (
          <NewsCard
            key={n.id}
            news={n}
            canManage={canManage}
            onEdit={() => setEditing(n)}
            onDelete={() => handleDelete(n)}
            onArchive={tab === 'active' ? () => handleArchive(n) : undefined}
            onRestore={tab === 'archive' ? () => handleRestore(n) : undefined}
          />
        ))}
      </div>

      {creating && (
        <NewsModal onClose={() => setCreating(false)} onSaved={refresh} />
      )}
      {editing && (
        <NewsModal news={editing} onClose={() => setEditing(null)} onSaved={refresh} />
      )}
    </div>
  )
}

function TabBtn({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2.5 text-sm font-medium transition border-b-2 whitespace-nowrap inline-flex items-center ${
        active
          ? 'border-brand-600 text-brand-700 dark:text-brand-400'
          : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
      }`}
    >
      {children}
    </button>
  )
}

function NewsCard({
  news,
  canManage,
  onEdit,
  onDelete,
  onArchive,
  onRestore,
}: {
  news: NewsDto
  canManage: boolean
  onEdit: () => void
  onDelete: () => void
  onArchive?: () => void
  onRestore?: () => void
}) {
  const expiringSoon = (() => {
    if (!news.expiresAt || news.isArchived) return false
    const diff = new Date(news.expiresAt).getTime() - Date.now()
    return diff > 0 && diff < 3 * 86400000
  })()

  return (
    <div className="group relative bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-[#30363d] overflow-hidden hover:shadow-md transition">
      {canManage && (
        <div className="absolute top-2 right-2 z-10 flex gap-1 opacity-0 group-hover:opacity-100 transition">
          {onRestore && (
            <button
              onClick={(e) => {
                e.preventDefault()
                onRestore()
              }}
              className="w-8 h-8 rounded-md bg-white/90 dark:bg-[#0d1117]/90 text-brand-600 dark:text-brand-400 shadow hover:bg-white dark:hover:bg-[#161b22] flex items-center justify-center"
              title="Восстановить из архива"
            >
              <IconRestore size={14} />
            </button>
          )}
          {onArchive && (
            <button
              onClick={(e) => {
                e.preventDefault()
                onArchive()
              }}
              className="w-8 h-8 rounded-md bg-white/90 dark:bg-[#0d1117]/90 text-amber-600 dark:text-amber-400 shadow hover:bg-white dark:hover:bg-[#161b22] flex items-center justify-center"
              title="В архив"
            >
              <IconArchive size={14} />
            </button>
          )}
          <button
            onClick={(e) => {
              e.preventDefault()
              onEdit()
            }}
            className="w-8 h-8 rounded-md bg-white/90 dark:bg-[#0d1117]/90 text-slate-700 dark:text-slate-200 shadow hover:bg-white dark:hover:bg-[#161b22] flex items-center justify-center"
            title="Редактировать"
          >
            <IconEdit size={14} />
          </button>
          <button
            onClick={(e) => {
              e.preventDefault()
              onDelete()
            }}
            className="w-8 h-8 rounded-md bg-white/90 dark:bg-[#0d1117]/90 text-red-600 dark:text-red-400 shadow hover:bg-white dark:hover:bg-[#161b22] flex items-center justify-center"
            title="Удалить"
          >
            <IconTrash size={14} />
          </button>
        </div>
      )}

      <Link to={`/news/${news.id}`} className="block">
        <div className="aspect-video bg-slate-100 dark:bg-[#0d1117] overflow-hidden relative">
          {news.coverUrl ? (
            <img
              src={news.coverUrl}
              alt={news.title}
              className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-500 to-emerald-600 text-white text-3xl font-bold">
              {news.title.charAt(0).toUpperCase()}
            </div>
          )}

          {news.isArchived && (
            <span className="absolute top-2 right-2 bg-slate-700 text-white text-xs px-2 py-0.5 rounded-full font-medium">
              В архиве
            </span>
          )}
          {news.isPinned && !news.isArchived && (
            <span className="absolute top-2 left-2 inline-flex items-center gap-1 bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">
              <IconPin size={10} />
              Закреплено
            </span>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-slate-900 dark:text-white line-clamp-2 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition">
            {news.title}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 line-clamp-3">
            {stripMarkdown(news.content)}
          </p>

          {expiringSoon && (
            <div className="mt-2 inline-flex items-center gap-1 text-xs bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-500/30">
              <IconClock size={12} />
              Скоро истекает
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-slate-400 dark:text-slate-500 mt-3">
            <span className="truncate">{news.authorName}</span>
            <div className="flex items-center gap-3 shrink-0">
              <span className="inline-flex items-center gap-1">
                <IconEye size={12} />
                {news.views}
              </span>
              {news.averageRating !== null && (
                <span className="inline-flex items-center gap-0.5 text-amber-600 dark:text-amber-400 font-medium">
                  <IconStarFilled size={12} />
                  {news.averageRating.toFixed(1)}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </div>
  )
}

function stripMarkdown(text: string): string {
  return text
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}