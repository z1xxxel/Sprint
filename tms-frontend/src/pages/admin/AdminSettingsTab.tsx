import { useState, useMemo } from 'react'
import { useFetch } from '../../hooks/useFetch'
import { getSettings, updateSetting, type SystemSetting } from '../../api/admin'
import { IconCheck, IconSettings } from '../../components/Icons'

export default function AdminSettingsTab() {
  const { data, loading, error } = useFetch(() => getSettings(), [])
  const [local, setLocal] = useState<SystemSetting[] | null>(null)
  const [editingKey, setEditingKey] = useState<string | null>(null)
  const [value, setValue] = useState('')
  const [busy, setBusy] = useState(false)
  const [success, setSuccess] = useState('')

  const list = local ?? data ?? []

  const grouped = useMemo(() => {
    const groups: Record<string, SystemSetting[]> = {}
    list.forEach((s) => {
      const cat = s.category || 'Разное'
      if (!groups[cat]) groups[cat] = []
      groups[cat].push(s)
    })
    return groups
  }, [list])

  function startEdit(s: SystemSetting) {
    setEditingKey(s.settingKey)
    setValue(s.settingValue)
    setSuccess('')
  }

  async function save(key: string) {
    setBusy(true)
    try {
      await updateSetting(key, value)
      setLocal(list.map((s) => (s.settingKey === key ? { ...s, settingValue: value } : s)))
      setEditingKey(null)
      setSuccess('Настройка сохранена')
      setTimeout(() => setSuccess(''), 3000)
    } catch (e: any) {
      alert(e.response?.data || 'Ошибка сохранения')
    } finally {
      setBusy(false)
    }
  }

  if (loading) return <div className="text-slate-500">Загрузка...</div>
  if (error) return <div className="text-red-600">{error}</div>

  return (
    <div className="max-w-4xl space-y-6">
      {success && (
        <div className="bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-400 text-sm p-3 rounded border border-brand-200 dark:border-brand-500/30 inline-flex items-center gap-1.5">
          <IconCheck size={14} /> {success}
        </div>
      )}

      {list.length === 0 && (
        <div className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-[#30363d] p-8 text-center">
          <div className="flex justify-center mb-3 text-slate-300 dark:text-slate-600">
            <IconSettings size={40} />
          </div>
          <div className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Настройки не найдены
          </div>
        </div>
      )}

      {Object.entries(grouped).map(([category, settings]) => (
        <div key={category} className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">
            {category}
          </h3>
          <div className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-[#30363d] divide-y divide-slate-100 dark:divide-[#30363d]">
            {settings.map((s) => {
              const isEditing = editingKey === s.settingKey
              return (
                <div key={s.settingKey} className="p-4 sm:p-5">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-slate-900 dark:text-white">
                        {s.label || s.settingKey}
                      </div>
                      {s.description && (
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {s.description}
                        </div>
                      )}
                      <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono mt-1">
                        {s.settingKey}
                      </div>
                    </div>

                    {!isEditing ? (
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-lg font-bold text-brand-600 dark:text-brand-400 font-mono">
                          {s.settingValue}
                        </div>
                        <button
                          onClick={() => startEdit(s)}
                          className="text-xs px-3 py-1.5 border border-slate-300 dark:border-[#30363d] rounded text-slate-700 dark:text-slate-300 hover:border-brand-500 transition"
                        >
                          Изменить
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2 shrink-0 w-full sm:w-auto">
                        <input
                          value={value}
                          onChange={(e) => setValue(e.target.value)}
                          className="w-full sm:w-32 border border-slate-300 dark:border-[#30363d] dark:bg-[#0d1117] dark:text-white rounded-md px-3 py-1.5 text-sm focus:outline-none focus:border-brand-500 font-mono"
                          autoFocus
                        />
                        <button
                          onClick={() => save(s.settingKey)}
                          disabled={busy}
                          className="bg-brand-600 hover:bg-brand-700 text-white rounded-md px-3 py-1.5 text-sm font-medium disabled:opacity-50 transition"
                        >
                          ОК
                        </button>
                        <button
                          onClick={() => setEditingKey(null)}
                          className="px-3 py-1.5 text-sm text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-[#30363d] rounded-md"
                        >
                          Отмена
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}