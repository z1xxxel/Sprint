import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../api/auth'
import { getProfile } from '../api/users'
import { useAuth } from '../store/auth'
import { useTheme } from '../hooks/useTheme'
import { IconSun, IconMoon } from '../components/Icons'

export default function Login() {
  const [email, setEmail] = useState('admin@tms.local')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const doLogin = useAuth((s) => s.login)
  const nav = useNavigate()
  const { theme, toggle } = useTheme()

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await login(email, password)
      let avatarUrl: string | null = null
      try {
        const profile = await getProfile(data.userId)
        avatarUrl = profile.avatarUrl ?? null
      } catch {
      }
      doLogin({
        id: data.userId,
        name: data.name,
        email,
        role: data.role,
        avatarUrl,
      })
      nav('/')
    } catch (err: any) {
      setError(err.response?.data || 'Ошибка входа')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f7f9f8] via-white to-brand-50/50 dark:from-[#0d1117] dark:via-[#0d1117] dark:to-[#0f291f] px-4 relative overflow-hidden">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-200 dark:bg-brand-700/20 rounded-full blur-3xl opacity-30 pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-200 dark:bg-emerald-700/20 rounded-full blur-3xl opacity-20 pointer-events-none" />

      <button
        onClick={toggle}
        className="absolute top-4 right-4 p-2.5 rounded-lg bg-white/80 dark:bg-[#161b22] border border-slate-200 dark:border-[#30363d] text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-[#21262d] transition shadow-sm"
        title={theme === 'light' ? 'Тёмная тема' : 'Светлая тема'}
      >
        {theme === 'light' ? <IconMoon size={18} /> : <IconSun size={18} />}
      </button>

      <div className="w-full max-w-sm relative">
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-md">
            <span className="text-white font-bold text-lg">П</span>
          </div>
          <span className="text-2xl font-semibold text-slate-900 dark:text-white tracking-tight">
            ПУЛЬС
          </span>
        </div>

        <form
          onSubmit={submit}
          className="bg-white dark:bg-[#161b22] p-8 rounded-2xl border border-slate-200 dark:border-[#30363d] shadow-xl space-y-5"
        >
          <div className="text-center mb-2">
            <h1 className="text-lg font-semibold text-slate-900 dark:text-white">Вход в систему</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Введите корпоративные данные
            </p>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 text-sm p-3 rounded-lg border border-red-100 dark:border-red-500/20">
              {error}
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-slate-300 dark:border-[#30363d] dark:bg-[#0d1117] dark:text-white rounded-lg px-3 py-2.5 mt-1 text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Пароль</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-slate-300 dark:border-[#30363d] dark:bg-[#0d1117] dark:text-white rounded-lg px-3 py-2.5 mt-1 text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-700 text-white rounded-lg py-2.5 text-sm font-medium disabled:opacity-50 transition shadow-sm hover:shadow-md"
          >
            {loading ? 'Вход...' : 'Войти'}
          </button>

          <p className="text-xs text-center text-slate-400 dark:text-slate-500 pt-2">
            Нет аккаунта? Обратитесь к HR-отделу
          </p>
        </form>
      </div>
    </div>
  )
}