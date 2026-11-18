import { useState } from 'react'
import { useAuth } from '../../store/auth'
import { useFetch } from '../../hooks/useFetch'
import {
  getDepartments,
  createDepartment,
  assignUserToDepartment,
  removeUserFromDepartment,
} from '../../api/departments'
import { getAllUsers } from '../../api/users'
import { notify } from '../../lib/notify'
import { confirmDialog } from '../../lib/confirm'
import type { Department, UserListItem } from '../../types'
import { IconPlus, IconSearch } from '../../components/Icons'

export default function AdminDepartmentsTab() {
  const me = useAuth((s) => s.user)!
  const departments = useFetch(() => getDepartments(), [])
  const users = useFetch(() => getAllUsers(), [])

  const [creating, setCreating] = useState(false)
  const [editingUsers, setEditingUsers] = useState<Department | null>(null)

  const deptList = departments.data ?? []
  const usersList = users.data ?? []

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <div className="text-sm font-semibold text-slate-900 dark:text-white">
            Подразделения компании
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {deptList.length} отделов · {usersList.filter((u) => u.departmentId).length} сотрудников распределено
          </div>
        </div>
        <button
          onClick={() => setCreating(true)}
          className="bg-brand-600 hover:bg-brand-700 text-white rounded-lg px-4 py-2 text-sm font-medium inline-flex items-center gap-1.5 transition"
        >
          <IconPlus size={14} />
          Создать отдел
        </button>
      </div>

      {departments.loading && (
        <div className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-[#30363d] p-8 text-center text-slate-500">
          Загрузка...
        </div>
      )}

      {!departments.loading && deptList.length === 0 && (
        <div className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-[#30363d] p-10 text-center">
          <div className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1">
            Отделов пока нет
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Создайте первый отдел, чтобы распределить сотрудников
          </div>
          <button
            onClick={() => setCreating(true)}
            className="bg-brand-600 hover:bg-brand-700 text-white rounded-lg px-4 py-2 text-sm font-medium"
          >
            Создать первый отдел
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {deptList.map((d) => {
          const memberCount = usersList.filter((u) => u.departmentId === d.id).length
          const totalRating = usersList
            .filter((u) => u.departmentId === d.id)
            .reduce((s, u) => s + (u.currentRating ?? 0), 0)
          const totalBalance = usersList
            .filter((u) => u.departmentId === d.id)
            .reduce((s, u) => s + (u.balance ?? 0), 0)

          return (
            <div
              key={d.id}
              className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-[#30363d] p-5"
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-slate-900 dark:text-white truncate">
                    {d.name}
                  </div>
                  {d.description && (
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                      {d.description}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 dark:border-[#30363d]">
                <div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Сотрудников
                  </div>
                  <div className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                    {memberCount}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Рейтинг
                  </div>
                  <div className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                    {totalRating.toFixed(1)}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Баланс
                  </div>
                  <div className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                    {totalBalance.toFixed(0)}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setEditingUsers(d)}
                className="mt-3 w-full text-xs px-3 py-1.5 border border-slate-300 dark:border-[#30363d] rounded-lg text-slate-700 dark:text-slate-300 hover:border-brand-500 transition"
              >
                Управление составом
              </button>
            </div>
          )
        })}
      </div>

      {creating && (
        <CreateDepartmentModal
          actorId={me.id}
          onClose={() => setCreating(false)}
          onCreated={() => {
            setCreating(false)
            window.location.reload()
          }}
        />
      )}

      {editingUsers && (
        <ManageMembersModal
          department={editingUsers}
          allUsers={usersList}
          onClose={() => setEditingUsers(null)}
          onChanged={() => window.location.reload()}
        />
      )}
    </div>
  )
}

function CreateDepartmentModal({
  actorId,
  onClose,
  onCreated,
}: {
  actorId: number
  onClose: () => void
  onCreated: () => void
}) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) {
      setError('Укажите название')
      return
    }
    setBusy(true)
    setError('')
    try {
      await createDepartment({ name: name.trim(), description: description.trim() || undefined })
      notify.success(`Отдел «${name}» создан`)
      onCreated()
    } catch (e: any) {
      setError(e.response?.data || 'Не удалось создать')
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
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-[#161b22] rounded-xl w-full max-w-md p-6 space-y-4"
      >
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Новый отдел
          </h2>
          <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Создать подразделение в компании
          </div>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 text-sm p-3 rounded">
            {error}
          </div>
        )}

        <div>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Название *
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Например: Backend Team"
            required
            className="w-full border border-slate-300 dark:border-[#30363d] dark:bg-[#0d1117] dark:text-white rounded-md px-3 py-2 mt-1 text-sm focus:outline-none focus:border-brand-500"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Описание
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            placeholder="Чем занимается отдел"
            className="w-full border border-slate-300 dark:border-[#30363d] dark:bg-[#0d1117] dark:text-white rounded-md px-3 py-2 mt-1 text-sm resize-none focus:outline-none focus:border-brand-500"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm text-slate-600 dark:text-slate-300"
          >
            Отмена
          </button>
          <button
            type="submit"
            disabled={busy}
            className="bg-brand-600 hover:bg-brand-700 text-white rounded-md px-4 py-2 text-sm font-medium disabled:opacity-50 transition"
          >
            {busy ? '...' : 'Создать'}
          </button>
        </div>
      </form>
    </div>
  )
}

function ManageMembersModal({
  department,
  allUsers,
  onClose,
  onChanged,
}: {
  department: Department
  allUsers: UserListItem[]
  onClose: () => void
  onChanged: () => void
}) {
  const [query, setQuery] = useState('')

  const inDept = allUsers.filter((u) => u.departmentId === department.id)
  const notInDept = allUsers.filter((u) => u.departmentId !== department.id)

  const filteredIn = inDept.filter((u) => {
    if (!query.trim()) return true
    const q = query.toLowerCase()
    return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
  })

  const filteredNotIn = notInDept.filter((u) => {
    if (!query.trim()) return true
    const q = query.toLowerCase()
    return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
  })

  async function handleAdd(u: UserListItem) {
    try {
      await assignUserToDepartment(department.id, u.id)
      notify.success(`${u.name} добавлен в «${department.name}»`)
      onChanged()
    } catch (e: any) {
      notify.error(e)
    }
  }

  async function handleRemove(u: UserListItem) {
    const ok = await confirmDialog({
      title: 'Убрать из отдела?',
      message: `${u.name} больше не будет в «${department.name}».`,
      confirmLabel: 'Убрать',
      danger: true,
    })
    if (!ok) return
    try {
      await removeUserFromDepartment(u.id)
      notify.info(`${u.name} убран из отдела`)
      onChanged()
    } catch (e: any) {
      notify.error(e)
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-[#161b22] rounded-xl w-full max-w-lg p-6 space-y-4 my-8 max-h-[90vh] flex flex-col"
      >
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            {department.name}
          </h2>
          <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {inDept.length} в отделе · {notInDept.length} вне
          </div>
        </div>

        <div className="relative">
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

        <div className="flex-1 overflow-y-auto space-y-4 min-h-0">
          {/* В отделе */}
          <div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              В отделе ({filteredIn.length})
            </div>
            <div className="space-y-1">
              {filteredIn.map((u) => (
                <div
                  key={u.id}
                  className="flex items-center gap-2 px-2 py-1.5 hover:bg-slate-50 dark:hover:bg-[#0d1117] rounded"
                >
                  <div className="flex-1 min-w-0 text-sm text-slate-900 dark:text-white truncate">
                    {u.name}
                  </div>
                  <button
                    onClick={() => handleRemove(u)}
                    className="text-xs text-red-600 dark:text-red-400 hover:underline shrink-0"
                  >
                    Убрать
                  </button>
                </div>
              ))}
              {filteredIn.length === 0 && (
                <div className="text-xs text-slate-400 italic py-2">
                  Нет сотрудников
                </div>
              )}
            </div>
          </div>

          {/* Вне отдела */}
          <div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Добавить из остальных ({filteredNotIn.length})
            </div>
            <div className="space-y-1">
              {filteredNotIn.map((u) => (
                <div
                  key={u.id}
                  className="flex items-center gap-2 px-2 py-1.5 hover:bg-slate-50 dark:hover:bg-[#0d1117] rounded"
                >
                  <div className="flex-1 min-w-0 text-sm text-slate-900 dark:text-white truncate">
                    {u.name}
                    {u.departmentName && (
                      <span className="text-xs text-slate-400 ml-1.5">
                        ({u.departmentName})
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => handleAdd(u)}
                    className="text-xs text-brand-600 dark:text-brand-400 hover:underline shrink-0"
                  >
                    Добавить
                  </button>
                </div>
              ))}
              {filteredNotIn.length === 0 && (
                <div className="text-xs text-slate-400 italic py-2">
                  Все уже в отделе
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-[#30363d]">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-slate-600 dark:text-slate-300"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  )
}