import { useAuth } from '../store/auth'
import { useFetch } from '../hooks/useFetch'
import { getFavorites } from '../api/shop'
import { Link } from 'react-router-dom'

export default function Favorites() {
  const user = useAuth((s) => s.user)!
  const { data, loading, error } = useFetch(() => getFavorites(user.id), [user.id])

  if (loading) return <div className="text-slate-500 dark:text-slate-400">Загрузка...</div>
  if (error) return <div className="text-red-600 dark:text-red-400">{error}</div>
  if (!data) return null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white tracking-tight">
          Избранное
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Товары, которые вам нравятся</p>
      </div>

      {data.length === 0 ? (
        <div className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-[#30363d] p-8 sm:p-12 text-center">
          <div className="text-slate-400 dark:text-slate-500 text-sm mb-4">Избранное пусто</div>
          <Link
            to="/catalog"
            className="inline-block bg-brand-600 hover:bg-brand-700 text-white rounded-md px-4 py-2 text-sm font-medium transition"
          >
            В магазин
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.map((p) => (
            <Link
              key={p.id}
              to={`/catalog/${p.id}`}
              className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-[#30363d] overflow-hidden hover:shadow-md transition"
            >
              <div className="aspect-video bg-slate-100 dark:bg-[#0d1117] flex items-center justify-center overflow-hidden">
                {p.imageUrl ? (
                  <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-slate-300 dark:text-slate-600 text-sm">Нет фото</span>
                )}
              </div>
              <div className="p-4">
                <div className="font-medium text-sm text-slate-900 dark:text-white truncate">{p.name}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{p.categoryName}</div>
                <div className="font-semibold text-slate-900 dark:text-white mt-2">
                  {p.finalPrice.toFixed(0)} монет
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}