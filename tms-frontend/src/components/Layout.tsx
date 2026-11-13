import { useState, useEffect, useRef } from 'react'
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
  IconPulseLogo,
  IconEconomy,
  IconChevronDown,
} from './Icons'
import Avatar from './Avatar'
import Toaster from './Toaster'
import ConfirmHost from './ConfirmHost'
import NotificationBell from './NotificationBell'
import type { ReactNode } from 'react'

// ==========================================
// === Типы ===
// ==========================================
interface NavItem {
  to: string
  label: string
  icon: ReactNode
  roles?: Role[]
  badge?: 'cart' | null
}

interface NavCategory {
  id: string
  label: string
  items: NavItem[]
}

// ==========================================
// === Категории навигации ===
// ==========================================
const NAV_CATEGORIES: NavCategory[] = [
  {
    id: 'main',
    label: 'Главная',
    items: [{ to: '/', label: 'Главная', icon: <IconHome size={16} /> }],
  },
  {
    id: 'calendar',
    label: 'Календарь',
    items: [{ to: '/calendar', label: 'Календарь', icon: <IconCalendar size={16} /> }],
  },
  {
    id: 'activities',
    label: 'Активности',
    items: [
      { to: '/events', label: 'События', icon: <IconCalendar size={16} /> },
      { to: '/quests', label: 'Квесты', icon: <IconTarget size={16} /> },
      { to: '/surveys', label: 'Опросы', icon: <IconChart size={16} /> },
      { to: '/seasons', label: 'Сезоны', icon: <IconTrophy size={16} /> },
    ],
  },
  {
    id: 'shop',
    label: 'Магазин',
    items: [
      { to: '/catalog', label: 'Каталог', icon: <IconBag size={16} /> },
      { to: '/cart', label: 'Корзина', icon: <IconCart size={16} />, badge: 'cart' },
      { to: '/orders', label: 'Мои заказы', icon: <IconCheck size={16} /> },
      { to: '/favorites', label: 'Избранное', icon: <IconHeart size={16} /> },
    ],
  },
  {
    id: 'team',
    label: 'Команда',
    items: [
      { to: '/users', label: 'Сотрудники', icon: <IconSearch size={16} /> },
      { to: '/thanks', label: 'Благодарности', icon: <IconGift size={16} /> },
      { to: '/chats', label: 'Чаты', icon: <IconChat size={16} /> },
      { to: '/support', label: 'Поддержка', icon: <IconSupport size={16} /> },
    ],
  },
  {
    id: 'more',
    label: 'Ещё',
    items: [
      { to: '/news', label: 'Новости', icon: <IconBell size={16} /> },
      { to: '/profile', label: 'Профиль', icon: <IconUser size={16} /> },
      { to: '/economy', label: 'Экономика', icon: <IconEconomy size={16} /> },
      {
        to: '/manage',
        label: 'Управление',
        icon: <IconSettings size={16} />,
        roles: ['MANAGER', 'HR', 'ADMIN', 'SUPPORT'],
      },
      { to: '/admin', label: 'Админка', icon: <IconLock size={16} />, roles: ['ADMIN'] },
    ],
  },
]

