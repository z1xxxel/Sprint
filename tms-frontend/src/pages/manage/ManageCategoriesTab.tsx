import { useState } from 'react'
import { useAuth } from '../../store/auth'
import { useFetch } from '../../hooks/useFetch'
import { getCategories, deleteCategory } from '../../api/shop'
import CategoryModal from '../../components/CategoryModal'
import type { Category } from '../../types'

export default function ManageCategoriesTab() {
  const user = useAuth((s) => s.user)!
  const cats = useFetch(() => getCategories(), [])

  const [editing, setEditing] = useState<Category | null>(null)
  const [creating, setCreating] = useState(false)

  async function handleDelete(c: Category) {
    if (!confirm(`Удалить категорию «${c.name}»?\n\nВсе товары из этой категории останутся в магазине, но переместятся в раздел «Без категории».`)) return
    try {
      await deleteCategory(c.id, user.id)
      window.location.reload()
    } catch (e: any) {
      alert(e.response?.data || 'Не удалось удалить')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-slate-500 dark:text-slate-400">
          Категорий: {cats.data?.length ?? 0}
        </div>
        <button
          onClick={() => setCreating(true)}
          className="bg-brand-600 hover:bg-brand-700 text-white rounded-md px-4 py-2 text-sm font-medium transition"
        >
          + Создать категорию
        </button>
      </div>

      {cats.loading && <div className="text-slate-500">Загрузка...</div>}
      {cats.error && <div className="text-red-600">{cats.error}</div>}

      {!cats.loading && (cats.data?.length ?? 0) === 0 && (
        <div className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-[#30363d] p-8 sm:p-12 text-center">
          <div className="text-slate-400 dark:text-slate-500 text-sm">Категорий пока нет</div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {cats.data?.map((c) => (
          <div
            key={c.id}
            className="bg-white dark:bg-[#161b22] rounded-lg border border-slate-200 dark:border-[#30363d] p-4 flex items-center gap-3"
          >
            <div className="w-16 h-16 rounded-lg bg-slate-100 dark:bg-[#0d1117] shrink-0 overflow-hidden flex items-center justify-center">
              {c.imageUrl ? (
                <img src={c.imageUrl} alt={c.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-slate-300 dark:text-slate-600 text-xl font-bold">
                  {c.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm text-slate-900 dark:text-white truncate">
                {c.name}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {c.description || 'Без описания'}
              </div>
              <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                Порядок: {c.sortOrder}
              </div>
            </div>

            <div className="flex flex-col gap-1.5 shrink-0">
              <button
                onClick={() => setEditing(c)}
                className="text-xs px-2.5 py-1 border border-slate-300 dark:border-[#30363d] rounded text-slate-700 dark:text-slate-300 hover:border-brand-500 transition"
              >
                Изменить
              </button>
              <button
                onClick={() => handleDelete(c)}
                className="text-xs px-2.5 py-1 border border-red-300 dark:border-red-500/30 rounded text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition"
              >
                Удалить
              </button>
            </div>
          </div>
        ))}
      </div>

      {creating && (
        <CategoryModal
          actorId={user.id}
          onClose={() => setCreating(false)}
          onSaved={() => {
            setCreating(false)
            window.location.reload()
          }}
        />
      )}

      {editing && (
        <CategoryModal
          category={editing}
          actorId={user.id}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null)
            window.location.reload()
          }}
        />
      )}
    </div>
  )
}