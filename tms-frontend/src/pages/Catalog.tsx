import { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../store/auth'
import { useFetch } from '../hooks/useFetch'
import { getCategories, searchProducts, getProducts } from '../api/shop'
import CategoryModal from '../components/CategoryModal'
import { can } from '../lib/permissions'
import { IconX, IconSearch } from '../components/Icons'
import type { Product, Category } from '../types'

const CATEGORY_GRADIENTS = [
  'from-emerald-400 to-teal-600',
  'from-amber-400 to-orange-600',
  'from-blue-400 to-indigo-600',
  'from-purple-400 to-pink-600',
  'from-rose-400 to-red-600',
  'from-cyan-400 to-sky-600',
]

const SORT_OPTIONS = [
  { value: 'name-asc', label: 'Название · А→Я', sortBy: 'name', sortDir: 'asc' },
  { value: 'name-desc', label: 'Название · Я→А', sortBy: 'name', sortDir: 'desc' },
  { value: 'price-asc', label: 'Цена · сначала дешёвые', sortBy: 'price', sortDir: 'asc' },
  { value: 'price-desc', label: 'Цена · сначала дорогие', sortBy: 'price', sortDir: 'desc' },
]

export default function Catalog() {
  const user = useAuth((s) => s.user)!
  const navigate = useNavigate()
  const canManage = can.manageCatalog(user.role)

  const [query, setQuery] = useState('')
  const [sortValue, setSortValue] = useState('name-asc')
  const [categoryId, setCategoryId] = useState<number | null>(null)
  const [minPrice, setMinPrice] = useState<string>('')
  const [maxPrice, setMaxPrice] = useState<string>('')
  const [onlyInStock, setOnlyInStock] = useState(false)
  const [filtersOpen, setFiltersOpen] = useState(false)

  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [creatingCategory, setCreatingCategory] = useState(false)

  const categories = useFetch(() => getCategories(), [])
  const allProducts = useFetch(() => getProducts(), [])

  const counts = useMemo(() => {
    const m: Record<number, number> = {}
    allProducts.data?.forEach((p) => {
      if (p.categoryId) m[p.categoryId] = (m[p.categoryId] || 0) + 1
    })
    return m
  }, [allProducts.data])

  const activeFiltersCount = useMemo(() => {
    let n = 0
    if (categoryId) n++
    if (minPrice !== '') n++
    if (maxPrice !== '') n++
    if (onlyInStock) n++
    return n
  }, [categoryId, minPrice, maxPrice, onlyInStock])

  const sortOption = SORT_OPTIONS.find((o) => o.value === sortValue) ?? SORT_OPTIONS[0]

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    const min = minPrice !== '' ? Number(minPrice) : undefined
    const max = maxPrice !== '' ? Number(maxPrice) : undefined

    // Валидация диапазона
    if (min !== undefined && max !== undefined && min > max) {
      setError('Минимальная цена больше максимальной')
      setProducts([])
      setLoading(false)
      return
    }

    searchProducts({
      query: query.trim() || undefined,
      categoryId: categoryId ?? undefined,
      minPrice: min,
      maxPrice: max,
      sortBy: sortOption.sortBy,
      sortDir: sortOption.sortDir,
    })
      .then((d) => {
        if (cancelled) return
        const filtered = onlyInStock ? d.filter((p) => p.stock > 0) : d
        setProducts(filtered)
      })
      .catch((e) => !cancelled && setError(e.response?.data || 'Ошибка загрузки'))
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [query, sortValue, categoryId, minPrice, maxPrice, onlyInStock, sortOption.sortBy, sortOption.sortDir])

  function resetFilters() {
    setQuery('')
    setCategoryId(null)
    setMinPrice('')
    setMaxPrice('')
    setOnlyInStock(false)
    setSortValue('name-asc')
  }

  function refresh() {
    window.location.reload()
  }

  return (
    <div className="space-y-8">
      {/* Заголовок */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white tracking-tight">
            Магазин
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Трать заработанные монеты на награды
          </p>
        </div>
        {canManage && (
          <button
            onClick={() => setCreatingCategory(true)}
            className="bg-brand-600 hover:bg-brand-700 text-white rounded-md px-4 py-2 text-sm font-medium transition"
          >
            + Категория
          </button>
        )}
      </div>

      {/* Категории */}
      {categories.data && categories.data.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
            Категории
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {categories.data.map((c, i) => (
              <CategoryTile
                key={c.id}
                category={c}
                count={counts[c.id] || 0}
                gradient={CATEGORY_GRADIENTS[i % CATEGORY_GRADIENTS.length]}
                onClick={() => navigate(`/catalog/category/${c.id}`)}
                canManage={canManage}
                onEdit={() => setEditingCategory(c)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Товары + фильтры */}
      <div>
        <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
          <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Все товары
          </h2>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {!loading && !error && `Найдено: ${products.length}`}
          </div>
        </div>

        {/* Основная строка фильтров */}
        <div className="flex flex-col sm:flex-row gap-2 mb-3">
          <div className="relative flex-1">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              <IconSearch size={16} />
            </div>
            <input
              type="text"
              placeholder="Поиск товаров..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full border border-slate-300 dark:border-[#30363d] dark:bg-[#161b22] dark:text-white rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-brand-500"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900 dark:hover:text-white p-1"
                title="Очистить"
              >
                <IconX size={14} />
              </button>
            )}
          </div>

          <select
            value={sortValue}
            onChange={(e) => setSortValue(e.target.value)}
            className="border border-slate-300 dark:border-[#30363d] dark:bg-[#161b22] dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-500 cursor-pointer"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>

          <button
            onClick={() => setFiltersOpen((v) => !v)}
            className={`relative border rounded-lg px-4 py-2 text-sm font-medium transition inline-flex items-center gap-2 ${
              filtersOpen || activeFiltersCount > 0
                ? 'border-brand-500 text-brand-700 dark:text-brand-400 bg-brand-50 dark:bg-brand-500/10'
                : 'border-slate-300 dark:border-[#30363d] text-slate-700 dark:text-slate-300 hover:border-brand-500'
            }`}
          >
            Фильтры
            {activeFiltersCount > 0 && (
              <span className="bg-brand-600 text-white text-[10px] rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`transition-transform ${filtersOpen ? 'rotate-180' : ''}`}
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>
        </div>

        {/* Раскрывающаяся панель фильтров */}
        {filtersOpen && (
          <div className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-[#30363d] p-4 mb-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Категория */}
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Категория
                </label>
                <select
                  value={categoryId ?? ''}
                  onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : null)}
                  className="w-full border border-slate-300 dark:border-[#30363d] dark:bg-[#0d1117] dark:text-white rounded-md px-3 py-2 mt-1 text-sm focus:outline-none focus:border-brand-500"
                >
                  <option value="">Все категории</option>
                  {categories.data?.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {counts[c.id] ? `(${counts[c.id]})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Цена */}
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Цена, монет
                </label>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="number"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    placeholder="от"
                    min={0}
                    className="flex-1 border border-slate-300 dark:border-[#30363d] dark:bg-[#0d1117] dark:text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:border-brand-500"
                  />
                  <span className="text-slate-400">—</span>
                  <input
                    type="number"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    placeholder="до"
                    min={0}
                    className="flex-1 border border-slate-300 dark:border-[#30363d] dark:bg-[#0d1117] dark:text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 flex-wrap pt-3 border-t border-slate-100 dark:border-[#30363d]">
              <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={onlyInStock}
                  onChange={(e) => setOnlyInStock(e.target.checked)}
                  className="rounded"
                />
                Только в наличии
              </label>

              <button
                onClick={resetFilters}
                disabled={activeFiltersCount === 0 && !query}
                className="text-sm text-red-600 dark:text-red-400 hover:underline disabled:opacity-40 disabled:cursor-not-allowed disabled:no-underline"
              >
                Сбросить все
              </button>
            </div>
          </div>
        )}

        {/* Результаты */}
        {loading && <div className="text-slate-500">Загрузка...</div>}
        {error && <div className="text-red-600">{error}</div>}
        {!loading && !error && products.length === 0 && (
          <div className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-[#30363d] p-8 sm:p-12 text-center">
            <div className="text-slate-400 dark:text-slate-500 text-sm">
              Ничего не найдено. Попробуйте изменить фильтры.
            </div>
            {(activeFiltersCount > 0 || query) && (
              <button
                onClick={resetFilters}
                className="mt-3 text-sm text-brand-600 dark:text-brand-400 hover:underline"
              >
                Сбросить фильтры
              </button>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>

      {creatingCategory && (
        <CategoryModal
          actorId={user.id}
          onClose={() => setCreatingCategory(false)}
          onSaved={() => {
            setCreatingCategory(false)
            refresh()
          }}
        />
      )}

      {editingCategory && (
        <CategoryModal
          category={editingCategory}
          actorId={user.id}
          onClose={() => setEditingCategory(null)}
          onSaved={() => {
            setEditingCategory(null)
            refresh()
          }}
        />
      )}
    </div>
  )
}

function CategoryTile({
  category,
  count,
  gradient,
  onClick,
  canManage,
  onEdit,
}: {
  category: Category
  count: number
  gradient: string
  onClick: () => void
  canManage: boolean
  onEdit: () => void
}) {
  return (
    <div className="group relative rounded-xl border border-slate-200 dark:border-[#30363d] bg-white dark:bg-[#161b22] hover:border-brand-400 dark:hover:border-brand-500/50 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 overflow-hidden">
      <button onClick={onClick} className="w-full text-left">
        <div
          className={`aspect-[4/3] bg-gradient-to-br ${gradient} flex items-center justify-center relative overflow-hidden`}
        >
          {category.imageUrl ? (
            <img
              src={category.imageUrl}
              alt={category.name}
              className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
            />
          ) : (
            <div className="text-white text-4xl font-bold opacity-80 group-hover:scale-110 transition-transform">
              {category.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div className="p-3 sm:p-4">
          <div className="font-semibold text-slate-900 dark:text-white text-sm truncate">
            {category.name}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {count} {count === 1 ? 'товар' : count < 5 ? 'товара' : 'товаров'}
          </div>
        </div>
      </button>

      {canManage && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            onEdit()
          }}
          title="Редактировать категорию"
          className="absolute top-2 right-2 z-10 px-2.5 py-1 rounded-md bg-white/90 dark:bg-[#0d1117]/90 text-slate-700 dark:text-slate-200 shadow hover:bg-white dark:hover:bg-[#161b22] text-xs font-medium transition"
        >
          Ред.
        </button>
      )}
    </div>
  )
}

function ProductCard({ product: p }: { product: Product }) {
  return (
    <Link
      to={`/catalog/${p.id}`}
      className="bg-white dark:bg-[#161b22] rounded-lg border border-slate-200 dark:border-[#30363d] overflow-hidden hover:border-brand-400 dark:hover:border-brand-500/50 hover:shadow-sm transition group"
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
        {p.stock === 0 && (
          <span className="absolute inset-0 bg-black/40 flex items-center justify-center text-white text-sm font-medium">
            Нет в наличии
          </span>
        )}
      </div>
      <div className="p-4 space-y-1.5">
        <h3 className="font-medium text-sm line-clamp-2 text-slate-900 dark:text-white">{p.name}</h3>
        <div className="text-xs text-slate-500 dark:text-slate-400">{p.categoryName}</div>
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