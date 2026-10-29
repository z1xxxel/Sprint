import { useState, useEffect, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../store/auth'
import { useCart } from '../store/cart'
import { useFetch } from '../hooks/useFetch'
import {
  getReviews,
  addReview,
  addFavorite,
  removeFavorite,
  getFavorites,
  getUserOrders,
  getCategories,
  getProductById,
  deleteProduct,
} from '../api/shop'
import ProductModal from '../components/ProductModal'
import { can } from '../lib/permissions'
import { notify } from '../lib/notify'
import { confirmDialog } from '../lib/confirm'
import { IconStar, IconStarFilled, IconHeart } from '../components/Icons'

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>()
  const productId = Number(id)
  const user = useAuth((s) => s.user)!
  const addToCart = useCart((s) => s.add)
  const canManage = can.manageCatalog(user.role)

  const product = useFetch(() => getProductById(productId), [productId])
  const reviews = useFetch(() => getReviews(productId), [productId])
  const orders = useFetch(() => getUserOrders(user.id), [user.id])
  const categories = useFetch(() => getCategories(), [])
  const favorites = useFetch(() => getFavorites(user.id), [user.id])

  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [selectedColor, setSelectedColor] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [editing, setEditing] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)
  const [favBusy, setFavBusy] = useState(false)
  const [activeImage, setActiveImage] = useState<string | null>(null)

  // Отзыв
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewComment, setReviewComment] = useState('')
  const [reviewLoading, setReviewLoading] = useState(false)

  const p = product.data

  useEffect(() => {
    if (p) setActiveImage(p.imageUrl)
  }, [p])

  useEffect(() => {
    if (favorites.data) {
      setIsFavorite(favorites.data.some((f) => f.id === productId))
    }
  }, [favorites.data, productId])

  const sizes = useMemo(() => {
    if (!p?.variants) return []
    return Array.from(new Set(p.variants.map((v) => v.size).filter((s) => s !== '')))
  }, [p])

  const colors = useMemo(() => {
    if (!p?.variants) return []
    return Array.from(new Set(p.variants.map((v) => v.color).filter((c) => c !== '')))
  }, [p])

  // Проверка доступности размера С УЧЕТОМ выбранного цвета
  function isSizeAvailable(size: string) {
    return !!p?.variants?.some((v) => {
      if (v.size !== size || v.stock <= 0) return false
      // Если выбран цвет, размер должен быть доступен именно для этого цвета
      if (selectedColor && v.color !== selectedColor) return false
      return true
    })
  }

  // Проверка доступности цвета С УЧЕТОМ выбранного размера
  function isColorAvailable(color: string) {
    if (!p?.variants) return false
    return p.variants.some((v) => {
      if (v.color !== color || v.stock <= 0) return false
      if (selectedSize && v.size !== selectedSize) return false
      return true
    })
  }

  const selectedVariant = useMemo(() => {
    if (!p?.variants) return null
    if (sizes.length > 0 && !selectedSize) return null
    if (colors.length > 0 && !selectedColor) return null
    return p.variants.find(
      (v) =>
        (sizes.length === 0 || v.size === selectedSize) &&
        (colors.length === 0 || v.color === selectedColor)
    )
  }, [p, selectedSize, selectedColor, sizes.length, colors.length])

  useEffect(() => {
    // Если выбранный цвет стал недоступен при смене размера — сбрасываем его
    if (selectedColor && !isColorAvailable(selectedColor)) setSelectedColor(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSize])

  useEffect(() => {
    setQuantity(1)
  }, [selectedVariant?.id])

  const hasPurchased = useMemo(() => {
    if (!orders.data) return false
    return orders.data.some((o) => o.productId === productId && o.status === 'COMPLETED')
  }, [orders.data, productId])

  const maxQty = p?.hasVariants ? selectedVariant?.stock ?? 0 : p?.stock ?? 0

  function handleAddToCart() {
    setError('')
    setSuccess('')
    if (!p) return

    if (p.hasVariants) {
      if (sizes.length > 0 && !selectedSize) { setError('Выберите размер'); return }
      if (colors.length > 0 && !selectedColor) { setError('Выберите цвет'); return }
      if (!selectedVariant) { setError('Такая комбинация недоступна'); return }
      if (selectedVariant.stock < quantity) { setError('Недостаточно товара'); return }
    } else if (p.stock < quantity) {
      setError('Недостаточно товара')
      return
    }

    addToCart(
      {
        productId: p.id,
        variantId: selectedVariant?.id ?? null,
        name: p.name,
        imageUrl: p.imageUrl,
        size: selectedVariant?.size || null,
        color: selectedVariant?.color || null,
        price: p.finalPrice,
        maxStock: maxQty,
      },
      quantity
    )
    setSuccess('Добавлено в корзину')
    notify.success('Добавлено в корзину')
    setTimeout(() => setSuccess(''), 2000)
  }

  async function handleFavorite() {
    if (favBusy) return
    setFavBusy(true)
    try {
      if (isFavorite) {
        await removeFavorite(user.id, productId)
        setIsFavorite(false)
        notify.info('Удалено из избранного')
      } else {
        await addFavorite(user.id, productId)
        setIsFavorite(true)
        notify.success('Добавлено в избранное')
      }
    } catch (e) {
      notify.error(e)
    } finally {
      setFavBusy(false)
    }
  }

  async function handleReviewSubmit(e: React.FormEvent) {
    e.preventDefault()
    setReviewLoading(true)
    try {
      await addReview(productId, user.id, reviewRating, reviewComment)
      setReviewComment('')
      setReviewRating(5)
      notify.success('Спасибо за отзыв!')
      window.location.reload()
    } catch (e) {
      notify.error(e)
    } finally {
      setReviewLoading(false)
    }
  }

  async function handleDelete() {
    if (!p) return
    const ok = await confirmDialog({
      title: 'Скрыть товар?',
      message: `Товар «${p.name}» будет скрыт из каталога. Вы сможете вернуть его позже.`,
      confirmLabel: 'Скрыть',
      danger: true,
    })
    if (!ok) return

    try {
      await deleteProduct(p.id, user.id)
      notify.success('Товар скрыт из каталога')
      window.location.href = '/catalog'
    } catch (e) {
      notify.error(e)
    }
  }

  if (product.loading) return <div className="text-slate-500">Загрузка...</div>
  if (product.error) return <div className="text-red-600">{product.error}</div>
  if (!p) return <div className="text-slate-500">Товар не найден</div>

  const inStock = p.hasVariants
    ? selectedVariant ? selectedVariant.stock > 0 : p.stock > 0
    : p.stock > 0

  const gallery = [p.imageUrl, ...(p.images || [])].filter(Boolean) as string[]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <Link to="/catalog" className="text-sm text-brand-600 hover:underline">← Назад в магазин</Link>
        {canManage && (
          <div className="flex gap-2">
            <button onClick={() => setEditing(true)} className="text-xs px-3 py-1.5 border border-slate-300 dark:border-[#30363d] rounded-md text-slate-700 dark:text-slate-300 hover:border-brand-500 transition">Редактировать</button>
            <button onClick={handleDelete} className="text-xs px-3 py-1.5 border border-red-300 dark:border-red-500/30 rounded-md text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition">Скрыть</button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="flex flex-col gap-3">
          <div className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-[#30363d] overflow-hidden aspect-square flex items-center justify-center">
            {activeImage ? (
              <img src={activeImage} alt={p.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-slate-300 dark:text-slate-600 text-sm">Нет фото</span>
            )}
          </div>
          {gallery.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {gallery.map((img, i) => (
                <button key={i} onClick={() => setActiveImage(img)} className={`w-20 h-20 rounded-lg overflow-hidden border-2 shrink-0 transition ${activeImage === img ? 'border-brand-500' : 'border-transparent opacity-70 hover:opacity-100'}`}>
                  <img src={img} alt={`${p.name} ${i}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-5">
          <div>
            <div className="text-sm text-slate-500 dark:text-slate-400">{p.categoryName}</div>
            <h1 className="text-2xl font-bold mt-1 text-slate-900 dark:text-white">{p.name}</h1>
            {p.reviewCount > 0 && (
              <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">Оценка: {p.averageRating} из 5 ({p.reviewCount} отзывов)</div>
            )}
          </div>

          {p.description && <p className="text-sm text-slate-600 dark:text-slate-300">{p.description}</p>}

          <div className="flex items-baseline gap-3">
            {p.isOnDiscount && <span className="text-lg text-slate-400 line-through">{p.adjustedPrice.toFixed(0)} монет</span>}
            <span className="text-3xl font-bold text-brand-600">{p.finalPrice.toFixed(0)} монет</span>
            {p.isOnDiscount && <span className="bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 text-sm px-2 py-0.5 rounded">-{p.discountPercent}%</span>}
          </div>

          {p.hasVariants && colors.length > 0 && (
            <div>
              <div className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Цвет</div>
              <div className="flex flex-wrap gap-2">
                {colors.map((color) => {
                  const available = isColorAvailable(color)
                  const isSelected = selectedColor === color
                  return (
                    <button key={color} onClick={() => available && setSelectedColor(color)} disabled={!available}
                      className={`px-3 py-2 rounded-md text-sm font-medium border transition ${
                        isSelected ? 'bg-brand-600 text-white border-brand-600'
                        : available ? 'bg-white dark:bg-[#161b22] text-slate-900 dark:text-white border-slate-300 dark:border-[#30363d] hover:border-brand-500'
                        : 'bg-slate-100 dark:bg-[#0d1117] text-slate-400 dark:text-slate-600 border-slate-200 dark:border-[#30363d] cursor-not-allowed line-through'
                      }`}>
                      {color}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {p.hasVariants && sizes.length > 0 && (
            <div>
              <div className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Размер</div>
              <div className="flex flex-wrap gap-2">
                {sizes.map((size) => {
                  const available = isSizeAvailable(size)
                  const isSelected = selectedSize === size
                  return (
                    <button key={size} onClick={() => available && setSelectedSize(size)} disabled={!available}
                      className={`min-w-[48px] px-3 py-2 rounded-md text-sm font-medium border transition ${
                        isSelected ? 'bg-brand-600 text-white border-brand-600' 
                        : available ? 'bg-white dark:bg-[#161b22] text-slate-900 dark:text-white border-slate-300 dark:border-[#30363d] hover:border-brand-500'
                        : 'bg-slate-100 dark:bg-[#0d1117] text-slate-400 dark:text-slate-600 border-slate-200 dark:border-[#30363d] cursor-not-allowed line-through'
                      }`}>
                      {size}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          <div className="text-sm text-slate-500 dark:text-slate-400">
            {p.hasVariants
              ? selectedVariant
                ? selectedVariant.stock > 0 ? `В наличии: ${selectedVariant.stock} шт.` : 'Нет в наличии'
                : `Всего на складе: ${p.stock} шт.`
              : p.stock > 0 ? `В наличии: ${p.stock} шт.` : 'Нет в наличии'}
          </div>

          {inStock && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-600 dark:text-slate-400">Количество:</span>
              <div className="flex items-center gap-1">
                <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} disabled={quantity <= 1} className="w-8 h-8 rounded-md border border-slate-300 dark:border-[#30363d] text-slate-600 dark:text-slate-300 hover:border-brand-500 disabled:opacity-30">-</button>
                <span className="w-10 text-center text-sm font-medium text-slate-900 dark:text-white">{quantity}</span>
                <button onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))} disabled={quantity >= maxQty} className="w-8 h-8 rounded-md border border-slate-300 dark:border-[#30363d] text-slate-600 dark:text-slate-300 hover:border-brand-500 disabled:opacity-30">+</button>
              </div>
            </div>
          )}

          {error && <div className="bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 text-sm p-3 rounded border border-red-200 dark:border-red-500/30">{error}</div>}
          {success && <div className="bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-400 text-sm p-3 rounded border border-brand-200 dark:border-brand-500/30">{success}</div>}

          <div className="flex gap-3">
            <button onClick={handleAddToCart} disabled={!inStock} className="flex-1 bg-brand-600 hover:bg-brand-700 text-white rounded-md py-2.5 font-medium disabled:opacity-50 transition">В корзину</button>
            <button onClick={handleFavorite} disabled={favBusy} title={isFavorite ? 'Убрать из избранного' : 'Добавить в избранное'}
              className={`border rounded-md px-4 py-2.5 transition text-sm font-medium inline-flex items-center gap-2 disabled:opacity-50 ${
                isFavorite ? 'border-red-300 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20'
                : 'border-slate-300 dark:border-[#30363d] text-slate-700 dark:text-slate-300 hover:border-brand-500'
              }`}>
              <IconHeart size={16} />
              {isFavorite ? 'В избранном' : 'В избранное'}
            </button>
          </div>
        </div>
      </div>

      {/* Отзывы */}
      <div className="bg-white dark:bg-[#161b22] p-6 rounded-xl border border-slate-200 dark:border-[#30363d] space-y-4">
        <h2 className="font-bold text-slate-900 dark:text-white">Отзывы ({reviews.data?.length ?? 0})</h2>
        {hasPurchased && (
          <form onSubmit={handleReviewSubmit} className="bg-slate-50 dark:bg-[#0d1117] p-4 rounded-lg space-y-3">
            <div className="text-sm font-medium text-slate-900 dark:text-white">Оставить отзыв</div>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} type="button" onClick={() => setReviewRating(n)} className={`w-8 h-8 rounded-md flex items-center justify-center transition ${n <= reviewRating ? 'text-amber-500' : 'text-slate-300 dark:text-slate-600'}`}>
                  {n <= reviewRating ? <IconStarFilled size={20} /> : <IconStar size={20} />}
                </button>
              ))}
            </div>
            <textarea value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} rows={2} placeholder="Поделитесь впечатлениями..." className="w-full border border-slate-300 dark:border-[#30363d] dark:bg-[#161b22] dark:text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:border-brand-500 resize-none" />
            <button type="submit" disabled={reviewLoading || !reviewComment.trim()} className="bg-brand-600 hover:bg-brand-700 text-white rounded-md px-4 py-2 text-sm font-medium disabled:opacity-50 transition">{reviewLoading ? 'Отправка...' : 'Отправить'}</button>
          </form>
        )}
        {reviews.loading && <div className="text-slate-500">Загрузка...</div>}
        {reviews.data?.length === 0 && <div className="text-slate-400 text-sm">Пока нет отзывов</div>}
        <div className="space-y-3">
          {reviews.data?.map((r) => (
            <div key={r.id} className="border-b border-slate-100 dark:border-[#30363d] pb-3 last:border-0">
              <div className="flex items-center justify-between">
                <div className="font-medium text-sm text-slate-900 dark:text-white">{r.userName}</div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <span key={n} className={n <= r.rating ? 'text-amber-500' : 'text-slate-300 dark:text-slate-600'}>
                      {n <= r.rating ? <IconStarFilled size={14} /> : <IconStar size={14} />}
                    </span>
                  ))}
                </div>
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-300 mt-1">{r.comment}</div>
              <div className="text-xs text-slate-400 dark:text-slate-500 mt-1">{new Date(r.createdAt).toLocaleString('ru-RU')}</div>
            </div>
          ))}
        </div>
      </div>

      {editing && (
        <ProductModal product={p} categories={categories.data ?? []} actorId={user.id} onClose={() => setEditing(false)} onSaved={() => { setEditing(false); window.location.reload() }} />
      )}
    </div>
  )
}