import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../store/auth'
import { getAllUsers } from '../api/users'
import CreateUserModal from '../components/CreateUserModal'
import { IconSearch } from '../components/Icons'
import type { UserListItem } from '../types'

const ROLE_LABEL: Record<string, string> = {
  EMPLOYEE: 'Сотрудник',
  ORGANIZER: 'Организатор',
  MANAGER: 'Менеджер',
  HR: 'HR',
  SUPPORT: 'Поддержка',
  ADMIN: 'Администратор',
}

export default function Users() {
  const me = useAuth((s) => s.user)!
  const canCreate = ['MANAGER', 'HR', 'ADMIN'].includes(me.role)

  const [query, setQuery] = useState('')
  const [allUsers, setAllUsers] = useState<UserListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    getAllUsers()
      .then((d) => !cancelled && setAllUsers(d))
      .catch((e) => !cancelled && setError(e.response?.data || 'Ошибка загрузки'))
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return allUsers
    return allUsers.filter(
      (u) =>
        u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    )
  }, [allUsers, query])

  const isSearching = query.trim().length > 0

  return (
    <div className="space-y-6">
      {/* Заголовок с кнопкой */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white tracking-tight">
            Сотрудники
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Найдите коллегу, чтобы поблагодарить или написать
          </p>
        </div>
        {canCreate && (
          <button
            onClick={() => setCreating(true)}
            className="bg-brand-600 hover:bg-brand-700 text-white rounded-md px-4 py-2 text-sm font-medium transition inline-flex items-center gap-1.5"
          >
            + Создать сотрудника
          </button>
        )}
      </div>

      {/* Поиск */}
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
          <IconSearch size={18} />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Имя или email..."
          autoFocus
          className="w-full border border-slate-300 dark:border-[#30363d] dark:bg-[#161b22] dark:text-white rounded-lg pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:border-brand-500"
        />
      </div>

      {loading && <div className="text-slate-500 text-sm">Загрузка...</div>}
      {error && <div className="text-red-600 text-sm">{error}</div>}

      {!loading && !error && filtered.length === 0 && (
        <div className="text-slate-400 text-sm text-center py-8">
          {isSearching ? 'Никого не нашли' : 'Пока нет сотрудников'}
        </div>
      )}

      {filtered.length > 0 && (
        <div className="bg-white dark:bg-[#161b22] rounded-lg border border-slate-200 dark:border-[#30363d] divide-y divide-slate-100 dark:divide-[#30363d]">
          {filtered.map((u) => (
            <Link
              key={u.id}
              to={`/users/${u.id}`}
              className="flex items-center gap-4 px-4 py-3 hover:bg-slate-50 dark:hover:bg-[#0d1117] transition"
            >
              <div className="w-10 h-10 rounded-full bg-brand-600 text-white flex items-center justify-center font-medium shrink-0">
                {u.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-slate-900 dark:text-white text-sm truncate">
                  {u.name}
                  {u.id === me.id && (
                    <span className="ml-1.5 text-xs text-slate-400 dark:text-slate-500">
                      (вы)
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {u.email}
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {ROLE_LABEL[u.role] || u.role}
                </div>
                <div className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                  {u.level} · {u.lifetimeRating?.toFixed(1) ?? '0.0'}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {!isSearching && allUsers.length > 0 && (
        <div className="text-xs text-slate-400 dark:text-slate-500 text-center">
          Всего сотрудников: {allUsers.length}
        </div>
      )}

      {/* Модалка создания — только для MANAGER/HR/ADMIN */}
      {creating && (
        <CreateUserModal
          actorId={me.id}
          actorRole={me.role}
          onClose={() => setCreating(false)}
          onCreated={() => {
            setCreating(false)
            window.location.reload()
          }}
        />
      )}
    </div>
  )
}