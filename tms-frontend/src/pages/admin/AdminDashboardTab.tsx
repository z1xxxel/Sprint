import { Link } from 'react-router-dom'
import { useFetch } from '../../hooks/useFetch'
import { getAdminDashboard } from '../../api/admin'
import { getTreasury } from '../../api/treasury'
import { IconCheck, IconArrowRight } from '../../components/Icons'

type AdminTab =
  | 'dashboard'
  | 'analytics'
  | 'departments'
  | 'roles'
  | 'transactions'
  | 'treasury'
  | 'settings'

interface Props {
  onNavigate: (tab: AdminTab) => void
}

export default function AdminDashboardTab({ onNavigate }: Props) {
  const dashboard = useFetch(() => getAdminDashboard(), [])
  const treasury = useFetch(() => getTreasury(), [])

  if (dashboard.loading) {
    return (
      <div className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-[#30363d] p-8 text-center text-slate-500">
        Загрузка...
      </div>
    )
  }
  if (dashboard.error) {
    return (
      <div className="bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 rounded-xl border border-red-200 dark:border-red-500/30 p-4 text-sm">
        {dashboard.error}
      </div>
    )
  }
  if (!dashboard.data) return null

  const d = dashboard.data
  const pendingTotal = d.pendingOrders + d.pendingEvents + d.pendingTickets + d.pendingQuests

  return (
    <div className="space-y-6">
      {/* 4 ключевых показателя */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Сотрудников"
          value={String(d.totalUsers)}
          hint="в системе"
          to="/manage?tab=users"
        />
        <StatCard
          label="Товаров"
          value={String(d.totalProducts)}
          hint="в каталоге"
          to="/catalog"
        />
        <StatCard
          label="Монет в системе"
          value={d.totalCoinsInSystem.toFixed(0)}
          hint="сумма балансов"
        />
        <StatCard
          label="В казне"
          value={treasury.data ? treasury.data.balance.toFixed(0) : '—'}
          hint="доступно"
          onClick={() => onNavigate('treasury')}
        />
      </div>

      {/* Очереди */}
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
            <div className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Все очереди пусты
            </div>
            <div className="text-xs text-slate-400 dark:text-slate-500">
              Нет заявок, требующих вашего внимания
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {d.pendingOrders > 0 && (
              <QueueCard
                label="Заказы"
                description="Ожидают одобрения и выдачи"
                count={d.pendingOrders}
                to="/manage?tab=orders"
                color="amber"
              />
            )}
            {d.pendingEvents > 0 && (
              <QueueCard
                label="События"
                description="На модерации"
                count={d.pendingEvents}
                to="/manage?tab=events"
                color="blue"
              />
            )}
            {d.pendingQuests > 0 && (
              <QueueCard
                label="Квесты"
                description="Сданы на проверку"
                count={d.pendingQuests}
                to="/manage?tab=quests"
                color="purple"
              />
            )}
            {d.pendingTickets > 0 && (
              <QueueCard
                label="Обращения"
                description="В поддержку"
                count={d.pendingTickets}
                to="/manage?tab=support"
                color="brand"
              />
            )}
          </div>
        )}
      </div>

      {/* Управление контентом (всё в /manage) */}
      <div>
        <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
          Управление контентом
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <QuickLink to="/manage?tab=events" label="События" hint="Модерация" />
          <QuickLink to="/manage?tab=quests" label="Квесты" hint="Проверка и шаблоны" />
          <QuickLink to="/manage?tab=orders" label="Заказы" hint="Выдача" />
          <QuickLink to="/manage?tab=surveys" label="Опросы" hint="Создание, статистика" />
          <QuickLink to="/manage?tab=shop" label="Товары" hint="Каталог" />
          <QuickLink to="/manage?tab=penalties" label="Штрафы" hint="Списания" />
        </div>
      </div>

      {/* Системные разделы (в админке) */}
      <div>
        <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
          Система
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <QuickButton
            onClick={() => onNavigate('transactions')}
            label="Транзакции"
            hint="История монет"
          />
          <QuickButton
            onClick={() => onNavigate('treasury')}
            label="Казна"
            hint="Баланс и операции"
          />
          <QuickButton
            onClick={() => onNavigate('settings')}
            label="Настройки"
            hint="Лимиты и правила"
          />
        </div>
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  hint,
  to,
  onClick,
}: {
  label: string
  value: string
  hint?: string
  to?: string
  onClick?: () => void
}) {
  const inner = (
    <>
      <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">
        {label}
      </div>
      <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{value}</div>
      {hint && (
        <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">{hint}</div>
      )}
    </>
  )

  const cls =
    'bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-[#30363d] p-4'

  if (to) {
    return (
      <Link
        to={to}
        className={`${cls} hover:border-brand-400 dark:hover:border-brand-500/50 transition`}
      >
        {inner}
      </Link>
    )
  }
  if (onClick) {
    return (
      <button
        onClick={onClick}
        className={`${cls} text-left hover:border-brand-400 dark:hover:border-brand-500/50 transition`}
      >
        {inner}
      </button>
    )
  }
  return <div className={cls}>{inner}</div>
}

const QUEUE_COLORS = {
  amber: 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400',
  blue: 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400',
  brand: 'bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400',
  purple: 'bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400',
}

function QueueCard({
  label,
  description,
  count,
  to,
  color,
}: {
  label: string
  description: string
  count: number
  to: string
  color: keyof typeof QUEUE_COLORS
}) {
  return (
    <Link
      to={to}
      className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-[#30363d] p-4 hover:border-brand-400 dark:hover:border-brand-500/50 transition flex items-center gap-3"
    >
      <div
        className={`shrink-0 min-w-[44px] h-11 rounded-lg flex items-center justify-center text-lg font-bold ${QUEUE_COLORS[color]}`}
      >
        {count}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-slate-900 dark:text-white">{label}</div>
        <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
          {description}
        </div>
      </div>
      <IconArrowRight
        size={16}
        className="shrink-0 text-slate-300 dark:text-slate-600"
      />
    </Link>
  )
}

function QuickLink({ to, label, hint }: { to: string; label: string; hint: string }) {
  return (
    <Link
      to={to}
      className="bg-white dark:bg-[#161b22] rounded-lg border border-slate-200 dark:border-[#30363d] p-3 hover:border-brand-400 dark:hover:border-brand-500/50 transition"
    >
      <div className="text-sm font-medium text-slate-900 dark:text-white">{label}</div>
      <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{hint}</div>
    </Link>
  )
}

function QuickButton({
  onClick,
  label,
  hint,
}: {
  onClick: () => void
  label: string
  hint: string
}) {
  return (
    <button
      onClick={onClick}
      className="bg-white dark:bg-[#161b22] rounded-lg border border-slate-200 dark:border-[#30363d] p-3 text-left hover:border-brand-400 dark:hover:border-brand-500/50 transition"
    >
      <div className="text-sm font-medium text-slate-900 dark:text-white">{label}</div>
      <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{hint}</div>
    </button>
  )
}