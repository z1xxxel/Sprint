import { useState, useMemo } from 'react'
import { useAuth } from '../../store/auth'
import { useFetch } from '../../hooks/useFetch'
import {
  getAdminProducts,
  deleteProduct,
  hardDeleteProduct, // <-- ДОБАВЛЕНО
  writeOffStock,
  restockProduct,
  getCategories,
} from '../../api/shop'
import { notify } from '../../lib/notify'
import { confirmDialog } from '../../lib/confirm'
import ProductModal from '../../components/ProductModal'
import WriteOffModal from '../../components/WriteOffModal'
import ProductMovementsModal from '../../components/ProductMovementsModal'
import type { Product } from '../../types'

type Tab = 'active' | 'hidden'

export default function ManageShopTab() {
  const user = useAuth((s) => s.user)!
  const products = useFetch(() => getAdminProducts(user.id), [user.id])
  const cats = useFetch(() => getCategories(), [])

  const [tab, setTab] = useState<Tab>('active')
  const [local, setLocal] = useState<Product[] | null>(null)
  const [creating, setCreating] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [restocking, setRestocking] = useState<Product | null>(null)
  const [writeOffProduct, setWriteOffProduct] = useState<Product | null>(null)
  const [movementsProduct, setMovementsProduct] = useState<Product | null>(null)

  const list = local ?? products.data ?? []

  const activeList = useMemo(() => list.filter((p) => p.isActive), [list])
  const hiddenList = useMemo(() => list.filter((p) => !p.isActive), [list])
  const displayed = tab === 'active' ? activeList : hiddenList

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
      message: `Товар «${p.name}» будет перемещен во вкладку «Скрытые».`,
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
      message: `Товар «${p.name}» будет полностью удален из базы данных. Это действие нельзя отменить. Если на товар есть заказы, удаление не пройдет.`,
      confirmLabel: 'Удалить навсегда',
      danger: true,
    })
    if (!ok) return

    try {
      await hardDeleteProduct(p.id, user.id)
      setLocal(list.filter((x) => x.id !== p.id))
      notify.success(`Товар удален навсегда · ${p.name}`)
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
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="text-sm text-slate-500 dark:text-slate-400">
          Всего товаров: {list.length}
        </div>
        <button
          onClick={() => setCreating(true)}
          className="bg-brand-600 hover:bg-brand-700 text-white rounded-md px-4 py-2 text-sm font-medium transition"
        >
          + Создать товар
        </button>
      </div>

      {/* Вкладки */}
      <div className="border-b border-slate-200 dark:border-[#30363d]">
        <div className="flex gap-1 -mb-px">
          <button
            onClick={() => setTab('active')}
            className={`px-4 py-2.5 text-sm font-medium transition border-b-2 flex items-center gap-2 ${
              tab === 'active'
                ? 'border-brand-600 text-brand-700 dark:text-brand-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Активные
            {activeList.length > 0 && (
              <span className="text-xs bg-brand-100 dark:bg-brand-500/20 text-brand-700 dark:text-brand-400 px-1.5 py-0.5 rounded-full">
                {activeList.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setTab('hidden')}
            className={`px-4 py-2.5 text-sm font-medium transition border-b-2 flex items-center gap-2 ${
              tab === 'hidden'
                ? 'border-brand-600 text-brand-700 dark:text-brand-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Скрытые
            {hiddenList.length > 0 && (
              <span className="text-xs bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 px-1.5 py-0.5 rounded-full">
                {hiddenList.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {products.loading && <div className="text-slate-500">Загрузка...</div>}
      {products.error && <div className="text-red-600">{products.error}</div>}

      {!products.loading && displayed.length === 0 && (
        <div className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-[#30363d] p-8 sm:p-12 text-center">
          <div className="text-slate-400 dark:text-slate-500 text-sm">
            {tab === 'active' ? 'Активных товаров нет' : 'Скрытых товаров нет'}
          </div>
        </div>
      )}

      <div className="space-y-2">
        {displayed.map((p) => (
          <div
            key={p.id}
            className={`bg-white dark:bg-[#161b22] rounded-lg border border-slate-200 dark:border-[#30363d] p-4 flex flex-col sm:flex-row sm:items-center gap-3 transition ${
              !p.isActive ? 'opacity-60 bg-slate-50 dark:bg-[#0d1117]/50' : ''
            }`}
          >
            <div className="w-12 h-12 rounded-md bg-slate-100 dark:bg-[#0d1117] shrink-0 overflow-hidden flex items-center justify-center">
              {p.imageUrl ? (
                <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-slate-300 text-xs">—</span>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <div className="font-medium text-sm text-slate-900 dark:text-white truncate">
                  {p.name}
                </div>
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                {p.categoryName} · {p.finalPrice.toFixed(0)} монет · остаток{' '}
                <span className="font-medium">{p.stock}</span>
                {p.hasVariants && ` · ${p.variants.length} вар.`}
                {p.isOnDiscount && ` · −${p.discountPercent}%`}
              </div>
            </div>

            <div className="flex gap-1.5 flex-wrap">
              <button
                onClick={() => setMovementsProduct(p)}
                className="text-xs px-2.5 py-1.5 border border-slate-300 dark:border-[#30363d] rounded text-slate-700 dark:text-slate-300 hover:border-brand-500 transition"
              >
                История
              </button>
              <button
                onClick={() => setEditing(p)}
                className="text-xs px-2.5 py-1.5 border border-brand-400 dark:border-brand-500/50 text-brand-700 dark:text-brand-400 rounded hover:bg-brand-50 dark:hover:bg-brand-500/10 transition"
              >
                Изменить
              </button>
              
              {/* Кнопки, которые не нужны для скрытых товаров */}
              {p.isActive && (
                <>
                  <button
                    onClick={() => setRestocking(p)}
                    className="text-xs px-2.5 py-1.5 border border-slate-300 dark:border-[#30363d] rounded text-slate-700 dark:text-slate-300 hover:border-brand-500 transition"
                  >
                    Пополнить
                  </button>
                  <button
                    onClick={() => setWriteOffProduct(p)}
                    className="text-xs px-2.5 py-1.5 border border-slate-300 dark:border-[#30363d] rounded text-slate-700 dark:text-slate-300 hover:border-brand-500 transition"
                  >
                    Списать
                  </button>
                  <button
                    onClick={() => handleHide(p)}
                    className="text-xs px-2.5 py-1.5 border border-amber-300 dark:border-amber-500/30 rounded text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/10 transition"
                  >
                    Скрыть
                  </button>
                </>
              )}

              {/* Кнопка полного удаления (доступна всем в этой вкладке) */}
              <button
                onClick={() => handleHardDelete(p)}
                className="text-xs px-2.5 py-1.5 border border-red-300 dark:border-red-500/30 rounded text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition"
              >
                Удалить навсегда
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
      const msg = e.response?.data || 'Не удалось пополнить'
      setError(msg)
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
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {product.name}
          </p>
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
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm text-slate-600 dark:text-slate-300"
          >
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