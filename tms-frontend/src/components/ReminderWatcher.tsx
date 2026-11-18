import { useEffect, useRef } from 'react'
import { useAuth } from '../store/auth'
import { getPendingToasts, markToastShown, type CalendarNote } from '../api/notes'
import { notify } from '../lib/notify'

/**
 * Опрашивает бэкенд каждые 30 сек. Если есть заметки, по которым пришло
 * напоминание — показывает toast слева снизу через notify (Toaster в Layout)
 * и помечает их как показанные.
 */
export default function ReminderWatcher() {
  const user = useAuth((s) => s.user)
  const shownIds = useRef<Set<number>>(new Set())

  useEffect(() => {
    if (!user) return
    let cancelled = false

    async function poll() {
      try {
        const list = await getPendingToasts(user!.id)
        if (cancelled) return
        for (const note of list) {
          if (shownIds.current.has(note.id)) continue
          shownIds.current.add(note.id)
          showNoteToast(note)
          markToastShown(note.id, user!.id).catch(() => {})
        }
      } catch {
        // сеть/сервер — пропускаем тик
      }
    }

    poll()
    const t = setInterval(poll, 30_000)
    return () => {
      cancelled = true
      clearInterval(t)
    }
  }, [user])

  return null
}

function showNoteToast(note: CalendarNote) {
  const time = new Date(note.noteTime).toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  })
  const message =
    note.text && note.text.trim().length > 0
      ? note.text
      : `В ${time} — «${note.title}»`
  notify.info(`⏰ ${note.title} · ${time}\n${message}`, 'Напоминание', undefined)
}