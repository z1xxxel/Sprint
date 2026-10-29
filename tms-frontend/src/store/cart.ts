import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
  productId: number
  variantId: number | null
  name: string
  imageUrl: string | null
  size: string | null
  color: string | null
  price: number
  quantity: number
  maxStock: number
}

interface CartState {
  items: CartItem[]
  add: (item: Omit<CartItem, 'quantity'>, qty?: number) => void
  remove: (productId: number, variantId: number | null) => void
  updateQty: (productId: number, variantId: number | null, qty: number) => void
  clear: () => void
  count: () => number
  total: () => number
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      add: (item, qty = 1) => {
        set((state) => {
          const idx = state.items.findIndex(
            (i) => i.productId === item.productId && i.variantId === item.variantId
          )
          if (idx >= 0) {
            const existing = state.items[idx]
            const newQty = Math.min(existing.quantity + qty, existing.maxStock)
            const copy = [...state.items]
            copy[idx] = { ...existing, quantity: newQty }
            return { items: copy }
          }
          return { items: [...state.items, { ...item, quantity: Math.min(qty, item.maxStock) }] }
        })
      },
      remove: (productId, variantId) => {
        set((state) => ({
          items: state.items.filter(
            (i) => !(i.productId === productId && i.variantId === variantId)
          ),
        }))
      },
      updateQty: (productId, variantId, qty) => {
        set((state) => ({
          items: state.items.map((i) =>
            i.productId === productId && i.variantId === variantId
              ? { ...i, quantity: Math.max(1, Math.min(qty, i.maxStock)) }
              : i
          ),
        }))
      },
      clear: () => set({ items: [] }),
      count: () => get().items.reduce((s, i) => s + i.quantity, 0),
      total: () => get().items.reduce((s, i) => s + i.price * i.quantity, 0),
    }),
    { name: 'cart' }
  )
)