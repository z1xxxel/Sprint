import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../store/auth'
import { useFetch } from '../hooks/useFetch'
import {
  getThanksFeed,
  getUserThanks,
  getThanksStats,
  type ThanksTag,
  type ThanksFeed,
  type UserThanks,
  type Page,
} from '../api/thanks'
import Avatar from '../components/Avatar'
import {
  IconGift,
  IconStar,
  IconArrowRight,
  IconArrowUp,
  IconArrowDown,
} from '../components/Icons'

// ==========================================
// === Константы тегов ===
// ==========================================
const TAG_LABEL: Record<ThanksTag, string> = {
  GRATITUDE: 'Благодарность',
  FOR_HELP: 'За помощь',
  INITIATIVE: 'Инициатива',
  MENTORING: 'Наставничество',
  TRANSFER: 'Перевод',
  OTHER: 'Другое',
}

const TAG_COLOR: Record<ThanksTag, string> = {
  GRATITUDE:
    'bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-400 border-brand-200 dark:border-brand-500/30',
  FOR_HELP:
    'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/30',
  INITIATIVE:
    'bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-500/30',
  MENTORING:
    'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/30',
  TRANSFER:
    'bg-slate-50 dark:bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-200 dark:border-slate-500/30',
  OTHER:
    'bg-slate-50 dark:bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-200 dark:border-slate-500/30',
}

function formatDate(iso: string) {
  const d = new Date(iso)
  const now = Date.now()
  const diff = now - d.getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'только что'
  if (mins < 60) return `${mins} ${mins === 1 ? 'минуту' : mins < 5 ? 'минуты' : 'минут'} назад`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours} ${hours === 1 ? 'час' : hours < 5 ? 'часа' : 'часов'} назад`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days} ${days === 1 ? 'день' : days < 5 ? 'дня' : 'дней'} назад`
  return d.toLocaleDateString('ru-RU', { day: '2-digit', month: 'short', year: 'numeric' })
}

type Tab = 'feed' | 'received' | 'sent'

