import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../store/auth'
import { useFetch } from '../hooks/useFetch'
import { getProfile } from '../api/users'
import { startChat } from '../api/chats'
import { can } from '../lib/permissions'
import ThanksModal from '../components/ThanksModal'
import GrantAchievementModal from '../components/GrantAchievementModal'
import GrantCoinsModal from '../components/GrantCoinsModal'
import { IconChat, IconGift, IconTrophy, IconArrowLeft } from '../components/Icons'

export default function PublicProfile() {
  const { id } = useParams<{ id: string }>()
  const userId = Number(id)
  const me = useAuth((s) => s.user)!
  const nav = useNavigate()

  const { data, loading, error } = useFetch(() => getProfile(userId), [userId])

  const [thanksOpen, setThanksOpen] = useState(false)
  const [achOpen, setAchOpen] = useState(false)
  const [grantOpen, setGrantOpen] = useState(false)
  const [chatLoading, setChatLoading] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')

  const isSelf = me.id === userId
  const canManageUsers = can.manageUsers(me.role)
  const canGrantCoins = can.grantCoins(me.role)

  async function handleStartChat() {
    setChatLoading(true)
    try {
      const chat = await startChat(me.id, userId)
      nav(`/chats/${chat.chatId}`)
    } catch (e: any) {
      alert(e.response?.data || 'Не удалось открыть чат')
    } finally {
      setChatLoading(false)
    }
  }

  function handleThanksSuccess() {
    setThanksOpen(false)
    setSuccessMsg('Спасибо отправлено!')
    setTimeout(() => setSuccessMsg(''), 3000)
  }

  function handleAchSuccess() {
    setAchOpen(false)
    setSuccessMsg('Ачивка выдана!')
    setTimeout(() => setSuccessMsg(''), 3000)
  }

  function handleGrantSuccess() {
    setGrantOpen(false)
    setSuccessMsg('Бонус успешно начислен!')
    setTimeout(() => {
      setSuccessMsg('')
      window.location.reload() // Перезагружаем, чтобы обновить баланс
    }, 1500)
  }

  if (loading) return <div className="text-slate-500">Загрузка...</div>
  if (error) return <div className="text-red-600">{error}</div>
  if (!data) return <div className="text-slate-500">Пользователь не найден</div>

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <Link
        to="/users"
        className="text-sm text-brand-600 dark:text-brand-400 hover:underline inline-flex items-center gap-1"
      >
        <IconArrowLeft size={14} /> К поиску
      </Link>

      {successMsg && (
        <div className="bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-400 text-sm p-3 rounded-md border border-brand-200 dark:border-brand-500/30">
          {successMsg}
        </div>
      )}

      {/* Шапка профиля */}
      <div className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-[#30363d] p-6 flex items-center gap-5">
        <div className="w-16 h-16 rounded-full bg-brand-600 text-white flex items-center justify-center text-2xl font-semibold shrink-0">
          {data.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-semibold text-slate-900 dark:text-white truncate">
            {data.name}
          </h1>
          <div className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {data.role} · {data.departmentName}
          </div>
          <div className="text-xs text-slate-400 dark:text-slate-500 mt-1">
            Уровень: {data.level} · {data.lifetimeRating.toFixed(1)} репутации
          </div>
        </div>
      </div>

      {/* Кнопки действий */}
      {!isSelf && (
        <div className="space-y-2">
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={() => setThanksOpen(true)}
              className="flex-1 bg-brand-600 hover:bg-brand-700 text-white rounded-md py-2.5 font-medium text-sm transition flex items-center justify-center gap-2"
            >
              <IconGift size={16} />
              Поблагодарить
            </button>
            <button
              onClick={handleStartChat}
              disabled={chatLoading}
              className="flex-1 border border-slate-300 dark:border-[#30363d] hover:border-brand-500 hover:text-brand-600 dark:hover:text-brand-400 text-slate-700 dark:text-slate-300 rounded-md py-2.5 font-medium text-sm transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <IconChat size={16} />
              {chatLoading ? 'Открытие...' : 'Написать'}
            </button>
          </div>

          {/* Панель управления для менеджеров/HR/Админов */}
          {(canManageUsers || canGrantCoins) && (
            <div className="flex flex-col sm:flex-row gap-2">
              {canGrantCoins && (
                <button
                  onClick={() => setGrantOpen(true)}
                  className="flex-1 border border-amber-300 dark:border-amber-500/30 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/10 rounded-md py-2 text-sm font-medium transition flex items-center justify-center gap-2"
                >
                  <IconTrophy size={16} />
                  Начислить бонус
                </button>
              )}
              {canManageUsers && (
                <button
                  onClick={() => setAchOpen(true)}
                  className="flex-1 border border-brand-300 dark:border-brand-500/30 text-brand-700 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-500/10 rounded-md py-2 text-sm font-medium transition flex items-center justify-center gap-2"
                >
                  <IconTrophy size={16} />
                  Выдать ачивку
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Статистика */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatBlock label="Рейтинг сезона" value={data.currentRating.toFixed(1)} />
        <StatBlock label="Репутация" value={data.lifetimeRating.toFixed(1)} />
        <StatBlock label="Место" value={`${data.currentPlace}/${data.totalUsers}`} />
        <StatBlock label="Отдел" value={data.departmentPlace ? `#${data.departmentPlace}` : '—'} />
      </div>

      {/* Активности */}
      <div className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-[#30363d] p-5 grid grid-cols-2 gap-4">
        <div>
          <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Событий посещено
          </div>
          <div className="text-lg font-semibold text-slate-900 dark:text-white mt-1">
            {data.participatedEventsCount}
          </div>
        </div>
        <div>
          <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Событий организовано
          </div>
          <div className="text-lg font-semibold text-slate-900 dark:text-white mt-1">
            {data.organizedEventsCount}
          </div>
        </div>
      </div>

      {/* Ачивки */}
      {data.achievements && data.achievements.filter((a) => a.isEarned).length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
            Достижения
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {data.achievements
              .filter((a) => a.isEarned)
              .map((a) => (
                <div
                  key={a.groupCode}
                  className="bg-white dark:bg-[#161b22] rounded-lg border border-slate-200 dark:border-[#30363d] p-3"
                >
                  <div className="text-sm font-medium text-slate-900 dark:text-white truncate">
                    {a.name}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {a.levels.filter((l) => l.isEarned).length} / {a.levels.length} уровней
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Модалки */}
      {thanksOpen && (
        <ThanksModal
          toUserId={userId}
          toUserName={data.name}
          onClose={() => setThanksOpen(false)}
          onSuccess={handleThanksSuccess}
        />
      )}

      {achOpen && (
        <GrantAchievementModal
          userId={userId}
          userName={data.name}
          actorId={me.id}
          onClose={() => setAchOpen(false)}
          onGranted={handleAchSuccess}
        />
      )}

      {grantOpen && (
        <GrantCoinsModal
          toUserId={userId}
          toUserName={data.name}
          onClose={() => setGrantOpen(false)}
          onSuccess={handleGrantSuccess}
        />
      )}
    </div>
  )
}

function StatBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white dark:bg-[#161b22] px-4 py-4 rounded-lg border border-slate-200 dark:border-[#30363d]">
      <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">
        {label}
      </div>
      <div className="text-lg font-semibold text-slate-900 dark:text-white mt-1">{value}</div>
    </div>
  )
}