import { useState, useRef, useMemo, useEffect } from 'react'
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
import { getProfile, updateAvatar, getBalanceHistory, getRatingHistory } from '../api/users'
import { uploadFile } from '../api/files'
import { touchStreak, type StreakInfo } from '../api/streak'
import { notify } from '../lib/notify'
import Avatar from '../components/Avatar'
import StreakBadge from '../components/StreakBadge'
import ImageCropperModal from '../components/ImageCropperModal'
import {
  IconChart,
  IconStar,
  IconTrophy,
  IconBag,
  IconCheck,
  IconArrowRight,
  IconArrowUp,
  IconArrowDown,
} from '../components/Icons'
import type { AchievementProfileDTO } from '../types'

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
  return { current: current.name, next: next?.name ?? null, progress, nextAt: next?.min ?? null }
}

export default function Profile() {
  const user = useAuth((s) => s.user)!
  const updateUser = useAuth((s) => s.updateUser)

  const profile = useFetch(() => getProfile(user.id), [user.id])
  const balanceHistory = useFetch(() => getBalanceHistory(user.id, 100), [user.id])
  const ratingHistory = useFetch(() => getRatingHistory(user.id, 100), [user.id])

  const [uploading, setUploading] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [streak, setStreak] = useState<StreakInfo | null>(null)
  const [cropperSrc, setCropperSrc] = useState<string | null>(null)
  const fileInput = useRef<HTMLInputElement>(null)

  const p = profile.data
  const currentAvatar = avatarUrl ?? p?.avatarUrl
  const levelInfo = p ? getLevelInfo(p.lifetimeRating) : null

  useEffect(() => {
    if (!user.id) return
    touchStreak(user.id)
      .then(setStreak)
      .catch(() => {})
  }, [user.id])

  const ratingChartData = useMemo(() => {
    if (!ratingHistory.data) return []
    const sorted = [...ratingHistory.data].reverse()
    let sum = 0
    return sorted.map((t) => {
      sum += t.amount
      return {
        date: new Date(t.createdAt).toLocaleDateString('ru-RU', {
          day: '2-digit',
          month: '2-digit',
        }),
        value: Math.max(0, Math.round(sum * 10) / 10),
      }
    })
  }, [ratingHistory.data])

  const balanceChartData = useMemo(() => {
    if (!balanceHistory.data) return []
    const sorted = [...balanceHistory.data].reverse()
    let sum = 0
    return sorted.map((t) => {
      const isOut = t.fromUserId === user.id && t.type !== 'MANAGER_BONUS' && t.type !== 'ADMIN_ADJUSTMENT'
      const delta = isOut ? -t.amount : t.amount
      sum += delta
      return {
        date: new Date(t.createdAt).toLocaleDateString('ru-RU', {
          day: '2-digit',
          month: '2-digit',
        }),
        value: Math.max(0, Math.round(sum * 100) / 100),
      }
    })
  }, [balanceHistory.data, user.id])

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      notify.error('Выберите изображение')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      notify.error('Файл больше 10 МБ')
      return
    }
    const url = URL.createObjectURL(file)
    setCropperSrc(url)
    if (fileInput.current) fileInput.current.value = ''
  }

  async function handleCropped(blob: Blob) {
    setUploading(true)
    try {
      const file = new File([blob], 'avatar.jpg', { type: 'image/jpeg' })
      const url = await uploadFile(file)
      await updateAvatar(user.id, user.id, url)
      setAvatarUrl(url)
      updateUser({ avatarUrl: url })
      notify.success('Аватар обновлён')
    } catch (e) {
      notify.error(e)
    } finally {
      setUploading(false)
      if (cropperSrc) URL.revokeObjectURL(cropperSrc)
      setCropperSrc(null)
    }
  }

  function handleCancelCrop() {
    if (cropperSrc) URL.revokeObjectURL(cropperSrc)
    setCropperSrc(null)
  }

  if (profile.loading) return <div className="text-slate-500">Загрузка...</div>
  if (profile.error) return <div className="text-red-600">{profile.error}</div>
  if (!p) return null

  const last5Coins = balanceHistory.data?.slice(0, 5) ?? []
  const last5Rating = ratingHistory.data?.slice(0, 5) ?? []

  return (
    <div className="space-y-6">
      {/* HERO */}
      <div className="bg-white dark:bg-[#161b22] rounded-2xl border border-slate-200 dark:border-[#30363d] p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="relative group shrink-0">
            <Avatar name={p.name} avatarUrl={currentAvatar} size="xl" />
            <button
              onClick={() => fileInput.current?.click()}
              disabled={uploading}
              className="absolute inset-0 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center text-xs font-medium transition disabled:cursor-wait"
            >
              {uploading ? '...' : 'Сменить'}
            </button>
            <input
              ref={fileInput}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">{p.name}</h1>
            <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">{p.email}</div>
            <div className="flex flex-wrap gap-2 justify-center sm:justify-start mt-3">
              <span className="text-xs bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-400 px-2.5 py-1 rounded-full font-medium">
                {p.role}
              </span>
              <span className="text-xs bg-slate-100 dark:bg-[#0d1117] text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-full">
                {p.departmentName || 'Без отдела'}
              </span>
              {streak && <StreakBadge streak={streak} />}
            </div>
          </div>
        </div>

        {levelInfo && (
          <div className="mt-6 pt-6 border-t border-slate-200 dark:border-[#30363d]">
            <div className="flex items-center justify-between text-sm mb-2">
              <div className="flex items-center gap-2">
                <span className="text-slate-500 dark:text-slate-400">Уровень:</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {levelInfo.current}
                </span>
                {levelInfo.next && (
                  <span className="inline-flex items-center gap-1 text-slate-400 dark:text-slate-500">
                    <IconArrowRight size={12} />
                    <span>{levelInfo.next}</span>
                  </span>
                )}
              </div>
              <div className="text-slate-500 dark:text-slate-400 text-xs">
                {levelInfo.next
                  ? `${(levelInfo.nextAt! - p.lifetimeRating).toFixed(1)} до следующего`
                  : 'Максимум'}
              </div>
            </div>
            <div className="h-2.5 bg-slate-100 dark:bg-[#0d1117] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-brand-500 to-emerald-500 rounded-full transition-all duration-700"
                style={{ width: `${levelInfo.progress}%` }}
              />
            </div>
            <div className="text-xs text-slate-400 dark:text-slate-500 mt-1.5">
              Репутация: {p.lifetimeRating.toFixed(1)}
              {levelInfo.nextAt && ` / ${levelInfo.nextAt}`}
            </div>
          </div>
        )}
      </div>

      {/* 4 стата */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          icon={<IconBag />}
          label="Баланс"
          value={p.balance.toFixed(0)}
          suffix="монет"
          gradient="from-amber-400 to-orange-500"
        />
        <StatCard
          icon={<IconTrophy />}
          label="Рейтинг сезона"
          value={p.currentRating.toFixed(1)}
          suffix="очков"
          gradient="from-brand-500 to-emerald-600"
        />
        <StatCard
          icon={<IconStar />}
          label="Репутация"
          value={p.lifetimeRating.toFixed(1)}
          suffix="всего"
          gradient="from-blue-400 to-indigo-600"
        />
        <StatCard
          icon={<IconChart />}
          label="Место в сезоне"
          value={`${p.currentPlace}`}
          suffix={`из ${p.totalUsers}`}
          gradient="from-purple-400 to-pink-600"
        />
      </div>

      {/* Монеты */}
      <div className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-[#30363d] p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="font-semibold text-slate-900 dark:text-white">Динамика баланса</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Последние операции с монетами
            </div>
          </div>
          <Link
            to="/history/coins"
            className="text-xs text-brand-600 dark:text-brand-400 hover:underline shrink-0 inline-flex items-center gap-1"
          >
            Вся история <IconArrowRight size={12} />
          </Link>
        </div>

        {balanceChartData.length === 0 ? (
          <div className="h-[180px] flex items-center justify-center text-sm text-slate-400 dark:text-slate-500">
            Нет данных
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={balanceChartData}>
              <defs>
                <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#94a3b8" tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" tickLine={false} width={40} />
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
                dataKey="value"
                stroke="#f59e0b"
                strokeWidth={2}
                fill="url(#balanceGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}

        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-[#30363d]">
          <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
            Последние 5 операций
          </div>
          {last5Coins.length === 0 ? (
            <div className="text-xs text-slate-400 dark:text-slate-500 py-4 text-center">
              Нет операций
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-[#30363d]">
              {last5Coins.map((t) => {
                const isOut = t.fromUserId === user.id && t.type !== 'MANAGER_BONUS' && t.type !== 'ADMIN_ADJUSTMENT'
                return (
                  <div key={t.id} className="py-2 flex items-start gap-3">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                        isOut
                          ? 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400'
                          : 'bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400'
                      }`}
                    >
                      {isOut ? '-' : '+'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-slate-900 dark:text-white truncate">
                        {t.comment || t.type}
                      </div>
                      <div className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                        {new Date(t.createdAt).toLocaleString('ru-RU')}
                      </div>
                    </div>
                    <div
                      className={`text-sm font-semibold shrink-0 ${
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
      </div>

      {/* Рейтинг */}
      <div className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-[#30363d] p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="font-semibold text-slate-900 dark:text-white">Динамика рейтинга</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Последние начисления рейтинга
            </div>
          </div>
          <Link
            to="/history/rating"
            className="text-xs text-brand-600 dark:text-brand-400 hover:underline shrink-0 inline-flex items-center gap-1"
          >
            Вся история <IconArrowRight size={12} />
          </Link>
        </div>

        {ratingChartData.length === 0 ? (
          <div className="h-[180px] flex items-center justify-center text-sm text-slate-400 dark:text-slate-500">
            Нет данных
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={ratingChartData}>
              <defs>
                <linearGradient id="ratingGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#94a3b8" tickLine={false} />
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
                dataKey="value"
                stroke="#10b981"
                strokeWidth={2}
                fill="url(#ratingGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}

        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-[#30363d]">
          <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
            Последние 5 изменений
          </div>
          {last5Rating.length === 0 ? (
            <div className="text-xs text-slate-400 dark:text-slate-500 py-4 text-center">
              Нет изменений
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-[#30363d]">
              {last5Rating.map((t) => {
                const isPositive = t.amount > 0
                return (
                  <div key={t.id} className="py-2 flex items-start gap-3">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                        isPositive
                          ? 'bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400'
                          : 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400'
                      }`}
                    >
                      {isPositive ? <IconArrowUp size={14} /> : <IconArrowDown size={14} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-slate-900 dark:text-white truncate">
                        {t.reason}
                      </div>
                      <div className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                        {new Date(t.createdAt).toLocaleString('ru-RU')}
                      </div>
                    </div>
                    <div
                      className={`text-sm font-semibold shrink-0 ${
                        isPositive
                          ? 'text-brand-600 dark:text-brand-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}
                    >
                      {isPositive ? '+' : ''}
                      {t.amount.toFixed(1)}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Ачивки */}
      {p.achievements && p.achievements.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Достижения
            </h2>
            <div className="text-xs text-slate-400 dark:text-slate-500">
              Получено: {p.achievements.filter((a) => a.isEarned).length} / {p.achievements.length}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {p.achievements.map((a) => (
              <AchievementGroupCard key={a.groupCode} group={a} />
            ))}
          </div>
        </div>
      )}

      {/* Кроппер */}
      {cropperSrc && (
        <ImageCropperModal
          imageSrc={cropperSrc}
          aspect={1}
          cropShape="round"
          outputWidth={400}
          outputHeight={400}
          title="Аватар"
          onCancel={handleCancelCrop}
          onCrop={handleCropped}
        />
      )}
    </div>
  )
}

function AchievementGroupCard({ group }: { group: AchievementProfileDTO }) {
  const earnedCount = group.levels.filter((l) => l.isEarned).length
  const totalLevels = group.levels.length
  const earnedCoins = group.levels
    .filter((l) => l.isEarned)
    .reduce((s, l) => s + l.rewardCoins, 0)
  const totalCoins = group.levels.reduce((s, l) => s + l.rewardCoins, 0)

  return (
    <div
      className={`rounded-xl border p-4 transition ${
        group.isEarned
          ? 'border-brand-300 dark:border-brand-500/50 bg-white dark:bg-[#161b22]'
          : 'border-slate-200 dark:border-[#30363d] bg-white dark:bg-[#161b22] opacity-75'
      }`}
    >
      <div className="flex items-start gap-3 mb-3">
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
            group.isEarned
              ? 'bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400'
              : 'bg-slate-100 dark:bg-[#0d1117] text-slate-400 dark:text-slate-500'
          }`}
        >
          <IconTrophy size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-slate-900 dark:text-white truncate">
            {group.name}
          </div>
          {group.description && (
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
              {group.description}
            </div>
          )}
        </div>
        <div
          className={`shrink-0 text-xs px-2 py-0.5 rounded font-medium ${
            group.isEarned
              ? 'bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-400'
              : 'bg-slate-100 dark:bg-[#0d1117] text-slate-500 dark:text-slate-400'
          }`}
        >
          {earnedCount}/{totalLevels}
        </div>
      </div>

      <div className="space-y-1.5">
        {group.levels.map((lvl) => (
          <div
            key={lvl.level}
            className={`flex items-start gap-2.5 px-2.5 py-2 rounded-md ${
              lvl.isEarned
                ? 'bg-brand-50 dark:bg-brand-500/5'
                : 'bg-slate-50 dark:bg-[#0d1117]'
            }`}
          >
            <div
              className={`w-6 h-6 rounded flex items-center justify-center shrink-0 text-xs font-bold ${
                lvl.isEarned
                  ? 'bg-brand-600 text-white'
                  : 'bg-slate-200 dark:bg-[#30363d] text-slate-500 dark:text-slate-400'
              }`}
            >
              {lvl.level}
            </div>

            <div className="flex-1 min-w-0">
              <div
                className={`text-xs font-medium truncate ${
                  lvl.isEarned
                    ? 'text-slate-900 dark:text-white'
                    : 'text-slate-700 dark:text-slate-300'
                }`}
              >
                {lvl.title}
              </div>
              {lvl.condition && (
                <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5">
                  {lvl.condition}
                </div>
              )}
              {lvl.isEarned && lvl.earnedAt && (
                <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                  Получено {new Date(lvl.earnedAt).toLocaleDateString('ru-RU')}
                </div>
              )}
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {lvl.rewardCoins > 0 && (
                <span
                  className={`text-[11px] font-semibold ${
                    lvl.isEarned
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-slate-400 dark:text-slate-500'
                  }`}
                >
                  +{lvl.rewardCoins.toFixed(0)}
                </span>
              )}
              {lvl.isEarned && (
                <span className="text-brand-600 dark:text-brand-400">
                  <IconCheck size={14} />
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {totalCoins > 0 && (
        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-2.5 pt-2.5 border-t border-slate-100 dark:border-[#30363d]">
          {group.isEarned ? (
            <>
              Заработано:{' '}
              <span className="font-semibold text-amber-600 dark:text-amber-400">
                {earnedCoins.toFixed(0)}
              </span>{' '}
              из {totalCoins.toFixed(0)} монет
            </>
          ) : (
            <>Можно получить до {totalCoins.toFixed(0)} монет</>
          )}
        </div>
      )}
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
  suffix,
  gradient,
}: {
  icon: React.ReactNode
  label: string
  value: string
  suffix: string
  gradient: string
}) {
  return (
    <div className="relative overflow-hidden bg-white dark:bg-[#161b22] p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-[#30363d]">
      <div
        className={`absolute top-0 right-0 w-20 h-20 rounded-full bg-gradient-to-br ${gradient} opacity-10 -mr-6 -mt-6`}
      />
      <div className="relative">
        <div
          className={`w-8 h-8 rounded-lg bg-gradient-to-br ${gradient} text-white flex items-center justify-center shadow-sm mb-2`}
        >
          {icon}
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          {label}
        </div>
        <div className="flex items-baseline gap-1.5 mt-1 flex-wrap">
          <span className="text-xl sm:text-2xl font-semibold text-slate-900 dark:text-white">
            {value}
          </span>
          <span className="text-xs text-slate-400 dark:text-slate-500">{suffix}</span>
        </div>
      </div>
    </div>
  )
}