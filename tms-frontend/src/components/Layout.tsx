import { useState } from 'react'
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../store/auth'
import { useCart } from '../store/cart'
import { useTheme } from '../hooks/useTheme'
import type { Role } from '../types'
import {
  IconHome,
  IconUser,
  IconBag,
  IconCalendar,
  IconTarget,
  IconChart,
  IconChat,
  IconSupport,
  IconTrophy,
  IconSettings,
  IconLogout,
  IconCheck,
  IconSearch,
  IconSun,
  IconMoon,
  IconCart,
  IconHeart,
  IconGift,
  IconLock,
  IconBell,
} from './Icons'
import Avatar from './Avatar'
import Toaster from './Toaster'
import ConfirmHost from './ConfirmHost'
import NotificationBell from './NotificationBell'
import type { ReactNode } from 'react'

interface NavItem {
  to: string
  label: string
  icon: ReactNode
  roles?: Role[]
}

const NAV_GROUPS: NavItem[][] = [
  // Основное
  [
    { to: '/', label: 'Главная', icon: <IconHome /> },
    { to: '/news', label: 'Новости', icon: <IconBell /> },
    { to: '/profile', label: 'Профиль', icon: <IconUser /> },
  ],
  // Активности
  [
    { to: '/events', label: 'События', icon: <IconCalendar /> },
    { to: '/quests', label: 'Квесты', icon: <IconTarget /> },
    { to: '/surveys', label: 'Опросы', icon: <IconChart /> },
  ],
  // Магазин
  [
    { to: '/catalog', label: 'Магазин', icon: <IconBag /> },
    { to: '/orders', label: 'Мои заказы', icon: <IconCheck /> },
    { to: '/favorites', label: 'Избранное', icon: <IconHeart /> },
  ],
  // Социальное
  [
    { to: '/users', label: 'Сотрудники', icon: <IconSearch /> },
    { to: '/thanks', label: 'Благодарности', icon: <IconGift /> },
    { to: '/chats', label: 'Чаты', icon: <IconChat /> },
    { to: '/support', label: 'Поддержка', icon: <IconSupport /> },
  ],
  // Геймификация
  [
    { to: '/seasons', label: 'Сезоны', icon: <IconTrophy /> },
  ],
]

const MANAGE_GROUP: NavItem[] = [
  {
    to: '/manage',
    label: 'Панель управления',
    icon: <IconSettings />,
    roles: ['MANAGER', 'HR', 'ADMIN', 'SUPPORT'],
  },
  {
    to: '/admin',
    label: 'Админка',
    icon: <IconLock />,
    roles: ['ADMIN'],
  },
]

const ALL_NAV: NavItem[] = [
  ...NAV_GROUPS.flat(),
  { to: '/cart', label: 'Корзина', icon: <IconCart /> },
  ...MANAGE_GROUP,
]

