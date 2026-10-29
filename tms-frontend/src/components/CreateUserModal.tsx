import { useState } from 'react'
import { createUser, type CreateUserPayload } from '../api/users'
import { notify, getErrorMessage } from '../lib/notify'
import { IconX } from './Icons'

const ROLE_OPTIONS = [
  { value: 'EMPLOYEE', label: 'Сотрудник' },
  { value: 'MANAGER', label: 'Менеджер' },
  { value: 'SUPPORT', label: 'Поддержка' },
  { value: 'HR', label: 'HR' },
  { value: 'ADMIN', label: 'Администратор' },
]

interface Props {
  actorId: number
  actorRole: string
  onClose: () => void
  onCreated: () => void
}

export default function CreateUserModal({
  actorId,
  actorRole,
  onClose,
  onCreated,
}: Props) {
  // Какие роли можно выбрать — зависит от того, кто создаёт
  const availableRoles = (() => {
    if (actorRole === 'ADMIN' || actorRole === 'HR') {
      // Без ADMIN (нельзя создавать админов), без ORGANIZER (скрыт)
      return ROLE_OPTIONS.filter((r) => r.value !== 'ADMIN')
    }
    if (actorRole === 'MANAGER') {
      return ROLE_OPTIONS.filter(
        (r) => r.value === 'EMPLOYEE' || r.value === 'MANAGER'
      )
    }
    return ROLE_OPTIONS.filter((r) => r.value === 'EMPLOYEE')
  })()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState(availableRoles[0]?.value ?? 'EMPLOYEE')
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (name.trim().length < 2) {
      setError('Имя слишком короткое')
      return
    }
    if (!email.includes('@')) {
      setError('Введите корректный email')
      return
    }
    if (password.length < 4) {
      setError('Пароль минимум 4 символа')
      return
    }

    setLoading(true)
    try {
      const payload: CreateUserPayload = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        role,
      }
      await createUser(actorId, payload)
      notify.success(`Сотрудник создан · ${payload.name}`)
      onCreated()
    } catch (e) {
      const msg = getErrorMessage(e)
      setError(msg)
      notify.error(msg)
    } finally {
      setLoading(false)
    }
  }

  function generatePassword() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789'
    let pwd = ''
    for (let i = 0; i < 8; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setPassword(pwd)
    setShowPwd(true)
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 overflow-y-auto"
      onClick={onClose}
    >
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-[#161b22] rounded-xl w-full max-w-md p-6 space-y-4 my-8"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Новый сотрудник
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Создайте учётную запись для входа в систему
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-900 dark:hover:text-white p-1"
          >
            <IconX size={18} />
          </button>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 text-sm p-3 rounded border border-red-200 dark:border-red-500/30">
            {error}
          </div>
        )}

        <div>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Имя *
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Иван Иванов"
            required
            className="w-full border border-slate-300 dark:border-[#30363d] dark:bg-[#0d1117] dark:text-white rounded-md px-3 py-2 mt-1 text-sm focus:outline-none focus:border-brand-500"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Email *
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ivan@tms.local"
            required
            className="w-full border border-slate-300 dark:border-[#30363d] dark:bg-[#0d1117] dark:text-white rounded-md px-3 py-2 mt-1 text-sm focus:outline-none focus:border-brand-500"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Пароль *
          </label>
          <div className="relative mt-1">
            <input
              type={showPwd ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Минимум 4 символа"
              required
              className="w-full border border-slate-300 dark:border-[#30363d] dark:bg-[#0d1117] dark:text-white rounded-md px-3 py-2 pr-24 text-sm focus:outline-none focus:border-brand-500 font-mono"
            />
            <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
              <button
                type="button"
                onClick={() => setShowPwd((v) => !v)}
                className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white px-2 py-1"
              >
                {showPwd ? 'скрыть' : 'показать'}
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between mt-1">
            <p className="text-xs text-slate-400 dark:text-slate-500">
              Передайте пароль сотруднику лично
            </p>
            <button
              type="button"
              onClick={generatePassword}
              className="text-xs text-brand-600 dark:text-brand-400 hover:underline"
            >
              Сгенерировать
            </button>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Роль *
          </label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full border border-slate-300 dark:border-[#30363d] dark:bg-[#0d1117] dark:text-white rounded-md px-3 py-2 mt-1 text-sm focus:outline-none focus:border-brand-500"
          >
            {availableRoles.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
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
            disabled={loading}
            className="bg-brand-600 hover:bg-brand-700 text-white rounded-md px-4 py-2 text-sm font-medium disabled:opacity-50 transition"
          >
            {loading ? 'Создание...' : 'Создать'}
          </button>
        </div>
      </form>
    </div>
  )
}