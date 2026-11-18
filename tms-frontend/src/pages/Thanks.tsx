import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../store/auth'
import { useFetch } from '../hooks/useFetch'
import {
  getThanksFeed,
  getUserThanks,
  getThanksStats,
  getTopThankedWeek,
  type ThanksTag,
  type ThanksFeed,
  type UserThanks,
  type Page,
} from '../api/thanks'
import Avatar from '../components/Avatar'

// ==========================================
// === Теги
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
    'bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-400',
  FOR_HELP:
    'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400',
  INITIATIVE:
    'bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400',
  MENTORING:
    'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400',
  TRANSFER:
    'bg-slate-100 dark:bg-slate-500/10 text-slate-600 dark:text-slate-400',
  OTHER:
    'bg-slate-100 dark:bg-slate-500/10 text-slate-600 dark:text-slate-400',
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
  const topWeek = useFetch(() => getTopThankedWeek(3), [])

  return (
    <div className="space-y-6">
      {/* ============ HERO ============ */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500 via-orange-500 to-rose-600 text-white">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex-1 min-w-0">
              <div className="text-sm text-white/80 uppercase tracking-wider mb-1">
                Благодарности
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold">
                Скажите спасибо коллегам
              </h1>
              <p className="text-sm text-white/85 mt-1.5 max-w-lg">
                Отмечайте вклад коллег и делитесь монетами — это бесплатно для вас и ценно для них
              </p>
            </div>

            <Link
              to="/users"
              className="shrink-0 bg-white/20 hover:bg-white/30 backdrop-blur rounded-lg px-5 py-2.5 text-sm font-medium transition"
            >
              Поблагодарить коллегу
            </Link>
          </div>

          {/* Статистика */}
          {stats.data && (
            <div className="mt-6 grid grid-cols-2 gap-4 max-w-md">
              <div>
                <div className="text-[11px] text-white/70 uppercase tracking-wider">
                  Получено
                </div>
                <div className="text-3xl sm:text-4xl font-bold mt-0.5">
                  {stats.data.totalReceived}
                </div>
                <div className="text-xs text-white/70 mt-0.5">
                  {stats.data.totalCoinsReceived.toFixed(0)} монет
                </div>
              </div>
              <div>
                <div className="text-[11px] text-white/70 uppercase tracking-wider">
                  Отправлено
                </div>
                <div className="text-3xl sm:text-4xl font-bold mt-0.5">
                  {stats.data.totalSent}
                </div>
                <div className="text-xs text-white/70 mt-0.5">
                  {stats.data.totalCoinsSent.toFixed(0)} монет
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ============ ТОП НЕДЕЛИ ============ */}
      {topWeek.data && topWeek.data.length > 0 && (
        <div className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-[#30363d] p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-semibold text-slate-900 dark:text-white">
              Больше всего спасибо на этой неделе
            </div>
            <Link
              to="/users"
              className="text-xs text-brand-600 dark:text-brand-400 hover:underline"
            >
              Все сотрудники
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {topWeek.data.map((t, i) => (
              <Link
                key={t.userId}
                to={`/users/${t.userId}`}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-[#0d1117] transition"
              >
                <div className="w-6 text-center text-sm font-bold text-slate-400 shrink-0">
                  {i + 1}
                </div>
                <Avatar name={t.userName} avatarUrl={t.avatarUrl} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-slate-900 dark:text-white truncate">
                    {t.userName}
                  </div>
                  <div className="text-xs text-amber-600 dark:text-amber-400">
                    {t.count} {t.count === 1 ? 'спасибо' : t.count < 5 ? 'спасибо' : 'спасибо'}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ============ ТАБЫ ============ */}
      <div className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-[#30363d] p-1.5 flex gap-1">
        <button
          onClick={() => setTab('feed')}
          className={`flex-1 px-4 py-2.5 text-sm font-medium rounded-lg transition ${
            tab === 'feed'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#21262d]'
          }`}
        >
          Лента
        </button>
        <button
          onClick={() => setTab('received')}
          className={`flex-1 px-4 py-2.5 text-sm font-medium rounded-lg transition ${
            tab === 'received'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#21262d]'
          }`}
        >
          Мне
          {stats.data && stats.data.totalReceived > 0 && (
            <span className="ml-1.5 text-xs opacity-70">
              {stats.data.totalReceived}
            </span>
          )}
        </button>
        <button
          onClick={() => setTab('sent')}
          className={`flex-1 px-4 py-2.5 text-sm font-medium rounded-lg transition ${
            tab === 'sent'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#21262d]'
          }`}
        >
          От меня
          {stats.data && stats.data.totalSent > 0 && (
            <span className="ml-1.5 text-xs opacity-70">
              {stats.data.totalSent}
            </span>
          )}
        </button>
      </div>

      {/* ============ КОНТЕНТ ============ */}
      {tab === 'feed' && (
        <FeedTab loading={feed.loading} error={feed.error} items={feed.data} />
      )}

      {tab === 'received' && <UserThanksTab userId={user.id} direction="received" />}
      {tab === 'sent' && <UserThanksTab userId={user.id} direction="sent" />}
    </div>
  )
}

// ==========================================
// === ЛЕНТА
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
  if (loading) {
    return (
      <div className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-[#30363d] p-8 text-center text-slate-500">
        Загрузка...
      </div>
    )
  }
  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 rounded-xl border border-red-200 dark:border-red-500/30 p-4 text-sm">
        {error}
      </div>
    )
  }
  if (!items) return null

  if (items.length === 0) {
    return (
      <div className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-[#30363d] p-10 sm:p-12 text-center">
        <div className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
          В ленте пока пусто
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Станьте первым, кто скажет спасибо коллеге
        </div>
        <Link
          to="/users"
          className="inline-block bg-brand-600 hover:bg-brand-700 text-white rounded-lg px-4 py-2 text-sm font-medium transition"
        >
          Найти коллегу
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-2.5">
      {items.map((t) => (
        <div
          key={t.transactionId}
          className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-[#30363d] p-5"
        >
          {/* Верхняя строка: два аватара и имена */}
          <div className="flex items-center gap-2 mb-3">
            <Avatar name={t.fromUserName} size="sm" />
            <div className="w-5 h-px bg-slate-300 dark:bg-slate-600 shrink-0" />
            <Avatar name={t.toUserName} size="sm" />
            <div className="flex-1 min-w-0 ml-1">
              <div className="text-sm font-medium text-slate-900 dark:text-white truncate">
                {t.fromUserName}
                <span className="text-slate-400 dark:text-slate-500 font-normal mx-1.5">
                  поблагодарил
                </span>
                {t.toUserName}
              </div>
            </div>
            <div className="text-base font-bold text-amber-600 dark:text-amber-400 shrink-0">
              +{t.amount.toFixed(0)}
            </div>
          </div>

          {/* Комментарий */}
          {t.comment && (
            <div className="text-sm text-slate-700 dark:text-slate-300 mb-3 pl-0.5">
              «{t.comment}»
            </div>
          )}

          {/* Тег и время */}
          <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-[#30363d]">
            <span
              className={`text-xs px-2 py-0.5 rounded font-medium ${
                TAG_COLOR[t.tag] || TAG_COLOR.OTHER
              }`}
            >
              {TAG_LABEL[t.tag] || t.tag}
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-500">
              {formatDate(t.createdAt)}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

// ==========================================
// === МНЕ / ОТ МЕНЯ
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

  if (loading) {
    return (
      <div className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-[#30363d] p-8 text-center text-slate-500">
        Загрузка...
      </div>
    )
  }
  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 rounded-xl border border-red-200 dark:border-red-500/30 p-4 text-sm">
        {error}
      </div>
    )
  }
  if (!data) return null

  if (data.content.length === 0) {
    return (
      <div className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-[#30363d] p-10 sm:p-12 text-center">
        <div className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
          {direction === 'received'
            ? 'Вам пока не отправляли благодарностей'
            : 'Вы пока никого не благодарили'}
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          {direction === 'received'
            ? 'Участвуйте в активностях — коллеги заметят ваш вклад'
            : 'Скажите спасибо коллеге — это приятно и полезно'}
        </div>
        {direction === 'sent' && (
          <Link
            to="/users"
            className="inline-block bg-brand-600 hover:bg-brand-700 text-white rounded-lg px-4 py-2 text-sm font-medium transition"
          >
            Найти коллегу
          </Link>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-2.5">
      {data.content.map((t) => (
        <UserThanksCard key={t.transactionId} thanks={t} direction={direction} />
      ))}

      {!data.last && (
        <div className="pt-2 flex justify-center">
          <button
            onClick={() => {
              const next = page + 1
              setPage(next)
              loadPage(next, true)
            }}
            disabled={appending}
            className="text-sm text-brand-600 dark:text-brand-400 hover:underline disabled:opacity-50 px-4 py-2 font-medium"
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

// ==========================================
// === КАРТОЧКА МНЕ / ОТ МЕНЯ
// ==========================================
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
    <div className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-[#30363d] p-5">
      <div className="flex items-center gap-3 mb-3">
        <Avatar name={counterpart} size="sm" />
        <div className="flex-1 min-w-0">
          <div className="text-sm text-slate-900 dark:text-white">
            {isIncoming ? (
              <>
                <span className="font-medium">{counterpart}</span>
                <span className="text-slate-400 dark:text-slate-500 mx-1.5 font-normal">
                  поблагодарил вас
                </span>
              </>
            ) : (
              <>
                <span className="text-slate-400 dark:text-slate-500 font-normal">
                  Вы поблагодарили{' '}
                </span>
                <span className="font-medium">{counterpart}</span>
              </>
            )}
          </div>
        </div>
        <div
          className={`text-base font-bold shrink-0 ${
            isIncoming
              ? 'text-amber-600 dark:text-amber-400'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          {isIncoming ? '+' : '−'}
          {thanks.amount.toFixed(0)}
        </div>
      </div>

      {thanks.comment && (
        <div className="text-sm text-slate-700 dark:text-slate-300 mb-3">
          «{thanks.comment}»
        </div>
      )}

      <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-[#30363d]">
        <span
          className={`text-xs px-2 py-0.5 rounded font-medium ${
            TAG_COLOR[thanks.tag] || TAG_COLOR.OTHER
          }`}
        >
          {TAG_LABEL[thanks.tag] || thanks.tag}
        </span>
        <span className="text-xs text-slate-400 dark:text-slate-500">
          {formatDate(thanks.createdAt)}
        </span>
      </div>
    </div>
  )
}