export default function Thanks() {
  const user = useAuth((s) => s.user)!
  const [tab, setTab] = useState<Tab>('feed')

  const feed = useFetch(() => getThanksFeed(), [])
  const stats = useFetch(() => getThanksStats(user.id), [user.id])

  return (
    <div className="space-y-6">
      {/* HERO */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500 via-orange-500 to-rose-600 text-white p-6 sm:p-8">
        <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-56 h-56 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <IconGift size={20} className="text-white/80" />
                <span className="text-xs text-white/80 uppercase tracking-wider">
                  Благодарности
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold">Спасибо коллегам</h1>
              <p className="text-sm text-white/80 mt-1">
                Отмечайте вклад коллег и делитесь монетами
              </p>
            </div>
            <Link
              to="/users"
              className="shrink-0 bg-white/15 hover:bg-white/25 backdrop-blur rounded-md px-4 py-2 text-sm font-medium transition inline-flex items-center gap-1.5"
            >
              Поблагодарить <IconArrowRight size={14} />
            </Link>
          </div>

          {/* Статистика */}
          {stats.data && (
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <div className="text-xs text-white/70 uppercase tracking-wider">
                  Получено
                </div>
                <div className="text-2xl sm:text-3xl font-bold mt-1">
                  {stats.data.totalReceived}
                </div>
                <div className="text-xs text-white/70 mt-0.5">
                  на {stats.data.totalCoinsReceived.toFixed(0)} монет
                </div>
              </div>
              <div>
                <div className="text-xs text-white/70 uppercase tracking-wider">
                  Отправлено
                </div>
                <div className="text-2xl sm:text-3xl font-bold mt-1">
                  {stats.data.totalSent}
                </div>
                <div className="text-xs text-white/70 mt-0.5">
                  на {stats.data.totalCoinsSent.toFixed(0)} монет
                </div>
              </div>
              <div className="col-span-2">
                <div className="text-xs text-white/70 uppercase tracking-wider mb-1.5">
                  Топ благодарителей
                </div>
                {stats.data.topThankers.length === 0 ? (
                  <div className="text-sm text-white/70">Пока никого</div>
                ) : (
                  <div className="space-y-1">
                    {stats.data.topThankers.slice(0, 3).map((t, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="truncate">{t.userName}</span>
                        <span className="text-white/70 ml-2 shrink-0">
                          {t.count} раз
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Табы */}
      <div className="border-b border-slate-200 dark:border-[#30363d]">
        <div className="flex gap-1 -mb-px">
          <TabBtn active={tab === 'feed'} onClick={() => setTab('feed')}>
            Лента
          </TabBtn>
          <TabBtn active={tab === 'received'} onClick={() => setTab('received')}>
            Мне
          </TabBtn>
          <TabBtn active={tab === 'sent'} onClick={() => setTab('sent')}>
            От меня
          </TabBtn>
        </div>
      </div>

      {tab === 'feed' && (
        <FeedTab loading={feed.loading} error={feed.error} items={feed.data} />
      )}

      {tab === 'received' && <UserThanksTab userId={user.id} direction="received" />}
      {tab === 'sent' && <UserThanksTab userId={user.id} direction="sent" />}
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
      className={`px-4 py-2.5 text-sm font-medium transition border-b-2 whitespace-nowrap ${
        active
          ? 'border-brand-600 text-brand-700 dark:text-brand-400'
          : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
      }`}
    >
      {children}
    </button>
  )
}

// ==========================================
// === Лента ===
// ==========================================
function FeedTab({
  loading,
  error,
  items,
}: {
  loading: boolean
  error: string | null
  items: ThanksFeed[] | null
}) {
  if (loading) return <div className="text-slate-500">Загрузка...</div>
  if (error) return <div className="text-red-600">{error}</div>
  if (!items) return null

  if (items.length === 0) {
    return (
      <div className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-[#30363d] p-8 sm:p-12 text-center">
        <div className="text-slate-400 dark:text-slate-500 text-sm">
          В ленте пока нет благодарностей
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {items.map((t) => (
        <FeedCard key={t.transactionId} thanks={t} />
      ))}
    </div>
  )
}

function FeedCard({ thanks }: { thanks: ThanksFeed }) {
  return (
    <div className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-[#30363d] p-4">
      <div className="flex items-start gap-3">
        <div className="flex items-center gap-2 shrink-0">
          <Avatar name={thanks.fromUserName} size="sm" />
          <IconArrowRight size={14} className="text-slate-400" />
          <Avatar name={thanks.toUserName} size="sm" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="text-sm text-slate-900 dark:text-white">
            <span className="font-medium">{thanks.fromUserName}</span>{' '}
            <span className="text-slate-500 dark:text-slate-400">
              поблагодарил
            </span>{' '}
            <span className="font-medium">{thanks.toUserName}</span>
          </div>

          {thanks.comment && (
            <div className="mt-2 bg-slate-50 dark:bg-[#0d1117] rounded-md px-3 py-2 text-sm text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-[#30363d]">
              «{thanks.comment}»
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span
              className={`text-xs px-2 py-0.5 rounded border font-medium ${TAG_COLOR[thanks.tag] || TAG_COLOR.OTHER}`}
            >
              {TAG_LABEL[thanks.tag] || thanks.tag}
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-500">
              {formatDate(thanks.createdAt)}
            </span>
          </div>
        </div>

        <div className="shrink-0 text-right">
          <div className="inline-flex items-center gap-1 bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30 px-2.5 py-1 rounded-md text-sm font-semibold">
            +{thanks.amount.toFixed(0)}
          </div>
          <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
            монет
          </div>
        </div>
      </div>
    </div>
  )
}

// ==========================================
// === История пользователя (received / sent) ===
// ==========================================
function UserThanksTab({
  userId,
  direction,
}: {
  userId: number
  direction: 'received' | 'sent'
}) {
  const [page, setPage] = useState(0)
  const [data, setData] = useState<Page<UserThanks> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [appending, setAppending] = useState(false)

  const loadPage = useCallback(
    async (p: number, append: boolean) => {
      if (append) setAppending(true)
      else setLoading(true)
      setError(null)
      try {
        const res = await getUserThanks(userId, direction, p, 20)
        if (append && data) {
          setData({ ...res, content: [...data.content, ...res.content] })
        } else {
          setData(res)
        }
      } catch (e: any) {
        setError(e.response?.data || 'Ошибка загрузки')
      } finally {
        setLoading(false)
        setAppending(false)
      }
    },
    [userId, direction, data]
  )

  useEffect(() => {
    setPage(0)
    setData(null)
    loadPage(0, false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, direction])

  if (loading) return <div className="text-slate-500">Загрузка...</div>
  if (error) return <div className="text-red-600">{error}</div>
  if (!data) return null

  if (data.content.length === 0) {
    return (
      <div className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-[#30363d] p-8 sm:p-12 text-center">
        <div className="flex justify-center mb-3 text-slate-300 dark:text-slate-600">
          <IconStar size={40} />
        </div>
        <div className="text-slate-500 dark:text-slate-400 text-sm font-medium">
          {direction === 'received'
            ? 'Вам пока не отправляли благодарностей'
            : 'Вы пока никого не благодарили'}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {data.content.map((t) => (
        <UserThanksCard key={t.transactionId} thanks={t} direction={direction} />
      ))}

      {/* Пагинация */}
      {!data.last && (
        <div className="pt-2 flex justify-center">
          <button
            onClick={() => {
              const next = page + 1
              setPage(next)
              loadPage(next, true)
            }}
            disabled={appending}
            className="text-sm text-brand-600 dark:text-brand-400 hover:underline disabled:opacity-50 px-4 py-2"
          >
            {appending ? 'Загрузка...' : 'Показать ещё'}
          </button>
        </div>
      )}

      {data.content.length > 0 && data.last && (
        <div className="pt-2 text-center text-xs text-slate-400 dark:text-slate-500">
          Всего {data.totalElements}
        </div>
      )}
    </div>
  )
}

function UserThanksCard({
  thanks,
  direction,
}: {
  thanks: UserThanks
  direction: 'received' | 'sent'
}) {
  const isIncoming = direction === 'received'
  const counterpart = isIncoming ? thanks.fromUserName : thanks.toUserName

  return (
    <div className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-[#30363d] p-4">
      <div className="flex items-start gap-3">
        <div
          className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center ${
            isIncoming
              ? 'bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400'
              : 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400'
          }`}
        >
          {isIncoming ? <IconArrowDown size={16} /> : <IconArrowUp size={16} />}
        </div>

        <div className="flex-1 min-w-0">
          <div className="text-sm text-slate-900 dark:text-white">
            {isIncoming ? (
              <>
                <span className="font-medium">{counterpart}</span>{' '}
                <span className="text-slate-500 dark:text-slate-400">
                  поблагодарил вас
                </span>
              </>
            ) : (
              <>
                <span className="text-slate-500 dark:text-slate-400">
                  Вы поблагодарили
                </span>{' '}
                <span className="font-medium">{counterpart}</span>
              </>
            )}
          </div>

          {thanks.comment && (
            <div className="mt-2 bg-slate-50 dark:bg-[#0d1117] rounded-md px-3 py-2 text-sm text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-[#30363d]">
              «{thanks.comment}»
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span
              className={`text-xs px-2 py-0.5 rounded border font-medium ${TAG_COLOR[thanks.tag] || TAG_COLOR.OTHER}`}
            >
              {TAG_LABEL[thanks.tag] || thanks.tag}
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-500">
              {formatDate(thanks.createdAt)}
            </span>
          </div>
        </div>

        <div className="shrink-0 text-right">
          <div
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-sm font-semibold border ${
              isIncoming
                ? 'bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-400 border-brand-200 dark:border-brand-500/30'
                : 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/30'
            }`}
          >
            {isIncoming ? '+' : '-'}
            {thanks.amount.toFixed(0)}
          </div>
          <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
            монет
          </div>
        </div>
      </div>
    </div>
  )
}