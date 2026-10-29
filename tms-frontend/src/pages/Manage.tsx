import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAuth } from '../store/auth'
import { can } from '../lib/permissions'
import ManageEventsTab from './manage/ManageEventsTab'
import ManageOrdersTab from './manage/ManageOrdersTab'
import ManageQuestsTab from './manage/ManageQuestsTab'
import ManageSurveysTab from './manage/ManageSurveysTab'
import ManageSupportTab from './manage/ManageSupportTab'
import ManageShopTab from './manage/ManageShopTab'
import ManageCategoriesTab from './manage/ManageCategoriesTab'
import ManageShopLogs from './manage/ManageShopLogs'
import ManagePenaltiesTab from './manage/ManagePenaltiesTab'
import AdminUsersTab from './admin/AdminUsersTab' // <-- ДОБАВЛЕНО: переиспользуем вкладку из админки

type Tab =
  | 'users'      // <-- ДОБАВЛЕНО
  | 'events'
  | 'orders'
  | 'quests'
  | 'surveys'
  | 'support'
  | 'shop'
  | 'categories'
  | 'logs'
  | 'penalties'

export default function Manage() {
  const user = useAuth((s) => s.user)!
  const [searchParams, setSearchParams] = useSearchParams()

  const canManageSurveys =
    can.manageUsers(user.role) || can.approveEvents(user.role)
  const canManageQuestsTab = can.manageQuests(user.role) && user.role !== 'SUPPORT'

  const tabs: { id: Tab; label: string }[] = []
  
  // Добавляем вкладку Сотрудники (HR и Админ)
  if (can.manageUsers(user.role)) {
    tabs.push({ id: 'users', label: 'Сотрудники' }) // <-- ДОБАВЛЕНО
  }

  if (can.approveEvents(user.role)) tabs.push({ id: 'events', label: 'События' })
  if (can.manageOrders(user.role)) tabs.push({ id: 'orders', label: 'Заказы' })
  if (canManageQuestsTab) tabs.push({ id: 'quests', label: 'Квесты' })
  if (canManageSurveys) tabs.push({ id: 'surveys', label: 'Опросы' })
  if (can.manageTickets(user.role)) tabs.push({ id: 'support', label: 'Поддержка' })
  if (can.manageCatalog(user.role)) {
    tabs.push({ id: 'shop', label: 'Товары' })
    tabs.push({ id: 'categories', label: 'Категории' })
    tabs.push({ id: 'logs', label: 'Логи магазина' })
  }
  if (['MANAGER', 'HR', 'ADMIN'].includes(user.role)) {
    tabs.push({ id: 'penalties', label: 'Штрафы' })
  }

  const urlTab = searchParams.get('tab') as Tab | null
  const validUrlTab = urlTab && tabs.some((t) => t.id === urlTab) ? urlTab : null

  const [tab, setTab] = useState<Tab>(validUrlTab ?? tabs[0]?.id ?? 'orders')

  useEffect(() => {
    if (validUrlTab && validUrlTab !== tab) {
      setTab(validUrlTab)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [validUrlTab])

  function handleChangeTab(newTab: Tab) {
    setTab(newTab)
    setSearchParams({ tab: newTab }, { replace: true })
  }

  if (tabs.length === 0) {
    return (
      <div className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-[#30363d] p-8 text-center text-slate-500 dark:text-slate-400 text-sm">
        У вас нет доступа к панели управления.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white tracking-tight">
          Панель управления
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Модерация, управление сотрудниками и магазином
        </p>
      </div>

      <div className="border-b border-slate-200 dark:border-[#30363d] overflow-x-auto">
        <div className="flex gap-1 -mb-px">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => handleChangeTab(t.id)}
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
        {/* Рендерим вкладку Сотрудники */}
        {tab === 'users' && can.manageUsers(user.role) && <AdminUsersTab />} {/* <-- ДОБАВЛЕНО */}
        
        {tab === 'events' && can.approveEvents(user.role) && <ManageEventsTab />}
        {tab === 'orders' && can.manageOrders(user.role) && <ManageOrdersTab />}
        {tab === 'quests' && canManageQuestsTab && <ManageQuestsTab />}
        {tab === 'surveys' && canManageSurveys && <ManageSurveysTab />}
        {tab === 'support' && can.manageTickets(user.role) && <ManageSupportTab />}
        {tab === 'shop' && can.manageCatalog(user.role) && <ManageShopTab />}
        {tab === 'categories' && can.manageCatalog(user.role) && <ManageCategoriesTab />}
        {tab === 'logs' && can.manageCatalog(user.role) && <ManageShopLogs />}
        {tab === 'penalties' &&
          ['MANAGER', 'HR', 'ADMIN'].includes(user.role) && <ManagePenaltiesTab />}
      </div>
    </div>
  )
}