import { useState } from 'react'
import { useAuth } from '../../store/auth'
import { useFetch } from '../../hooks/useFetch'
import {
  getAllUsers,
  changeUserRole,
  toggleUserBlock,
  changeUserPassword,
} from '../../api/users'
import { notify } from '../../lib/notify'
import { confirmDialog } from '../../lib/confirm'
import CreateUserModal from '../../components/CreateUserModal'
import type { UserListItem, Role } from '../../types'
import { IconSearch, IconCheck, IconX, IconPlus } from '../../components/Icons'

const ROLE_LABEL: Record<string, string> = {
  EMPLOYEE: 'Сотрудник',
  ORGANIZER: 'Организатор',
  MANAGER: 'Менеджер',
  HR: 'HR',
  SUPPORT: 'Поддержка',
  ADMIN: 'Администратор',
}

const ROLE_COLOR: Record<string, string> = {
  EMPLOYEE: 'bg-slate-100 dark:bg-[#0d1117] text-slate-600 dark:text-slate-400',
  ORGANIZER: 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400',
  MANAGER: 'bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400',
  HR: 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400',
  SUPPORT: 'bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400',
  ADMIN: 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400',
}

export default function AdminUsersTab() {
  const me = useAuth((s) => s.user)!
  const isAdmin = me.role === 'ADMIN' // <-- Проверка на админа
  
  const { data, loading, error } = useFetch(() => getAllUsers(), [])
  const [query, setQuery] = useState('')
  const [local, setLocal] = useState<UserListItem[] | null>(null)
  const [busy, setBusy] = useState<number | null>(null)
  const [pwdUser, setPwdUser] = useState<UserListItem | null>(null)
  const [roleUser, setRoleUser] = useState<UserListItem | null>(null)
  const [creating, setCreating] = useState(false)

  const list = (local ?? data ?? []).filter((u) => {
    if (!query.trim()) return true
    const q = query.toLowerCase()
    return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
  })

  async function handleToggleBlock(u: UserListItem) {
    const ok = await confirmDialog({
      title: u.isBlocked ? 'Разблокировать сотрудника?' : 'Заблокировать сотрудника?',
      message: u.isBlocked
        ? `${u.name} снова сможет входить в систему`
        : `${u.name} не сможет войти в систему. Вы сможете разблокировать его позже.`,
      confirmLabel: u.isBlocked ? 'Разблокировать' : 'Заблокировать',
      danger: !u.isBlocked,
    })
    if (!ok) return

    setBusy(u.id)
    try {
      await toggleUserBlock(u.id, me.id)
      setLocal(
        (local ?? data ?? []).map((x) =>
          x.id === u.id ? { ...x, isBlocked: !u.isBlocked } : x
        )
      )
      notify.success(
        u.isBlocked ? `${u.name} разблокирован` : `${u.name} заблокирован`
      )
    } catch (e) {
      notify.error(e)
    } finally {
      setBusy(null)
    }
  }

  if (loading) return <div className="text-slate-500">Загрузка...</div>
  if (error) return <div className="text-red-600">{error}</div>

  return (
    <div className="space-y-4">
      {/* Поиск + кнопка создания */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            <IconSearch size={16} />
          </div>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск по имени или email..."
            className="w-full border border-slate-300 dark:border-[#30363d] dark:bg-[#0d1117] dark:text-white rounded-md pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-brand-500"
          />
        </div>
        <button
          onClick={() => setCreating(true)}
          className="bg-brand-600 hover:bg-brand-700 text-white rounded-md px-4 py-2 text-sm font-medium transition shrink-0 inline-flex items-center gap-1.5"
        >
          <IconPlus size={14} />
          Создать сотрудника
        </button>
      </div>

      {/* Таблица */}
      <div className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-[#30363d] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-[#0d1117] border-b border-slate-200 dark:border-[#30363d]">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
                  Сотрудник
                </th>
                <th className="text-left px-4 py-3 font-medium text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
                  Роль
                </th>
                <th className="text-right px-4 py-3 font-medium text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
                  Баланс
                </th>
                <th className="text-center px-4 py-3 font-medium text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
                  Статус
                </th>
                <th className="text-right px-4 py-3 font-medium text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#30363d]">
              {list.map((u) => (
                <tr
                  key={u.id}
                  className="hover:bg-slate-50 dark:hover:bg-[#0d1117] transition"
                >
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-900 dark:text-white">
                      {u.name}
                      {u.id === me.id && (
                        <span className="ml-1.5 text-xs text-slate-400 dark:text-slate-500">
                          (вы)
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {u.email}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs px-2 py-0.5 rounded font-medium ${
                        ROLE_COLOR[u.role] || ROLE_COLOR.EMPLOYEE
                      }`}
                    >
                      {ROLE_LABEL[u.role] || u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-slate-900 dark:text-white">
                    {u.balance.toFixed(0)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {u.isBlocked ? (
                      <span className="inline-flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
                        <IconX size={12} /> Заблокирован
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-brand-600 dark:text-brand-400">
                        <IconCheck size={12} /> Активен
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1.5 flex-wrap">
                      
                      {/* Кнопка Роль (только Админ) */}
                      {isAdmin && (
                        <button
                          onClick={() => setRoleUser(u)}
                          className="text-xs px-2.5 py-1 border border-slate-300 dark:border-[#30363d] rounded text-slate-700 dark:text-slate-300 hover:border-brand-500 transition"
                        >
                          Роль
                        </button>
                      )}
                      
                      {/* Кнопка Пароль (только Админ) */}
                      {isAdmin && (
                        <button
                          onClick={() => setPwdUser(u)}
                          className="text-xs px-2.5 py-1 border border-slate-300 dark:border-[#30363d] rounded text-slate-700 dark:text-slate-300 hover:border-brand-500 transition"
                        >
                          Пароль
                        </button>
                      )}
                      
                      {/* Кнопка Блок (только Админ) */}
                      {isAdmin && u.id !== me.id && (
                        <button
                          onClick={() => handleToggleBlock(u)}
                          disabled={busy === u.id}
                          className={`text-xs px-2.5 py-1 border rounded transition disabled:opacity-50 ${
                            u.isBlocked
                              ? 'border-brand-300 dark:border-brand-500/30 text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-500/10'
                              : 'border-red-300 dark:border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10'
                          }`}
                        >
                          {busy === u.id ? '...' : u.isBlocked ? 'Разблок.' : 'Блок.'}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {list.length === 0 && (
          <div className="p-8 text-center text-sm text-slate-500 dark:text-slate-400">
            {query ? 'Никого не нашли' : 'Нет сотрудников'}
          </div>
        )}
      </div>

      <div className="text-xs text-slate-400 dark:text-slate-500 text-center">
        Всего: {list.length}
      </div>

      {/* Модалка создания */}
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

      {/* Модалка смены роли */}
      {roleUser && (
        <RoleModal
          user={roleUser}
          actorId={me.id}
          onClose={() => setRoleUser(null)}
          onSaved={(newRole, newRoleLabel) => {
            setLocal(
              (local ?? data ?? []).map((x) =>
                x.id === roleUser.id ? { ...x, role: newRole as Role } : x
              )
            )
            notify.success(`${roleUser.name} · новая роль: ${newRoleLabel}`)
            setRoleUser(null)
          }}
        />
      )}

      {/* Модалка сброса пароля */}
      {pwdUser && (
        <PasswordModal
          user={pwdUser}
          actorId={me.id}
          onClose={() => setPwdUser(null)}
          onSaved={() => {
            notify.success(`Пароль изменён · ${pwdUser.name}`)
            setPwdUser(null)
          }}
        />
      )}
    </div>
  )
}

// ==========================================
// === Модалка смены роли ===
// ==========================================
function RoleModal({
  user,
  actorId,
  onClose,
  onSaved,
}: {
  user: UserListItem
  actorId: number
  onClose: () => void
  onSaved: (newRole: string, newRoleLabel: string) => void
}) {
  const [role, setRole] = useState<string>(user.role)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function handleSave() {
    if (role === user.role) {
      onClose()
      return
    }
    setBusy(true)
    setError('')
    try {
      await changeUserRole(user.id, role, actorId)
      onSaved(role, ROLE_LABEL[role] || role)
    } catch (e: any) {
      const msg = e.response?.data || 'Ошибка'
      setError(msg)
      notify.error(e)
    } finally {
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
            Изменить роль
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {user.name}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 text-sm p-3 rounded border border-red-200 dark:border-red-500/30">
            {error}
          </div>
        )}

        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full border border-slate-300 dark:border-[#30363d] dark:bg-[#0d1117] dark:text-white rounded-md px-3 py-2 text-sm"
        >
          {Object.entries(ROLE_LABEL).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>

        {role !== user.role && (
          <div className="bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs p-2.5 rounded border border-amber-200 dark:border-amber-500/30">
            Роль будет изменена с{' '}
            <strong>{ROLE_LABEL[user.role] || user.role}</strong> на{' '}
            <strong>{ROLE_LABEL[role] || role}</strong>. Набор доступных
            возможностей изменится.
          </div>
        )}

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
            disabled={busy}
            className="bg-brand-600 hover:bg-brand-700 text-white rounded-md px-4 py-2 text-sm font-medium disabled:opacity-50 transition"
          >
            {busy ? 'Сохранение...' : 'Сохранить'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ==========================================
// === Модалка сброса пароля ===
// ==========================================
function PasswordModal({
  user,
  actorId,
  onClose,
  onSaved,
}: {
  user: UserListItem
  actorId: number
  onClose: () => void
  onSaved: () => void
}) {
  const [pwd, setPwd] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [showPwd, setShowPwd] = useState(false)

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (pwd.length < 4) {
      setError('Минимум 4 символа')
      return
    }
    setBusy(true)
    setError('')
    try {
      await changeUserPassword(user.id, pwd, actorId)
      onSaved()
    } catch (e: any) {
      const msg = e.response?.data || 'Ошибка'
      setError(msg)
      notify.error(e)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <form
        onSubmit={handleSave}
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-[#161b22] rounded-xl w-full max-w-md p-6 space-y-4"
      >
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Сбросить пароль
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {user.name} ({user.email})
          </p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 text-sm p-3 rounded border border-red-200 dark:border-red-500/30">
            {error}
          </div>
        )}

        <div>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Новый пароль
          </label>
          <div className="relative mt-1">
            <input
              type={showPwd ? 'text' : 'password'}
              value={pwd}
              onChange={(e) => setPwd(e.target.value)}
              placeholder="Минимум 4 символа"
              required
              className="w-full border border-slate-300 dark:border-[#30363d] dark:bg-[#0d1117] dark:text-white rounded-md px-3 py-2 pr-16 text-sm focus:outline-none focus:border-brand-500"
            />
            <button
              type="button"
              onClick={() => setShowPwd((v) => !v)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white px-2 py-1"
            >
              {showPwd ? 'скрыть' : 'показать'}
            </button>
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
            Сотруднику не придёт уведомление — передайте пароль лично.
          </p>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="px-4 py-2 text-sm text-slate-600 dark:text-slate-300 disabled:opacity-50"
          >
            Отмена
          </button>
          <button
            type="submit"
            disabled={busy}
            className="bg-brand-600 hover:bg-brand-700 text-white rounded-md px-4 py-2 text-sm font-medium disabled:opacity-50 transition"
          >
            {busy ? 'Сохранение...' : 'Сохранить'}
          </button>
        </div>
      </form>
    </div>
  )
}