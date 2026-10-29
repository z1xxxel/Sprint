import { useState } from 'react'
import { useAuth } from '../store/auth'
import { useFetch } from '../hooks/useFetch'
import { getCurrentSeason } from '../api/seasons'
import Avatar from '../components/Avatar'
import { IconTrophy, IconStar, IconChart, IconUser } from '../components/Icons'
import type { LeaderboardEntry, SeasonResult, DepartmentResult } from '../types'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

function daysLeft(endDate: string) {
  const diff = new Date(endDate).getTime() - Date.now()
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
  return days > 0 ? days : 0
}

const PODIUM_GRADIENTS = [
  'from-yellow-400 via-amber-500 to-orange-600',
  'from-slate-300 via-slate-400 to-slate-500',
  'from-orange-400 via-amber-600 to-yellow-700',
]
const PODIUM_HEIGHTS = ['h-28', 'h-20', 'h-16']

const PARTICIPATION_REWARD = 100
const WINNING_DEPT_REWARDS = [2500, 1500, 1000] as const
const LOSING_DEPT_REWARDS = [1250, 750, 500] as const

// Цвета для призовых мест
const PLACE_COLORS: Record<1 | 2 | 3, string> = {
  1: 'bg-gradient-to-br from-yellow-400 to-amber-600 text-white',
  2: 'bg-gradient-to-br from-slate-300 to-slate-500 text-white',
  3: 'bg-gradient-to-br from-orange-400 to-amber-700 text-white',
}

type Tab = 'personal' | 'department'

/** Плашка с номером места — заменяет медали */
function PlaceBadge({
  place,
  size = 'md',
}: {
  place: 1 | 2 | 3
  size?: 'sm' | 'md' | 'lg'
}) {
  const dim = size === 'sm' ? 'w-6 h-6 text-xs' : size === 'lg' ? 'w-10 h-10 text-base' : 'w-8 h-8 text-sm'
  return (
    <span
      className={`${dim} ${PLACE_COLORS[place]} rounded-full flex items-center justify-center font-bold shadow-sm shrink-0`}
    >
      {place}
    </span>
  )
}

