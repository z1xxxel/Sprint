import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../store/auth'
import { useFetch } from '../hooks/useFetch'
import {
  getChat,
  sendChatMessage,
  editChatMessage,
  deleteChatMessage,
} from '../api/chats'
import { uploadFile } from '../api/files'
import { notify } from '../lib/notify'
import { refreshNotifications } from '../components/NotificationBell'
import MessageBubble, { type UIMessage } from '../components/MessageBubble'
import DeleteMessageModal from '../components/DeleteMessageModal'
import { IconSend, IconPaperclip, IconX } from '../components/Icons'
import type { ChatMessage } from '../types'

interface Props {
  chatId: number
  onMessageSent?: () => void
}

export default function ChatDetail({ chatId, onMessageSent }: Props) {
  const me = useAuth((s) => s.user)!
  const { data, loading, error } = useFetch(
    () => getChat(chatId, me.id),
    [chatId, me.id]
  )

  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [pendingAttachment, setPendingAttachment] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null)
  const [replyTo, setReplyTo] = useState<UIMessage | null>(null)
  const [deletingMessage, setDeletingMessage] = useState<UIMessage | null>(null)

  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (data) {
      setMessages(data.messages)
      refreshNotifications()
    }
    setText('')
    setReplyTo(null)
    setPendingAttachment(null)
    setUploadError('')
  }, [data])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (!loading && data) {
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [loading, data])

  useEffect(() => {
    if (!lightboxUrl) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxUrl(null)
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [lightboxUrl])

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setUploadError('Можно прикреплять только изображения')
      notify.error('Можно прикреплять только изображения')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Файл больше 5 МБ')
      notify.error('Файл больше 5 МБ')
      return
    }
    setUploading(true)
    setUploadError('')
    try {
      const url = await uploadFile(file)
      setPendingAttachment(url)
    } catch {
      setUploadError('Не удалось загрузить файл')
      notify.error('Не удалось загрузить файл')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim() && !pendingAttachment) return
    setSending(true)
    try {
      const msg = await sendChatMessage(
        chatId,
        me.id,
        text.trim(),
        pendingAttachment ?? undefined,
        replyTo?.id
      )
      setMessages([...messages, msg])
      setText('')
      setPendingAttachment(null)
      setReplyTo(null)
      onMessageSent?.()
      refreshNotifications()
      setTimeout(() => inputRef.current?.focus(), 10)
    } catch (e) {
      notify.error(e)
    } finally {
      setSending(false)
    }
  }

  async function handleEdit(messageId: number, newText: string) {
    try {
      const updated = await editChatMessage(chatId, messageId, me.id, newText)
      setMessages((prev) => prev.map((m) => (m.id === messageId ? updated : m)))
    } catch (e) {
      notify.error(e)
      throw e
    }
  }

  async function handleDelete(messageId: number) {
    try {
      await deleteChatMessage(chatId, messageId, me.id)
      setMessages((prev) => prev.filter((m) => m.id !== messageId))
      notify.success('Сообщение удалено')
    } catch (e) {
      notify.error(e)
      throw e
    }
  }

  if (loading) return <div className="text-slate-500 p-6">Загрузка...</div>
  if (error) return <div className="text-red-600 p-6">{error}</div>
  if (!data) return null

  const messageMap = new Map(messages.map((m) => [m.id, m]))

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#161b22] overflow-hidden">
      <Link
        to={`/users/${data.otherUserId}`}
        className="px-4 py-3 border-b border-slate-200 dark:border-[#30363d] flex items-center gap-3 shrink-0 hover:bg-slate-50 dark:hover:bg-[#0d1117] transition"
        title={`Открыть профиль ${data.otherUserName}`}
      >
        <div className="w-9 h-9 rounded-full bg-brand-600 text-white flex items-center justify-center font-medium text-sm">
          {data.otherUserName.charAt(0).toUpperCase()}
        </div>
        <div className="font-medium text-slate-900 dark:text-white">
          {data.otherUserName}
        </div>
      </Link>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.length === 0 && (
          <div className="text-center text-slate-400 dark:text-slate-500 text-sm py-8">
            Начните переписку
          </div>
        )}
        {messages.map((m, index) => {
          const prevMessage = index > 0 ? messages[index - 1] : null
          const showDate =
            !prevMessage ||
            new Date(m.createdAt).toDateString() !==
              new Date(prevMessage.createdAt).toDateString()

          return (
            <div key={m.id}>
              {showDate && (
                <div className="flex justify-center my-4">
                  <span className="px-3 py-1 bg-slate-100 dark:bg-[#21262d] text-slate-500 dark:text-slate-400 text-xs font-medium rounded-full shadow-sm">
                    {getDateLabel(m.createdAt)}
                  </span>
                </div>
              )}
              <MessageBubble
                message={m}
                isMine={m.senderId === me.id}
                replyTo={m.replyToId ? messageMap.get(m.replyToId) ?? null : null}
                onReply={(msg) => {
                  setReplyTo(msg)
                  inputRef.current?.focus()
                }}
                onEdit={handleEdit}
                onRequestDelete={(msg) => setDeletingMessage(msg)}
                onImageClick={setLightboxUrl}
              />
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {uploadError && (
        <div className="mx-3 mb-2 bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 text-xs p-2 rounded border border-red-200 dark:border-red-500/30">
          {uploadError}
        </div>
      )}

      {pendingAttachment && (
        <div className="mx-3 mb-2 flex items-center gap-2 p-2 rounded-md bg-slate-50 dark:bg-[#0d1117] border border-slate-200 dark:border-[#30363d]">
          <img src={pendingAttachment} alt="Превью" className="w-16 h-16 object-cover rounded" />
          <div className="flex-1 text-xs text-slate-500 dark:text-slate-400">
            Изображение готово к отправке
          </div>
          <button
            type="button"
            onClick={() => setPendingAttachment(null)}
            className="p-1 text-slate-400 hover:text-red-500 transition"
            title="Убрать вложение"
          >
            <IconX size={16} />
          </button>
        </div>
      )}

      {replyTo && (
        <div className="mx-3 mb-2 flex items-start gap-2 p-2 rounded-md bg-brand-50 dark:bg-brand-500/10 border border-brand-200 dark:border-brand-500/30">
          <div className="w-1 self-stretch bg-brand-500 rounded-full" />
          <div className="flex-1 min-w-0">
            <div className="text-[11px] font-medium text-brand-700 dark:text-brand-400">
              Ответ на сообщение {replyTo.senderName}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-300 truncate">
              {replyTo.text || 'Изображение'}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setReplyTo(null)}
            className="p-1 text-slate-400 hover:text-red-500 transition"
            title="Отменить ответ"
          >
            <IconX size={14} />
          </button>
        </div>
      )}

      <form
        onSubmit={handleSend}
        className="border-t border-slate-200 dark:border-[#30363d] p-3 flex gap-2 items-center shrink-0"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          disabled={sending || uploading}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={sending || uploading}
          title="Прикрепить изображение"
          className="shrink-0 p-2 rounded-md text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#21262d] transition disabled:opacity-50"
        >
          <IconPaperclip size={18} />
        </button>
        <input
          ref={inputRef}
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={uploading ? 'Загрузка файла...' : 'Сообщение...'}
          className="flex-1 border border-slate-300 dark:border-[#30363d] dark:bg-[#0d1117] dark:text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:border-brand-500"
          disabled={sending || uploading}
        />
        <button
          type="submit"
          disabled={sending || uploading || (!text.trim() && !pendingAttachment)}
          className="bg-brand-600 hover:bg-brand-700 text-white rounded-md px-4 py-2 disabled:opacity-50 transition shrink-0"
        >
          <IconSend size={18} />
        </button>
      </form>

      {lightboxUrl && (
        <div
          className="fixed inset-0 bg-black/85 z-[60] flex items-center justify-center p-4"
          onClick={() => setLightboxUrl(null)}
        >
          <button
            type="button"
            onClick={() => setLightboxUrl(null)}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-2 rounded-md hover:bg-white/10 transition"
          >
            <IconX size={24} />
          </button>
          <img
            src={lightboxUrl}
            alt="Просмотр"
            className="max-w-full max-h-full object-contain rounded-md cursor-default"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {deletingMessage && (
        <DeleteMessageModal
          onClose={() => setDeletingMessage(null)}
          onConfirm={async () => {
            await handleDelete(deletingMessage.id)
            setDeletingMessage(null)
          }}
        />
      )}
    </div>
  )
}

function getDateLabel(isoString: string) {
  const date = new Date(isoString)
  const today = new Date()
  const yesterday = new Date()
  yesterday.setDate(today.getDate() - 1)

  const isSameDay = (d1: Date, d2: Date) =>
    d1.getDate() === d2.getDate() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getFullYear() === d2.getFullYear()

  if (isSameDay(date, today)) return 'Сегодня'
  if (isSameDay(date, yesterday)) return 'Вчера'

  const diffTime = Math.abs(today.getTime() - date.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays < 7) {
    const weekday = date.toLocaleDateString('ru-RU', { weekday: 'long' })
    return weekday.charAt(0).toUpperCase() + weekday.slice(1)
  }

  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}