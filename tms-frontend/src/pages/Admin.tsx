import { useState } from 'react'
import { useAuth } from '../store/auth'
import AdminDashboardTab from './admin/AdminDashboardTab'
import AdminUsersTab from './admin/AdminUsersTab'
import AdminQuestsTab from './admin/AdminQuestsTab'
import AdminQuestLogsTab from './admin/AdminQuestLogsTab'
import AdminSupportTab from './admin/AdminSupportTab'
import AdminTransactionsTab from './admin/AdminTransactionsTab'
import AdminTreasuryTab from './admin/AdminTreasuryTab'
import AdminSettingsTab from './admin/AdminSettingsTab'

type Tab =
  | 'dashboard'
  | 'users'
  | 'quests'
  | 'questLogs'
  | 'support'
  | 'transactions'
  | 'treasury'
  | 'settings'

const TABS: { id: Tab; label: string }[] = [
  { id: 'dashboard', label: 'Дашборд' },
  { id: 'users', label: 'Сотрудники' },
  { id: 'quests', label: 'Квесты' },
  { id: 'questLogs', label: 'Логи квестов' },
  { id: 'support', label: 'Поддержка' },
  { id: 'transactions', label: 'Транзакции' },
  { id: 'treasury', label: 'Казна' },
  { id: 'settings', label: 'Настройки' },
]

export default function Admin() {
  const user = useAuth((s) => s.user)!
  const [tab, setTab] = useState<Tab>('dashboard')

  if (user.role !== 'ADMIN') {
    return (
      <div className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-[#30363d] p-8 text-center text-slate-500 dark:text-slate-400 text-sm">
        У вас нет доступа к админ-панели.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white tracking-tight">
          Админ-панель
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Управление платформой, экономикой и сотрудниками
        </p>
      </div>

      <div className="border-b border-slate-200 dark:border-[#30363d] overflow-x-auto">
        <div className="flex gap-1 -mb-px">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2.5 text-sm font-medium transition border-b-2 whitespace-nowrap ${
                tab === t.id
                  ? 'border-brand-600 text-brand-700 dark:text-brand-400'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        {tab === 'dashboard' && <AdminDashboardTab onNavigate={setTab} />}
        {tab === 'users' && <AdminUsersTab />}
        {tab === 'quests' && <AdminQuestsTab />}
        {tab === 'questLogs' && <AdminQuestLogsTab />}
        {tab === 'support' && <AdminSupportTab />}
        {tab === 'transactions' && <AdminTransactionsTab />}
        {tab === 'treasury' && <AdminTreasuryTab />}
        {tab === 'settings' && <AdminSettingsTab />}
      </div>
    </div>
  )
}