export type StreakVariant = 'muted' | 'amber' | 'orange' | 'red' | 'blue' | 'legendary'

export interface StreakDisplay {
  variant: StreakVariant
  bgGradient: string
  label: string
  color: string
  tier: number
}

export function getStreakDisplay(days: number): StreakDisplay {
  if (days <= 0) {
    return {
      variant: 'muted',
      bgGradient: 'from-slate-50 to-slate-100 dark:from-slate-500/10 dark:to-slate-500/5',
      label: 'Начните серию',
      color: 'text-slate-500 dark:text-slate-400',
      tier: 0,
    }
  }
  if (days < 3) {
    return {
      variant: 'amber',
      bgGradient: 'from-amber-50 to-orange-50 dark:from-amber-500/10 dark:to-orange-500/5',
      label: 'Свеча',
      color: 'text-amber-600 dark:text-amber-400',
      tier: 1,
    }
  }
  if (days < 7) {
    return {
      variant: 'orange',
      bgGradient: 'from-orange-50 to-red-50 dark:from-orange-500/10 dark:to-red-500/5',
      label: 'Огонь',
      color: 'text-orange-600 dark:text-orange-400',
      tier: 2,
    }
  }
  if (days < 14) {
    return {
      variant: 'orange',
      bgGradient: 'from-orange-50 to-red-50 dark:from-orange-500/10 dark:to-red-500/5',
      label: 'Пламя',
      color: 'text-orange-600 dark:text-orange-400',
      tier: 3,
    }
  }
  if (days < 30) {
    return {
      variant: 'red',
      bgGradient: 'from-red-50 to-rose-50 dark:from-red-500/10 dark:to-rose-500/5',
      label: 'Пожар',
      color: 'text-rose-600 dark:text-rose-400',
      tier: 4,
    }
  }
  if (days < 60) {
    return {
      variant: 'blue',
      bgGradient: 'from-blue-50 to-indigo-50 dark:from-blue-500/10 dark:to-indigo-500/5',
      label: 'Синее пламя',
      color: 'text-blue-600 dark:text-blue-400',
      tier: 5,
    }
  }
  return {
    variant: 'legendary',
    bgGradient: 'from-indigo-50 to-cyan-50 dark:from-indigo-500/10 dark:to-cyan-500/5',
    label: 'Легендарный огонь',
    color: 'text-indigo-600 dark:text-indigo-400',
    tier: 6,
  }
}

export function streakProgressToReward(days: number): number {
  const mod = days % 10
  return (mod / 10) * 100
}

export function streakToTier(days: number): number {
  return getStreakDisplay(days).tier
}