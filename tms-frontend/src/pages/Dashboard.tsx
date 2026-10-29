import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'
import { useAuth } from '../store/auth'
import { useFetch } from '../hooks/useFetch'
import { getProfile, getActivityChart, type ActivityPoint } from '../api/users'
import { getEvents, getMyParticipations } from '../api/events'
import { touchStreak, type StreakInfo } from '../api/streak'
import { getTopThankedWeek, type TopThanked } from '../api/thanks'
import { getLatestNews } from '../api/news'
import Avatar from '../components/Avatar'
import StreakCard from '../components/StreakCard'
import {
  IconBag,
  IconCalendar,
  IconTarget,
  IconTrophy,
  IconStar,
  IconChart,
  IconPin,
  IconArrowRight,
  IconEye,
  IconStarFilled,
} from '../components/Icons'

function getLevelInfo(rating: number) {
  const levels = [
    { name: 'Junior', min: 0, max: 100 },
    { name: 'Middle', min: 100, max: 500 },
    { name: 'Senior', min: 500, max: 1500 },
    { name: 'Legend', min: 1500, max: Infinity },
  ]
  const current = levels.find((l) => rating >= l.min && rating < l.max) || levels[3]
  const next = levels[levels.indexOf(current) + 1]
  const progress = next
    ? Math.min(100, ((rating - current.min) / (next.min - current.min)) * 100)
    : 100
  return {
    current: current.name,
    next: next?.name ?? null,
    progress,
    nextAt: next?.min ?? null,
    remaining: next ? next.min - rating : 0,
  }
}