export default function Layout() {
  const user = useAuth((s) => s.user)!
  const logout = useAuth((s) => s.logout)
  const nav = useNavigate()
  const { pathname } = useLocation()
  const { theme, toggle } = useTheme()
  const cartCount = useCart((s) => s.count())

  const [mobileOpen, setMobileOpen] = useState(false)

  const isActive = (to: string) =>
    pathname === to || (to !== '/' && pathname.startsWith(to))

  const handleLogout = () => {
    logout()
    nav('/login')
  }

  return (
    <div className="min-h-screen bg-[#f7f9f8] dark:bg-[#0d1117] text-slate-800 dark:text-slate-200">
      <header className="bg-white/90 dark:bg-[#161b22]/90 backdrop-blur-md border-b border-slate-200 dark:border-[#30363d] sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-3 sm:gap-6 h-14 sm:h-16">
            {/* Бургер */}
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 -ml-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              aria-label="Меню"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M3 6h18M3 12h18M3 18h18" />
              </svg>
            </button>

            {/* Лого */}
            <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                <span className="text-white font-bold text-sm">П</span>
              </div>
              <span className="font-semibold text-slate-900 dark:text-white tracking-tight hidden sm:inline">
                ПУЛЬС
              </span>
            </Link>

            {/* Десктопное меню */}
            <nav className="hidden lg:flex items-center gap-1 flex-1">
              {NAV_GROUPS.map((group, gi) => (
                <div key={gi} className="flex items-center gap-0.5">
                  {group.map((item) => (
                    <NavIcon key={item.to} item={item} isActive={isActive(item.to)} />
                  ))}
                  {gi < NAV_GROUPS.length - 1 && (
                    <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1.5" />
                  )}
                </div>
              ))}
              {(() => {
                const visible = MANAGE_GROUP.filter(
                  (item) => !item.roles || item.roles.includes(user.role)
                )
                if (visible.length === 0) return null
                return (
                  <>
                    <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1.5" />
                    {visible.map((item) => (
                      <NavIcon key={item.to} item={item} isActive={isActive(item.to)} />
                    ))}
                  </>
                )
              })()}
            </nav>

            {/* Правая часть */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 ml-auto">
              <NotificationBell />

              <button
                onClick={toggle}
                title={theme === 'light' ? 'Тёмная тема' : 'Светлая тема'}
                className="p-2 rounded-md text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#21262d] hover:text-slate-900 dark:hover:text-white transition"
              >
                {theme === 'light' ? <IconMoon size={18} /> : <IconSun size={18} />}
              </button>

              <Link
                to="/cart"
                title="Корзина"
                className="relative p-2 rounded-md text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#21262d] hover:text-slate-900 dark:hover:text-white transition"
              >
                <IconCart size={18} />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 bg-brand-600 text-white text-[10px] font-medium rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>

              <div className="text-right hidden md:block ml-1">
                <div className="text-sm font-medium text-slate-900 dark:text-white leading-tight max-w-[140px] truncate">
                  {user.name}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">{user.role}</div>
              </div>

              <Link to="/profile" title="Профиль" className="ml-1">
                <Avatar name={user.name} avatarUrl={user.avatarUrl} size="sm" />
              </Link>

              <button
                onClick={handleLogout}
                title="Выйти"
                className="text-slate-400 dark:text-slate-500 hover:text-red-500 transition p-1.5"
              >
                <IconLogout size={18} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Мобильное меню */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/30 dark:bg-black/60 z-40 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="fixed top-0 left-0 bottom-0 w-72 max-w-[85vw] bg-white dark:bg-[#161b22] z-50 lg:hidden flex flex-col shadow-xl">
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-[#30363d]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-md bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">П</span>
                </div>
                <span className="font-semibold text-slate-900 dark:text-white">ПУЛЬС</span>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
              {ALL_NAV.filter((item) => !item.roles || item.roles.includes(user.role)).map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition ${
                    isActive(item.to)
                      ? 'bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-400 font-medium'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#21262d]'
                  }`}
                >
                  <span className="opacity-70">{item.icon}</span>
                  <span>{item.label}</span>
                  {item.to === '/cart' && cartCount > 0 && (
                    <span className="ml-auto min-w-[20px] h-5 px-1.5 bg-brand-600 text-white text-[11px] font-medium rounded-full flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </Link>
              ))}
            </nav>

            <div className="p-4 border-t border-slate-200 dark:border-[#30363d]">
              <div className="flex items-center gap-3 mb-3">
                <Avatar name={user.name} avatarUrl={user.avatarUrl} size="md" />
                <div className="min-w-0">
                  <div className="text-sm font-medium text-slate-900 dark:text-white truncate">
                    {user.name}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">{user.role}</div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full bg-slate-100 dark:bg-[#21262d] hover:bg-slate-200 dark:hover:bg-[#30363d] text-slate-700 dark:text-slate-200 rounded-md py-2 text-sm font-medium transition"
              >
                Выйти
              </button>
            </div>
          </aside>
        </>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <Outlet />
      </main>

      <Toaster />
      <ConfirmHost />
    </div>
  )
}

function NavIcon({ item, isActive }: { item: NavItem; isActive: boolean }) {
  return (
    <div className="relative group">
      <Link
        to={item.to}
        className={`flex items-center justify-center w-10 h-10 rounded-md transition ${
          isActive
            ? 'bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-400'
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#21262d]'
        }`}
      >
        {item.icon}
      </Link>
      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2.5 py-1 bg-slate-900 dark:bg-[#30363d] text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition whitespace-nowrap z-30 shadow-lg">
        {item.label}
      </div>
    </div>
  )
}