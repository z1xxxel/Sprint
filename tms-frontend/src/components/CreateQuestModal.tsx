import { useState, useMemo, useEffect } from 'react'
import { useAuth } from '../store/auth'
import { useFetch } from '../hooks/useFetch'
import { createQuestWithAudience } from '../api/quests'
import { getDepartments } from '../api/departments'
import { getAllUsers } from '../api/users'
import { notify, getErrorMessage } from '../lib/notify'
import { IconX, IconSearch } from './Icons'
import type { Department, UserListItem } from '../types'

interface Props {
  onClose: () => void
  onCreated: () => void
}

type Mode = 'all' | 'departments' | 'users' | 'mixed'

export default function CreateQuestModal({ onClose, onCreated }: Props) {
  const me = useAuth((s) => s.user)!

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [rewardCoins, setRewardCoins] = useState(100)
  const [rewardRating, setRewardRating] = useState(0)
  const [deadline, setDeadline] = useState('')
  const [isMandatory, setIsMandatory] = useState(false)
  const [penaltyCoins, setPenaltyCoins] = useState(0)
  const [penaltyRating, setPenaltyRating] = useState(0)
  
  // Новые поля
  const [isRepeatable, setIsRepeatable] = useState(false)
  const [cooldownHours, setCooldownHours] = useState(24)

  const [mode, setMode] = useState<Mode>('all')
  const [selectedDepts, setSelectedDepts] = useState<number[]>([])
  const [selectedUsers, setSelectedUsers] = useState<number[]>([])
  const [excludedUsers, setExcludedUsers] = useState<number[]>([])
  const [userQuery, setUserQuery] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const depts = useFetch<Department[]>(() => getDepartments(), [])
  const users = useFetch<UserListItem[]>(() => getAllUsers(), [])

  const deptsData: Department[] = depts.data ?? []
  const usersData: UserListItem[] = users.data ?? []

  const audienceCandidates = useMemo(() => {
    const ids = new Set<number>()

    if (mode === 'all') {
      usersData.forEach((u) => {
        if (u.id !== me.id) ids.add(u.id)
      })
    } else {
      if (mode === 'departments' || mode === 'mixed') {
        selectedDepts.forEach((dId) => {
          usersData.forEach((u) => {
            if (u.departmentId === dId && u.id !== me.id) ids.add(u.id)
          })
        })
      }
      if (mode === 'users' || mode === 'mixed') {
        selectedUsers.forEach((id) => {
          if (id !== me.id) ids.add(id)
        })
      }
    }

    return usersData.filter((u) => ids.has(u.id))
  }, [mode, selectedDepts, selectedUsers, usersData, me.id])

  const excludableUsers = audienceCandidates

  const audienceCount = useMemo(() => {
    const ids = new Set(audienceCandidates.map((u) => u.id))
    excludedUsers.forEach((id) => ids.delete(id))
    return ids.size
  }, [audienceCandidates, excludedUsers])

  useEffect(() => {
    const validIds = new Set(excludableUsers.map((u) => u.id))
    setExcludedUsers((prev) => prev.filter((id) => validIds.has(id)))
  }, [excludableUsers])

  const filteredUsers = usersData
    .filter((u) => u.id !== me.id)
    .filter((u) => {
      if (!userQuery.trim()) return true
      const q = userQuery.toLowerCase()
      return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    })

  function toggle(array: number[], setter: (v: number[]) => void, id: number) {
    if (array.includes(id)) setter(array.filter((x) => x !== id))
    else setter([...array, id])
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!title.trim() || !description.trim()) {
      setError('Заполните название и описание')
      return
    }
    if (rewardCoins <= 0) {
      setError('Награда должна быть больше нуля')
      return
    }
    if (rewardRating < 0 || rewardRating > 5) {
      setError('Рейтинговая награда должна быть от 0 до 5')
      return
    }

    setLoading(true)
    try {
      await createQuestWithAudience({
        creatorId: me.id,
        title: title.trim(),
        description: description.trim(),
        rewardCoins,
        rewardRating: rewardRating > 0 ? rewardRating : null,
        deadline: deadline ? deadline + ':00' : null,
        isMandatory,
        penaltyCoins: isMandatory && penaltyCoins > 0 ? penaltyCoins : null,
        penaltyRating: isMandatory && penaltyRating > 0 ? penaltyRating : null,
        isRepeatable,
        cooldownHours: isRepeatable && cooldownHours > 0 ? cooldownHours : null,
        allUsers: mode === 'all',
        departmentIds: mode !== 'all' && selectedDepts.length > 0 ? selectedDepts : null,
        userIds: mode !== 'all' && selectedUsers.length > 0 ? selectedUsers : null,
        excludeUserIds: excludedUsers.length > 0 ? excludedUsers : null,
      })
      notify.success(`Квест создан · получат ${audienceCount} чел.`)
      onCreated()
    } catch (e) {
      const msg = getErrorMessage(e)
      setError(msg)
      notify.error(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 overflow-y-auto"
      onClick={onClose}
    >
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-[#161b22] rounded-xl w-full max-w-3xl p-6 space-y-4 my-8"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Новый квест
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Создайте задание и выберите, кто его получит
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="sm:col-span-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Название *
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full border border-slate-300 dark:border-[#30363d] dark:bg-[#0d1117] dark:text-white rounded-md px-3 py-2 mt-1 text-sm focus:outline-none focus:border-brand-500"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Описание *
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              required
              className="w-full border border-slate-300 dark:border-[#30363d] dark:bg-[#0d1117] dark:text-white rounded-md px-3 py-2 mt-1 text-sm resize-none focus:outline-none focus:border-brand-500"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Награда, монет *
            </label>
            <input
              type="number"
              value={rewardCoins}
              onChange={(e) => setRewardCoins(Number(e.target.value))}
              min={1}
              required
              className="w-full border border-slate-300 dark:border-[#30363d] dark:bg-[#0d1117] dark:text-white rounded-md px-3 py-2 mt-1 text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Награда, рейтинга <span className="text-slate-400 text-xs">(0–5)</span>
            </label>
            <input
              type="number"
              value={rewardRating}
              onChange={(e) => {
                const v = Number(e.target.value)
                if (v < 0 || v > 5) return
                setRewardRating(v)
              }}
              min={0}
              max={5}
              step={0.5}
              className="w-full border border-slate-300 dark:border-[#30363d] dark:bg-[#0d1117] dark:text-white rounded-md px-3 py-2 mt-1 text-sm"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Дедлайн
            </label>
            <input
              type="datetime-local"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full border border-slate-300 dark:border-[#30363d] dark:bg-[#0d1117] dark:text-white rounded-md px-3 py-2 mt-1 text-sm"
            />
          </div>
        </div>

        {/* Повторяемость */}
        <div className="border border-slate-200 dark:border-[#30363d] rounded-lg p-4 space-y-3">
          <label className="flex items-center gap-2 text-sm font-medium text-slate-900 dark:text-white">
            <input
              type="checkbox"
              checked={isRepeatable}
              onChange={(e) => setIsRepeatable(e.target.checked)}
            />
            Повторяемый квест (можно взять снова после сдачи)
          </label>

          {isRepeatable && (
            <div className="pl-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-600 dark:text-slate-400">
                  Кулдаун после сдачи (в часах)
                </label>
                <input
                  type="number"
                  value={cooldownHours}
                  onChange={(e) => setCooldownHours(Number(e.target.value))}
                  min={0}
                  placeholder="Например: 24"
                  className="w-full border border-slate-300 dark:border-[#30363d] dark:bg-[#0d1117] dark:text-white rounded-md px-2 py-1.5 mt-1 text-sm"
                />
              </div>
            </div>
          )}
        </div>

        {/* Принудительный + штраф */}
        <div className="border border-slate-200 dark:border-[#30363d] rounded-lg p-4 space-y-3">
          <label className="flex items-center gap-2 text-sm font-medium text-slate-900 dark:text-white">
            <input
              type="checkbox"
              checked={isMandatory}
              onChange={(e) => setIsMandatory(e.target.checked)}
            />
            Принудительный квест (назначается сразу, штраф за невыполнение)
          </label>

          {isMandatory && (
            <div className="grid grid-cols-2 gap-3 pl-6">
              <div>
                <label className="text-xs text-slate-600 dark:text-slate-400">
                  Штраф, монет
                </label>
                <input
                  type="number"
                  value={penaltyCoins}
                  onChange={(e) => setPenaltyCoins(Number(e.target.value))}
                  min={0}
                  className="w-full border border-slate-300 dark:border-[#30363d] dark:bg-[#0d1117] dark:text-white rounded-md px-2 py-1.5 mt-1 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-slate-600 dark:text-slate-400">
                  Штраф, рейтинга
                </label>
                <input
                  type="number"
                  value={penaltyRating}
                  onChange={(e) => setPenaltyRating(Number(e.target.value))}
                  min={0}
                  step={0.5}
                  className="w-full border border-slate-300 dark:border-[#30363d] dark:bg-[#0d1117] dark:text-white rounded-md px-2 py-1.5 mt-1 text-sm"
                />
              </div>
            </div>
          )}
        </div>

        {/* Аудитория */}
        <div>
          <div className="text-sm font-medium text-slate-900 dark:text-white mb-2">
            Кто получит квест
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 p-1 rounded-lg bg-slate-100 dark:bg-[#0d1117]">
            {(
              [
                { id: 'all', label: 'Всем' },
                { id: 'departments', label: 'По отделам' },
                { id: 'users', label: 'Конкретным' },
                { id: 'mixed', label: 'Комбинированно' },
              ] as { id: Mode; label: string }[]
            ).map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setMode(m.id)}
                className={`py-1.5 px-2 text-xs font-medium rounded-md transition ${
                  mode === m.id
                    ? 'bg-white dark:bg-[#161b22] text-brand-700 dark:text-brand-400 shadow-sm'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          {(mode === 'departments' || mode === 'mixed') && (
            <div className="mt-3">
              <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                Отделы (выбрано: {selectedDepts.length})
              </div>
              {deptsData.length === 0 ? (
                <div className="text-xs text-slate-400 dark:text-slate-500 italic">
                  Отделов нет
                </div>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {deptsData.map((d) => {
                    const selected = selectedDepts.includes(d.id)
                    return (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => toggle(selectedDepts, setSelectedDepts, d.id)}
                        className={`text-xs px-2.5 py-1 rounded border transition ${
                          selected
                            ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-400'
                            : 'border-slate-300 dark:border-[#30363d] text-slate-600 dark:text-slate-300 hover:border-brand-400'
                        }`}
                      >
                        {d.name}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {(mode === 'users' || mode === 'mixed') && (
            <div className="mt-3">
              <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                Сотрудники (выбрано: {selectedUsers.length})
              </div>
              <div className="relative mb-2">
                <div className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  <IconSearch size={14} />
                </div>
                <input
                  value={userQuery}
                  onChange={(e) => setUserQuery(e.target.value)}
                  placeholder="Поиск..."
                  className="w-full border border-slate-300 dark:border-[#30363d] dark:bg-[#0d1117] dark:text-white rounded-md pl-8 pr-3 py-1.5 text-xs"
                />
              </div>
              <div className="max-h-40 overflow-y-auto border border-slate-200 dark:border-[#30363d] rounded-md divide-y divide-slate-100 dark:divide-[#30363d]">
                {filteredUsers.map((u) => (
                  <label
                    key={u.id}
                    className="flex items-center gap-2 px-2 py-1.5 hover:bg-slate-50 dark:hover:bg-[#0d1117] cursor-pointer text-xs"
                  >
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(u.id)}
                      onChange={() => toggle(selectedUsers, setSelectedUsers, u.id)}
                    />
                    <span className="text-slate-900 dark:text-white">{u.name}</span>
                    {u.departmentName && (
                      <span className="text-slate-400 text-[10px]">
                        · {u.departmentName}
                      </span>
                    )}
                    <span className="text-slate-400 text-[10px] ml-auto">
                      {u.email}
                    </span>
                  </label>
                ))}
                {filteredUsers.length === 0 && (
                  <div className="p-3 text-xs text-slate-400 text-center">Никого</div>
                )}
              </div>
            </div>
          )}

          {/* Исключения */}
          <div className="mt-3">
            <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">
              Исключить из аудитории ({excludedUsers.length})
              {excludableUsers.length > 0 && (
                <span className="text-slate-400 dark:text-slate-500 ml-1">
                  · доступно {excludableUsers.length}
                </span>
              )}
            </div>
            {excludableUsers.length === 0 ? (
              <div className="text-xs text-slate-400 dark:text-slate-500 italic border border-dashed border-slate-200 dark:border-[#30363d] rounded-md p-3 text-center">
                {mode === 'departments' && selectedDepts.length === 0
                  ? 'Выберите отделы выше — появятся сотрудники для исключения'
                  : mode === 'users' && selectedUsers.length === 0
                  ? 'Выберите сотрудников выше'
                  : 'Нет сотрудников в выбранной аудитории'}
              </div>
            ) : (
              <div className="max-h-40 overflow-y-auto border border-slate-200 dark:border-[#30363d] rounded-md divide-y divide-slate-100 dark:divide-[#30363d]">
                {excludableUsers.map((u) => (
                  <label
                    key={u.id}
                    className="flex items-center gap-2 px-2 py-1.5 hover:bg-slate-50 dark:hover:bg-[#0d1117] cursor-pointer text-xs"
                  >
                    <input
                      type="checkbox"
                      checked={excludedUsers.includes(u.id)}
                      onChange={() => toggle(excludedUsers, setExcludedUsers, u.id)}
                    />
                    <span className="text-slate-900 dark:text-white">{u.name}</span>
                    {u.departmentName && (
                      <span className="text-slate-400 text-[10px]">
                        · {u.departmentName}
                      </span>
                    )}
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Итог */}
        <div className="bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-400 text-sm p-3 rounded border border-brand-200 dark:border-brand-500/30">
          Квест получат: <strong>{audienceCount}</strong>{' '}
          {audienceCount === 1
            ? 'сотрудник'
            : audienceCount < 5
            ? 'сотрудника'
            : 'сотрудников'}
          {excludedUsers.length > 0 && (
            <span className="text-slate-500 dark:text-slate-400 ml-1">
              (исключено {excludedUsers.length})
            </span>
          )}
          {mode === 'all' && isMandatory && ' · принудительно'}
          {isRepeatable && ` · кулдаун ${cooldownHours} ч.`}
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
            disabled={loading || audienceCount === 0}
            className="bg-brand-600 hover:bg-brand-700 text-white rounded-md px-4 py-2 text-sm font-medium disabled:opacity-50 transition"
          >
            {loading ? 'Создание...' : 'Создать квест'}
          </button>
        </div>
      </form>
    </div>
  )
}