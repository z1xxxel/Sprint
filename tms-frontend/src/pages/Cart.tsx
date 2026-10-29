import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../store/auth'
import { useCart } from '../store/cart'
import { useFetch } from '../hooks/useFetch'
import { purchaseBulk } from '../api/shop'
import { getProfile } from '../api/users'
import { notify } from '../lib/notify'
import { confirmDialog } from '../lib/confirm'
import { IconTrash, IconPlus, IconMinus } from '../components/Icons'

export default function Cart() {
  const user = useAuth((s) => s.user)!
  const nav = useNavigate()
  const { items, remove, updateQty, clear, total } = useCart()
  const profile = useFetch(() => getProfile(user.id), [user.id])

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [checkoutComment, setCheckoutComment] = useState('')

  async function handleCheckout() {
    if (items.length === 0) return
    setError('')
    setLoading(true)
    try {
      await purchaseBulk(
        items.map((i) => ({
          userId: user.id,
          productId: i.productId,
          quantity: i.quantity,
          variantId: i.variantId,
        })),
        checkoutComment
      )
      clear()
      setSuccess(true)
      notify.success('Заказ оформлен', 'Проверьте «Мои заказы»')
      setTimeout(() => nav('/orders'), 1500)
    } catch (e: any) {
      const msg = e.response?.data || 'Не удалось оформить заказ'
      setError(msg)
      notify.error(e)
    } finally {
      setLoading(false)
    }
  }

  async function handleRemove(productId: number, variantId: number | null, name: string) {
    const ok = await confirmDialog({
      title: 'Удалить из корзины?',
      message: `«${name}» будет удалён из корзины`,
      confirmLabel: 'Удалить',
      danger: true,
    })
    if (!ok) return
    remove(productId, variantId)
    notify.info('Товар удалён из корзины')
  }

  async function handleClear() {
    const ok = await confirmDialog({
      title: 'Очистить корзину?',
      message: 'Все товары будут удалены из корзины',
      confirmLabel: 'Очистить',
      danger: true,
    })
    if (!ok) return
    clear()
    notify.info('Корзина очищена')
  }

  if (success) {
    return (
      <div className="bg-brand-50 dark:bg-brand-500/10 border border-brand-200 dark:border-brand-500/30 rounded-xl p-8 text-center">
        <div className="text-lg font-semibold text-brand-700 dark:text-brand-400">Заказ оформлен!</div>
        <div className="text-sm text-slate-600 dark:text-slate-300 mt-1">Перенаправляем на страницу заказов...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white tracking-tight">Корзина</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{items.length === 0 ? 'Пусто' : `Товаров: ${items.length}`}</p>
        </div>
        {items.length > 0 && (
          <button onClick={handleClear} className="text-sm text-red-600 dark:text-red-400 hover:underline">Очистить</button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-[#30363d] p-8 sm:p-12 text-center">
          <div className="text-slate-400 dark:text-slate-500 text-sm mb-4">Корзина пуста</div>
          <Link to="/catalog" className="inline-block bg-brand-600 hover:bg-brand-700 text-white rounded-md px-4 py-2 text-sm font-medium transition">Перейти в магазин</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-3">
            {items.map((item) => (
              <div key={`${item.productId}-${item.variantId ?? 'none'}`} className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-[#30363d] p-4 flex gap-4">
                <div className="w-20 h-20 rounded-lg bg-slate-100 dark:bg-[#0d1117] shrink-0 overflow-hidden flex items-center justify-center">
                  {item.imageUrl ? <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" /> : <span className="text-slate-300 dark:text-slate-600 text-xs">—</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-slate-900 dark:text-white text-sm truncate">{item.name}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {item.size && <span>Размер: {item.size}</span>}
                    {item.size && item.color && ' · '}
                    {item.color && <span>Цвет: {item.color}</span>}
                  </div>
                  <div className="text-sm font-semibold text-slate-900 dark:text-white mt-1">{item.price.toFixed(0)} монет</div>
                </div>
                <div className="flex flex-col items-end justify-between shrink-0">
                  <button onClick={() => handleRemove(item.productId, item.variantId, item.name)} className="text-slate-400 hover:text-red-500 transition p-1" title="Удалить">
                    <IconTrash size={16} />
                  </button>
                  <div className="flex items-center gap-1">
                    <button onClick={() => updateQty(item.productId, item.variantId, item.quantity - 1)} disabled={item.quantity <= 1} className="w-7 h-7 rounded-md border border-slate-300 dark:border-[#30363d] text-slate-600 dark:text-slate-300 hover:border-brand-500 disabled:opacity-30 flex items-center justify-center"><IconMinus size={12} /></button>
                    <span className="w-8 text-center text-sm font-medium text-slate-900 dark:text-white">{item.quantity}</span>
                    <button onClick={() => updateQty(item.productId, item.variantId, item.quantity + 1)} disabled={item.quantity >= item.maxStock} className="w-7 h-7 rounded-md border border-slate-300 dark:border-[#30363d] text-slate-600 dark:text-slate-300 hover:border-brand-500 disabled:opacity-30 flex items-center justify-center"><IconPlus size={12} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-[#30363d] p-5 sticky top-20">
              <div className="flex justify-between text-sm mb-3">
                <span className="text-slate-500 dark:text-slate-400">Товаров</span>
                <span className="font-medium text-slate-900 dark:text-white">{items.length}</span>
              </div>
              <div className="flex justify-between text-sm mb-4 pb-4 border-b border-slate-200 dark:border-[#30363d]">
                <span className="text-slate-500 dark:text-slate-400">Сумма</span>
                <span className="font-medium text-slate-900 dark:text-white">{total().toFixed(0)} монет</span>
              </div>

              {profile.data && (
                <div className="flex justify-between text-sm mb-4">
                  <span className="text-slate-500 dark:text-slate-400">Ваш баланс</span>
                  <span className={`font-medium ${profile.data.balance >= total() ? 'text-slate-900 dark:text-white' : 'text-red-600 dark:text-red-400'}`}>
                    {profile.data.balance.toFixed(0)} монет
                  </span>
                </div>
              )}

              <div className="mb-4">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">Комментарий к заказу</label>
                <textarea
                  value={checkoutComment}
                  onChange={(e) => setCheckoutComment(e.target.value)}
                  placeholder="Например: нужен размер M, заберу в офисе на 4 этаже"
                  rows={2}
                  className="w-full border border-slate-300 dark:border-[#30363d] dark:bg-[#0d1117] dark:text-white rounded-md px-3 py-2 text-sm resize-none focus:outline-none focus:border-brand-500"
                />
              </div>

              {error && (
                <div className="bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 text-xs p-2 rounded mb-3 border border-red-100 dark:border-red-500/20">{error}</div>
              )}

              <button onClick={handleCheckout} disabled={loading} className="w-full bg-brand-600 hover:bg-brand-700 text-white rounded-md py-2.5 font-medium text-sm disabled:opacity-50 transition">
                {loading ? 'Оформление...' : `Оформить (${total().toFixed(0)} монет)`}
              </button>

              {profile.data && profile.data.balance < total() && (
                <p className="text-xs text-red-600 dark:text-red-400 mt-2 text-center">Недостаточно монет</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}