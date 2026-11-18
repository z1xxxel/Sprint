import { useSearchParams, Link } from 'react-router-dom'
import { useAuth } from '../store/auth'
import AdminDashboardTab from './admin/AdminDashboardTab'
import AdminAnalyticsTab from './admin/AdminAnalyticsTab'
import AdminDepartmentsTab from './admin/AdminDepartmentsTab'
import AdminRolesTab from './admin/AdminRolesTab'
import AdminTransactionsTab from './admin/AdminTransactionsTab'
import AdminTreasuryTab from './admin/AdminTreasuryTab'
import AdminSettingsTab from './admin/AdminSettingsTab'

type Tab =
  | 'dashboard'
  | 'analytics'
  | 'departments'
  | 'roles'
  | 'transactions'
  | 'treasury'
  | 'settings'

const TABS: { id: Tab; label: string }[] = [
  { id: 'dashboard', label: 'Дашборд' },
  { id: 'analytics', label: 'Аналитика' },
  { id: 'departments', label: 'Отделы' },
  { id: 'roles', label: 'Роли' },
  { id: 'transactions', label: 'Транзакции' },
  { id: 'treasury', label: 'Казна' },
  { id: 'settings', label: 'Настройки' },
]

export default function Admin() {
  const user = useAuth((s) => s.user)!
  const [searchParams, setSearchParams] = useSearchParams()

  const urlTab = searchParams.get('tab') as Tab | null
  const validTab = urlTab && TABS.some((t) => t.id === urlTab) ? urlTab : null
  const tab: Tab = validTab ?? 'dashboard'

  if (user.role !== 'ADMIN') {
    return (
      <div className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-[#30363d] p-8 text-center">
        <div className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
          Доступ ограничен
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-400">
          Админ-панель доступна только администраторам.
        </div>
      </div>
    )
  }

  function handleTab(id: Tab) {
    setSearchParams({ tab: id }, { replace: true })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white tracking-tight">
            Админ-панель
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Системное управление, экономика и аналитика платформы
          </p>
        </div>
        <Link
          to="/manage"
          className="bg-white dark:bg-[#161b22] border border-slate-300 dark:border-[#30363d] text-slate-700 dark:text-slate-300 hover:border-brand-500 rounded-lg px-4 py-2 text-sm font-medium transition"
        >
          → Панель управления
        </Link>
      </div>

      <div className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-[#30363d] p-1.5 flex gap-1 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => handleTab(t.id)}
            className={`min-w-fit px-3.5 py-2 text-sm font-medium rounded-lg transition whitespace-nowrap ${
              tab === t.id
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#21262d]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'dashboard' && <AdminDashboardTab onNavigate={handleTab} />}
      {tab === 'analytics' && <AdminAnalyticsTab />}
      {tab === 'departments' && <AdminDepartmentsTab />}
      {tab === 'roles' && <AdminRolesTab />}
      {tab === 'transactions' && <AdminTransactionsTab />}
      {tab === 'treasury' && <AdminTreasuryTab />}
      {tab === 'settings' && <AdminSettingsTab />}
    </div>
  )
}