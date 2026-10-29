import type { StreakInfo } from '../api/streak'
import { getStreakDisplay } from '../lib/streak'
import FireIcon from './FireIcon'

export default function StreakBadge({ streak }: { streak: StreakInfo }) {
  if (streak.currentStreak <= 0) return null
  const display = getStreakDisplay(streak.currentStreak)

  return (
    <span
      className={`inline-flex items-center gap-1.5 pl-1 pr-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r ${display.bgGradient} ${display.color} border border-slate-200 dark:border-[#30363d]`}
      title={`${display.label} · ${streak.currentStreak} дней подряд`}
    >
      <FireIcon tier={display.tier} size={22} />
      <span>{streak.currentStreak} дн.</span>
    </span>
  )
}