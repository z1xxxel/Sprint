import { useState } from 'react'
import { useAuth } from '../store/auth'
import { useFetch } from '../hooks/useFetch'
import { getCurrentSeason } from '../api/seasons'
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
const PODIUM_HEIGHTS = ['h-32', 'h-24', 'h-20']
const PERSONAL_REWARDS = [7000, 4000, 3000] as const

const PARTICIPATION_REWARD = 100
const WINNING_DEPT_REWARDS = [2500, 1500, 1000] as const
const LOSING_DEPT_REWARDS = [1250, 750, 500] as const

const PLACE_COLORS: Record<1 | 2 | 3, string> = {
  1: 'bg-gradient-to-br from-yellow-400 to-amber-600 text-white',
  2: 'bg-gradient-to-br from-slate-300 to-slate-500 text-white',
  3: 'bg-gradient-to-br from-orange-400 to-amber-700 text-white',
}

type Tab = 'personal' | 'department'

function PlaceBadge({
  place,
  size = 'md',
}: {
  place: 1 | 2 | 3
  size?: 'sm' | 'md' | 'lg'
}) {
  const dim =
    size === 'sm' ? 'w-6 h-6 text-xs' : size === 'lg' ? 'w-10 h-10 text-base' : 'w-8 h-8 text-sm'
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

  const leaderboard = data.currentLeaderboard ?? []
  const myPlace = leaderboard.find((e) => e.userId === user.id)
  const totalActive = leaderboard.length
  const left = daysLeft(data.endDate)

  const top3 = leaderboard.slice(0, 3)
  const inTop3 = myPlace ? top3.some((e) => e.userId === user.id) : false
  const thirdPlace = leaderboard[2]
  const firstPlace = leaderboard[0]
  const pointsToTop3 =
    !inTop3 && thirdPlace && myPlace
      ? Math.max(0, thirdPlace.currentRating - myPlace.currentRating)
      : 0
  const pointsToFirst =
    !myPlace ? 0 : firstPlace ? Math.max(0, firstPlace.currentRating - myPlace.currentRating) : 0

  const myDeptWonLastSeason = (data.previousDepartmentResults ?? []).some(
    (d) => d.place === 1 && d.departmentName === data.myDepartmentName
  )

  const isEmpty = leaderboard.length === 0

  return (
    <div className="space-y-6">
      {/* ============ HERO ============ */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-600 via-accent-600 to-accent-700 text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative p-6 sm:p-8">
          {/* Верхняя строка: название + дни */}
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <div className="text-sm text-white/80 uppercase tracking-wider mb-1">
                Текущий сезон
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold">{data.name}</h1>
              <div className="text-sm text-white/80 mt-1.5">
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

          {/* Моё положение */}
          {myPlace ? (
            <div className="mt-6 space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="text-xs text-white/70 uppercase tracking-wider">Моё место</div>
                  <div className="text-3xl font-bold mt-1">
                    {myPlace.place}
                    <span className="text-base font-medium text-white/70">
                      {' '}/ {totalActive}
                    </span>
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

              {/* Прогресс до призовой зоны */}
              {inTop3 ? (
                <div className="bg-emerald-400/20 border border-emerald-300/40 rounded-lg px-4 py-2.5 text-sm font-medium">
                  Вы в призовой зоне. Если сезон закончится сейчас, получите{' '}
                  <strong>
                    {PERSONAL_REWARDS[(myPlace.place ?? 1) - 1]?.toLocaleString('ru-RU')} монет
                  </strong>
                </div>
              ) : pointsToTop3 > 0 && thirdPlace ? (
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-white/80">
                    <span>
                      До призовой зоны (3 место):{' '}
                      <strong className="text-white">{pointsToTop3.toFixed(1)} очков</strong>
                    </span>
                    <span>
                      {myPlace.currentRating.toFixed(1)} / {thirdPlace.currentRating.toFixed(1)}
                    </span>
                  </div>
                  <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-yellow-300 to-orange-400 rounded-full transition-all"
                      style={{
                        width: `${Math.min(
                          100,
                          thirdPlace.currentRating > 0
                            ? (myPlace.currentRating / thirdPlace.currentRating) * 100
                            : 0
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              ) : null}

              <div className="text-xs text-white/70">
                Рейтинг идёт в зачёт только текущего сезона. Репутация сохраняется навсегда.
              </div>
            </div>
          ) : (
            <div className="mt-6 bg-white/10 backdrop-blur rounded-lg px-4 py-3 text-sm">
              Вы пока не в рейтинге. Участвуйте в активностях — и появятся очки.
            </div>
          )}
        </div>
      </div>

      {/* ============ ТАБЫ ============ */}
      <div className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-[#30363d] p-1.5 flex gap-1">
        <button
          onClick={() => setTab('personal')}
          className={`flex-1 px-4 py-2.5 text-sm font-medium rounded-lg transition ${
            tab === 'personal'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#21262d]'
          }`}
        >
          Личный зачёт
        </button>
        <button
          onClick={() => setTab('department')}
          className={`flex-1 px-4 py-2.5 text-sm font-medium rounded-lg transition ${
            tab === 'department'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#21262d]'
          }`}
        >
          Мой отдел
        </button>
      </div>

      {/* ============ КОНТЕНТ ============ */}
      {tab === 'personal' && (
        <PersonalTab
          leaderboard={leaderboard}
          currentUserId={user.id}
          prevResults={data.previousSeasonResults}
          myPlace={myPlace}
          isEmpty={isEmpty}
          pointsToFirst={pointsToFirst}
          pointsToTop3={pointsToTop3}
          inTop3={inTop3}
        />
      )}

      {tab === 'department' && (
        <DepartmentTab
          data={data}
          currentUserId={user.id}
          myDeptWonLastSeason={myDeptWonLastSeason}
        />
      )}

      {/* ============ FAQ ============ */}
      <FAQBlock />
    </div>
  )
}

// ==========================================
// === ЛИЧНЫЙ ЗАЧЁТ
// ==========================================
function PersonalTab({
  leaderboard,
  currentUserId,
  prevResults,
  myPlace,
  isEmpty,
  pointsToFirst,
  pointsToTop3,
  inTop3,
}: {
  leaderboard: LeaderboardEntry[]
  currentUserId: number
  prevResults: SeasonResult[]
  myPlace: LeaderboardEntry | undefined
  isEmpty: boolean
  pointsToFirst: number
  pointsToTop3: number
  inTop3: boolean
}) {
  const top3 = leaderboard.slice(0, 3)
  const rest = leaderboard.slice(3)
  const topRating = top3[0]?.currentRating ?? 1

  // Пустой сезон
  if (isEmpty) {
    return (
      <div className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-[#30363d] p-10 text-center">
        <div className="text-base font-semibold text-slate-900 dark:text-white mb-2">
          Сезон только начался
        </div>
        <div className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
          Заработайте первые очки рейтинга — участвуйте в событиях, выполняйте квесты,
          проходите опросы. Как только появятся первые результаты, они отобразятся здесь.
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Подиум */}
      {top3.length > 0 && (
        <div className="bg-gradient-to-b from-slate-50 to-white dark:from-[#0d1117] dark:to-[#161b22] rounded-2xl border border-slate-200 dark:border-[#30363d] p-6">
          <div className="text-center mb-6">
            <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Топ-3 сезона
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Награды в конце сезона
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-4 items-end max-w-2xl mx-auto">
            {top3[1] && (
              <PodiumCard
                entry={top3[1]}
                place={2}
                isMe={top3[1].userId === currentUserId}
                reward={PERSONAL_REWARDS[1]}
              />
            )}
            {!top3[1] && <div />}

            {top3[0] && (
              <PodiumCard
                entry={top3[0]}
                place={1}
                isMe={top3[0].userId === currentUserId}
                reward={PERSONAL_REWARDS[0]}
              />
            )}

            {top3[2] && (
              <PodiumCard
                entry={top3[2]}
                place={3}
                isMe={top3[2].userId === currentUserId}
                reward={PERSONAL_REWARDS[2]}
              />
            )}
            {!top3[2] && <div />}
          </div>

          {/* Подсказка для меня */}
          {myPlace && !inTop3 && pointsToTop3 > 0 && (
            <div className="mt-6 pt-5 border-t border-slate-200 dark:border-[#30363d] text-center text-sm text-slate-600 dark:text-slate-300">
              Вы на <strong>{myPlace.place} месте</strong>. До призовой зоны не хватает{' '}
              <strong className="text-brand-600 dark:text-brand-400">
                {pointsToTop3.toFixed(1)} очков
              </strong>
              .
            </div>
          )}
          {myPlace && inTop3 && (
            <div className="mt-6 pt-5 border-t border-slate-200 dark:border-[#30363d] text-center text-sm text-slate-600 dark:text-slate-300">
              Вы в призовой зоне — {myPlace.place} место. Так держать!
            </div>
          )}
        </div>
      )}

      {/* Все участники */}
      {rest.length > 0 && (
        <div className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-[#30363d] overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-200 dark:border-[#30363d] flex items-center justify-between">
            <div className="text-sm font-semibold text-slate-900 dark:text-white">
              Остальные участники
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {rest.length} {rest.length === 1 ? 'человек' : rest.length < 5 ? 'человека' : 'человек'}
            </div>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-[#30363d]">
            {rest.map((e) => {
              const isMe = e.userId === currentUserId
              const percent = topRating > 0 ? (e.currentRating / topRating) * 100 : 0
              const prevEntry = leaderboard[leaderboard.findIndex((x) => x.userId === e.userId) - 1]
              const toPrev = prevEntry
                ? Math.max(0, prevEntry.currentRating - e.currentRating)
                : 0
              return (
                <div
                  key={e.userId}
                  className={`px-5 py-3 flex items-center gap-4 ${
                    isMe ? 'bg-brand-50 dark:bg-brand-500/10' : ''
                  }`}
                >
                  <div className="w-10 text-center text-base font-semibold text-slate-400 shrink-0">
                    {e.place}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="font-medium text-sm text-slate-900 dark:text-white truncate">
                        {e.userName}
                        {isMe && (
                          <span className="ml-1.5 text-xs text-brand-600 dark:text-brand-400">
                            (вы)
                          </span>
                        )}
                      </div>
                      <div className="text-sm font-semibold text-slate-900 dark:text-white shrink-0">
                        {e.currentRating.toFixed(1)}
                      </div>
                    </div>
                    {isMe && toPrev > 0 && (
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                        До места выше: {toPrev.toFixed(1)} очков
                      </div>
                    )}
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

      {/* Итоги прошлого сезона */}
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

// ==========================================
// === ПОДИУМ
// ==========================================
function PodiumCard({
  entry,
  place,
  isMe,
  reward,
}: {
  entry: LeaderboardEntry
  place: number
  isMe: boolean
  reward: number
}) {
  const gradient = PODIUM_GRADIENTS[place - 1]
  const height = PODIUM_HEIGHTS[place - 1]

  return (
    <div className="flex flex-col items-center text-center">
      <div className="mb-3 px-1 w-full">
        <div className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white break-words leading-tight">
          {entry.userName}
        </div>
        {isMe && (
          <div className="text-[11px] text-brand-600 dark:text-brand-400 font-medium mt-0.5">
            это вы
          </div>
        )}
        <div className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mt-1">
          {entry.currentRating.toFixed(1)}
        </div>
        <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          очков
        </div>
      </div>

      <div
        className={`w-full ${height} bg-gradient-to-br ${gradient} rounded-t-lg flex flex-col items-center justify-center text-white shadow-md`}
      >
        <span className="text-3xl font-black opacity-95">{place}</span>
        <span className="text-[10px] uppercase tracking-wider opacity-80 mt-0.5">место</span>
      </div>

      {/* Приз под пьедесталом */}
      <div className="w-full bg-slate-100 dark:bg-[#21262d] rounded-b-lg py-1.5 text-center">
        <div className="text-xs font-semibold text-amber-600 dark:text-amber-400">
          +{reward.toLocaleString('ru-RU')} монет
        </div>
      </div>
    </div>
  )
}

// ==========================================
// === ПРОШЛЫЙ ПОБЕДИТЕЛЬ
// ==========================================
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
        <div className="font-semibold text-sm text-slate-900 dark:text-white break-words">
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

// ==========================================
// === МОЙ ОТДЕЛ
// ==========================================
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
  const myEntry = myLeaderboard.find((e) => e.userId === currentUserId)
  const inDeptTop3 = myEntry ? myEntry.place <= 3 : false
  const thirdInDept = myLeaderboard[2]
  const pointsToDeptTop3 =
    !inDeptTop3 && thirdInDept && myEntry
      ? Math.max(0, thirdInDept.currentRating - myEntry.currentRating)
      : 0

  // Мой отдел без участников
  if (!myLeaderboard.length) {
    return (
      <div className="space-y-4">
        <DepartmentHero
          myDept={myDept}
          myPlace={myPlace}
          wonLastSeason={myDeptWonLastSeason}
        />
        <div className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-[#30363d] p-10 text-center">
          <div className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1">
            В отделе пока нет участников
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Как только сотрудники начнут зарабатывать рейтинг, они появятся здесь
          </div>
        </div>
        <DepartmentRewards isWinner={isMyDeptWinner} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Hero отдела */}
      <DepartmentHero
        myDept={myDept}
        myPlace={myPlace}
        wonLastSeason={myDeptWonLastSeason}
      />

      {/* Мой прогресс в отделе */}
      {myEntry && !inDeptTop3 && pointsToDeptTop3 > 0 && (
        <div className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-[#30363d] p-4">
          <div className="text-sm text-slate-700 dark:text-slate-300 mb-2">
            Вы на <strong>{myEntry.place} месте</strong> в отделе. До топ-3 отдела:{' '}
            <strong className="text-brand-600 dark:text-brand-400">
              {pointsToDeptTop3.toFixed(1)} очков
            </strong>
          </div>
          <div className="h-2 bg-slate-100 dark:bg-[#0d1117] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-brand-500 to-emerald-500 rounded-full"
              style={{
                width: `${Math.min(
                  100,
                  thirdInDept && thirdInDept.currentRating > 0
                    ? (myEntry.currentRating / thirdInDept.currentRating) * 100
                    : 0
                )}%`,
              }}
            />
          </div>
        </div>
      )}
      {myEntry && inDeptTop3 && (
        <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 rounded-xl px-4 py-2.5 text-sm text-emerald-700 dark:text-emerald-400 font-medium">
          Вы в топ-3 отдела. Если сезон закончится сейчас, получите{' '}
          <strong>{myPrizes[myEntry.place - 1]} монет</strong> плюс участие.
        </div>
      )}

      {/* Сотрудники отдела */}
      <div>
        <div className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
          Сотрудники отдела
        </div>

        {/* Топ-3 отдела */}
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
                <div className="mb-2">
                  <span
                    className={`inline-flex w-10 h-10 rounded-full ${PLACE_COLORS[place]} items-center justify-center text-lg font-black shadow-md`}
                  >
                    {place}
                  </span>
                </div>
                <div className="text-xs font-medium text-slate-900 dark:text-white break-words leading-tight">
                  {e.userName}
                  {isMe && (
                    <div className="text-[10px] text-brand-600 dark:text-brand-400 mt-0.5">
                      (вы)
                    </div>
                  )}
                </div>
                <div className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                  {e.currentRating.toFixed(1)}
                </div>
                <div className="text-xs font-semibold text-amber-600 dark:text-amber-400 mt-1">
                  +{myPrizes[i]} монет
                </div>
              </div>
            )
          })}
        </div>

        {/* Остальные */}
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
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-sm text-slate-900 dark:text-white break-words">
                      {e.userName}
                      {isMe && (
                        <span className="ml-1.5 text-xs text-brand-600 dark:text-brand-400">
                          (вы)
                        </span>
                      )}
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

      {/* Награды отдела */}
      <DepartmentRewards isWinner={isMyDeptWinner} />

      {/* Итоги прошлого сезона */}
      {prevDepts.length > 0 && (
        <div>
          <div className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
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

// ==========================================
// === HERO ОТДЕЛА
// ==========================================
function DepartmentHero({
  myDept,
  myPlace,
  wonLastSeason,
}: {
  myDept: string
  myPlace: number | null
  wonLastSeason: boolean
}) {
  return (
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

        {wonLastSeason && (
          <div className="mt-4 inline-flex items-center gap-2 bg-yellow-400/20 border border-yellow-300/40 rounded-full px-4 py-1.5 text-sm">
            Ваш отдел занял 1 место в прошлом сезоне
          </div>
        )}

        <div className="mt-4 text-xs text-white/70">
          Отдел соревнуется по сумме рейтингов всех участников. Каждый вклад важен.
        </div>
      </div>
    </div>
  )
}

// ==========================================
// === НАГРАДЫ ОТДЕЛА
// ==========================================
function DepartmentRewards({ isWinner }: { isWinner: boolean }) {
  return (
    <div className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-[#30363d] p-5">
      <div className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
        Награды отделов
      </div>

      <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-lg px-4 py-3 mb-4 flex items-center justify-between gap-3">
        <div>
          <div className="text-xs text-amber-700 dark:text-amber-400 uppercase tracking-wider">
            За участие
          </div>
          <div className="text-sm text-amber-700 dark:text-amber-400 mt-0.5">
            каждому сотруднику
          </div>
        </div>
        <div className="text-lg font-bold text-amber-700 dark:text-amber-400">
          +{PARTICIPATION_REWARD} монет
        </div>
      </div>

      <div className="text-xs text-slate-500 dark:text-slate-400 mb-2">
        Призовые места внутри отдела
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div
          className={`rounded-lg p-3 border ${
            isWinner
              ? 'bg-yellow-50 dark:bg-yellow-500/10 border-yellow-300 dark:border-yellow-500/30'
              : 'bg-slate-50 dark:bg-[#0d1117] border-slate-200 dark:border-[#30363d]'
          }`}
        >
          <div className="text-[11px] text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
            Победивший отдел {isWinner && '(ваш)'}
          </div>
          <div className="space-y-1.5">
            {WINNING_DEPT_REWARDS.map((amount, i) => (
              <div key={i} className="flex items-center gap-2">
                <PlaceBadge place={(i + 1) as 1 | 2 | 3} size="sm" />
                <span className="text-xs text-slate-700 dark:text-slate-300 flex-1">
                  {i + 1} место
                </span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  {amount}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-[#0d1117] rounded-lg p-3 border border-slate-200 dark:border-[#30363d]">
          <div className="text-[11px] text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
            Остальные отделы
          </div>
          <div className="space-y-1.5">
            {LOSING_DEPT_REWARDS.map((amount, i) => (
              <div key={i} className="flex items-center gap-2">
                <PlaceBadge place={(i + 1) as 1 | 2 | 3} size="sm" />
                <span className="text-xs text-slate-700 dark:text-slate-300 flex-1">
                  {i + 1} место
                </span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  {amount}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ==========================================
// === РЕЗУЛЬТАТ ОТДЕЛА (прошлый сезон)
// ==========================================
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
                Победитель
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
                  +{m.rewardCoins.toFixed(0)}
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

// ==========================================
// === FAQ
// ==========================================
const FAQ_ITEMS: { q: string; a: string }[] = [
  {
    q: 'Как работает рейтинг в сезоне?',
    a: 'Вы получаете рейтинг за участие в событиях, выполнение квестов, прохождение опросов, благодарности коллег и другие активности. Рейтинг идёт в зачёт только текущего сезона.',
  },
  {
    q: 'Что происходит в конце сезона?',
    a: 'Топ-3 сотрудника получают монеты (7000 / 4000 / 3000) и ачивки. Отдел-победитель получает по 5000 монет каждому участнику. Топ-3 внутри каждого отдела получают дополнительные монеты. Рейтинг сезона обнуляется, репутация сохраняется.',
  },
  {
    q: 'Чем рейтинг отличается от репутации?',
    a: 'Рейтинг сезона — очки за текущий квартал, сгорают в конце сезона. Репутация (lifetimeRating) — сумма всех рейтингов за всё время, по ней определяется уровень: Junior (0–100), Middle (100–500), Senior (500–1500), Legend (1500+).',
  },
  {
    q: 'Как попасть в топ отдела?',
    a: 'Займите одно из первых трёх мест внутри своего подразделения по рейтингу сезона. Чем выше место в отделе, тем больше монет получите в конце сезона. Победивший отдел получает полные награды, остальные — 50% от суммы.',
  },
  {
    q: 'Как заработать больше рейтинга?',
    a: 'Участвуйте в событиях, берите квесты, проходите опросы, получайте благодарности от коллег. Руководители могут начислять бонусный рейтинг. Ежедневный вход в систему даёт streak — серия посещений приносит дополнительные очки.',
  },
]

function FAQBlock() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <div>
      <div className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
        Частые вопросы
      </div>
      <div className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-[#30363d] divide-y divide-slate-100 dark:divide-[#30363d] overflow-hidden">
        {FAQ_ITEMS.map((item, i) => {
          const isOpen = openIndex === i
          return (
            <div key={i}>
              <button
                onClick={() => setOpenIndex(isOpen ? null : i)}
                className="w-full text-left px-5 py-4 flex items-start justify-between gap-3 hover:bg-slate-50 dark:hover:bg-[#0d1117] transition"
              >
                <span className="font-medium text-sm text-slate-900 dark:text-white">
                  {item.q}
                </span>
                <span
                  className={`shrink-0 text-slate-400 transition-transform ${
                    isOpen ? 'rotate-45' : ''
                  }`}
                >
                  +
                </span>
              </button>
              {isOpen && (
                <div className="px-5 pb-4 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {item.a}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}