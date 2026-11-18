import { useState } from 'react'
import { useAuth } from '../../store/auth'
import { useFetch } from '../../hooks/useFetch'
import { getAllUsers, changeUserRole } from '../../api/users'
import { ROLE_PERMISSIONS } from '../../lib/permissions'
import { notify } from '../../lib/notify'
import type { Role, UserListItem } from '../../types'
import { IconSearch } from '../../components/Icons'

const ROLE_LABEL: Record<Role, string> = {
  ADMIN: 'Администратор',
  HR: 'HR',
  MANAGER: 'Менеджер',
  SUPPORT: 'Поддержка',
  ORGANIZER: 'Организатор',
  EMPLOYEE: 'Сотрудник',
}

const ROLE_COLORS: Record<Role, string> = {
  ADMIN: 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400',
  HR: 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400',
  MANAGER: 'bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400',
  SUPPORT: 'bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-400',
  ORGANIZER: 'bg-cyan-50 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-400',
  EMPLOYEE: 'bg-slate-100 dark:bg-slate-500/10 text-slate-600 dark:text-slate-400',
}

const ALL_ROLES: Role[] = ['ADMIN', 'HR', 'MANAGER', 'SUPPORT', 'ORGANIZER', 'EMPLOYEE']

const ROLE_DESCRIPTION: Record<Role, string> = {
  ADMIN: 'Полный доступ ко всем разделам и настройкам',
  HR: 'Модерация событий, управление сотрудниками, поддержка',
  MANAGER: 'Модерация, заказы, квесты, штрафы',
  SUPPORT: 'Обработка тикетов и запросов',
  ORGANIZER: 'Создание и редактирование событий',
  EMPLOYEE: 'Базовый доступ: события, квесты, магазин',
}

export default function AdminRolesTab() {
  const me = useAuth((s) => s.user)!
  const users = useFetch(() => getAllUsers(), [])
  const [query, setQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<Role | 'all'>('all')
  const [changing, setChanging] = useState<UserListItem | null>(null)

  const usersList = users.data ?? []

  const filtered = usersList.filter((u) => {
    if (roleFilter !== 'all' && u.role !== roleFilter) return false
    if (!query.trim()) return true
    const q = query.toLowerCase()
    return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
  })

  const counts = usersList.reduce((acc, u) => {
    acc[u.role] = (acc[u.role] ?? 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="space-y-5">
      {/* Сводка по ролям */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
        {ALL_ROLES.map((role) => (
          <button
            key={role}
            onClick={() => setRoleFilter(roleFilter === role ? 'all' : role)}
            className={`bg-white dark:bg-[#161b22] rounded-xl border p-4 text-left transition ${
              roleFilter === role
                ? 'border-brand-500 ring-1 ring-brand-300 dark:ring-brand-500/30'
                : 'border-slate-200 dark:border-[#30363d] hover:border-brand-400'
            }`}
          >
            <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {ROLE_LABEL[role]}
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              {counts[role] ?? 0}
            </div>
            <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 line-clamp-2">
              {ROLE_DESCRIPTION[role]}
            </div>
          </button>
        ))}
      </div>

      {/* Фильтр + поиск */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            <IconSearch size={14} />
          </div>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск по имени или email"
            className="w-full border border-slate-300 dark:border-[#30363d] dark:bg-[#0d1117] dark:text-white rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-brand-500"
          />
        </div>
        {roleFilter !== 'all' && (
          <button
            onClick={() => setRoleFilter('all')}
            className="text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-[#30363d] text-slate-600 dark:text-slate-300 hover:border-brand-400 transition"
          >
            Сбросить · {ROLE_LABEL[roleFilter]}
          </button>
        )}
        <span className="text-xs text-slate-500 dark:text-slate-400 ml-auto">
          {filtered.length} из {usersList.length}
        </span>
      </div>

      {/* Список пользователей */}
      <div className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-[#30363d] divide-y divide-slate-100 dark:divide-[#30363d]">
        {filtered.map((u) => (
          <div key={u.id} className="px-4 py-3 flex items-center gap-3 flex-wrap">
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-slate-900 dark:text-white truncate">
                {u.name}
                {u.id === me.id && (
                  <span className="ml-1.5 text-xs text-slate-400">(вы)</span>
                )}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {u.email}
                {u.departmentName && ` · ${u.departmentName}`}
              </div>
            </div>
            <span
              className={`text-xs px-2 py-0.5 rounded font-medium shrink-0 ${
                ROLE_COLORS[u.role]
              }`}
            >
              {ROLE_LABEL[u.role]}
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-500 shrink-0">
              {ROLE_PERMISSIONS[u.role]?.length ?? 0} прав
            </span>
            {u.id !== me.id && (
              <button
                onClick={() => setChanging(u)}
                className="text-xs px-2.5 py-1 border border-slate-300 dark:border-[#30363d] rounded text-slate-700 dark:text-slate-300 hover:border-brand-500 transition shrink-0"
              >
                Сменить
              </button>
            )}
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="px-4 py-8 text-center text-sm text-slate-400">
            Никого не нашли
          </div>
        )}
      </div>

      {changing && (
        <ChangeRoleModal
          user={changing}
          actorId={me.id}
          onClose={() => setChanging(null)}
          onChanged={() => {
            setChanging(null)
            window.location.reload()
          }}
        />
      )}
    </div>
  )
}

function ChangeRoleModal({
  user,
  actorId,
  onClose,
  onChanged,
}: {
  user: UserListItem
  actorId: number
  onClose: () => void
  onChanged: () => void
}) {
  const [role, setRole] = useState<Role>(user.role)
  const [busy, setBusy] = useState(false)

  async function handleSave() {
    if (role === user.role) {
      onClose()
      return
    }
    setBusy(true)
    try {
      await changeUserRole(user.id, role, actorId)
      notify.success(`${user.name} · новая роль: ${ROLE_LABEL[role]}`)
      onChanged()
    } catch (e: any) {
      notify.error(e)
      setBusy(false)
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-[#161b22] rounded-xl w-full max-w-md p-6 space-y-4"
      >
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Сменить роль
          </h2>
          <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {user.name} · {user.email}
          </div>
        </div>

        <div className="space-y-2">
          {ALL_ROLES.map((r) => (
            <label
              key={r}
              className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition ${
                role === r
                  ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/10'
                  : 'border-slate-200 dark:border-[#30363d] hover:border-brand-300'
              }`}
            >
              <input
                type="radio"
                name="role"
                checked={role === r}
                onChange={() => setRole(r)}
                className="mt-1"
              />
              <div className="flex-1">
                <div className="text-sm font-medium text-slate-900 dark:text-white">
                  {ROLE_LABEL[r]}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {ROLE_DESCRIPTION[r]}
                </div>
              </div>
            </label>
          ))}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            disabled={busy}
            className="px-4 py-2 text-sm text-slate-600 dark:text-slate-300 disabled:opacity-50"
          >
            Отмена
          </button>
          <button
            onClick={handleSave}
            disabled={busy || role === user.role}
            className="bg-brand-600 hover:bg-brand-700 text-white rounded-md px-4 py-2 text-sm font-medium disabled:opacity-50 transition"
          >
            {busy ? '...' : 'Сохранить'}
          </button>
        </div>
      </div>
    </div>
  )
}