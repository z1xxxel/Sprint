import { useToasts, type Toast, type ToastType } from '../store/toasts'
import { IconCheck, IconX } from './Icons'

const TYPE_STYLES: Record<
  ToastType,
  { bg: string; border: string; icon: string; iconBg: string }
> = {
  success: {
    bg: 'bg-white dark:bg-[#161b22]',
    border: 'border-brand-200 dark:border-brand-500/30',
    icon: 'text-brand-600 dark:text-brand-400',
    iconBg: 'bg-brand-50 dark:bg-brand-500/10',
  },
  error: {
    bg: 'bg-white dark:bg-[#161b22]',
    border: 'border-red-200 dark:border-red-500/30',
    icon: 'text-red-600 dark:text-red-400',
    iconBg: 'bg-red-50 dark:bg-red-500/10',
  },
  warning: {
    bg: 'bg-white dark:bg-[#161b22]',
    border: 'border-amber-200 dark:border-amber-500/30',
    icon: 'text-amber-600 dark:text-amber-400',
    iconBg: 'bg-amber-50 dark:bg-amber-500/10',
  },
  info: {
    bg: 'bg-white dark:bg-[#161b22]',
    border: 'border-blue-200 dark:border-blue-500/30',
    icon: 'text-blue-600 dark:text-blue-400',
    iconBg: 'bg-blue-50 dark:bg-blue-500/10',
  },
}

export default function Toaster() {
  const toasts = useToasts((s) => s.toasts)
  const remove = useToasts((s) => s.remove)

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-4 left-4 z-[100] flex flex-col gap-2 pointer-events-none w-full max-w-sm">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onClose={() => remove(t.id)} />
      ))}
    </div>
  )
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const style = TYPE_STYLES[toast.type]

  return (
    <div
      className={`pointer-events-auto ${style.bg} border ${style.border} rounded-xl shadow-lg p-3.5 flex items-start gap-3 animate-slide-in`}
    >
      <div
        className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${style.iconBg} ${style.icon}`}
      >
        <ToastIcon type={toast.type} />
      </div>
      <div className="flex-1 min-w-0">
        {toast.title && (
          <div className="text-sm font-semibold text-slate-900 dark:text-white">
            {toast.title}
          </div>
        )}
        <div
          className={`text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap break-words ${
            toast.title ? 'mt-0.5' : ''
          }`}
        >
          {toast.message}
        </div>
      </div>
      <button
        onClick={onClose}
        className="shrink-0 text-slate-400 hover:text-slate-900 dark:hover:text-white p-1 -m-1"
        title="Закрыть"
      >
        <IconX size={14} />
      </button>
    </div>
  )
}

function ToastIcon({ type }: { type: ToastType }) {
  if (type === 'success') return <IconCheck size={16} />
  if (type === 'error') return <IconX size={16} />
  if (type === 'warning') {
    return (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 9v4M12 17h.01" />
        <path d="M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
      </svg>
    )
  }
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4M12 8h.01" />
    </svg>
  )
}