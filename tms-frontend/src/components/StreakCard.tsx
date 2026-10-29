import type { StreakInfo } from '../api/streak'
import { getStreakDisplay, streakProgressToReward } from '../lib/streak'
import FireIcon from './FireIcon'
import { IconTrophy } from './Icons'

export default function StreakCard({ streak }: { streak: StreakInfo }) {
  const display = getStreakDisplay(streak.currentStreak)
  const progress = streakProgressToReward(streak.currentStreak)

  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${display.bgGradient} border border-slate-200 dark:border-[#30363d] flex flex-col h-full`}
    >
      {/* Основной контент (растягивается) */}
      <div className="p-5 flex items-center gap-4 flex-1">
        <div className="shrink-0 flex items-center justify-center">
          <FireIcon tier={display.tier} size={56} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
              {streak.currentStreak}
            </span>
            <span className="text-sm text-slate-500 dark:text-slate-400">
              {streak.currentStreak === 1
                ? 'день'
                : streak.currentStreak < 5
                ? 'дня'
                : 'дней'}{' '}
              подряд
            </span>
          </div>
          <div className={`text-xs font-semibold mt-0.5 ${display.color}`}>
            {display.label}
          </div>
        </div>

        {streak.earnedRatingToday > 0 && (
          <div className="shrink-0 bg-white/70 dark:bg-white/10 backdrop-blur rounded-lg px-3 py-2 text-center">
            <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Сегодня
            </div>
            <div className="text-sm font-bold text-orange-600 dark:text-orange-400 inline-flex items-center gap-1">
              <IconTrophy size={12} />+{streak.earnedRatingToday}
            </div>
          </div>
        )}
      </div>

      {/* Прогресс-бар и подписи (прижаты к низу) */}
      <div className="mt-auto">
        <div className="h-1.5 bg-white/40 dark:bg-black/20 w-full">
          <div
            className={`h-full bg-gradient-to-r ${
              display.tier <= 1
                ? 'from-amber-400 to-orange-500'
                : display.tier <= 4
                ? 'from-orange-500 to-red-600'
                : display.tier === 5
                ? 'from-blue-500 to-indigo-600'
                : 'from-indigo-600 to-cyan-500'
            } transition-all duration-500`}
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="px-5 py-2 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 bg-white/40 dark:bg-black/10 w-full">
          <span>До +1 рейтинга: {streak.daysToNextReward} дн.</span>
          <span>До месячного +2: {streak.daysToMonthBonus} дн.</span>
        </div>
      </div>
    </div>
  )
}