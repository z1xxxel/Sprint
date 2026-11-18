import { useMemo } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'
import { useFetch } from '../../hooks/useFetch'
import { getAllUsers } from '../../api/users'
import { getDepartments } from '../../api/departments'
import { getAdminDashboard } from '../../api/admin'
import { getTreasury } from '../../api/treasury'
import Avatar from '../../components/Avatar'

const ROLE_LABEL: Record<string, string> = {
  ADMIN: 'Администратор',
  HR: 'HR',
  MANAGER: 'Менеджер',
  SUPPORT: 'Поддержка',
  ORGANIZER: 'Организатор',
  EMPLOYEE: 'Сотрудник',
}

const ROLE_COLORS: Record<string, string> = {
  ADMIN: '#dc2626',
  HR: '#f59e0b',
  MANAGER: '#8b5cf6',
  SUPPORT: '#6366f1',
  ORGANIZER: '#06b6d4',
  EMPLOYEE: '#64748b',
}

export default function AdminAnalyticsTab() {
  const users = useFetch(() => getAllUsers(), [])
  const departments = useFetch(() => getDepartments(), [])
  const dashboard = useFetch(() => getAdminDashboard(), [])
  const treasury = useFetch(() => getTreasury(), [])

  const usersList = users.data ?? []
  const deptList = departments.data ?? []

  const topByRating = useMemo(
    () =>
      [...usersList]
        .sort((a, b) => (b.currentRating ?? 0) - (a.currentRating ?? 0))
        .slice(0, 10),
    [usersList]
  )

  const topByLifetime = useMemo(
    () =>
      [...usersList]
        .sort((a, b) => (b.lifetimeRating ?? 0) - (a.lifetimeRating ?? 0))
        .slice(0, 5),
    [usersList]
  )

  const roleDistribution = useMemo(() => {
    const counts: Record<string, number> = {}
    usersList.forEach((u) => {
      counts[u.role] = (counts[u.role] ?? 0) + 1
    })
    return Object.entries(counts).map(([role, count]) => ({
      role,
      label: ROLE_LABEL[role] ?? role,
      count,
      color: ROLE_COLORS[role] ?? '#64748b',
    }))
  }, [usersList])

  const deptByRating = useMemo(
    () =>
      [...deptList]
        .filter((d) => (d.memberCount ?? 0) > 0)
        .sort((a, b) => (b.totalRating ?? 0) - (a.totalRating ?? 0))
        .map((d) => ({
          name: d.name.length > 18 ? d.name.slice(0, 16) + '…' : d.name,
          fullName: d.name,
          rating: Math.round((d.totalRating ?? 0) * 10) / 10,
          members: d.memberCount ?? 0,
        })),
    [deptList]
  )

  const avgBalance = useMemo(() => {
    if (!usersList.length) return 0
    const total = usersList.reduce((s, u) => s + (u.balance ?? 0), 0)
    return total / usersList.length
  }, [usersList])

  const blockedCount = usersList.filter((u) => u.isBlocked).length

  const loading =
    users.loading || departments.loading || dashboard.loading || treasury.loading

  if (loading) {
    return (
      <div className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-[#30363d] p-8 text-center text-slate-500">
        Загрузка...
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* KPI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KPI label="Сотрудников" value={String(usersList.length)} hint="в системе" />
        <KPI
          label="Средний баланс"
          value={avgBalance.toFixed(0)}
          hint="монет на сотрудника"
        />
        <KPI
          label="В казне"
          value={treasury.data ? treasury.data.balance.toFixed(0) : '—'}
          hint="доступно сейчас"
        />
        <KPI
          label="Заблокированы"
          value={String(blockedCount)}
          hint={blockedCount > 0 ? 'требуют проверки' : 'все активны'}
          danger={blockedCount > 0}
        />
      </div>

      {/* Топ отделов по рейтингу */}
      {deptByRating.length > 0 && (
        <div className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-[#30363d] p-5">
          <div className="mb-4">
            <div className="font-semibold text-slate-900 dark:text-white">
              Рейтинг отделов в сезоне
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Сумма рейтинга всех участников отдела
            </div>
          </div>
          <ResponsiveContainer width="100%" height={Math.max(180, deptByRating.length * 36)}>
            <BarChart
              data={deptByRating}
              layout="vertical"
              margin={{ top: 0, right: 20, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 11 }}
                stroke="#94a3b8"
                width={130}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
                formatter={(v) => [`${v} очков`, 'Рейтинг']}
              />
              <Bar dataKey="rating" fill="#6366f1" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Топ-10 по рейтингу */}
        <div className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-[#30363d] overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-200 dark:border-[#30363d]">
            <div className="font-semibold text-slate-900 dark:text-white text-sm">
              Топ-10 по рейтингу сезона
            </div>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-[#30363d]">
            {topByRating.map((u, i) => (
              <div key={u.id} className="px-5 py-2.5 flex items-center gap-3">
                <div className="w-6 text-center text-xs font-semibold text-slate-400 shrink-0">
                  {i + 1}
                </div>
                <Avatar name={u.name} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-slate-900 dark:text-white truncate">
                    {u.name}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {u.departmentName || 'Без отдела'}
                  </div>
                </div>
                <div className="text-sm font-semibold text-slate-900 dark:text-white shrink-0">
                  {u.currentRating.toFixed(1)}
                </div>
              </div>
            ))}
            {topByRating.length === 0 && (
              <div className="px-5 py-8 text-center text-sm text-slate-400">
                Нет данных
              </div>
            )}
          </div>
        </div>

        {/* Распределение по ролям */}
        <div className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-[#30363d] overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-200 dark:border-[#30363d]">
            <div className="font-semibold text-slate-900 dark:text-white text-sm">
              Распределение по ролям
            </div>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-[#30363d]">
            {roleDistribution
              .sort((a, b) => b.count - a.count)
              .map((r) => {
                const percent =
                  usersList.length > 0
                    ? Math.round((r.count / usersList.length) * 100)
                    : 0
                return (
                  <div key={r.role} className="px-5 py-3">
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="text-sm text-slate-900 dark:text-white">
                        {r.label}
                      </div>
                      <div className="text-sm font-semibold text-slate-900 dark:text-white shrink-0">
                        {r.count}{' '}
                        <span className="text-xs text-slate-400 font-normal">
                          ({percent}%)
                        </span>
                      </div>
                    </div>
                    <div className="h-1.5 bg-slate-100 dark:bg-[#0d1117] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${percent}%`,
                          backgroundColor: r.color,
                        }}
                      />
                    </div>
                  </div>
                )
              })}
          </div>
        </div>
      </div>

      {/* Топ-5 по репутации */}
      <div className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-[#30363d] overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-200 dark:border-[#30363d]">
          <div className="font-semibold text-slate-900 dark:text-white text-sm">
            Топ-5 по репутации (за всё время)
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            По сумме всех рейтингов — определяет уровень (Junior → Legend)
          </div>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-[#30363d]">
          {topByLifetime.map((u, i) => (
            <div key={u.id} className="px-5 py-3 flex items-center gap-3">
              <div className="w-6 text-center text-xs font-semibold text-slate-400 shrink-0">
                {i + 1}
              </div>
              <Avatar name={u.name} size="sm" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-slate-900 dark:text-white truncate">
                  {u.name}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {u.level} · {u.departmentName || 'Без отдела'}
                </div>
              </div>
              <div className="text-sm font-semibold text-slate-900 dark:text-white shrink-0">
                {u.lifetimeRating.toFixed(1)}
              </div>
            </div>
          ))}
          {topByLifetime.length === 0 && (
            <div className="px-5 py-8 text-center text-sm text-slate-400">
              Нет данных
            </div>
          )}
        </div>
      </div>

      {/* Сводка по системе */}
      {dashboard.data && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <SmallStat label="Товаров" value={dashboard.data.totalProducts} />
          <SmallStat
            label="Монет в обороте"
            value={Math.round(dashboard.data.totalCoinsInSystem)}
          />
          <SmallStat label="Заказов ждут" value={dashboard.data.pendingOrders} />
          <SmallStat
            label="Обращений"
            value={dashboard.data.pendingTickets}
          />
        </div>
      )}
    </div>
  )
}

function KPI({
  label,
  value,
  hint,
  danger,
}: {
  label: string
  value: string
  hint: string
  danger?: boolean
}) {
  return (
    <div
      className={`bg-white dark:bg-[#161b22] rounded-xl border p-4 ${
        danger
          ? 'border-red-300 dark:border-red-500/30'
          : 'border-slate-200 dark:border-[#30363d]'
      }`}
    >
      <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">
        {label}
      </div>
      <div
        className={`text-2xl font-bold mt-1 ${
          danger ? 'text-red-600 dark:text-red-400' : 'text-slate-900 dark:text-white'
        }`}
      >
        {value}
      </div>
      <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">{hint}</div>
    </div>
  )
}

function SmallStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white dark:bg-[#161b22] rounded-lg border border-slate-200 dark:border-[#30363d] px-4 py-3">
      <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">
        {label}
      </div>
      <div className="text-lg font-semibold text-slate-900 dark:text-white mt-0.5">
        {value.toLocaleString('ru-RU')}
      </div>
    </div>
  )
}