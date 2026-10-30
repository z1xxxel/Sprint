import { useState } from 'react'
import { createProduct, updateProduct, deleteDiscount, getProductById } from '../api/shop'
import { uploadFile } from '../api/files'
import DiscountModal from './DiscountModal'
import ImageCropperModal from './ImageCropperModal'
import { notify } from '../lib/notify'
import { IconSettings } from './Icons' // <-- IconX удален
import type { Category, Product } from '../types'

interface VariantInput {
  size: string
  color: string
  stock: number
}

interface Props {
  product?: Product
  defaultCategoryId?: number
  categories: Category[]
  actorId: number
  onClose: () => void
  onSaved: () => void
}

interface CropTarget {
  url: string
  type: 'cover' | 'gallery'
  index?: number
}

export default function ProductModal({
  product,
  defaultCategoryId,
  categories,
  actorId,
  onClose,
  onSaved,
}: Props) {
  const isEdit = !!product

  const [name, setName] = useState(product?.name ?? '')
  const [description, setDescription] = useState(product?.description ?? '')
  const [price, setPrice] = useState(product?.basePrice ?? 1000)
  const [stock, setStock] = useState(product?.stock ?? 0)
  
  const [imageUrl, setImageUrl] = useState(product?.imageUrl ?? '')
  const [images, setImages] = useState<string[]>(product?.images ?? [])

  const [categoryId, setCategoryId] = useState<number | undefined>(
    product?.categoryId ?? defaultCategoryId ?? categories[0]?.id
  )
  
  const [hasVariants, setHasVariants] = useState(product?.hasVariants ?? false)
  const [variants, setVariants] = useState<VariantInput[]>(
    product?.variants?.map(v => ({ size: v.size, color: v.color, stock: v.stock })) || []
  )
  
  const [isActive, setIsActive] = useState(product?.isActive ?? true)

  // Генератор вариантов
  const [sizesTemplate, setSizesTemplate] = useState('XXS, XS, S, M, L, XL, XXL, XXXL')
  const [colorsTemplate, setColorsTemplate] = useState('Черный, Белый')

  // Drag & Drop
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  // Загрузка
  const [uploading, setUploading] = useState(false)
  const [uploadingGallery, setUploadingGallery] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const [cropTarget, setCropTarget] = useState<CropTarget | null>(null)

  // Скидка
  const [discount, setDiscount] = useState({
    isActive: product?.isOnDiscount ?? false,
    percent: product?.discountPercent ?? null,
    until: product?.discountValidUntil ?? null,
  })
  const [discountModal, setDiscountModal] = useState(false)

  // --- ГЕНЕРАЦИЯ ВАРИАНТОВ ---
  function generateVariants() {
    const sizes = sizesTemplate.split(',').map(s => s.trim()).filter(Boolean)
    const colors = colorsTemplate.split(',').map(c => c.trim()).filter(Boolean)
    
    if (sizes.length === 0) return notify.error('Укажите хотя бы один размер')

    const newVariants: VariantInput[] = []
    if (colors.length === 0) {
      sizes.forEach(s => newVariants.push({ size: s, color: '', stock: 0 }))
    } else {
      colors.forEach(c => {
        sizes.forEach(s => newVariants.push({ size: s, color: c, stock: 0 }))
      })
    }
    setVariants(newVariants)
    notify.success('Матрица вариантов создана')
  }

  // --- DRAG & DROP ---
  function handleDragStart(e: React.DragEvent, index: number) {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', index.toString())
  }

  function handleDragOver(e: React.DragEvent, index: number) {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === index) return

    const newVariants = [...variants]
    const item = newVariants[draggedIndex]
    newVariants.splice(draggedIndex, 1)
    newVariants.splice(index, 0, item)
    
    setDraggedIndex(index)
    setVariants(newVariants)
  }

  function handleDragEnd() {
    setDraggedIndex(null)
  }

  // --- ОБЛОЖКА ---
  function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) return notify.error('Выберите изображение')
    if (file.size > 10 * 1024 * 1024) return notify.error('Файл больше 10 МБ')
    
    setUploading(true)
    uploadFile(file).then((url) => {
        setImageUrl(url)
        notify.success('Обложка загружена')
      }).catch((err) => notify.error(err)).finally(() => {
        setUploading(false)
        e.target.value = ''
      })
  }

  function startCropCover() {
    if (!imageUrl) return
    setCropTarget({ url: imageUrl, type: 'cover' })
  }

  // --- ГАЛЕРЕЯ ---
  async function handleGalleryUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files || files.length === 0) return
    
    setUploadingGallery(true)
    try {
      const newImages: string[] = []
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        if (file.type.startsWith('image/') && file.size <= 10 * 1024 * 1024) {
          const url = await uploadFile(file)
          newImages.push(url)
        }
      }
      setImages(prev => [...prev, ...newImages])
      notify.success('Фото добавлены в галерею')
    } catch (e) {
      notify.error(e)
    } finally {
      setUploadingGallery(false)
      e.target.value = ''
    }
  }

  function startCropGallery(index: number) {
    setCropTarget({ url: images[index], type: 'gallery', index })
  }

  // --- ОБРАБОТКА РЕЗУЛЬТАТА КРОППЕРА ---
  async function handleCroppedImage(blob: Blob) {
    if (!cropTarget) return
    setUploading(true)
    try {
      const file = new File([blob], 'cropped.jpg', { type: 'image/jpeg' })
      const newUrl = await uploadFile(file)
      
      if (cropTarget.type === 'cover') {
        setImageUrl(newUrl)
      } else if (cropTarget.type === 'gallery' && cropTarget.index !== undefined) {
        const copy = [...images]
        copy[cropTarget.index] = newUrl
        setImages(copy)
      }
      notify.success('Ракурс обновлен')
    } catch (e) {
      notify.error(e)
    } finally {
      setUploading(false)
      if (cropTarget.url && cropTarget.url.startsWith('blob:')) URL.revokeObjectURL(cropTarget.url)
      setCropTarget(null)
    }
  }

  function handleCancelCrop() {
    if (cropTarget?.url && cropTarget.url.startsWith('blob:')) URL.revokeObjectURL(cropTarget.url)
    setCropTarget(null)
  }

  // --- СКИДКИ ---
  async function handleDeleteDiscount() {
    if (!product) return
    if (!confirm('Удалить скидку?')) return
    try {
      await deleteDiscount(product.id, actorId)
      setDiscount({ isActive: false, percent: null, until: null })
    } catch (e: any) {
      alert(e.response?.data || 'Ошибка')
    }
  }

  async function refreshDiscount() {
    if (!product) return
    try {
      const updated = await getProductById(product.id)
      setDiscount({
        isActive: updated.isOnDiscount,
        percent: updated.discountPercent,
        until: updated.discountValidUntil,
      })
    } catch { /* ignore */ }
  }

  // --- СОХРАНЕНИЕ ---
  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    
    if (hasVariants) {
      if (variants.some(v => !v.size && !v.color)) {
        setError('Заполните размер или цвет для всех вариантов')
        return
      }
    }

    setLoading(true)
    try {
      const payload: any = {
        name,
        description,
        price,
        stock: hasVariants ? undefined : stock,
        imageUrl,
        images: images.filter(img => img.trim() !== ''),
        categoryId,
        isActive,
        hasVariants,
        variants: hasVariants ? variants : null,
      }

      if (isEdit) {
        await updateProduct(product!.id, actorId, payload)
      } else {
        await createProduct(actorId, payload)
      }
      onSaved()
    } catch (e: any) {
      setError(e.response?.data || 'Ошибка сохранения')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 overflow-y-auto" onClick={onClose}>
      <div className="flex min-h-full items-start justify-center p-4">
        <form onSubmit={submit} onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-[#161b22] rounded-xl w-full max-w-2xl p-6 space-y-4 my-8">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            {isEdit ? 'Редактировать товар' : 'Новый товар'}
          </h2>

          {error && (
            <div className="bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 text-sm p-3 rounded border border-red-100 dark:border-red-500/20">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Название *</label>
              <input value={name} onChange={(e) => setName(e.target.value)} required className="w-full border border-slate-300 dark:border-[#30363d] dark:bg-[#0d1117] dark:text-white rounded-md px-3 py-2 mt-1 text-sm focus:outline-none focus:border-brand-500" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Описание</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="w-full border border-slate-300 dark:border-[#30363d] dark:bg-[#0d1117] dark:text-white rounded-md px-3 py-2 mt-1 text-sm resize-none focus:outline-none focus:border-brand-500" />
            </div>
            
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Цена, монет</label>
              <input type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} min={1} required className="w-full border border-slate-300 dark:border-[#30363d] dark:bg-[#0d1117] dark:text-white rounded-md px-3 py-2 mt-1 text-sm focus:outline-none focus:border-brand-500" />
            </div>
            
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Категория</label>
              <select value={categoryId ?? ''} onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : undefined)} className="w-full border border-slate-300 dark:border-[#30363d] dark:bg-[#0d1117] dark:text-white rounded-md px-3 py-2 mt-1 text-sm focus:outline-none focus:border-brand-500">
                <option value="">—</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            {/* Количество на складе (только если нет вариантов) */}
            {!hasVariants && (
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Количество на складе</label>
                <input type="number" value={stock} onChange={(e) => setStock(Number(e.target.value))} min={0} required className="w-full border border-slate-300 dark:border-[#30363d] dark:bg-[#0d1117] dark:text-white rounded-md px-3 py-2 mt-1 text-sm focus:outline-none focus:border-brand-500" />
              </div>
            )}

            {/* Статус */}
            <div className={`flex items-center gap-2 ${!hasVariants ? 'pt-6' : 'sm:col-span-2 pt-2'}`}>
              <input type="checkbox" id="isActive" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="rounded border-slate-300 text-brand-600 focus:ring-brand-500" />
              <label htmlFor="isActive" className="text-sm text-slate-700 dark:text-slate-300 cursor-pointer">Товар активен и виден в каталоге</label>
            </div>

            {/* ОБЛОЖКА */}
            <div className="sm:col-span-2 border-t border-slate-100 dark:border-[#30363d] pt-3">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Главная обложка</label>
              <div className="flex gap-2 mt-1 items-center">
                <div className="w-12 h-12 rounded bg-slate-100 dark:bg-[#0d1117] shrink-0 overflow-hidden flex items-center justify-center border border-slate-200 dark:border-[#30363d]">
                  {imageUrl ? <img src={imageUrl} alt="" className="w-full h-full object-cover" /> : <span className="text-xs text-slate-400">—</span>}
                </div>
                <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="URL или загрузите файл" className="flex-1 border border-slate-300 dark:border-[#30363d] dark:bg-[#0d1117] dark:text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:border-brand-500" />
                
                <label className="px-3 py-2 border border-slate-300 dark:border-[#30363d] rounded-md text-sm text-slate-600 dark:text-slate-300 cursor-pointer hover:border-brand-500 transition shrink-0">
                  {uploading ? '...' : 'Загрузить'}
                  <input type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} disabled={uploading} />
                </label>

                {imageUrl && (
                  <button type="button" onClick={startCropCover} className="px-3 py-2 border border-brand-300 dark:border-brand-500/30 text-brand-600 dark:text-brand-400 rounded-md text-sm font-medium hover:bg-brand-50 dark:hover:bg-brand-500/10 transition shrink-0">
                    Обрезать
                  </button>
                )}
              </div>
            </div>

            {/* ГАЛЕРЕЯ */}
            <div className="sm:col-span-2 border-t border-slate-100 dark:border-[#30363d] pt-3">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Галерея фото</label>
              <div className="space-y-2 mt-2">
                {images.map((url, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <div className="w-10 h-10 rounded shrink-0 bg-slate-100 dark:bg-[#0d1117] overflow-hidden border border-slate-200 dark:border-[#30363d]">
                      {url ? <img src={url} alt="" className="w-full h-full object-cover" /> : <span className="text-[10px] text-slate-400 flex items-center justify-center h-full">—</span>}
                    </div>
                    <input value={url} onChange={(e) => { const copy = [...images]; copy[i] = e.target.value; setImages(copy); }} placeholder="URL фото" className="flex-1 border border-slate-300 dark:border-[#30363d] dark:bg-[#0d1117] dark:text-white rounded-md px-3 py-1.5 text-sm" />
                    
                    {url && (
                      <button type="button" onClick={() => startCropGallery(i)} className="text-xs px-2 py-1.5 border border-brand-300 dark:border-brand-500/30 text-brand-600 dark:text-brand-400 rounded hover:bg-brand-50 transition shrink-0">
                        Обрезать
                      </button>
                    )}
                    
                    <button type="button" onClick={() => setImages(images.filter((_, idx) => idx !== i))} className="text-red-500 hover:text-red-700 px-2 font-bold shrink-0">✕</button>
                  </div>
                ))}
                <div className="flex gap-4 pt-1">
                  <button type="button" onClick={() => setImages([...images, ''])} className="text-sm text-brand-600 hover:underline">+ Добавить ссылку</button>
                  <label className="text-sm text-brand-600 hover:underline cursor-pointer">
                    {uploadingGallery ? 'Загрузка...' : '+ Загрузить файлы'}
                    <input type="file" accept="image/*" multiple className="hidden" onChange={handleGalleryUpload} disabled={uploadingGallery} />
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* ВАРИАНТЫ (Размеры/Цвета) */}
          <div className="border-t border-slate-200 dark:border-[#30363d] pt-4">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
              <input type="checkbox" checked={hasVariants} onChange={(e) => setHasVariants(e.target.checked)} />
              Есть размеры / цвета
            </label>

            {hasVariants && (
              <div className="space-y-4">
                
                {/* Генератор */}
                <div className="bg-slate-50 dark:bg-[#0d1117] p-3 rounded-lg border border-slate-200 dark:border-[#30363d]">
                  <div className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">Быстрое заполнение</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
                    <input value={sizesTemplate} onChange={e => setSizesTemplate(e.target.value)} placeholder="Размеры (через запятую)" className="border border-slate-300 dark:border-[#30363d] rounded-md px-2 py-1.5 text-sm bg-white dark:bg-[#161b22]" />
                    <input value={colorsTemplate} onChange={e => setColorsTemplate(e.target.value)} placeholder="Цвета (через запятую)" className="border border-slate-300 dark:border-[#30363d] rounded-md px-2 py-1.5 text-sm bg-white dark:bg-[#161b22]" />
                  </div>
                  <button type="button" onClick={generateVariants} className="text-xs bg-brand-600 text-white px-3 py-1.5 rounded-md hover:bg-brand-700 transition">
                    Сгенерировать список
                  </button>
                </div>

                {/* Список вариантов */}
                <div className="space-y-2">
                  <div className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    Список вариантов (перетаскивайте за <IconSettings size={12} className="inline" /> для сортировки)
                  </div>
                  {variants.length === 0 && <div className="text-sm text-slate-400 italic text-center py-2">Список пуст. Нажмите "Сгенерировать" или добавьте вручную.</div>}
                  
                  <div className="max-h-64 overflow-y-auto space-y-2 pr-2">
                    {variants.map((v, i) => (
                      <div 
                        key={i} 
                        draggable
                        onDragStart={(e) => handleDragStart(e, i)}
                        onDragOver={(e) => handleDragOver(e, i)}
                        onDragEnd={handleDragEnd}
                        className={`flex items-center gap-2 bg-white dark:bg-[#161b22] border border-slate-200 dark:border-[#30363d] p-2 rounded-md cursor-move transition ${draggedIndex === i ? 'opacity-50 border-brand-500' : ''}`}
                      >
                        <div className="text-slate-400 cursor-grab active:cursor-grabbing px-1">
                          <IconSettings size={16} />
                        </div>
                        <input placeholder="Размер" value={v.size} onChange={(e) => { const copy = [...variants]; copy[i].size = e.target.value; setVariants(copy) }} className="w-20 border border-slate-300 dark:border-[#30363d] rounded-md px-2 py-1 text-sm" />
                        <input placeholder="Цвет" value={v.color} onChange={(e) => { const copy = [...variants]; copy[i].color = e.target.value; setVariants(copy) }} className="flex-1 border border-slate-300 dark:border-[#30363d] rounded-md px-2 py-1 text-sm" />
                        <input type="number" placeholder="Сток" value={v.stock} onChange={(e) => { const copy = [...variants]; copy[i].stock = Number(e.target.value); setVariants(copy) }} className="w-20 border border-slate-300 dark:border-[#30363d] rounded-md px-2 py-1 text-sm" />
                        <button type="button" onClick={() => setVariants(variants.filter((_, idx) => idx !== i))} className="text-red-500 hover:text-red-700 px-2 font-bold shrink-0">✕</button>
                      </div>
                    ))}
                  </div>
                  
                  <button type="button" onClick={() => setVariants([...variants, { size: '', color: '', stock: 0 }])} className="text-sm text-brand-600 hover:underline mt-2">+ Добавить вручную</button>
                </div>
              </div>
            )}
          </div>

          {/* СКИДКИ */}
          {isEdit && (
            <div className="border-t border-slate-200 dark:border-[#30363d] pt-4">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <div className="text-sm font-medium text-slate-900 dark:text-white">Скидка</div>
                  {discount.isActive && discount.percent !== null ? (
                    <div className="text-xs text-brand-600 dark:text-brand-400 mt-0.5">{discount.percent}% до {discount.until ? new Date(discount.until).toLocaleDateString('ru-RU') : '—'}</div>
                  ) : (
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Не задана</div>
                  )}
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setDiscountModal(true)} className="text-xs px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-md font-medium transition">
                    {discount.isActive ? 'Изменить' : 'Добавить скидку'}
                  </button>
                  {discount.isActive && (
                    <button type="button" onClick={handleDeleteDiscount} className="text-xs px-3 py-1.5 border border-red-300 text-red-600 hover:bg-red-50 rounded-md font-medium transition">Удалить</button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* КНОПКИ */}
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-slate-600 dark:text-slate-300">Отмена</button>
            <button type="submit" disabled={loading || uploading || uploadingGallery} className="bg-brand-600 hover:bg-brand-700 text-white rounded-md px-4 py-2 text-sm font-medium disabled:opacity-50">
              {loading ? 'Сохранение...' : isEdit ? 'Сохранить' : 'Создать'}
            </button>
          </div>
        </form>
      </div>

      {discountModal && product && (
        <DiscountModal
          productId={product.id}
          productName={product.name}
          hasExisting={discount.isActive}
          currentPercent={discount.percent}
          actorId={actorId}
          onClose={() => setDiscountModal(false)}
          onSaved={async () => { setDiscountModal(false); await refreshDiscount(); }}
        />
      )}

      {cropTarget && (
        <ImageCropperModal
          imageSrc={cropTarget.url}
          aspect={4 / 3}
          cropShape="rect"
          outputWidth={1200}
          outputHeight={900}
          title={cropTarget.type === 'cover' ? 'Обложка товара' : 'Фото из галереи'}
          onCancel={handleCancelCrop}
          onCrop={handleCroppedImage}
        />
      )}
    </div>
  )
}