export default function Seasons() {
  const user = useAuth((s) => s.user)!
  const { data, loading, error } = useFetch(() => getCurrentSeason(user.id), [user.id])
  const [tab, setTab] = useState<Tab>('personal')

  if (loading) return <div className="text-slate-500">Загрузка...</div>
  if (error) return <div className="text-red-600">{error}</div>
  if (!data) return null

  const myPlace = data.currentLeaderboard.find((e) => e.userId === user.id)
  const totalActive = data.currentLeaderboard.length
  const left = daysLeft(data.endDate)

  const myDeptWonLastSeason = (data.previousDepartmentResults ?? []).some(
    (d) => d.place === 1 && d.departmentName === data.myDepartmentName
  )

  return (
    <div className="space-y-6">
      {/* HERO */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative p-6 sm:p-8">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <IconTrophy size={20} className="text-yellow-300" />
                <span className="text-sm text-white/80 uppercase tracking-wider">
                  Текущий сезон
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold">{data.name}</h1>
              <div className="text-sm text-white/80 mt-2">
                {formatDate(data.startDate)} — {formatDate(data.endDate)}
              </div>
            </div>

            {left > 0 && (
              <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur rounded-full px-4 py-1.5 shrink-0">
                <span className="w-2 h-2 rounded-full bg-green-300 animate-pulse" />
                <span className="text-sm font-medium">
                  {left} {left === 1 ? 'день' : left < 5 ? 'дня' : 'дней'} до конца
                </span>
              </div>
            )}
          </div>

          {myPlace && (
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div>
                <div className="text-xs text-white/70 uppercase tracking-wider">Моё место</div>
                <div className="text-3xl font-bold mt-1">
                  {myPlace.place}
                  <span className="text-base font-medium text-white/70"> / {totalActive}</span>
                </div>
              </div>
              <div>
                <div className="text-xs text-white/70 uppercase tracking-wider">
                  Рейтинг сезона
                </div>
                <div className="text-3xl font-bold mt-1">
                  {myPlace.currentRating.toFixed(1)}
                </div>
              </div>
              <div>
                <div className="text-xs text-white/70 uppercase tracking-wider">Репутация</div>
                <div className="text-3xl font-bold mt-1">
                  {myPlace.lifetimeRating.toFixed(1)}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Табы */}
      <div className="border-b border-slate-200 dark:border-[#30363d]">
        <div className="flex gap-1 -mb-px">
          <button
            onClick={() => setTab('personal')}
            className={`px-4 py-2.5 text-sm font-medium transition border-b-2 flex items-center gap-2 ${
              tab === 'personal'
                ? 'border-brand-600 text-brand-700 dark:text-brand-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <IconUser size={16} />
            Личный зачёт
          </button>
          <button
            onClick={() => setTab('department')}
            className={`px-4 py-2.5 text-sm font-medium transition border-b-2 flex items-center gap-2 ${
              tab === 'department'
                ? 'border-brand-600 text-brand-700 dark:text-brand-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <IconStar size={16} />
            Мой отдел
          </button>
        </div>
      </div>

      {tab === 'personal' && (
        <PersonalTab
          leaderboard={data.currentLeaderboard}
          currentUserId={user.id}
          prevResults={data.previousSeasonResults}
        />
      )}

      {tab === 'department' && (
        <DepartmentTab
          data={data}
          currentUserId={user.id}
          myDeptWonLastSeason={myDeptWonLastSeason}
        />
      )}
    </div>
  )
}

function PersonalTab({
  leaderboard,
  currentUserId,
  prevResults,
}: {
  leaderboard: LeaderboardEntry[]
  currentUserId: number
  prevResults: SeasonResult[]
}) {
  const top3 = leaderboard.slice(0, 3)
  const rest = leaderboard.slice(3)
  const topRating = top3[0]?.currentRating ?? 1

  return (
    <div className="space-y-6">
      {top3.length > 0 && (
        <div className="bg-gradient-to-b from-slate-50 to-white dark:from-[#0d1117] dark:to-[#161b22] rounded-2xl border border-slate-200 dark:border-[#30363d] p-6">
          <div className="text-center mb-6">
            <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Топ-3 сезона
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-4 items-end max-w-lg mx-auto">
            {top3[1] && (
              <PodiumCard
                entry={top3[1]}
                place={2}
                isMe={top3[1].userId === currentUserId}
              />
            )}
            {!top3[1] && <div />}

            {top3[0] && (
              <PodiumCard
                entry={top3[0]}
                place={1}
                isMe={top3[0].userId === currentUserId}
              />
            )}

            {top3[2] && (
              <PodiumCard
                entry={top3[2]}
                place={3}
                isMe={top3[2].userId === currentUserId}
              />
            )}
            {!top3[2] && <div />}
          </div>
        </div>
      )}

      {rest.length > 0 && (
        <div className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-[#30363d] overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-200 dark:border-[#30363d] flex items-center justify-between">
            <div className="text-sm font-semibold text-slate-900 dark:text-white">
              Все участники
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {leaderboard.length} человек
            </div>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-[#30363d]">
            {rest.map((e) => {
              const isMe = e.userId === currentUserId
              const percent = topRating > 0 ? (e.currentRating / topRating) * 100 : 0
              return (
                <div
                  key={e.userId}
                  className={`px-5 py-3 flex items-center gap-3 ${
                    isMe ? 'bg-brand-50 dark:bg-brand-500/10' : ''
                  }`}
                >
                  <div className="w-8 text-center text-sm font-semibold text-slate-400 shrink-0">
                    {e.place}
                  </div>
                  <Avatar name={e.userName} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="font-medium text-sm text-slate-900 dark:text-white truncate">
                        {e.userName}
                        {isMe && <span className="text-xs text-brand-600 ml-1">(я)</span>}
                      </div>
                      <div className="text-sm font-semibold text-slate-900 dark:text-white shrink-0">
                        {e.currentRating.toFixed(1)}
                      </div>
                    </div>
                    <div className="h-1.5 bg-slate-100 dark:bg-[#0d1117] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-brand-500 to-emerald-500 rounded-full"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {prevResults.length > 0 && (
        <div>
          <div className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
            Итоги прошлого сезона
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {prevResults.slice(0, 3).map((r) => (
              <PreviousWinnerCard key={r.place} result={r} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function PodiumCard({
  entry,
  place,
  isMe,
}: {
  entry: LeaderboardEntry
  place: number
  isMe: boolean
}) {
  const gradient = PODIUM_GRADIENTS[place - 1]
  const height = PODIUM_HEIGHTS[place - 1]

  return (
    <div className="flex flex-col items-center text-center">
      <div className="mb-2">
        <div
          className={`w-14 h-14 sm:w-16 sm:h-16 mx-auto rounded-full bg-gradient-to-br ${gradient} text-white flex items-center justify-center text-lg font-bold shadow-lg ring-2 ring-white dark:ring-[#161b22]`}
        >
          {entry.userName.charAt(0).toUpperCase()}
        </div>
        <div className="text-xs sm:text-sm font-medium text-slate-900 dark:text-white mt-1.5 truncate max-w-[90px] sm:max-w-[120px]">
          {entry.userName}
          {isMe && <span className="text-brand-600 ml-0.5">•</span>}
        </div>
        <div className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
          {entry.currentRating.toFixed(1)}
        </div>
      </div>

      <div
        className={`w-full ${height} bg-gradient-to-br ${gradient} rounded-t-lg flex flex-col items-center justify-center text-white shadow-md`}
      >
        <span className="text-2xl font-black opacity-95">{place}</span>
        <span className="text-[10px] uppercase tracking-wider opacity-80 mt-0.5">место</span>
      </div>
    </div>
  )
}

function PreviousWinnerCard({ result }: { result: SeasonResult }) {
  const place = result.place
  const gradient = place <= 3 ? PODIUM_GRADIENTS[place - 1] : 'from-slate-400 to-slate-600'

  return (
    <div className="relative overflow-hidden bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-[#30363d] p-4">
      <div
        className={`absolute top-0 right-0 w-20 h-20 rounded-full bg-gradient-to-br ${gradient} opacity-15 -mr-6 -mt-6`}
      />
      <div className="relative">
        <div className="flex items-center gap-2 mb-2">
          <div
            className={`w-8 h-8 rounded-full bg-gradient-to-br ${gradient} text-white flex items-center justify-center text-sm font-bold shadow-sm`}
          >
            {place}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Место #{place}
          </div>
        </div>
        <div className="font-semibold text-sm text-slate-900 dark:text-white truncate">
          {result.userName}
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Рейтинг: {result.finalRating.toFixed(1)}
        </div>
        <div className="mt-2 inline-flex items-center gap-1 text-xs bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 px-2 py-1 rounded font-medium">
          +{result.rewardCoins.toFixed(0)} монет
        </div>
      </div>
    </div>
  )
}

function DepartmentTab({
  data,
  currentUserId,
  myDeptWonLastSeason,
}: {
  data: any
  currentUserId: number
  myDeptWonLastSeason: boolean
}) {
  const myDept = data.myDepartmentName
  const myPlace = data.myDepartmentPlace
  const myLeaderboard: LeaderboardEntry[] = data.myDepartmentLeaderboard ?? []
  const prevDepts: DepartmentResult[] = data.previousDepartmentResults ?? []

  const isMyDeptWinner = myPlace === 1
  const myPrizes = isMyDeptWinner ? WINNING_DEPT_REWARDS : LOSING_DEPT_REWARDS

  return (
    <div className="space-y-6">
      {/* Hero отдела */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-500 via-emerald-600 to-teal-700 text-white p-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="relative">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <div className="text-xs text-white/70 uppercase tracking-wider">Мой отдел</div>
              <div className="text-2xl sm:text-3xl font-bold mt-1">{myDept}</div>
            </div>
            {myPlace && (
              <div className="bg-white/15 backdrop-blur rounded-full px-4 py-1.5 text-sm font-medium shrink-0">
                #{myPlace} место среди отделов
              </div>
            )}
          </div>

          {myDeptWonLastSeason && (
            <div className="mt-4 inline-flex items-center gap-2 bg-yellow-400/20 border border-yellow-300/40 rounded-full px-4 py-1.5">
              <IconTrophy size={16} className="text-yellow-200" />
              <span className="text-sm font-medium">
                Ваш отдел занял 1 место в прошлом сезоне
              </span>
            </div>
          )}

          {/* Награды */}
          <div className="mt-5 space-y-3">
            <div className="bg-white/10 rounded-lg p-3 backdrop-blur flex items-center justify-between">
              <div>
                <div className="text-xs text-white/70">За участие</div>
                <div className="text-[11px] text-white/60 mt-0.5">
                  каждому сотруднику в любом отделе
                </div>
              </div>
              <div className="text-lg font-bold">+{PARTICIPATION_REWARD} монет</div>
            </div>

            <div>
              <div className="text-xs text-white/70 uppercase tracking-wider mb-2">
                Призовые места внутри отдела
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                {/* Победивший отдел */}
                <div className="bg-white/10 rounded-lg p-3 backdrop-blur">
                  <div className="text-[11px] text-white/60 uppercase tracking-wider mb-2">
                    Победивший отдел
                  </div>
                  <div className="space-y-1.5">
                    {WINNING_DEPT_REWARDS.map((amount, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <PlaceBadge place={(i + 1) as 1 | 2 | 3} size="sm" />
                        <span className="text-xs text-white/80 flex-1">{i + 1} место</span>
                        <span className="text-sm font-bold">{amount}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Остальные */}
                <div className="bg-white/5 rounded-lg p-3 backdrop-blur border border-white/10">
                  <div className="text-[11px] text-white/60 uppercase tracking-wider mb-2">
                    Остальные отделы
                  </div>
                  <div className="space-y-1.5">
                    {LOSING_DEPT_REWARDS.map((amount, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <PlaceBadge place={(i + 1) as 1 | 2 | 3} size="sm" />
                        <span className="text-xs text-white/80 flex-1">{i + 1} место</span>
                        <span className="text-sm font-bold">{amount}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Топ-3 моего отдела */}
      {myLeaderboard.length > 0 ? (
        <div>
          <div className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <IconChart size={16} />
            Сотрудники отдела
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4">
            {myLeaderboard.slice(0, 3).map((e: LeaderboardEntry, i: number) => {
              const isMe = e.userId === currentUserId
              const place = (i + 1) as 1 | 2 | 3
              return (
                <div
                  key={e.userId}
                  className={`relative overflow-hidden rounded-xl border p-3 text-center ${
                    isMe
                      ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/10'
                      : 'border-slate-200 dark:border-[#30363d] bg-white dark:bg-[#161b22]'
                  }`}
                >
                  <div className="flex items-center justify-center mb-2">
                    <div
                      className={`w-12 h-12 rounded-full ${PLACE_COLORS[place]} flex items-center justify-center text-lg font-black shadow-md`}
                    >
                      {place}
                    </div>
                  </div>
                  <div className="text-xs font-medium text-slate-900 dark:text-white truncate">
                    {e.userName}
                  </div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                    {e.currentRating.toFixed(1)}
                  </div>
                  <div className="text-xs font-semibold text-amber-600 dark:text-amber-400 mt-1">
                    +{myPrizes[i]} монет
                  </div>
                </div>
              )
            })}
          </div>

          {myLeaderboard.length > 3 && (
            <div className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-[#30363d] divide-y divide-slate-100 dark:divide-[#30363d]">
              {myLeaderboard.slice(3).map((e: LeaderboardEntry) => {
                const isMe = e.userId === currentUserId
                return (
                  <div
                    key={e.userId}
                    className={`px-5 py-3 flex items-center gap-3 ${
                      isMe ? 'bg-brand-50 dark:bg-brand-500/10' : ''
                    }`}
                  >
                    <div className="w-8 text-center text-sm font-semibold text-slate-400">
                      {e.place}
                    </div>
                    <Avatar name={e.userName} size="sm" />
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-sm text-slate-900 dark:text-white truncate">
                        {e.userName}
                        {isMe && <span className="text-xs text-brand-600 ml-1">(я)</span>}
                      </div>
                    </div>
                    <div className="text-sm font-semibold text-slate-900 dark:text-white">
                      {e.currentRating.toFixed(1)}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-[#30363d] p-8 text-center">
          <div className="text-slate-400 dark:text-slate-500 text-sm">
            В вашем отделе пока нет участников в этом сезоне
          </div>
        </div>
      )}

      {/* Итоги прошлого сезона */}
      {prevDepts.length > 0 && (
        <div>
          <div className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <IconTrophy size={16} />
            Итоги отделов в прошлом сезоне
          </div>
          <div className="space-y-3">
            {prevDepts.map((d) => (
              <DepartmentResultCard
                key={d.place}
                result={d}
                isMine={d.departmentName === myDept}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function DepartmentResultCard({
  result,
  isMine,
}: {
  result: DepartmentResult
  isMine: boolean
}) {
  const place = result.place
  const isWinner = place === 1
  const gradient = place <= 3 ? PODIUM_GRADIENTS[place - 1] : 'from-slate-400 to-slate-600'

  return (
    <div
      className={`relative overflow-hidden rounded-xl border-2 p-4 ${
        isWinner
          ? 'border-yellow-400 bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-500/10 dark:to-amber-500/10'
          : isMine
          ? 'border-brand-400 dark:border-brand-500/50 bg-brand-50/50 dark:bg-brand-500/5'
          : 'border-slate-200 dark:border-[#30363d] bg-white dark:bg-[#161b22]'
      }`}
    >
      {isWinner && (
        <div className="absolute top-3 right-3">
          <IconTrophy size={20} className="text-yellow-500" />
        </div>
      )}

      <div className="flex items-start gap-3">
        <div
          className={`w-12 h-12 rounded-full bg-gradient-to-br ${gradient} text-white flex items-center justify-center text-lg font-black shrink-0 shadow-sm`}
        >
          {place}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="font-semibold text-sm text-slate-900 dark:text-white">
              {result.departmentName}
            </div>
            {isMine && (
              <span className="text-xs bg-brand-500 text-white px-2 py-0.5 rounded-full">
                Мой
              </span>
            )}
            {isWinner && (
              <span className="text-xs bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded-full font-medium">
                Победитель сезона
              </span>
            )}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {result.memberCount} участников · {result.totalRating.toFixed(1)} рейтинга
          </div>

          {result.rewardCoinsPerMember > 0 && (
            <div className="mt-2">
              <span className="inline-flex items-center gap-1 bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 px-2 py-1 rounded-md text-xs font-semibold">
                +{result.rewardCoinsPerMember.toFixed(0)} монет каждому за участие
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Топ-3 с наградами */}
      {result.topMembers && result.topMembers.length > 0 && (
        <div className="mt-3 pt-3 border-t border-slate-200/50 dark:border-[#30363d] space-y-1.5">
          {result.topMembers.slice(0, 3).map((m) => (
            <div key={m.placeInDepartment} className="flex items-center gap-2 text-xs">
              <PlaceBadge place={m.placeInDepartment as 1 | 2 | 3} size="sm" />
              <span className="font-medium text-slate-900 dark:text-white flex-1 truncate">
                {m.userName}
              </span>
              {m.rewardCoins > 0 && (
                <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 shrink-0">
                  +{m.rewardCoins.toFixed(0)} монет
                </span>
              )}
              <span className="text-slate-500 dark:text-slate-400 shrink-0">
                {m.finalRating.toFixed(1)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}