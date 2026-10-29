import { useState, useRef } from 'react'
import { useAuth } from '../store/auth'
import { createNews, updateNews, type NewsDto } from '../api/news'
import { uploadFile } from '../api/files'
import { notify } from '../lib/notify'
import { IconX, IconPaperclip } from './Icons'
import ImageCropperModal from './ImageCropperModal'

interface Props {
  news?: NewsDto
  onClose: () => void
  onSaved: () => void
}

const EXPIRY_PRESETS = [
  { label: '1 день', days: 1 },
  { label: '1 неделя', days: 7 },
  { label: '1 месяц', days: 30 },
  { label: 'Бессрочно', days: 0 },
]

function toLocalInput(iso: string | null | undefined): string {
  if (!iso) return ''
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function addDays(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return toLocalInput(d.toISOString())
}

export default function NewsModal({ news, onClose, onSaved }: Props) {
  const user = useAuth((s) => s.user)!
  const isEdit = !!news

  const [title, setTitle] = useState(news?.title ?? '')
  const [content, setContent] = useState(news?.content ?? '')
  const [coverUrl, setCoverUrl] = useState(news?.coverUrl ?? '')
  const [isPinned, setIsPinned] = useState(news?.isPinned ?? false)
  const [expiresAt, setExpiresAt] = useState(toLocalInput(news?.expiresAt))

  const [uploadingCover, setUploadingCover] = useState(false)
  const [uploadingInline, setUploadingInline] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [cropperSrc, setCropperSrc] = useState<string | null>(null)

  const contentRef = useRef<HTMLTextAreaElement>(null)
  const inlineInputRef = useRef<HTMLInputElement>(null)

  // --- обложка ---
  function handleCoverImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) return notify.error('Выберите изображение')
    if (file.size > 10 * 1024 * 1024) return notify.error('Файл больше 10 МБ')
    setCropperSrc(URL.createObjectURL(file))
    e.target.value = ''
  }

  async function handleCroppedCover(blob: Blob) {
    setUploadingCover(true)
    try {
      const file = new File([blob], 'news-cover.jpg', { type: 'image/jpeg' })
      const url = await uploadFile(file)
      setCoverUrl(url)
      notify.success('Обложка загружена')
    } catch (e) {
      notify.error(e)
    } finally {
      setUploadingCover(false)
      if (cropperSrc) URL.revokeObjectURL(cropperSrc)
      setCropperSrc(null)
    }
  }

  function handleCancelCrop() {
    if (cropperSrc) URL.revokeObjectURL(cropperSrc)
    setCropperSrc(null)
  }

  // --- вставка картинки в текст ---
  async function handleInlineImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) return notify.error('Выберите изображение')
    if (file.size > 10 * 1024 * 1024) return notify.error('Файл больше 10 МБ')
    setUploadingInline(true)
    try {
      const url = await uploadFile(file)
      insertAtCursor(`\n![изображение](${url})\n`)
      notify.success('Картинка вставлена')
    } catch (e) {
      notify.error(e)
    } finally {
      setUploadingInline(false)
      e.target.value = ''
    }
  }

  function insertAtCursor(text: string) {
    const ta = contentRef.current
    if (!ta) {
      setContent((prev) => prev + text)
      return
    }
    const start = ta.selectionStart ?? content.length
    const end = ta.selectionEnd ?? content.length
    const next = content.slice(0, start) + text + content.slice(end)
    setContent(next)
    setTimeout(() => {
      ta.focus()
      const pos = start + text.length
      ta.setSelectionRange(pos, pos)
    }, 0)
  }

  function applyPreset(days: number) {
    if (days === 0) setExpiresAt('')
    else setExpiresAt(addDays(days))
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const payload = {
        title: title.trim(),
        content: content.trim(),
        coverUrl: coverUrl.trim() || null,
        isPinned,
        expiresAt: expiresAt ? expiresAt + ':00' : null,
      }
      if (isEdit) await updateNews(news!.id, user.id, payload)
      else await createNews(user.id, payload)
      onSaved()
    } catch (e: any) {
      const msg = e.response?.data || 'Ошибка сохранения'
      setError(msg)
      notify.error(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 overflow-y-auto"
      onClick={onClose}
    >
      <form
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-[#161b22] rounded-xl w-full max-w-2xl p-6 space-y-4 my-8"
      >
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            {isEdit ? 'Редактировать новость' : 'Новая новость'}
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
            Заголовок *
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={200}
            required
            className="w-full border border-slate-300 dark:border-[#30363d] dark:bg-[#0d1117] dark:text-white rounded-md px-3 py-2 mt-1 text-sm focus:outline-none focus:border-brand-500"
          />
        </div>

        {/* Обложка */}
        <div>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Обложка
          </label>
          <div className="flex gap-2 mt-1">
            <input
              value={coverUrl}
              onChange={(e) => setCoverUrl(e.target.value)}
              placeholder="URL или загрузите"
              className="flex-1 border border-slate-300 dark:border-[#30363d] dark:bg-[#0d1117] dark:text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:border-brand-500"
            />
            <label className="px-3 border border-slate-300 dark:border-[#30363d] rounded-md text-sm text-slate-600 dark:text-slate-300 flex items-center cursor-pointer hover:border-brand-500 transition">
              {uploadingCover ? '...' : '↑'}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleCoverImage}
                disabled={uploadingCover}
              />
            </label>
          </div>
          {coverUrl && (
            <div className="mt-2 rounded-lg overflow-hidden border border-slate-200 dark:border-[#30363d] max-w-xs">
              <img src={coverUrl} alt="Обложка" className="w-full aspect-video object-cover" />
            </div>
          )}
        </div>

        {/* Текст */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Текст новости *
            </label>
            <button
              type="button"
              onClick={() => inlineInputRef.current?.click()}
              disabled={uploadingInline}
              className="inline-flex items-center gap-1 text-xs text-brand-600 dark:text-brand-400 hover:underline disabled:opacity-50"
            >
              <IconPaperclip size={12} />
              {uploadingInline ? 'Загрузка...' : 'Вставить картинку'}
            </button>
            <input
              ref={inlineInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleInlineImage}
              disabled={uploadingInline}
            />
          </div>
          <textarea
            ref={contentRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={12}
            maxLength={5000}
            required
            placeholder="Текст новости. Картинки можно вставлять в любом месте."
            className="w-full border border-slate-300 dark:border-[#30363d] dark:bg-[#0d1117] dark:text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:border-brand-500 resize-none font-mono"
          />
          <div className="text-xs text-slate-400 dark:text-slate-500 mt-1 flex justify-between">
            <span>Вставляйте картинки в текст через кнопку сверху</span>
            <span>{content.length} / 5000</span>
          </div>
        </div>

        {/* Срок актуальности */}
        <div className="border border-slate-200 dark:border-[#30363d] rounded-lg p-4 space-y-2">
          <div>
            <div className="text-sm font-medium text-slate-900 dark:text-white">
              Срок актуальности
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              После указанной даты новость автоматически уйдёт в архив
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {EXPIRY_PRESETS.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => applyPreset(p.days)}
                className="text-xs px-2.5 py-1 rounded border border-slate-300 dark:border-[#30363d] text-slate-700 dark:text-slate-300 hover:border-brand-500 transition"
              >
                {p.label}
              </button>
            ))}
          </div>

          <input
            type="datetime-local"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
            className="w-full border border-slate-300 dark:border-[#30363d] dark:bg-[#0d1117] dark:text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:border-brand-500"
          />
          {!expiresAt && (
            <div className="text-xs text-slate-400 dark:text-slate-500">
              Пусто = бессрочная новость (не уйдёт в архив автоматически)
            </div>
          )}
        </div>

        <label className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
          <input
            type="checkbox"
            checked={isPinned}
            onChange={(e) => setIsPinned(e.target.checked)}
            className="mt-0.5"
          />
          <span>
            <span className="font-medium">Закрепить</span>
            <span className="block text-xs text-slate-400 dark:text-slate-500 mt-0.5">
              Закреплённые новости показываются первыми
            </span>
          </span>
        </label>

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
            disabled={loading || uploadingCover || uploadingInline}
            className="bg-brand-600 hover:bg-brand-700 text-white rounded-md px-4 py-2 text-sm font-medium disabled:opacity-50 transition"
          >
            {loading ? 'Сохранение...' : isEdit ? 'Сохранить' : 'Опубликовать'}
          </button>
        </div>
      </form>

      {cropperSrc && (
        <ImageCropperModal
          imageSrc={cropperSrc}
          aspect={16 / 9}
          cropShape="rect"
          outputWidth={1200}
          outputHeight={675}
          title="Обложка новости"
          onCancel={handleCancelCrop}
          onCrop={handleCroppedCover}
        />
      )}
    </div>
  )
}