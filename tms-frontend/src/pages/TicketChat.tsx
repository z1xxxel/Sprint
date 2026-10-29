import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../store/auth'
import { useFetch } from '../hooks/useFetch'
import {
  getTicketChat,
  sendTicketMessage,
  editTicketMessage,
  deleteTicketMessage,
  takeTicket,
  completeTicket,
  leaveTicketReview,
  grantTicketAchievement,
  type TicketMessage,
  type TicketStatus,
} from '../api/support'
import {
  getQuestsForReviewByUser,
  approveQuest,
  rejectQuest,
  type UserQuestForReview,
} from '../api/quests'
import { getAllAchievements } from '../api/achievements'
import { uploadFile } from '../api/files'
import { can } from '../lib/permissions'
import { notify } from '../lib/notify'
import { refreshNotifications } from '../components/NotificationBell'
import CompleteTicketModal from '../components/CompleteTicketModal'
import DeleteMessageModal from '../components/DeleteMessageModal'
import MessageBubble, { type UIMessage } from '../components/MessageBubble'
import {
  IconSend,
  IconArrowLeft,
  IconCheck,
  IconX,
  IconTrophy,
  IconTarget,
  IconPaperclip,
} from '../components/Icons'

const STATUS_LABEL: Record<TicketStatus, string> = {
  PENDING: 'Ожидает',
  IN_PROGRESS: 'В работе',
  COMPLETED: 'Завершено',
}

const STATUS_COLOR: Record<TicketStatus, string> = {
  PENDING:
    'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30',
  IN_PROGRESS:
    'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/30',
  COMPLETED:
    'bg-brand-50 text-brand-700 border-brand-200 dark:bg-brand-500/10 dark:text-brand-400 dark:border-brand-500/30',
}

