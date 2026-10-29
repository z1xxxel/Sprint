import { useAuth } from '../store/auth'
import { useFetch } from '../hooks/useFetch'
import { getRatingHistory } from '../api/users'
import { Link } from 'react-router-dom'
import { IconArrowLeft, IconArrowUp, IconArrowDown } from '../components/Icons'

export default function RatingHistory() {
  const user = useAuth((s) => s.user)!
  const { data, loading, error } = useFetch(() => getRatingHistory(user.id, 500), [user.id])

  if (loading) return <div className="text-slate-500">Загрузка...</div>
  if (error) return <div className="text-red-600">{error}</div>
  if (!data) return null

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <Link
          to="/profile"
          className="text-sm text-brand-600 hover:underline inline-flex items-center gap-1"
        >
          <IconArrowLeft size={14} /> К профилю
        </Link>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white tracking-tight mt-2">
          История рейтинга
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Все изменения рейтинга и репутации
        </p>
      </div>

      {data.length === 0 ? (
        <div className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-[#30363d] p-8 text-center text-slate-400 text-sm">
          Пока нет изменений рейтинга
        </div>
      ) : (
        <div className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-[#30363d] divide-y divide-slate-100 dark:divide-[#30363d]">
          {data.map((t) => {
            const isPositive = t.amount > 0
            return (
              <div key={t.id} className="px-5 py-3 flex items-start gap-3">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                    isPositive
                      ? 'bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400'
                      : 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400'
                  }`}
                >
                  {isPositive ? <IconArrowUp size={18} /> : <IconArrowDown size={18} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-slate-900 dark:text-white">{t.reason}</div>
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
  )
}