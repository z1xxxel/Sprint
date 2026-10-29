import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../store/auth'
import { useFetch } from '../hooks/useFetch'
import { getMyChats } from '../api/chats'
import ChatDetail from './ChatDetail'
import { IconChat, IconArrowLeft } from '../components/Icons'
import type { ChatSummary } from '../types'

export default function Chats() {
  const user = useAuth((s) => s.user)!
  const { id } = useParams<{ id: string }>()
  const nav = useNavigate()
  const selectedId = id ? Number(id) : null

  const { data, loading, error } = useFetch(() => getMyChats(user.id), [user.id])
  const [local, setLocal] = useState<ChatSummary[] | null>(null)

  const chats = local ?? data ?? []

  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  function refreshChats() {
    setLocal(null)
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      {(!isMobile || !selectedId) && (
        <div className="mb-4 shrink-0">
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white tracking-tight">
            Чаты
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Общение с коллегами
          </p>
        </div>
      )}

      <div className="flex-1 min-h-0 flex bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-[#30363d] overflow-hidden">
        {/* Левая часть — список */}
        {(!isMobile || !selectedId) && (
          <aside className="w-full md:w-80 shrink-0 flex flex-col border-r border-slate-200 dark:border-[#30363d]">
            <div className="px-4 py-3 border-b border-slate-200 dark:border-[#30363d] flex items-center justify-between shrink-0">
              <div className="text-sm font-semibold text-slate-900 dark:text-white">
                Диалоги
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                {chats.length}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {loading && (
                <div className="p-6 text-sm text-slate-500">Загрузка...</div>
              )}
              {error && (
                <div className="p-6 text-sm text-red-600">{error}</div>
              )}
              {!loading && chats.length === 0 && (
                <div className="p-8 text-center">
                  <div className="flex justify-center mb-3 text-slate-300 dark:text-slate-600">
                    <IconChat size={40} />
                  </div>
                  <div className="text-sm text-slate-500 dark:text-slate-400 mb-3">
                    Пока нет чатов
                  </div>
                  <Link
                    to="/users"
                    className="inline-block bg-brand-600 hover:bg-brand-700 text-white rounded-md px-4 py-2 text-sm font-medium transition"
                  >
                    Найти коллегу
                  </Link>
                </div>
              )}
              {chats.map((chat) => {
                const isActive = selectedId === chat.chatId
                return (
                  <Link
                    key={chat.chatId}
                    to={`/chats/${chat.chatId}`}
                    className={`flex items-center gap-3 px-4 py-3 border-l-2 transition ${
                      isActive
                        ? 'bg-brand-50 dark:bg-brand-500/10 border-brand-500'
                        : 'border-transparent hover:bg-slate-50 dark:hover:bg-[#0d1117]'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-brand-600 text-white flex items-center justify-center font-medium shrink-0">
                      {chat.otherUserName.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div
                          className={`font-medium text-sm truncate ${
                            isActive
                              ? 'text-brand-700 dark:text-brand-400'
                              : 'text-slate-900 dark:text-white'
                          }`}
                        >
                          {chat.otherUserName}
                        </div>
                        <div className="text-xs text-slate-400 dark:text-slate-500 shrink-0">
                          {new Date(chat.lastMessageAt).toLocaleDateString('ru-RU', {
                            day: '2-digit',
                            month: '2-digit',
                          })}
                        </div>
                      </div>
                      <div className="flex items-center justify-between gap-2 mt-0.5">
                        <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          {chat.lastMessageText}
                        </div>
                        {chat.unreadCount > 0 && (
                          <span className="shrink-0 bg-brand-600 text-white text-xs rounded-full px-2 py-0.5 font-medium min-w-[20px] text-center">
                            {chat.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </aside>
        )}

        {/* Правая часть — чат */}
        {(!isMobile || selectedId) && (
          <main className="flex-1 min-w-0 flex flex-col">
            {isMobile && selectedId && (
              <button
                onClick={() => nav('/chats')}
                className="px-4 py-2 text-sm text-brand-600 dark:text-brand-400 hover:bg-slate-50 dark:hover:bg-[#0d1117] border-b border-slate-200 dark:border-[#30363d] inline-flex items-center gap-1 transition shrink-0"
              >
                <IconArrowLeft size={14} /> К списку
              </button>
            )}
            {selectedId ? (
              <div className="flex-1 min-h-0">
                <ChatDetail
                  key={selectedId}
                  chatId={selectedId}
                  onMessageSent={refreshChats}
                />
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center max-w-xs px-4">
                  <div className="flex justify-center mb-3 text-slate-300 dark:text-slate-600">
                    <IconChat size={48} />
                  </div>
                  <div className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Выберите чат
                  </div>
                  <div className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                    Или найдите коллегу в разделе «Сотрудники»
                  </div>
                </div>
              </div>
            )}
          </main>
        )}
      </div>
    </div>
  )
}