export default function TicketChatPage() {
  const { id } = useParams<{ id: string }>()
  const ticketId = Number(id)
  const me = useAuth((s) => s.user)!

  const { data, loading, error } = useFetch(
    () => getTicketChat(ticketId, me.id),
    [ticketId, me.id]
  )

  const [messages, setMessages] = useState<TicketMessage[]>([])
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [showReview, setShowReview] = useState(false)
  const [showAchievements, setShowAchievements] = useState(false)
  const [showComplete, setShowComplete] = useState(false)
  const [rejectingQuest, setRejectingQuest] = useState<UserQuestForReview | null>(null)
  const [replyTo, setReplyTo] = useState<UIMessage | null>(null)
  const [deletingMessage, setDeletingMessage] = useState<UIMessage | null>(null)

  const [pendingAttachment, setPendingAttachment] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null)

  const [authorQuests, setAuthorQuests] = useState<UserQuestForReview[]>([])
  const [questsLoading, setQuestsLoading] = useState(false)
  const [questProcessing, setQuestProcessing] = useState<number | null>(null)

  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const isSupport = can.manageTickets(me.role)
  const isCreator = data ? me.id === data.creatorId : false
  const isAssignee = data ? me.id === data.assigneeId : false
  const canReply = data ? data.status !== 'COMPLETED' : false
  const canTake = data?.status === 'PENDING' && isSupport && !data.assigneeName
  const canComplete = data?.status === 'IN_PROGRESS' && isAssignee
  const canReview = data?.status === 'COMPLETED' && isCreator
  const canGrantAchievement = isAssignee
  const canHandleQuests =
    isSupport && data && data.creatorId !== me.id && data.isQuestRequest

  useEffect(() => {
    if (data) {
      setMessages(data.messages)
      refreshNotifications()
    }
  }, [data])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (!loading && data && canReply) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [loading, data, canReply])

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

  useEffect(() => {
    if (!canHandleQuests || !data) return
    setQuestsLoading(true)
    getQuestsForReviewByUser(data.creatorId, me.id)
      .then((quests) => setAuthorQuests(quests))
      .catch(() => setAuthorQuests([]))
      .finally(() => setQuestsLoading(false))
  }, [canHandleQuests, data?.creatorId, me.id])

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
      const msg = await sendTicketMessage(
        ticketId,
        me.id,
        text.trim(),
        pendingAttachment ?? undefined,
        replyTo?.id
      )
      setMessages([...messages, msg])
      setText('')
      setPendingAttachment(null)
      setReplyTo(null)
      setTimeout(() => inputRef.current?.focus(), 10)
    } catch (e) {
      notify.error(e)
    } finally {
      setSending(false)
    }
  }

  async function handleEdit(messageId: number, newText: string) {
    try {
      const updated = await editTicketMessage(ticketId, messageId, me.id, newText)
      setMessages((prev) => prev.map((m) => (m.id === messageId ? updated : m)))
    } catch (e) {
      notify.error(e)
      throw e
    }
  }

  async function handleDelete(messageId: number) {
    try {
      await deleteTicketMessage(ticketId, messageId, me.id)
      setMessages((prev) => prev.filter((m) => m.id !== messageId))
      notify.success('Сообщение удалено')
    } catch (e) {
      notify.error(e)
      throw e
    }
  }

  async function handleTake() {
    setActionLoading(true)
    try {
      await takeTicket(ticketId, me.id)
      notify.success('Обращение взято в работу')
      refreshNotifications()
      window.location.reload()
    } catch (e) {
      notify.error(e)
      setActionLoading(false)
    }
  }

  async function handleComplete() {
    setActionLoading(true)
    try {
      await completeTicket(ticketId, me.id)
      notify.success('Обращение завершено')
      refreshNotifications()
      window.location.reload()
    } catch (e) {
      setActionLoading(false)
      throw e
    }
  }

  async function handleApproveQuest(questId: number, questTitle: string) {
    setQuestProcessing(questId)
    try {
      await approveQuest(questId, me.id)
      setAuthorQuests((prev) => prev.filter((q) => q.id !== questId))
      notify.success(`Квест принят · ${questTitle}`)
      refreshNotifications()
    } catch (e) {
      notify.error(e)
    } finally {
      setQuestProcessing(null)
    }
  }

  async function handleRejectQuest(questId: number, reason: string, questTitle: string) {
    setQuestProcessing(questId)
    try {
      await rejectQuest(questId, me.id, reason)
      setAuthorQuests((prev) => prev.filter((q) => q.id !== questId))
      setRejectingQuest(null)
      notify.info(`Квест отклонён · ${questTitle}`)
      refreshNotifications()
    } catch (e) {
      notify.error(e)
    } finally {
      setQuestProcessing(null)
    }
  }

  if (loading) return <div className="text-slate-500">Загрузка...</div>
  if (error) return <div className="text-red-600">{error}</div>
  if (!data) return null

  const messageMap = new Map(messages.map((m) => [m.id, m]))

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <Link
        to="/support"
        className="text-sm text-brand-600 dark:text-brand-400 hover:underline inline-flex items-center gap-1"
      >
        <IconArrowLeft size={14} /> К обращениям
      </Link>

      <div className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-[#30363d] p-5">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg font-semibold text-slate-900 dark:text-white">
                {data.topic}
              </h1>
              {data.isQuestRequest && (
                <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded border font-medium bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/30">
                  <IconTarget size={12} />
                  Запрос на квест
                </span>
              )}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-300 mt-1">
              {data.description}
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400 mt-3">
              <span>
                Автор:{' '}
                <Link
                  to={`/users/${data.creatorId}`}
                  className="font-medium text-brand-600 dark:text-brand-400 hover:underline"
                >
                  {data.creatorName}
                </Link>
              </span>
              {data.assigneeName && data.assigneeId && (
                <span>
                  Исполнитель:{' '}
                  <Link
                    to={`/users/${data.assigneeId}`}
                    className="font-medium text-brand-600 dark:text-brand-400 hover:underline"
                  >
                    {data.assigneeName}
                  </Link>
                </span>
              )}
              <span>Создано: {new Date(data.createdAt).toLocaleString('ru-RU')}</span>
            </div>
          </div>
          <span
            className={`shrink-0 text-xs px-2.5 py-1 rounded border font-medium ${STATUS_COLOR[data.status]}`}
          >
            {STATUS_LABEL[data.status]}
          </span>
        </div>

        {(canTake || canComplete || canGrantAchievement) && (
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-[#30363d]">
            {canTake && (
              <button
                onClick={handleTake}
                disabled={actionLoading}
                className="bg-brand-600 hover:bg-brand-700 text-white rounded-md px-4 py-2 text-sm font-medium disabled:opacity-50 transition inline-flex items-center gap-1.5"
              >
                <IconCheck size={14} /> Взять в работу
              </button>
            )}
            {canComplete && (
              <button
                onClick={() => setShowComplete(true)}
                disabled={actionLoading}
                className="bg-brand-600 hover:bg-brand-700 text-white rounded-md px-4 py-2 text-sm font-medium disabled:opacity-50 transition inline-flex items-center gap-1.5"
              >
                <IconCheck size={14} /> Завершить
              </button>
            )}
            {canGrantAchievement && (
              <button
                onClick={() => setShowAchievements(true)}
                className="border border-amber-300 dark:border-amber-500/30 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/10 rounded-md px-4 py-2 text-sm font-medium transition inline-flex items-center gap-1.5"
              >
                <IconTrophy size={14} /> Выдать ачивку автору
              </button>
            )}
          </div>
        )}

        {data.status === 'COMPLETED' && data.rating !== null && (
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-[#30363d] bg-brand-50 dark:bg-brand-500/10 rounded-lg px-4 py-3 -mx-1">
            <div className="text-xs font-medium text-brand-700 dark:text-brand-400 mb-1">
              Оценка работы поддержки
            </div>
            <div className="flex items-center gap-2">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((n) => (
                  <span
                    key={n}
                    className={`text-lg font-bold ${
                      n <= data.rating!
                        ? 'text-amber-500'
                        : 'text-slate-300 dark:text-slate-600'
                    }`}
                  >
                    {n}
                  </span>
                ))}
              </div>
              <span className="text-sm text-slate-600 dark:text-slate-300">
                {data.rating}/5
              </span>
            </div>
            {data.reviewComment && (
              <div className="text-sm text-slate-600 dark:text-slate-300 mt-2">
                «{data.reviewComment}»
              </div>
            )}
          </div>
        )}

        {canReview && !data.rating && (
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-[#30363d]">
            <button
              onClick={() => setShowReview(true)}
              className="bg-brand-600 hover:bg-brand-700 text-white rounded-md px-4 py-2 text-sm font-medium transition"
            >
              Оставить отзыв
            </button>
          </div>
        )}
      </div>

      {canHandleQuests && (questsLoading || authorQuests.length > 0) && (
        <div className="bg-white dark:bg-[#161b22] rounded-xl border border-amber-200 dark:border-amber-500/30 p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <IconTarget size={16} />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-slate-900 dark:text-white text-sm">
                Квесты автора на проверке
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                {questsLoading
                  ? 'Загрузка...'
                  : `${authorQuests.length} ${authorQuests.length === 1 ? 'квест' : 'квестов'}`}
              </div>
            </div>
          </div>

          {!questsLoading && (
            <div className="space-y-2">
              {authorQuests.map((q) => (
                <div
                  key={q.id}
                  className="bg-amber-50/50 dark:bg-amber-500/5 rounded-lg border border-amber-200/50 dark:border-amber-500/20 p-3"
                >
                  <div className="font-medium text-sm text-slate-900 dark:text-white">
                    {q.questTitle}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Сдан:{' '}
                    {q.submittedAt
                      ? new Date(q.submittedAt).toLocaleString('ru-RU')
                      : '—'}
                  </div>
                  <div className="flex gap-2 mt-2.5">
                    <button
                      onClick={() => handleApproveQuest(q.id, q.questTitle)}
                      disabled={questProcessing === q.id}
                      className="flex-1 bg-brand-600 hover:bg-brand-700 text-white text-xs px-3 py-1.5 rounded-md font-medium disabled:opacity-50 transition inline-flex items-center justify-center gap-1"
                    >
                      <IconCheck size={12} /> Принять
                    </button>
                    <button
                      onClick={() => setRejectingQuest(q)}
                      disabled={questProcessing === q.id}
                      className="flex-1 border border-red-300 dark:border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 text-xs px-3 py-1.5 rounded-md font-medium disabled:opacity-50 transition inline-flex items-center justify-center gap-1"
                    >
                      <IconX size={12} /> Отклонить
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-[#30363d] flex flex-col h-[calc(100vh-26rem)] min-h-[400px]">
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 && (
            <div className="text-center text-slate-400 dark:text-slate-500 text-sm py-8">
              Пока нет сообщений. Начните переписку.
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

        {canReply && uploadError && (
          <div className="mx-3 mb-2 bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 text-xs p-2 rounded border border-red-200 dark:border-red-500/30">
            {uploadError}
          </div>
        )}

        {canReply && pendingAttachment && (
          <div className="mx-3 mb-2 flex items-center gap-2 p-2 rounded-md bg-slate-50 dark:bg-[#0d1117] border border-slate-200 dark:border-[#30363d]">
            <img
              src={pendingAttachment}
              alt="Превью"
              className="w-16 h-16 object-cover rounded"
            />
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

        {canReply && replyTo && (
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

        {canReply ? (
          <form
            onSubmit={handleSend}
            className="border-t border-slate-200 dark:border-[#30363d] p-3 flex gap-2 items-center"
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
              disabled={sending || uploading}
              className="flex-1 border border-slate-300 dark:border-[#30363d] dark:bg-[#0d1117] dark:text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:border-brand-500"
            />
            <button
              type="submit"
              disabled={sending || uploading || (!text.trim() && !pendingAttachment)}
              className="bg-brand-600 hover:bg-brand-700 text-white rounded-md px-4 py-2 disabled:opacity-50 transition shrink-0"
            >
              <IconSend size={18} />
            </button>
          </form>
        ) : (
          <div className="border-t border-slate-200 dark:border-[#30363d] p-3 text-center text-sm text-slate-400 dark:text-slate-500">
            Обращение завершено. Переписка закрыта.
          </div>
        )}
      </div>

      {showReview && (
        <LeaveReviewModal
          ticketId={ticketId}
          userId={me.id}
          onClose={() => setShowReview(false)}
          onSubmitted={() => {
            setShowReview(false)
            refreshNotifications()
            window.location.reload()
          }}
        />
      )}

      {showAchievements && (
        <GrantAchievementModalTicket
          ticketId={ticketId}
          supportId={me.id}
          onClose={() => setShowAchievements(false)}
          onGranted={() => {
            setShowAchievements(false)
            notify.success('Ачивка выдана автору обращения')
          }}
        />
      )}

      {showComplete && (
        <CompleteTicketModal
          ticketTitle={data.topic}
          onClose={() => setShowComplete(false)}
          onConfirm={handleComplete}
        />
      )}

      {rejectingQuest && (
        <RejectQuestModal
          quest={rejectingQuest}
          onClose={() => setRejectingQuest(null)}
          onReject={(reason) =>
            handleRejectQuest(rejectingQuest.id, reason, rejectingQuest.questTitle)
          }
        />
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

      {lightboxUrl && (
        <div
          className="fixed inset-0 bg-black/85 z-[60] flex items-center justify-center p-4"
          onClick={() => setLightboxUrl(null)}
        >
          <button
            type="button"
            onClick={() => setLightboxUrl(null)}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-2 rounded-md hover:bg-white/10 transition"
            title="Закрыть (Esc)"
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

// ==========================================
// === Модалка отклонения квеста ===
// ==========================================
function RejectQuestModal({
  quest,
  onClose,
  onReject,
}: {
  quest: UserQuestForReview
  onClose: () => void
  onReject: (reason: string) => void
}) {
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!reason.trim()) {
      setError('Укажите причину')
      return
    }
    onReject(reason.trim())
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <form
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-[#161b22] rounded-xl w-full max-w-md p-6 space-y-4"
      >
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Отклонить квест
          </h2>
          <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {quest.questTitle}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 text-sm p-3 rounded border border-red-200 dark:border-red-500/30">
            {error}
          </div>
        )}

        <div>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Причина отклонения *
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            placeholder="Например: недостаточно подтверждений"
            required
            className="w-full border border-slate-300 dark:border-[#30363d] dark:bg-[#0d1117] dark:text-white rounded-md px-3 py-2 mt-1 text-sm resize-none focus:outline-none focus:border-brand-500"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm text-slate-600 dark:text-slate-300"
          >
            Отмена
          </button>
          <button
            type="submit"
            className="bg-red-600 hover:bg-red-700 text-white rounded-md px-4 py-2 text-sm font-medium transition"
          >
            Отклонить
          </button>
        </div>
      </form>
    </div>
  )
}

// ==========================================
// === Модалка отзыва ===
// ==========================================
function LeaveReviewModal({
  ticketId,
  userId,
  onClose,
  onSubmitted,
}: {
  ticketId: number
  userId: number
  onClose: () => void
  onSubmitted: () => void
}) {
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      await leaveTicketReview(ticketId, userId, rating, comment)
      notify.success('Спасибо за отзыв!')
      onSubmitted()
    } catch (e) {
      setError((e as any)?.response?.data || 'Не удалось отправить отзыв')
      notify.error(e)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-[#161b22] rounded-xl w-full max-w-md p-6 space-y-4"
      >
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Оценить поддержку
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-900 dark:hover:text-white p-1"
          >
            <IconX size={18} />
          </button>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 text-sm p-3 rounded border border-red-200 dark:border-red-500/30">
            {error}
          </div>
        )}

        <div>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Оценка
          </label>
          <div className="flex gap-2 mt-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setRating(n)}
                className={`flex-1 py-2.5 rounded-md border-2 font-semibold text-sm transition ${
                  rating === n
                    ? 'border-amber-500 bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400'
                    : 'border-slate-200 dark:border-[#30363d] text-slate-600 dark:text-slate-300 hover:border-amber-300'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Комментарий
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            placeholder="Расскажите о работе поддержки"
            className="w-full border border-slate-300 dark:border-[#30363d] dark:bg-[#0d1117] dark:text-white rounded-md px-3 py-2 mt-1 text-sm focus:outline-none focus:border-brand-500 resize-none"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm text-slate-600 dark:text-slate-300"
          >
            Отмена
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="bg-brand-600 hover:bg-brand-700 text-white rounded-md px-4 py-2 text-sm font-medium disabled:opacity-50 transition"
          >
            {submitting ? 'Отправка...' : 'Отправить'}
          </button>
        </div>
      </form>
    </div>
  )
}

// ==========================================
// === Модалка выдачи ачивки ===
// ==========================================
function GrantAchievementModalTicket({
  ticketId,
  supportId,
  onClose,
  onGranted,
}: {
  ticketId: number
  supportId: number
  onClose: () => void
  onGranted: () => void
}) {
  const { data, loading } = useFetch(() => getAllAchievements(), [])
  const [code, setCode] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const manualAchievements = (data ?? []).filter((a) => a.type === 'MANUAL')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!code) return
    setSubmitting(true)
    setError('')
    try {
      await grantTicketAchievement(ticketId, supportId, code)
      onGranted()
    } catch (e) {
      setError((e as any)?.response?.data || 'Не удалось выдать')
      notify.error(e)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-[#161b22] rounded-xl w-full max-w-md p-6 space-y-4"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Выдать ачивку
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Автору обращения
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-900 dark:hover:text-white p-1"
          >
            <IconX size={18} />
          </button>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 text-sm p-3 rounded border border-red-200 dark:border-red-500/30">
            {error}
          </div>
        )}

        {loading && <div className="text-slate-500 text-sm">Загрузка...</div>}

        {!loading && manualAchievements.length === 0 && (
          <div className="bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 text-sm p-3 rounded border border-amber-200 dark:border-amber-500/30">
            В системе нет ручных ачивок
          </div>
        )}

        {manualAchievements.length > 0 && (
          <select
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full border border-slate-300 dark:border-[#30363d] dark:bg-[#0d1117] dark:text-white rounded-md px-3 py-2 text-sm"
          >
            <option value="">— Выберите ачивку —</option>
            {manualAchievements.map((a) => (
              <option key={a.id} value={a.code}>
                {a.name}
                {a.rewardCoins > 0 ? ` (+${a.rewardCoins})` : ''}
              </option>
            ))}
          </select>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm text-slate-600 dark:text-slate-300"
          >
            Отмена
          </button>
          <button
            type="submit"
            disabled={submitting || !code}
            className="bg-brand-600 hover:bg-brand-700 text-white rounded-md px-4 py-2 text-sm font-medium disabled:opacity-50 transition"
          >
            {submitting ? 'Выдача...' : 'Выдать'}
          </button>
        </div>
      </form>
    </div>
  )
}