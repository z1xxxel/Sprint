import { useState, useRef, useEffect } from 'react'

export interface UIMessage {
  id: number
  senderId: number
  senderName: string
  text: string
  attachmentUrl: string | null
  replyToId: number | null
  editedAt: string | null
  createdAt: string
}

interface Props {
  message: UIMessage
  isMine: boolean
  replyTo: UIMessage | null
  onReply: (msg: UIMessage) => void
  onEdit: (msgId: number, newText: string) => Promise<void>
  onRequestDelete: (msg: UIMessage) => void
  onImageClick: (url: string) => void
}

export default function MessageBubble({
  message,
  isMine,
  replyTo,
  onReply,
  onEdit,
  onRequestDelete,
  onImageClick,
}: Props) {
  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState(message.text)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const editRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (isEditing) {
      setTimeout(() => {
        editRef.current?.focus()
        editRef.current?.setSelectionRange(editText.length, editText.length)
      }, 10)
    }
  }, [isEditing])

  const hasText = message.text.trim().length > 0
  const hasAttachment = !!message.attachmentUrl

  async function handleSave() {
    setError('')
    const trimmed = editText.trim()

    if (!trimmed && !hasAttachment) {
      setError('Добавьте текст или вложение')
      return
    }

    if (trimmed === message.text.trim()) {
      setIsEditing(false)
      return
    }

    setBusy(true)
    try {
      await onEdit(message.id, trimmed)
      setIsEditing(false)
    } catch (e: any) {
      setError(e?.response?.data || 'Не удалось сохранить')
    } finally {
      setBusy(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSave()
    }
    if (e.key === 'Escape') {
      setIsEditing(false)
      setEditText(message.text)
      setError('')
    }
  }

  function startEditing() {
    setEditText(message.text)
    setError('')
    setIsEditing(true)
  }

  function cancelEditing() {
    setIsEditing(false)
    setEditText(message.text)
    setError('')
  }

  return (
    <div className={`flex ${isMine ? 'justify-end' : 'justify-start'} group`}>
      <div className="relative max-w-[75%] flex flex-col">
        {!isEditing && (
          <div
            className={`absolute -top-3 ${
              isMine ? 'left-0 -translate-x-full pr-2' : 'right-0 translate-x-full pl-2'
            } opacity-0 group-hover:opacity-100 transition flex gap-1 z-10`}
          >
            <ActionBtn title="Ответить" onClick={() => onReply(message)}>
              <IconReply />
            </ActionBtn>
            {isMine && (
              <ActionBtn title="Изменить" onClick={startEditing}>
                <IconEdit />
              </ActionBtn>
            )}
            {isMine && (
              <ActionBtn title="Удалить" onClick={() => onRequestDelete(message)}>
                <IconTrashSmall />
              </ActionBtn>
            )}
          </div>
        )}

        <div
          className={`rounded-xl px-3.5 py-2.5 ${
            isMine
              ? 'bg-brand-600 text-white rounded-br-sm'
              : 'bg-slate-100 dark:bg-[#0d1117] text-slate-900 dark:text-white rounded-bl-sm'
          }`}
        >
          {!isMine && (
            <div className="text-[11px] font-medium opacity-70 mb-0.5">
              {message.senderName}
            </div>
          )}

          {message.replyToId && (
            <div
              className={`mb-1.5 pl-2 border-l-2 text-[11px] ${
                isMine
                  ? 'border-white/40 text-white/80'
                  : 'border-brand-400 text-slate-500 dark:text-slate-400'
              }`}
            >
              <div className="font-medium truncate">
                {replyTo ? replyTo.senderName : 'Сообщение удалено'}
              </div>
              <div className="truncate">
                {replyTo ? replyTo.text || 'Изображение' : '—'}
              </div>
            </div>
          )}

          {message.attachmentUrl && (
            <button
              type="button"
              onClick={() => onImageClick(message.attachmentUrl!)}
              className="block mb-1.5 cursor-zoom-in"
            >
              <img
                src={message.attachmentUrl}
                alt="Изображение"
                className="rounded-md max-w-full max-h-64 object-cover"
              />
            </button>
          )}

          {isEditing ? (
            <div className="space-y-1.5">
              <textarea
                ref={editRef}
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={2}
                className="w-full text-sm rounded-md px-2 py-1 bg-white text-slate-900 dark:bg-[#161b22] dark:text-white border border-slate-300 dark:border-[#30363d] focus:outline-none focus:border-brand-500 resize-none"
              />
              {error && (
                <div className="text-[11px] bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300 rounded px-2 py-1">
                  {error}
                </div>
              )}
              <div className="flex gap-1 justify-end">
                <button
                  type="button"
                  onClick={cancelEditing}
                  disabled={busy}
                  className="text-[11px] px-2 py-1 rounded bg-white/20 hover:bg-white/30 transition disabled:opacity-50"
                >
                  Отмена
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={busy}
                  className="text-[11px] px-2 py-1 rounded bg-white text-brand-600 hover:bg-white/90 transition disabled:opacity-50 font-medium"
                >
                  {busy ? '...' : 'Сохранить'}
                </button>
              </div>
            </div>
          ) : (
            hasText && (
              <div className="text-sm whitespace-pre-wrap break-words">
                {message.text}
              </div>
            )
          )}

          <div
            className={`text-[10px] mt-1 flex items-center gap-1.5 ${
              isMine ? 'text-white/60' : 'text-slate-400 dark:text-slate-500'
            }`}
          >
            <span>
              {new Date(message.createdAt).toLocaleTimeString('ru-RU', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
            {message.editedAt && <span>· изменено</span>}
          </div>
        </div>
      </div>
    </div>
  )
}

function ActionBtn({
  children,
  title,
  onClick,
}: {
  children: React.ReactNode
  title: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className="w-7 h-7 rounded-full bg-white dark:bg-[#161b22] border border-slate-200 dark:border-[#30363d] text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 hover:border-brand-400 transition shadow-sm flex items-center justify-center"
    >
      {children}
    </button>
  )
}

function IconReply() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 17l-5-5 5-5" />
      <path d="M20 18v-2a4 4 0 0 0-4-4H4" />
    </svg>
  )
}

function IconEdit() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  )
}

function IconTrashSmall() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    </svg>
  )
}