export default function Dashboard() {
  const user = useAuth((s) => s.user)!
  const profile = useFetch(() => getProfile(user.id), [user.id])
  const events = useFetch(() => getEvents(user.id), [user.id])
  const myParts = useFetch(() => getMyParticipations(user.id), [user.id])
  const activity = useFetch<ActivityPoint[]>(() => getActivityChart(user.id), [user.id])
  const topThanked = useFetch<TopThanked[]>(() => getTopThankedWeek(3), [])
  const news = useFetch(() => getLatestNews(3, user.id), [user.id])

  const [streak, setStreak] = useState<StreakInfo | null>(null)

  useEffect(() => {
    if (!user.id) return
    touchStreak(user.id)
      .then(setStreak)
      .catch(() => {})
  }, [user.id])

  const p = profile.data
  const levelInfo = p ? getLevelInfo(p.lifetimeRating) : null
  const participations = new Set(myParts.data ?? [])

  const allEvents = (events.data ?? []).filter((e) => e.eventStatus === 'ASSIGNED')
  const myEvents = allEvents.filter((e) => participations.has(e.id))
  const availableEvents = allEvents.filter(
    (e) => !participations.has(e.id) && e.organizerId !== user.id
  )

  return (
    <div className="space-y-6">
      {/* HERO */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-500 via-brand-600 to-emerald-700 text-white p-6 sm:p-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-48 h-48 bg-white/5 rounded-full blur-2xl pointer-events-none" />

        <div className="relative">
          <div className="text-sm text-white/80">Добро пожаловать</div>
          <h1 className="text-2xl sm:text-3xl font-bold mt-1">{user.name}</h1>

          {p && levelInfo && (
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
              <div>
                <div className="text-xs text-white/70 uppercase tracking-wider">Баланс</div>
                <div className="text-2xl sm:text-3xl font-bold mt-1">
                  {p.balance.toFixed(0)}{' '}
                  <span className="text-sm font-medium text-white/80">монет</span>
                </div>
              </div>
              <div>
                <div className="text-xs text-white/70 uppercase tracking-wider">Рейтинг сезона</div>
                <div className="text-2xl sm:text-3xl font-bold mt-1">
                  {p.currentRating.toFixed(1)}
                </div>
              </div>
              <div>
                <div className="text-xs text-white/70 uppercase tracking-wider">Уровень</div>
                <div className="text-2xl sm:text-3xl font-bold mt-1">{levelInfo.current}</div>
              </div>
              <div>
                <div className="text-xs text-white/70 uppercase tracking-wider">Место в сезоне</div>
                <div className="text-2xl sm:text-3xl font-bold mt-1">
                  {p.currentPlace}
                  <span className="text-sm font-medium text-white/80"> / {p.totalUsers}</span>
                </div>
              </div>
            </div>
          )}

          {levelInfo && levelInfo.next && (
            <div className="mt-6">
              <div className="flex items-center justify-between text-xs text-white/80 mb-1.5">
                <span>
                  До уровня «{levelInfo.next}»: {levelInfo.remaining.toFixed(1)} репутации
                </span>
                <span className="font-semibold">{Math.round(levelInfo.progress)}%</span>
              </div>
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all duration-500"
                  style={{ width: `${levelInfo.progress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Streak + Топ-3 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {streak && <StreakCard streak={streak} />}

        <div className="bg-white dark:bg-[#161b22] rounded-2xl border border-slate-200 dark:border-[#30363d] p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <IconStar size={18} className="text-amber-500" />
              <h2 className="font-semibold text-slate-900 dark:text-white">
                Топ коллег недели
              </h2>
            </div>
            <Link
              to="/thanks"
              className="text-xs text-brand-600 dark:text-brand-400 hover:underline inline-flex items-center gap-1"
            >
              Все <IconArrowRight size={12} />
            </Link>
          </div>

          {!topThanked.data || topThanked.data.length === 0 ? (
            <div className="py-8 text-center text-sm text-slate-400 dark:text-slate-500">
              Пока нет благодарностей за эту неделю
            </div>
          ) : (
            <div className="space-y-3">
              {topThanked.data.map((t, i) => (
                <Link
                  key={t.userId}
                  to={`/users/${t.userId}`}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-[#0d1117] transition"
                >
                  <div
                    className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center text-sm font-bold ${
                      i === 0
                        ? 'bg-gradient-to-br from-yellow-400 to-amber-600 text-white'
                        : i === 1
                        ? 'bg-gradient-to-br from-slate-300 to-slate-500 text-white'
                        : 'bg-gradient-to-br from-orange-400 to-amber-700 text-white'
                    }`}
                  >
                    {i + 1}
                  </div>
                  <Avatar name={t.userName} avatarUrl={t.avatarUrl} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-slate-900 dark:text-white truncate">
                      {t.userName}
                    </div>
                  </div>
                  <div className="text-xs font-semibold text-amber-600 dark:text-amber-400 shrink-0">
                    {t.count} спасибо
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* НОВОСТИ КОМПАНИИ */}
      {news.data && news.data.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Новости компании
            </h2>
            <Link
              to="/news"
              className="text-xs text-brand-600 dark:text-brand-400 hover:underline inline-flex items-center gap-1"
            >
              Все новости <IconArrowRight size={12} />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {news.data.map((n) => (
              <Link
                key={n.id}
                to={`/news/${n.id}`}
                className="group bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-[#30363d] overflow-hidden hover:shadow-md hover:border-brand-400 dark:hover:border-brand-500/50 transition"
              >
                <div className="aspect-video bg-slate-100 dark:bg-[#0d1117] overflow-hidden relative">
                  {n.coverUrl ? (
                    <img
                      src={n.coverUrl}
                      alt={n.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-500 to-emerald-600 text-white text-3xl font-bold">
                      {n.title.charAt(0).toUpperCase()}
                    </div>
                  )}
                  {n.isPinned && (
                    <span className="absolute top-2 left-2 inline-flex items-center gap-1 bg-amber-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-medium">
                      <IconPin size={10} />
                      Закреплено
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-medium text-sm text-slate-900 dark:text-white line-clamp-2 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition">
                    {n.title}
                  </h3>
                  <div className="flex items-center justify-between text-xs text-slate-400 dark:text-slate-500 mt-2">
                    <span>
                      {new Date(n.createdAt).toLocaleDateString('ru-RU', {
                        day: '2-digit',
                        month: 'short',
                      })}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1">
                        <IconEye size={11} />
                        {n.views}
                      </span>
                      {n.averageRating !== null && (
                        <span className="inline-flex items-center gap-0.5 text-amber-600 dark:text-amber-400 font-medium">
                          <IconStarFilled size={11} />
                          {n.averageRating.toFixed(1)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Быстрые действия */}
      <div>
        <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
          Быстрые действия
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <QuickAction
            to="/catalog"
            icon={<IconBag />}
            title="Магазин"
            subtitle="Потратить монеты"
            gradient="from-amber-400 to-orange-500"
          />
          <QuickAction
            to="/events"
            icon={<IconCalendar />}
            title="События"
            subtitle="Все мероприятия"
            gradient="from-brand-500 to-emerald-600"
          />
          <QuickAction
            to="/quests"
            icon={<IconTarget />}
            title="Квесты"
            subtitle="Выполнить"
            gradient="from-blue-400 to-indigo-600"
          />
          <QuickAction
            to="/seasons"
            icon={<IconTrophy />}
            title="Сезоны"
            subtitle="Лидерборд"
            gradient="from-purple-400 to-pink-600"
          />
        </div>
      </div>

      {/* Активность за 7 дней */}
      <div className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-[#30363d] p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <IconChart size={16} className="text-brand-600 dark:text-brand-400" />
              Активность за неделю
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Заработано и потрачено монет по дням
            </div>
          </div>
        </div>

        {activity.loading ? (
          <div className="h-[180px] flex items-center justify-center text-slate-400 text-sm">
            Загрузка...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={activity.data ?? []}>
              <defs>
                <linearGradient id="earnedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="spentGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="dayLabel" tick={{ fontSize: 11 }} stroke="#94a3b8" tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" tickLine={false} width={30} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
              <Area
                type="monotone"
                dataKey="earned"
                name="Заработано"
                stroke="#10b981"
                strokeWidth={2}
                fill="url(#earnedGrad)"
              />
              <Area
                type="monotone"
                dataKey="spent"
                name="Потрачено"
                stroke="#f43f5e"
                strokeWidth={2}
                fill="url(#spentGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Два блока с событиями */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-[#30363d] p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold text-slate-900 dark:text-white">
                Мои подписки
              </h2>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Куда вы записаны
              </div>
            </div>
            <Link
              to="/events"
              className="text-xs text-brand-600 dark:text-brand-400 hover:underline inline-flex items-center gap-1"
            >
              Все <IconArrowRight size={12} />
            </Link>
          </div>

          {myEvents.length === 0 ? (
            <div className="py-8 text-center text-sm text-slate-400 dark:text-slate-500">
              Вы пока ни на что не записаны
            </div>
          ) : (
            <div className="space-y-2">
              {myEvents.slice(0, 4).map((e) => (
                <EventRow key={e.id} event={e} />
              ))}
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-[#30363d] p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold text-slate-900 dark:text-white">
                Доступные события
              </h2>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Куда можно записаться
              </div>
            </div>
            <Link
              to="/events"
              className="text-xs text-brand-600 dark:text-brand-400 hover:underline inline-flex items-center gap-1"
            >
              Все <IconArrowRight size={12} />
            </Link>
          </div>

          {availableEvents.length === 0 ? (
            <div className="py-8 text-center text-sm text-slate-400 dark:text-slate-500">
              Нет доступных событий
            </div>
          ) : (
            <div className="space-y-2">
              {availableEvents.slice(0, 4).map((e) => (
                <EventRow key={e.id} event={e} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Последние операции */}
      <div className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-[#30363d] p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-slate-900 dark:text-white">Последние операции</h2>
          <Link
            to="/history/coins"
            className="text-xs text-brand-600 dark:text-brand-400 hover:underline inline-flex items-center gap-1"
          >
            Вся история <IconArrowRight size={12} />
          </Link>
        </div>

        {!p || p.recentBalanceTransactions.length === 0 ? (
          <div className="text-sm text-slate-400 dark:text-slate-500 py-6 text-center">
            Пока нет операций
          </div>
        ) : (
          <div className="space-y-2">
            {p.recentBalanceTransactions.slice(0, 5).map((t) => {
              const isOut = t.fromUserId === user.id && t.type !== 'MANAGER_BONUS' && t.type !== 'ADMIN_ADJUSTMENT'
              return (
                <div key={t.id} className="flex items-start gap-2 text-sm">
                  <div
                    className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${
                      isOut ? 'bg-red-500' : 'bg-brand-500'
                    }`}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-slate-900 dark:text-white text-xs leading-tight line-clamp-2">
                      {t.comment || t.type}
                    </div>
                    <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                      {new Date(t.createdAt).toLocaleDateString('ru-RU', {
                        day: '2-digit',
                        month: '2-digit',
                      })}
                    </div>
                  </div>
                  <div
                    className={`text-xs font-medium shrink-0 ${
                      isOut
                        ? 'text-red-600 dark:text-red-400'
                        : 'text-brand-600 dark:text-brand-400'
                    }`}
                  >
                    {isOut ? '-' : '+'}
                    {t.amount.toFixed(0)}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Мини-статистика */}
      {p && (
        <div>
          <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
            Моя статистика
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <MiniStat
              icon={<IconCalendar />}
              label="Событий посещено"
              value={String(p.participatedEventsCount)}
            />
            <MiniStat
              icon={<IconStar />}
              label="Событий создано"
              value={String(p.organizedEventsCount)}
            />
            <MiniStat
              icon={<IconChart />}
              label="Репутация"
              value={p.lifetimeRating.toFixed(1)}
            />
            <MiniStat
              icon={<IconTrophy />}
              label="Отдел"
              value={p.departmentName || '—'}
            />
          </div>
        </div>
      )}
    </div>
  )
}

function EventRow({ event }: { event: any }) {
  const from = new Date(event.fromTime)
  return (
    <Link
      to="/events"
      className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-[#0d1117] transition"
    >
      <div className="w-11 h-11 rounded-lg bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-400 flex flex-col items-center justify-center shrink-0">
        <div className="text-xs font-medium">
          {from.toLocaleDateString('ru-RU', { month: 'short' })}
        </div>
        <div className="text-sm font-bold leading-none">
          {from.toLocaleDateString('ru-RU', { day: '2-digit' })}
        </div>
      </div>
      <div className="min-w-0 flex-1">
        <div className="font-medium text-sm text-slate-900 dark:text-white truncate">
          {event.nameEvent}
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
          <IconPin size={12} />
          {event.eventPlace || 'Онлайн'} ·{' '}
          {from.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
      {event.paidInCoins && event.rewardCoins && (
        <div className="text-xs bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 px-2 py-1 rounded shrink-0">
          +{event.rewardCoins.toFixed(0)}
        </div>
      )}
    </Link>
  )
}

function QuickAction({
  to,
  icon,
  title,
  subtitle,
  gradient,
}: {
  to: string
  icon: React.ReactNode
  title: string
  subtitle: string
  gradient: string
}) {
  return (
    <Link
      to={to}
      className="group bg-white dark:bg-[#161b22] p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-[#30363d] hover:border-brand-400 dark:hover:border-brand-500/50 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
    >
      <div
        className={`w-10 h-10 rounded-lg bg-gradient-to-br ${gradient} text-white flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-sm`}
      >
        {icon}
      </div>
      <div className="font-medium text-sm text-slate-900 dark:text-white">{title}</div>
      <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</div>
    </Link>
  )
}

function MiniStat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="bg-white dark:bg-[#161b22] p-4 rounded-xl border border-slate-200 dark:border-[#30363d]">
      <div className="text-slate-400 dark:text-slate-500">{icon}</div>
      <div className="text-xs text-slate-500 dark:text-slate-400 mt-2 uppercase tracking-wider">
        {label}
      </div>
      <div className="text-lg font-semibold text-slate-900 dark:text-white mt-0.5 truncate">
        {value}
      </div>
    </div>
  )
}