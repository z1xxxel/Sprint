import { useState, useMemo, useEffect } from 'react'
import { useAuth } from '../store/auth'
import { useFetch } from '../hooks/useFetch'
import { createQuestWithAudience } from '../api/quests'
import { getDepartments } from '../api/departments'
import { getAllUsers } from '../api/users'
import { notify, getErrorMessage } from '../lib/notify'
import { IconX, IconSearch } from './Icons'
import type { Department, UserListItem } from '../types'

interface AnchorRect {
  top: number
  left: number
  width: number
  height: number
}

interface Props {
  onClose: () => void
  onCreated: () => void
  defaultDeadline?: Date
  compact?: boolean
  anchorRect?: AnchorRect | null
}

type Mode = 'all' | 'departments' | 'users' | 'mixed'

export default function CreateQuestModal({
  onClose,
  onCreated,
  defaultDeadline,
  compact,
  anchorRect,
}: Props) {
  const me = useAuth((s) => s.user)!

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [rewardCoins, setRewardCoins] = useState(100)
  const [rewardRating, setRewardRating] = useState(0)
  const [deadline, setDeadline] = useState(() => {
    if (defaultDeadline) {
      const pad = (n: number) => String(n).padStart(2, '0')
      return `${defaultDeadline.getFullYear()}-${pad(defaultDeadline.getMonth() + 1)}-${pad(defaultDeadline.getDate())}T${pad(defaultDeadline.getHours())}:${pad(defaultDeadline.getMinutes())}`
    }
    return ''
  })
  const [isMandatory, setIsMandatory] = useState(false)
  const [penaltyCoins, setPenaltyCoins] = useState(0)
  const [penaltyRating, setPenaltyRating] = useState(0)
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
      setError('Рейтинг должен быть от 0 до 5')
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

  // ==========================================
  // === КОМПАКТНЫЙ КОНТЕНТ (popover из календаря) ===
  // ==========================================
  const compactContent = (
    <>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">Новый квест</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {defaultDeadline?.toLocaleDateString('ru-RU', {
              day: 'numeric',
              month: 'long',
              weekday: 'short',
            })}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-slate-400 hover:text-slate-900 dark:hover:text-white p-1 shrink-0"
        >
          <IconX size={16} />
        </button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 text-xs p-2.5 rounded border border-red-200 dark:border-red-500/30">
          {error}
        </div>
      )}

      <div>
        <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Название *</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          autoFocus
          className="w-full border border-slate-300 dark:border-[#30363d] dark:bg-[#0d1117] dark:text-white rounded-md px-2.5 py-1.5 mt-1 text-sm focus:outline-none focus:border-brand-500"
        />
      </div>

      <div>
        <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Описание *</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          required
          className="w-full border border-slate-300 dark:border-[#30363d] dark:bg-[#0d1117] dark:text-white rounded-md px-2.5 py-1.5 mt-1 text-sm resize-none focus:outline-none focus:border-brand-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Монет *</label>
          <input
            type="number"
            value={rewardCoins}
            onChange={(e) => setRewardCoins(Number(e.target.value))}
            min={1}
            required
            className="w-full border border-slate-300 dark:border-[#30363d] dark:bg-[#0d1117] dark:text-white rounded-md px-2.5 py-1.5 mt-1 text-sm"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Рейтинга</label>
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
            className="w-full border border-slate-300 dark:border-[#30363d] dark:bg-[#0d1117] dark:text-white rounded-md px-2.5 py-1.5 mt-1 text-sm"
          />
        </div>
      </div>

      <div>
        <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Дедлайн</label>
        <input
          type="datetime-local"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          className="w-full border border-slate-300 dark:border-[#30363d] dark:bg-[#0d1117] dark:text-white rounded-md px-2.5 py-1.5 mt-1 text-sm"
        />
      </div>

      <div className="border border-slate-200 dark:border-[#30363d] rounded-lg p-2.5 space-y-1.5">
        <label className="flex items-center gap-2 text-xs font-medium text-slate-900 dark:text-white">
          <input type="checkbox" checked={isRepeatable} onChange={(e) => setIsRepeatable(e.target.checked)} />
          Повторяемый
        </label>
        {isRepeatable && (
          <div className="pl-6 flex items-center gap-2">
            <label className="text-[10px] text-slate-600 dark:text-slate-400 whitespace-nowrap">Кулдаун, ч:</label>
            <input
              type="number"
              value={cooldownHours}
              onChange={(e) => setCooldownHours(Number(e.target.value))}
              min={0}
              className="w-20 border border-slate-300 dark:border-[#30363d] dark:bg-[#0d1117] dark:text-white rounded-md px-2 py-1 text-xs"
            />
          </div>
        )}
      </div>

      <div className="border border-slate-200 dark:border-[#30363d] rounded-lg p-2.5 space-y-1.5">
        <label className="flex items-center gap-2 text-xs font-medium text-slate-900 dark:text-white">
          <input type="checkbox" checked={isMandatory} onChange={(e) => setIsMandatory(e.target.checked)} />
          Принудительный (со штрафом)
        </label>
        {isMandatory && (
          <div className="grid grid-cols-2 gap-2 pl-6">
            <div>
              <label className="text-[10px] text-slate-600 dark:text-slate-400">Монет</label>
              <input
                type="number"
                value={penaltyCoins}
                onChange={(e) => setPenaltyCoins(Number(e.target.value))}
                min={0}
                className="w-full border border-slate-300 dark:border-[#30363d] dark:bg-[#0d1117] dark:text-white rounded-md px-2 py-1 mt-0.5 text-xs"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-600 dark:text-slate-400">Рейтинга</label>
              <input
                type="number"
                value={penaltyRating}
                onChange={(e) => setPenaltyRating(Number(e.target.value))}
                min={0}
                step={0.5}
                className="w-full border border-slate-300 dark:border-[#30363d] dark:bg-[#0d1117] dark:text-white rounded-md px-2 py-1 mt-0.5 text-xs"
              />
            </div>
          </div>
        )}
      </div>

      <div>
        <div className="text-xs font-medium text-slate-900 dark:text-white mb-1.5">Кто получит квест</div>
        <div className="grid grid-cols-4 gap-1 p-1 rounded-lg bg-slate-100 dark:bg-[#0d1117]">
          {(
            [
              { id: 'all', label: 'Всем' },
              { id: 'departments', label: 'Отделы' },
              { id: 'users', label: 'Люди' },
              { id: 'mixed', label: 'Микс' },
            ] as { id: Mode; label: string }[]
          ).map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setMode(m.id)}
              className={`py-1.5 px-1 text-[10px] font-medium rounded-md transition ${
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
          <div className="mt-2">
            <div className="text-[10px] text-slate-500 dark:text-slate-400 mb-1">Отделы ({selectedDepts.length})</div>
            <div className="flex flex-wrap gap-1">
              {deptsData.map((d) => {
                const selected = selectedDepts.includes(d.id)
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => toggle(selectedDepts, setSelectedDepts, d.id)}
                    className={`text-[10px] px-2 py-0.5 rounded border transition ${
                      selected
                        ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-400'
                        : 'border-slate-300 dark:border-[#30363d] text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {d.name}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {(mode === 'users' || mode === 'mixed') && (
          <div className="mt-2">
            <div className="text-[10px] text-slate-500 dark:text-slate-400 mb-1">Сотрудники ({selectedUsers.length})</div>
            <div className="relative mb-1">
              <div className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                <IconSearch size={12} />
              </div>
              <input
                value={userQuery}
                onChange={(e) => setUserQuery(e.target.value)}
                placeholder="Поиск..."
                className="w-full border border-slate-300 dark:border-[#30363d] dark:bg-[#0d1117] dark:text-white rounded-md pl-7 pr-3 py-1 text-xs"
              />
            </div>
            <div className="max-h-28 overflow-y-auto border border-slate-200 dark:border-[#30363d] rounded-md divide-y divide-slate-100 dark:divide-[#30363d]">
              {filteredUsers.map((u) => (
                <label
                  key={u.id}
                  className="flex items-center gap-2 px-2 py-1 hover:bg-slate-50 dark:hover:bg-[#0d1117] cursor-pointer text-[10px]"
                >
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(u.id)}
                    onChange={() => toggle(selectedUsers, setSelectedUsers, u.id)}
                  />
                  <span className="text-slate-900 dark:text-white truncate">{u.name}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        <div className="mt-2">
          <div className="text-[10px] text-slate-500 dark:text-slate-400 mb-1">Исключить ({excludedUsers.length})</div>
          {excludableUsers.length === 0 ? (
            <div className="text-[10px] text-slate-400 italic border border-dashed border-slate-200 dark:border-[#30363d] rounded-md p-2 text-center">
              Нет сотрудников в выбранной аудитории
            </div>
          ) : (
            <div className="max-h-28 overflow-y-auto border border-slate-200 dark:border-[#30363d] rounded-md divide-y divide-slate-100 dark:divide-[#30363d]">
              {excludableUsers.map((u) => (
                <label
                  key={u.id}
                  className="flex items-center gap-2 px-2 py-1 hover:bg-slate-50 dark:hover:bg-[#0d1117] cursor-pointer text-[10px]"
                >
                  <input
                    type="checkbox"
                    checked={excludedUsers.includes(u.id)}
                    onChange={() => toggle(excludedUsers, setExcludedUsers, u.id)}
                  />
                  <span className="text-slate-900 dark:text-white truncate">{u.name}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-400 text-xs p-2 rounded border border-brand-200 dark:border-brand-500/30">
        Получат: <strong>{audienceCount}</strong> чел.
      </div>

      <div className="flex justify-end gap-2 pt-1">
        <button
          type="button"
          onClick={onClose}
          className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-300"
        >
          Отмена
        </button>
        <button
          type="submit"
          disabled={loading || audienceCount === 0}
          className="bg-brand-600 hover:bg-brand-700 text-white rounded-md px-3 py-1.5 text-xs font-medium disabled:opacity-50"
        >
          {loading ? '...' : 'Создать'}
        </button>
      </div>
    </>
  )

  // ==========================================
  // === FULL-КОНТЕНТ (админка, полноценное окно) ===
  // ==========================================
  const fullContent = (
    <>
      {/* Хедер */}
      <div className="flex items-start justify-between gap-3 px-6 pt-6 pb-4 border-b border-slate-100 dark:border-[#30363d]">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Новый квест</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Создайте задание и настройте условия начисления
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-slate-400 hover:text-slate-900 dark:hover:text-white p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-[#21262d] transition"
        >
          <IconX size={18} />
        </button>
      </div>

      {/* Скроллируемый контент */}
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
        {error && (
          <div className="bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 text-sm p-3 rounded-lg border border-red-200 dark:border-red-500/30">
            {error}
          </div>
        )}

        {/* === Секция: Основное === */}
        <section className="space-y-4">
          <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Основное
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Название <span className="text-red-500">*</span>
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              autoFocus
              placeholder="Например: Пройти курс по Java"
              className="w-full border border-slate-300 dark:border-[#30363d] dark:bg-[#0d1117] dark:text-white rounded-lg px-3 py-2.5 mt-1.5 text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 transition"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Описание <span className="text-red-500">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              required
              placeholder="Что нужно сделать, чтобы выполнить квест"
              className="w-full border border-slate-300 dark:border-[#30363d] dark:bg-[#0d1117] dark:text-white rounded-lg px-3 py-2.5 mt-1.5 text-sm resize-none focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 transition"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Дедлайн
            </label>
            <input
              type="datetime-local"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full border border-slate-300 dark:border-[#30363d] dark:bg-[#0d1117] dark:text-white rounded-lg px-3 py-2.5 mt-1.5 text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 transition"
            />
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              Оставьте пустым, если квест бессрочный
            </p>
          </div>
        </section>

        <div className="border-t border-slate-100 dark:border-[#30363d]" />

        {/* === Секция: Награда === */}
        <section className="space-y-4">
          <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Награда за выполнение
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Монет <span className="text-red-500">*</span>
              </label>
              <div className="relative mt-1.5">
                <input
                  type="number"
                  value={rewardCoins}
                  onChange={(e) => setRewardCoins(Number(e.target.value))}
                  min={1}
                  required
                  className="w-full border border-slate-300 dark:border-[#30363d] dark:bg-[#0d1117] dark:text-white rounded-lg pl-3 pr-16 py-2.5 text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 transition"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 pointer-events-none">
                  монет
                </span>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Рейтинга
              </label>
              <div className="relative mt-1.5">
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
                  className="w-full border border-slate-300 dark:border-[#30363d] dark:bg-[#0d1117] dark:text-white rounded-lg pl-3 pr-16 py-2.5 text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 transition"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 pointer-events-none">
                  очков
                </span>
              </div>
            </div>
          </div>
        </section>

        <div className="border-t border-slate-100 dark:border-[#30363d]" />

        {/* === Секция: Особые условия === */}
        <section className="space-y-4">
          <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Особые условия
          </div>

          {/* Toggle: повторяемый */}
          <label className="flex items-start gap-3 cursor-pointer group">
            <div className="pt-0.5">
              <div
                className={`w-10 h-6 rounded-full relative transition ${
                  isRepeatable ? 'bg-brand-600' : 'bg-slate-300 dark:bg-[#30363d]'
                }`}
              >
                <div
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                    isRepeatable ? 'translate-x-4' : ''
                  }`}
                />
              </div>
            </div>
            <input
              type="checkbox"
              checked={isRepeatable}
              onChange={(e) => setIsRepeatable(e.target.checked)}
              className="hidden"
            />
            <div className="flex-1 select-none">
              <div className="text-sm font-medium text-slate-900 dark:text-white">
                Повторяемый квест
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Сотрудник сможет взять его снова после сдачи
              </div>
            </div>
          </label>

          {isRepeatable && (
            <div className="ml-13 pl-1">
              <label className="text-xs font-medium text-slate-600 dark:text-slate-400">
                Кулдаун после сдачи
              </label>
              <div className="flex items-center gap-2 mt-1.5">
                <input
                  type="number"
                  value={cooldownHours}
                  onChange={(e) => setCooldownHours(Number(e.target.value))}
                  min={0}
                  className="w-24 border border-slate-300 dark:border-[#30363d] dark:bg-[#0d1117] dark:text-white rounded-lg px-3 py-2 text-sm"
                />
                <span className="text-sm text-slate-500 dark:text-slate-400">часов</span>
              </div>
            </div>
          )}

          {/* Toggle: принудительный */}
          <label className="flex items-start gap-3 cursor-pointer group">
            <div className="pt-0.5">
              <div
                className={`w-10 h-6 rounded-full relative transition ${
                  isMandatory ? 'bg-brand-600' : 'bg-slate-300 dark:bg-[#30363d]'
                }`}
              >
                <div
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                    isMandatory ? 'translate-x-4' : ''
                  }`}
                />
              </div>
            </div>
            <input
              type="checkbox"
              checked={isMandatory}
              onChange={(e) => setIsMandatory(e.target.checked)}
              className="hidden"
            />
            <div className="flex-1 select-none">
              <div className="text-sm font-medium text-slate-900 dark:text-white">
                Принудительный квест
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Назначается автоматически. За невыполнение — штраф
              </div>
            </div>
          </label>

          {isMandatory && (
            <div className="ml-13 pl-1 grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400">
                  Штраф, монет
                </label>
                <input
                  type="number"
                  value={penaltyCoins}
                  onChange={(e) => setPenaltyCoins(Number(e.target.value))}
                  min={0}
                  className="w-full border border-slate-300 dark:border-[#30363d] dark:bg-[#0d1117] dark:text-white rounded-lg px-3 py-2 mt-1 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400">
                  Штраф, рейтинга
                </label>
                <input
                  type="number"
                  value={penaltyRating}
                  onChange={(e) => setPenaltyRating(Number(e.target.value))}
                  min={0}
                  step={0.5}
                  className="w-full border border-slate-300 dark:border-[#30363d] dark:bg-[#0d1117] dark:text-white rounded-lg px-3 py-2 mt-1 text-sm"
                />
              </div>
            </div>
          )}
        </section>

        <div className="border-t border-slate-100 dark:border-[#30363d]" />

        {/* === Секция: Аудитория === */}
        <section className="space-y-4">
          <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Кто получит квест
          </div>

          <div className="grid grid-cols-4 gap-1 p-1 rounded-lg bg-slate-100 dark:bg-[#0d1117]">
            {(
              [
                { id: 'all', label: 'Всем' },
                { id: 'departments', label: 'Отделы' },
                { id: 'users', label: 'Сотрудники' },
                { id: 'mixed', label: 'Микс' },
              ] as { id: Mode; label: string }[]
            ).map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setMode(m.id)}
                className={`py-2 px-2 text-xs font-medium rounded-md transition ${
                  mode === m.id
                    ? 'bg-white dark:bg-[#161b22] text-brand-700 dark:text-brand-400 shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          {(mode === 'departments' || mode === 'mixed') && (
            <div>
              <div className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                Отделы <span className="text-slate-400">({selectedDepts.length} выбрано)</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {deptsData.map((d) => {
                  const selected = selectedDepts.includes(d.id)
                  return (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => toggle(selectedDepts, setSelectedDepts, d.id)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition ${
                        selected
                          ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-400 font-medium'
                          : 'border-slate-300 dark:border-[#30363d] text-slate-600 dark:text-slate-300 hover:border-brand-400'
                      }`}
                    >
                      {d.name}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {(mode === 'users' || mode === 'mixed') && (
            <div>
              <div className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                Сотрудники <span className="text-slate-400">({selectedUsers.length} выбрано)</span>
              </div>
              <div className="relative mb-2">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  <IconSearch size={16} />
                </div>
                <input
                  value={userQuery}
                  onChange={(e) => setUserQuery(e.target.value)}
                  placeholder="Поиск по имени или email"
                  className="w-full border border-slate-300 dark:border-[#30363d] dark:bg-[#0d1117] dark:text-white rounded-lg pl-10 pr-3 py-2 text-sm"
                />
              </div>
              <div className="max-h-48 overflow-y-auto border border-slate-200 dark:border-[#30363d] rounded-lg divide-y divide-slate-100 dark:divide-[#30363d]">
                {filteredUsers.map((u) => (
                  <label
                    key={u.id}
                    className="flex items-center gap-3 px-3 py-2 hover:bg-slate-50 dark:hover:bg-[#0d1117] cursor-pointer text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(u.id)}
                      onChange={() => toggle(selectedUsers, setSelectedUsers, u.id)}
                      className="rounded"
                    />
                    <span className="text-slate-900 dark:text-white flex-1">{u.name}</span>
                    {u.departmentName && (
                      <span className="text-xs text-slate-400">{u.departmentName}</span>
                    )}
                  </label>
                ))}
                {filteredUsers.length === 0 && (
                  <div className="p-4 text-sm text-slate-400 text-center">Никого не нашли</div>
                )}
              </div>
            </div>
          )}

          <div>
            <div className="text-sm text-slate-500 dark:text-slate-400 mb-2">
              Исключить из аудитории <span className="text-slate-400">({excludedUsers.length})</span>
            </div>
            {excludableUsers.length === 0 ? (
              <div className="text-sm text-slate-400 italic border border-dashed border-slate-200 dark:border-[#30363d] rounded-lg p-4 text-center">
                {mode === 'departments' && selectedDepts.length === 0
                  ? 'Выберите отделы — появятся сотрудники для исключения'
                  : mode === 'users' && selectedUsers.length === 0
                  ? 'Выберите сотрудников'
                  : 'Нет сотрудников в выбранной аудитории'}
              </div>
            ) : (
              <div className="max-h-40 overflow-y-auto border border-slate-200 dark:border-[#30363d] rounded-lg divide-y divide-slate-100 dark:divide-[#30363d]">
                {excludableUsers.map((u) => (
                  <label
                    key={u.id}
                    className="flex items-center gap-3 px-3 py-2 hover:bg-slate-50 dark:hover:bg-[#0d1117] cursor-pointer text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={excludedUsers.includes(u.id)}
                      onChange={() => toggle(excludedUsers, setExcludedUsers, u.id)}
                      className="rounded"
                    />
                    <span className="text-slate-900 dark:text-white flex-1">{u.name}</span>
                    {u.departmentName && (
                      <span className="text-xs text-slate-400">{u.departmentName}</span>
                    )}
                  </label>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Sticky footer */}
      <div className="border-t border-slate-200 dark:border-[#30363d] bg-slate-50 dark:bg-[#0d1117] px-6 py-4 flex items-center justify-between gap-3 shrink-0 rounded-b-xl">
        <div className="text-sm text-slate-600 dark:text-slate-400">
          Квест получат{' '}
          <strong className="text-slate-900 dark:text-white">{audienceCount}</strong>{' '}
          {audienceCount === 1 ? 'сотрудник' : audienceCount < 5 ? 'сотрудника' : 'сотрудников'}
          {excludedUsers.length > 0 && (
            <span className="text-slate-400 ml-1">(искл. {excludedUsers.length})</span>
          )}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#21262d] rounded-lg transition"
          >
            Отмена
          </button>
          <button
            type="submit"
            disabled={loading || audienceCount === 0}
            className="bg-brand-600 hover:bg-brand-700 text-white rounded-lg px-5 py-2 text-sm font-medium disabled:opacity-50 transition shadow-sm"
          >
            {loading ? 'Создание...' : 'Создать квест'}
          </button>
        </div>
      </div>
    </>
  )

  // ==========================================
  // === Compact + anchorRect → popover из календаря ===
  // ==========================================
  if (compact && anchorRect) {
    const winW = typeof window !== 'undefined' ? window.innerWidth : 1200
    const winH = typeof window !== 'undefined' ? window.innerHeight : 800
    const GAP = 8
    const W = 480
    const PREFERRED_H = 720

    let left = anchorRect.left + anchorRect.width + GAP
    if (left + W > winW - GAP) {
      left = anchorRect.left - W - GAP
      if (left < GAP) left = Math.max(GAP, (winW - W) / 2)
    }

    let top = Math.max(GAP, anchorRect.top)
    let maxH = Math.min(PREFERRED_H, winH - top - GAP)

    if (maxH < 450) {
      top = GAP
      maxH = Math.min(PREFERRED_H, winH - 2 * GAP)
    }

    return (
      <div
        className="fixed z-[60] animate-slide-down"
        style={{ top, left, width: W }}
        onClick={(e) => e.stopPropagation()}
      >
        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-[#30363d] shadow-2xl p-4 space-y-3 overflow-y-auto"
          style={{ maxHeight: maxH }}
        >
          {compactContent}
        </form>
      </div>
    )
  }

  // Compact без anchor → центрированная маленькая
  if (compact) {
    return (
      <div
        className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <form
          onSubmit={handleSubmit}
          onClick={(e) => e.stopPropagation()}
          className="bg-white dark:bg-[#161b22] rounded-xl w-full max-w-md p-5 space-y-3 max-h-[90vh] overflow-y-auto"
        >
          {compactContent}
        </form>
      </div>
    )
  }

  // ==========================================
  // === FULL-режим (из админки / управления) ===
  // ==========================================
  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-[#161b22] rounded-xl w-full max-w-2xl flex flex-col max-h-[90vh] shadow-2xl"
      >
        {fullContent}
      </form>
    </div>
  )
}