// ==========================================
// === Layout ===
// ==========================================
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
    <div className="min-h-screen bg-[#f5f7ff] dark:bg-[#0d1117] text-slate-800 dark:text-slate-200">
      <header className="bg-white/95 dark:bg-[#161b22]/95 backdrop-blur-md border-b border-slate-200 dark:border-[#30363d] sticky top-0 z-20">
        <div className="relative px-4 sm:px-6 h-16 flex items-center">

          {/* ЛЕВО: бургер + лого — прижато к краю */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 -ml-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              aria-label="Меню"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M3 6h18M3 12h18M3 18h18" />
              </svg>
            </button>
            <Link to="/" className="flex items-center gap-2 group">
              <IconPulseLogo size={32} className="group-hover:scale-105 transition-transform" />
              <span className="font-bold text-xl text-slate-900 dark:text-white tracking-tight hidden sm:inline">
                ПУЛЬС
              </span>
            </Link>
          </div>

          {/* ЦЕНТР: навигация — абсолютно по центру окна */}
          <nav className="hidden lg:flex absolute left-1/2 -translate-x-1/2 items-center gap-1 z-10">
            {NAV_CATEGORIES.map((cat, i) => (
              <NavCategoryButton
                key={cat.id}
                category={cat}
                userRole={user.role}
                isActive={isActive}
                cartCount={cartCount}
                alignRight={i >= NAV_CATEGORIES.length - 2}
              />
            ))}
          </nav>

          {/* ПРАВО: действия — прижато к краю через ml-auto */}
          <div className="flex items-center gap-1 sm:gap-1.5 ml-auto shrink-0">
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
              className="relative p-2 rounded-md text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#21262d] hover:text-slate-900 dark:hover:text-white transition hidden sm:inline-flex"
            >
              <IconCart size={18} />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 bg-brand-600 text-white text-[10px] font-medium rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            <div className="hidden xl:block text-right ml-1 mr-1">
              <div className="text-sm font-medium text-slate-900 dark:text-white leading-tight max-w-[140px] truncate">
                {user.name}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                {user.role}
              </div>
            </div>

            <Link to="/profile" title="Профиль" className="ml-0.5">
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
      </header>

      {/* Мобильное меню */}
      {mobileOpen && (
        <MobileMenu
          user={user}
          cartCount={cartCount}
          isActive={isActive}
          onClose={() => setMobileOpen(false)}
          onLogout={handleLogout}
        />
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <Outlet />
      </main>

      <Toaster />
      <ConfirmHost />
    </div>
  )
}

// ==========================================
// === Кнопка категории в десктопной навигации ===
// ==========================================
function NavCategoryButton({
  category,
  userRole,
  isActive,
  cartCount,
  alignRight,
}: {
  category: NavCategory
  userRole: Role
  isActive: (to: string) => boolean
  cartCount: number
  alignRight?: boolean
}) {
  const [open, setOpen] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const visibleItems = category.items.filter(
    (item) => !item.roles || item.roles.includes(userRole)
  )

  if (visibleItems.length === 0) return null

  const categoryIsActive = visibleItems.some((item) => isActive(item.to))

  // Один пункт — простая ссылка (без dropdown)
  if (visibleItems.length === 1) {
    const item = visibleItems[0]
    return (
      <Link
        to={item.to}
        className={`px-3.5 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${
          categoryIsActive
            ? 'bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-400'
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#21262d]'
        }`}
      >
        {category.label}
      </Link>
    )
  }

  function handleMouseEnter() {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setOpen(true)
  }
  function handleMouseLeave() {
    timeoutRef.current = setTimeout(() => setOpen(false), 120)
  }

  return (
    <div
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        className={`px-3.5 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition inline-flex items-center gap-1 ${
          categoryIsActive || open
            ? 'bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-400'
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#21262d]'
        }`}
      >
        {category.label}
        <IconChevronDown
          size={14}
          className={`transition-transform duration-150 ${open ? 'rotate-180' : 'opacity-60'}`}
        />
      </button>

      {open && (
        <div
          className={`absolute top-full mt-1.5 w-56 bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-[#30363d] shadow-xl shadow-slate-900/5 dark:shadow-black/40 z-50 overflow-hidden animate-slide-down py-1.5 ${
            alignRight ? 'right-0' : 'left-0'
          }`}
        >
          {visibleItems.map((item) => {
            const active = isActive(item.to)
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 mx-1.5 px-2.5 py-2 rounded-lg text-sm transition ${
                  active
                    ? 'bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-400 font-medium'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#0d1117]'
                }`}
              >
                <span
                  className={`shrink-0 ${
                    active ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400 dark:text-slate-500'
                  }`}
                >
                  {item.icon}
                </span>
                <span className="flex-1">{item.label}</span>
                {item.badge === 'cart' && cartCount > 0 && (
                  <span className="min-w-[20px] h-5 px-1.5 bg-brand-600 text-white text-[11px] font-medium rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ==========================================
// === Мобильное меню с аккордеоном ===
// ==========================================
function MobileMenu({
  user,
  cartCount,
  isActive,
  onClose,
  onLogout,
}: {
  user: { name: string; avatarUrl?: string | null; role: Role }
  cartCount: number
  isActive: (to: string) => boolean
  onClose: () => void
  onLogout: () => void
}) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  function toggleCategory(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <>
      <div
        className="fixed inset-0 bg-black/30 dark:bg-black/60 z-40 lg:hidden"
        onClick={onClose}
      />
      <aside className="fixed top-0 left-0 bottom-0 w-72 max-w-[85vw] bg-white dark:bg-[#161b22] z-50 lg:hidden flex flex-col shadow-xl">
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-[#30363d]">
          <div className="flex items-center gap-2">
            <IconPulseLogo size={28} />
            <span className="font-bold text-lg text-slate-900 dark:text-white">ПУЛЬС</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {NAV_CATEGORIES.map((cat) => {
            const visibleItems = cat.items.filter(
              (item) => !item.roles || item.roles.includes(user.role)
            )
            if (visibleItems.length === 0) return null

            if (visibleItems.length === 1) {
              const item = visibleItems[0]
              return (
                <Link
                  key={cat.id}
                  to={item.to}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${
                    isActive(item.to)
                      ? 'bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-400 font-medium'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#21262d]'
                  }`}
                >
                  <span className="opacity-70">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              )
            }

            const isOpen = expanded.has(cat.id)
            const catActive = visibleItems.some((item) => isActive(item.to))

            return (
              <div key={cat.id}>
                <button
                  onClick={() => toggleCategory(cat.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${
                    catActive
                      ? 'text-brand-700 dark:text-brand-400 font-medium'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#21262d]'
                  }`}
                >
                  <span className="flex-1 text-left">{cat.label}</span>
                  <IconChevronDown
                    size={14}
                    className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
                  />
                </button>
                {isOpen && (
                  <div className="mt-0.5 ml-3 space-y-0.5 border-l-2 border-slate-200 dark:border-[#30363d] pl-2">
                    {visibleItems.map((item) => (
                      <Link
                        key={item.to}
                        to={item.to}
                        onClick={onClose}
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition ${
                          isActive(item.to)
                            ? 'bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-400 font-medium'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#21262d]'
                        }`}
                      >
                        <span className="opacity-70 shrink-0">{item.icon}</span>
                        <span className="flex-1">{item.label}</span>
                        {item.badge === 'cart' && cartCount > 0 && (
                          <span className="min-w-[20px] h-5 px-1.5 bg-brand-600 text-white text-[11px] font-medium rounded-full flex items-center justify-center">
                            {cartCount}
                          </span>
                        )}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
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
            onClick={onLogout}
            className="w-full bg-slate-100 dark:bg-[#21262d] hover:bg-slate-200 dark:hover:bg-[#30363d] text-slate-700 dark:text-slate-200 rounded-lg py-2 text-sm font-medium transition"
          >
            Выйти
          </button>
        </div>
      </aside>
    </>
  )
}