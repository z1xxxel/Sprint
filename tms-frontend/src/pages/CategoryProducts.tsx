import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../store/auth'
import { useFetch } from '../hooks/useFetch'
import { getCategories, getProductsByCategory } from '../api/shop'
import ProductModal from '../components/ProductModal'
import { can } from '../lib/permissions'
import type { Product } from '../types'

export default function CategoryProducts() {
  const { categoryId } = useParams<{ categoryId: string }>()
  const cid = Number(categoryId)
  const user = useAuth((s) => s.user)!
  const canManage = can.manageCatalog(user.role)

  const categories = useFetch(() => getCategories(), [])
  const products = useFetch(() => getProductsByCategory(cid), [cid])

  const [editing, setEditing] = useState<Product | null>(null)
  const [creating, setCreating] = useState(false)

  const category = categories.data?.find((c) => c.id === cid)

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <Link to="/catalog" className="text-sm text-brand-600 hover:underline">
            &larr; Все категории
          </Link>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white tracking-tight mt-2">
            {category?.name || 'Категория'}
          </h1>
          {category?.description && (
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {category.description}
            </p>
          )}
        </div>
        {canManage && (
          <button
            onClick={() => setCreating(true)}
            className="bg-brand-600 hover:bg-brand-700 text-white rounded-md px-4 py-2 text-sm font-medium transition"
          >
            + Товар
          </button>
        )}
      </div>

      {products.loading && <div className="text-slate-500">Загрузка...</div>}
      {products.error && <div className="text-red-600">{products.error}</div>}

      {!products.loading && products.data?.length === 0 && (
        <div className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-[#30363d] p-8 sm:p-12 text-center">
          <div className="text-slate-400 dark:text-slate-500 text-sm mb-4">
            В этой категории пока нет товаров
          </div>
          {canManage && (
            <button
              onClick={() => setCreating(true)}
              className="inline-block bg-brand-600 hover:bg-brand-700 text-white rounded-md px-4 py-2 text-sm font-medium transition"
            >
              + Создать первый товар
            </button>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.data?.map((p) => (
          <div key={p.id} className="relative group">
            <ProductCard product={p} />
            {canManage && (
              <button
                onClick={(e) => {
                  e.preventDefault()
                  setEditing(p)
                }}
                title="Редактировать"
                className="absolute top-2 right-2 px-2.5 py-1 rounded-md bg-white/90 dark:bg-[#0d1117]/90 text-slate-700 dark:text-slate-200 shadow hover:bg-white dark:hover:bg-[#161b22] text-xs font-medium z-10"
              >
                Ред.
              </button>
            )}
          </div>
        ))}
      </div>

      {creating && (
        <ProductModal
          categories={categories.data ?? []}
          defaultCategoryId={cid}
          actorId={user.id}
          onClose={() => setCreating(false)}
          onSaved={() => {
            setCreating(false)
            window.location.reload()
          }}
        />
      )}

      {editing && (
        <ProductModal
          product={editing}
          categories={categories.data ?? []}
          actorId={user.id}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null)
            window.location.reload()
          }}
        />
      )}
    </div>
  )
}

function ProductCard({ product: p }: { product: Product }) {
  return (
    <Link
      to={`/catalog/${p.id}`}
      className="bg-white dark:bg-[#161b22] rounded-lg border border-slate-200 dark:border-[#30363d] overflow-hidden hover:border-brand-400 dark:hover:border-brand-500/50 hover:shadow-sm transition group block"
    >
      <div className="aspect-video bg-slate-100 dark:bg-[#0d1117] flex items-center justify-center overflow-hidden relative">
        {p.imageUrl ? (
          <img
            src={p.imageUrl}
            alt={p.name}
            className="w-full h-full object-cover group-hover:scale-105 transition"
          />
        ) : (
          <span className="text-slate-300 dark:text-slate-600 text-sm">Нет фото</span>
        )}
        {p.isOnDiscount && (
          <span className="absolute top-3 right-3 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">
            -{p.discountPercent}%
          </span>
        )}
      </div>
      <div className="p-4 space-y-1.5">
        <h3 className="font-medium text-sm line-clamp-2 text-slate-900 dark:text-white">{p.name}</h3>
        {p.reviewCount > 0 && (
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Оценка: {p.averageRating} ({p.reviewCount})
          </div>
        )}
        <div className="flex items-baseline gap-2 pt-2">
          {p.isOnDiscount && (
            <span className="text-xs text-slate-400 dark:text-slate-500 line-through">
              {p.adjustedPrice.toFixed(0)}
            </span>
          )}
          <span className="font-semibold text-slate-900 dark:text-white">
            {p.finalPrice.toFixed(0)}{' '}
            <span className="text-xs text-slate-500 dark:text-slate-400">монет</span>
          </span>
        </div>
        <div className="text-xs text-slate-400 dark:text-slate-500 pt-1">
          {p.stock > 0 ? `В наличии: ${p.stock}` : 'Нет в наличии'}
        </div>
      </div>
    </Link>
  )
}