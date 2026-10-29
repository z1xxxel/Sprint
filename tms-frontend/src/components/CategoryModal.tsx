import { useState } from 'react'
import { createCategory, updateCategory } from '../api/shop'
import { uploadFile } from '../api/files'
import type { Category } from '../types'

interface Props {
  category?: Category
  actorId: number
  onClose: () => void
  onSaved: () => void
}

export default function CategoryModal({ category, actorId, onClose, onSaved }: Props) {
  const [name, setName] = useState(category?.name ?? '')
  const [description, setDescription] = useState(category?.description ?? '')
  const [imageUrl, setImageUrl] = useState(category?.imageUrl ?? '')
  const [sortOrder, setSortOrder] = useState(category?.sortOrder ?? 0)
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const isEdit = !!category

  async function handleImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) return alert('Выберите изображение')
    if (file.size > 5 * 1024 * 1024) return alert('Файл больше 5 МБ')
    setUploading(true)
    try {
      const url = await uploadFile(file)
      setImageUrl(url)
    } catch {
      alert('Не удалось загрузить')
    } finally {
      setUploading(false)
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (isEdit) {
        await updateCategory(category!.id, actorId, { name, description, imageUrl, sortOrder })
      } else {
        await createCategory(actorId, { name, description, imageUrl, sortOrder })
      }
      onSaved()
    } catch (e: any) {
      setError(e.response?.data || 'Ошибка сохранения')
    } finally {
      setLoading(false)
    }
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
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          {isEdit ? 'Редактировать категорию' : 'Новая категория'}
        </h2>

        {error && (
          <div className="bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 text-sm p-3 rounded border border-red-100 dark:border-red-500/20">
            {error}
          </div>
        )}

        <div>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Картинка
          </label>
          <div className="flex items-center gap-3 mt-1">
            <div className="w-20 h-20 rounded-lg bg-slate-100 dark:bg-[#0d1117] shrink-0 overflow-hidden flex items-center justify-center">
              {imageUrl ? (
                <img src={imageUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-slate-300 dark:text-slate-600 text-2xl font-bold">
                  {name.charAt(0).toUpperCase() || '?'}
                </span>
              )}
            </div>
            <div className="flex-1 space-y-1">
              <label className="block text-xs text-brand-600 dark:text-brand-400 cursor-pointer hover:underline">
                {uploading ? 'Загрузка...' : 'Загрузить фото'}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImage}
                  disabled={uploading}
                />
              </label>
              {imageUrl && (
                <button
                  type="button"
                  onClick={() => setImageUrl('')}
                  className="block text-xs text-red-600 dark:text-red-400 hover:underline"
                >
                  Удалить
                </button>
              )}
              <input
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="или URL"
                className="w-full border border-slate-300 dark:border-[#30363d] dark:bg-[#0d1117] dark:text-white rounded-md px-2 py-1 text-xs"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Название *
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full border border-slate-300 dark:border-[#30363d] dark:bg-[#0d1117] dark:text-white rounded-md px-3 py-2 mt-1 text-sm"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Описание
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="w-full border border-slate-300 dark:border-[#30363d] dark:bg-[#0d1117] dark:text-white rounded-md px-3 py-2 mt-1 text-sm resize-none"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Порядок
          </label>
          <input
            type="number"
            value={sortOrder}
            onChange={(e) => setSortOrder(Number(e.target.value))}
            min={0}
            className="w-full border border-slate-300 dark:border-[#30363d] dark:bg-[#0d1117] dark:text-white rounded-md px-3 py-2 mt-1 text-sm"
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
            disabled={loading || uploading}
            className="bg-brand-600 hover:bg-brand-700 text-white rounded-md px-4 py-2 text-sm font-medium disabled:opacity-50"
          >
            {loading ? 'Сохранение...' : isEdit ? 'Сохранить' : 'Создать'}
          </button>
        </div>
      </form>
    </div>
  )
}