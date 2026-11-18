import { useState, useMemo } from 'react'
import { useAuth } from '../../store/auth'
import { useFetch } from '../../hooks/useFetch'
import {
  getAdminProducts,
  deleteProduct,
  hardDeleteProduct,
  writeOffStock,
  restockProduct,
  getCategories,
} from '../../api/shop'
import { notify } from '../../lib/notify'
import { confirmDialog } from '../../lib/confirm'
import ProductModal from '../../components/ProductModal'
import WriteOffModal from '../../components/WriteOffModal'
import ProductMovementsModal from '../../components/ProductMovementsModal'
import { IconPlus, IconSearch } from '../../components/Icons'
import type { Product } from '../../types'

type Tab = 'active' | 'hidden'

export default function ManageShopTab() {
  const user = useAuth((s) => s.user)!
  const products = useFetch(() => getAdminProducts(user.id), [user.id])
  const cats = useFetch(() => getCategories(), [])

  const [tab, setTab] = useState<Tab>('active')
  const [local, setLocal] = useState<Product[] | null>(null)
  const [query, setQuery] = useState('')
  const [creating, setCreating] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [restocking, setRestocking] = useState<Product | null>(null)
  const [writeOffProduct, setWriteOffProduct] = useState<Product | null>(null)
  const [movementsProduct, setMovementsProduct] = useState<Product | null>(null)

  const list = local ?? products.data ?? []
  const activeList = useMemo(() => list.filter((p) => p.isActive), [list])
  const hiddenList = useMemo(() => list.filter((p) => !p.isActive), [list])

  const displayed = useMemo(() => {
    const base = tab === 'active' ? activeList : hiddenList
    if (!query.trim()) return base
    const q = query.toLowerCase()
    return base.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.categoryName.toLowerCase().includes(q)
    )
  }, [tab, activeList, hiddenList, query])

  async function handleWriteOff(data: { quantity: number; reason: string; comment?: string }) {
    if (!writeOffProduct) return
    try {
      await writeOffStock(writeOffProduct.id, user.id, {
        quantity: data.quantity,
        reason: data.reason,
        comment: data.comment,
      })
      setLocal(
        list.map((p) =>
          p.id === writeOffProduct.id ? { ...p, stock: p.stock - data.quantity } : p
        )
      )
      notify.success(`Списано ${data.quantity} шт. · ${writeOffProduct.name}`)
      setWriteOffProduct(null)
    } catch (e) {
      notify.error(e)
    }
  }

  async function handleHide(p: Product) {
    const ok = await confirmDialog({
      title: 'Скрыть товар?',
      message: `Товар «${p.name}» будет скрыт из каталога.`,
      confirmLabel: 'Скрыть',
    })
    if (!ok) return
    try {
      await deleteProduct(p.id, user.id)
      setLocal(list.map((x) => (x.id === p.id ? { ...x, isActive: false } : x)))
      notify.success(`Товар скрыт · ${p.name}`)
    } catch (e) {
      notify.error(e)
    }
  }

  async function handleHardDelete(p: Product) {
    const ok = await confirmDialog({
      title: 'Удалить навсегда?',
      message: `Товар «${p.name}» будет полностью удалён. Отменить нельзя.`,
      confirmLabel: 'Удалить навсегда',
      danger: true,
    })
    if (!ok) return
    try {
      await hardDeleteProduct(p.id, user.id)
      setLocal(list.filter((x) => x.id !== p.id))
      notify.success(`Товар удалён · ${p.name}`)
    } catch (e) {
      notify.error(e)
    }
  }

  function handleRestockDone(productId: number, amount: number) {
    setLocal(
      list.map((p) => (p.id === productId ? { ...p, stock: p.stock + amount } : p))
    )
    notify.success(`Остаток пополнен на ${amount} шт.`)
    setRestocking(null)
  }

  function handleSaved() {
    notify.success(editing ? 'Товар обновлён' : 'Товар создан')
    setCreating(false)
    setEditing(null)
    setTimeout(() => window.location.reload(), 500)
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          Управление магазином
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Товары, остатки и видимость в каталоге
        </p>
      </div>

      {/* Tabs + search + create */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-[#0d1117]">
          <button
            onClick={() => setTab('active')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition ${
              tab === 'active'
                ? 'bg-white dark:bg-[#161b22] text-brand-700 dark:text-brand-400 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Активные
            <span className="text-xs px-1.5 py-0.5 rounded-full bg-slate-200 dark:bg-[#21262d] text-slate-600 dark:text-slate-400 font-semibold min-w-[20px] text-center">
              {activeList.length}
            </span>
          </button>
          <button
            onClick={() => setTab('hidden')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition ${
              tab === 'hidden'
                ? 'bg-white dark:bg-[#161b22] text-brand-700 dark:text-brand-400 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Скрытые
            {hiddenList.length > 0 && (
              <span className="text-xs px-1.5 py-0.5 rounded-full bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 font-semibold min-w-[20px] text-center">
                {hiddenList.length}
              </span>
            )}
          </button>
        </div>

        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            <IconSearch size={14} />
          </div>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск по названию или категории..."
            className="w-full border border-slate-300 dark:border-[#30363d] dark:bg-[#161b22] dark:text-white rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-brand-500"
          />
        </div>

        <button
          onClick={() => setCreating(true)}
          className="ml-auto bg-brand-600 hover:bg-brand-700 text-white rounded-lg px-4 py-2 text-sm font-medium inline-flex items-center gap-1.5 shadow-sm transition"
        >
          <IconPlus size={14} />
          Создать товар
        </button>
      </div>

      {products.loading && (
        <div className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-[#30363d] p-8 text-center text-slate-500">
          Загрузка...
        </div>
      )}

      {!products.loading && displayed.length === 0 && (
        <div className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-[#30363d] p-10 text-center">
          <div className="text-sm font-semibold text-slate-600 dark:text-slate-300">
            {query
              ? 'Ничего не нашли'
              : tab === 'active'
              ? 'Активных товаров нет'
              : 'Скрытых товаров нет'}
          </div>
          {!query && tab === 'active' && (
            <button
              onClick={() => setCreating(true)}
              className="mt-4 bg-brand-600 hover:bg-brand-700 text-white rounded-lg px-4 py-2 text-sm font-medium inline-flex items-center gap-1.5 transition"
            >
              <IconPlus size={14} />
              Создать первый товар
            </button>
          )}
        </div>
      )}

      <div className="space-y-2.5">
        {displayed.map((p) => (
          <div
            key={p.id}
            className={`bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-[#30363d] p-4 ${
              !p.isActive ? 'opacity-80' : ''
            }`}
          >
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-lg bg-slate-100 dark:bg-[#0d1117] shrink-0 overflow-hidden flex items-center justify-center">
                {p.imageUrl ? (
                  <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-slate-300 dark:text-slate-600 text-xs">—</span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                  <div className="font-semibold text-slate-900 dark:text-white truncate">
                    {p.name}
                  </div>
                  {p.isOnDiscount && (
                    <span className="text-[10px] text-red-600 dark:text-red-400 font-semibold">
                      −{p.discountPercent}%
                    </span>
                  )}
                  {!p.isActive && (
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">
                      Скрыт
                    </span>
                  )}
                </div>
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  {p.categoryName} · {p.finalPrice.toFixed(0)} монет · Остаток:{' '}
                  <span className={p.stock === 0 ? 'text-red-500 font-medium' : 'font-medium'}>
                    {p.stock}
                  </span>
                  {p.hasVariants && ` · ${p.variants.length} вар.`}
                </div>
              </div>
            </div>

            {/* Actions — текстовые, без иконок и рамок */}
            <div className="flex flex-wrap items-center gap-1 mt-3 pt-3 border-t border-slate-100 dark:border-[#30363d]">
              <button
                onClick={() => setEditing(p)}
                className="text-xs px-2.5 py-1 rounded-md text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-500/10 font-medium transition"
              >
                Изменить
              </button>
              <button
                onClick={() => setMovementsProduct(p)}
                className="text-xs px-2.5 py-1 rounded-md text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#21262d] transition"
              >
                История
              </button>
              {p.isActive ? (
                <>
                  <button
                    onClick={() => setRestocking(p)}
                    className="text-xs px-2.5 py-1 rounded-md text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#21262d] transition"
                  >
                    Пополнить
                  </button>
                  <button
                    onClick={() => setWriteOffProduct(p)}
                    className="text-xs px-2.5 py-1 rounded-md text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#21262d] transition"
                  >
                    Списать
                  </button>
                  <button
                    onClick={() => handleHide(p)}
                    className="text-xs px-2.5 py-1 rounded-md text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#21262d] transition"
                  >
                    Скрыть
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setEditing(p)}
                  className="text-xs px-2.5 py-1 rounded-md text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition"
                >
                  Восстановить
                </button>
              )}
              <button
                onClick={() => handleHardDelete(p)}
                className="ml-auto text-xs px-2.5 py-1 rounded-md text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition"
              >
                Удалить
              </button>
            </div>
          </div>
        ))}
      </div>

      {creating && (
        <ProductModal
          categories={cats.data ?? []}
          actorId={user.id}
          onClose={() => setCreating(false)}
          onSaved={handleSaved}
        />
      )}
      {editing && (
        <ProductModal
          product={editing}
          categories={cats.data ?? []}
          actorId={user.id}
          onClose={() => setEditing(null)}
          onSaved={handleSaved}
        />
      )}
      {restocking && (
        <RestockModal
          product={restocking}
          actorId={user.id}
          onClose={() => setRestocking(null)}
          onDone={(amount) => handleRestockDone(restocking.id, amount)}
        />
      )}
      {writeOffProduct && (
        <WriteOffModal
          productName={writeOffProduct.name}
          maxStock={writeOffProduct.stock}
          onClose={() => setWriteOffProduct(null)}
          onWriteOff={handleWriteOff}
        />
      )}
      {movementsProduct && (
        <ProductMovementsModal
          productId={movementsProduct.id}
          productName={movementsProduct.name}
          onClose={() => setMovementsProduct(null)}
        />
      )}
    </div>
  )
}

function RestockModal({
  product,
  actorId,
  onClose,
  onDone,
}: {
  product: Product
  actorId: number
  onClose: () => void
  onDone: (amount: number) => void
}) {
  const [amount, setAmount] = useState(10)
  const [variantId, setVariantId] = useState<number | null>(
    product.hasVariants ? product.variants[0]?.id ?? null : null
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (amount <= 0) {
      setError('Введите количество больше 0')
      return
    }
    setLoading(true)
    try {
      await restockProduct(product.id, actorId, amount, variantId ?? undefined)
      onDone(amount)
    } catch (e: any) {
      setError(e.response?.data || 'Не удалось пополнить')
      notify.error(e)
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
        className="bg-white dark:bg-[#161b22] rounded-xl w-full max-w-sm p-6 space-y-4"
      >
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Пополнить остаток
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{product.name}</p>
        </div>
        {error && (
          <div className="bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 text-sm p-3 rounded border border-red-200 dark:border-red-500/30">
            {error}
          </div>
        )}
        {product.hasVariants && (
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Вариант
            </label>
            <select
              value={variantId ?? ''}
              onChange={(e) => setVariantId(Number(e.target.value))}
              className="w-full border border-slate-300 dark:border-[#30363d] dark:bg-[#0d1117] dark:text-white rounded-md px-3 py-2 mt-1 text-sm"
            >
              {product.variants.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.size || '—'} / {v.color || '—'} (остаток: {v.stock})
                </option>
              ))}
            </select>
          </div>
        )}
        <div>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Сколько добавить?
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            min={1}
            className="w-full border border-slate-300 dark:border-[#30363d] dark:bg-[#0d1117] dark:text-white rounded-md px-3 py-2 mt-1 text-sm"
          />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-slate-600 dark:text-slate-300">
            Отмена
          </button>
          <button
            type="submit"
            disabled={loading || (product.hasVariants && !variantId)}
            className="bg-brand-600 hover:bg-brand-700 text-white rounded-md px-4 py-2 text-sm font-medium disabled:opacity-50"
          >
            {loading ? '...' : `Добавить +${amount}`}
          </button>
        </div>
      </form>
    </div>
  )
}