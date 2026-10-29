import type { ReactNode } from 'react'
import { useFetch } from '../../hooks/useFetch'
import { getAdminDashboard } from '../../api/admin'
import {
  IconUser,
  IconBag,
  IconTrophy,
  IconCalendar,
  IconSupport,
  IconTarget,
  IconCheck,
  IconArrowRight,
} from '../../components/Icons'

type AdminTab =
  | 'dashboard'
  | 'users'
  | 'quests'
  | 'questLogs'
  | 'support'
  | 'transactions'
  | 'treasury'
  | 'settings'

interface Props {
  onNavigate: (tab: AdminTab) => void
}

export default function AdminDashboardTab({ onNavigate }: Props) {
  const { data, loading, error } = useFetch(() => getAdminDashboard(), [])

  if (loading) return <div className="text-slate-500">Загрузка...</div>
  if (error) return <div className="text-red-600">{error}</div>
  if (!data) return null

  const pendingTotal =
    data.pendingOrders + data.pendingEvents + data.pendingTickets + data.pendingQuests

  return (
    <div className="space-y-6">
      {/* Верхний ряд — общая статистика */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <BigCard
          icon={<IconUser size={22} />}
          label="Всего сотрудников"
          value={String(data.totalUsers)}
          gradient="from-blue-400 to-indigo-600"
          onClick={() => onNavigate('users')}
        />
        <BigCard
          icon={<IconBag size={22} />}
          label="Товаров в каталоге"
          value={String(data.totalProducts)}
          gradient="from-amber-400 to-orange-600"
        />
        <BigCard
          icon={<IconTrophy size={22} />}
          label="Монет в системе"
          value={data.totalCoinsInSystem.toFixed(0)}
          gradient="from-brand-500 to-emerald-600"
          onClick={() => onNavigate('treasury')}
        />
      </div>

      {/* Очереди на модерацию */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Требует внимания
          </h2>
          {pendingTotal === 0 && (
            <span className="inline-flex items-center gap-1 text-xs text-brand-600 dark:text-brand-400 font-medium">
              <IconCheck size={12} /> Всё проверено
            </span>
          )}
        </div>

        {pendingTotal === 0 ? (
          <div className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-[#30363d] p-8 text-center">
            <div className="flex justify-center mb-2 text-brand-400">
              <IconCheck size={40} />
            </div>
            <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Все очереди пусты
            </div>
            <div className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              Нет заявок, требующих вашего внимания
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {data.pendingOrders > 0 && (
              <QueueCard
                icon={<IconBag size={18} />}
                label="Заказы в магазине"
                count={data.pendingOrders}
                color="amber"
                onClick={() => onNavigate('transactions')}
              />
            )}
            {data.pendingEvents > 0 && (
              <QueueCard
                icon={<IconCalendar size={18} />}
                label="События на модерации"
                count={data.pendingEvents}
                color="blue"
                onClick={() => onNavigate('quests')}
              />
            )}
            {data.pendingTickets > 0 && (
              <QueueCard
                icon={<IconSupport size={18} />}
                label="Обращения в поддержку"
                count={data.pendingTickets}
                color="brand"
                onClick={() => onNavigate('users')}
              />
            )}
            {data.pendingQuests > 0 && (
              <QueueCard
                icon={<IconTarget size={18} />}
                label="Квесты на проверке"
                count={data.pendingQuests}
                color="purple"
                onClick={() => onNavigate('quests')}
              />
            )}
          </div>
        )}
      </div>

      {/* Быстрые ссылки */}
      <div>
        <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
          Быстрые действия
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <QuickLink onClick={() => onNavigate('users')} label="Управление сотрудниками" />
          <QuickLink onClick={() => onNavigate('quests')} label="Модерация квестов" />
          <QuickLink onClick={() => onNavigate('treasury')} label="Казна компании" />
          <QuickLink onClick={() => onNavigate('settings')} label="Настройки" />
        </div>
      </div>
    </div>
  )
}

function BigCard({
  icon,
  label,
  value,
  gradient,
  onClick,
}: {
  icon: ReactNode
  label: string
  value: string
  gradient: string
  onClick?: () => void
}) {
  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-[#30363d] p-5 ${
        onClick
          ? 'cursor-pointer hover:border-brand-400 dark:hover:border-brand-500/50 transition'
          : ''
      }`}
    >
      <div
        className={`absolute top-0 right-0 w-24 h-24 rounded-full bg-gradient-to-br ${gradient} opacity-10 -mr-8 -mt-8`}
      />
      <div className="relative">
        <div
          className={`w-10 h-10 rounded-lg bg-gradient-to-br ${gradient} text-white flex items-center justify-center shadow-sm mb-3`}
        >
          {icon}
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          {label}
        </div>
        <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{value}</div>
      </div>
    </div>
  )
}

const QUEUE_COLORS = {
  amber:
    'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/30',
  blue: 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/30',
  brand:
    'bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 border-brand-200 dark:border-brand-500/30',
  purple:
    'bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-500/30',
}

function QueueCard({
  icon,
  label,
  count,
  color,
  onClick,
}: {
  icon: ReactNode
  label: string
  count: number
  color: keyof typeof QUEUE_COLORS
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-[#30363d] p-4 flex items-center gap-3 hover:border-brand-400 dark:hover:border-brand-500/50 transition text-left"
    >
      <div
        className={`w-10 h-10 shrink-0 rounded-lg flex items-center justify-center border ${QUEUE_COLORS[color]}`}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-slate-900 dark:text-white truncate">
          {label}
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          {count} {count === 1 ? 'заявка' : count < 5 ? 'заявки' : 'заявок'}
        </div>
      </div>
      <IconArrowRight size={16} className="shrink-0 text-slate-300 dark:text-slate-600" />
    </button>
  )
}

function QuickLink({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className="bg-white dark:bg-[#161b22] rounded-lg border border-slate-200 dark:border-[#30363d] p-3 text-left hover:border-brand-400 dark:hover:border-brand-500/50 transition"
    >
      <div className="text-sm font-medium text-slate-900 dark:text-white">{label}</div>
    </button>
  )
}