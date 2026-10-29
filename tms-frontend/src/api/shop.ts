import { api } from './client'
import type { Category, Product, OrderResponse } from '../types'

interface Page<T> {
  content: T[]
  totalElements: number
  totalPages: number
  last: boolean
}

// --- Категории и товары ---
export const getCategories = () => api.get<Category[]>('/shop/categories').then((r) => r.data)

export const createCategory = (actorId: number, data: { name: string; description?: string; imageUrl?: string; sortOrder?: number }) =>
  api.post<Category>('/shop/categories', data, { params: { actorId } }).then((r) => r.data)

export const updateCategory = (
  categoryId: number,
  actorId: number,
  data: { name?: string; description?: string; imageUrl?: string; sortOrder?: number }
) =>
  api
    .put<Category>(`/shop/categories/${categoryId}`, data, { params: { actorId } })
    .then((r) => r.data)

export const deleteCategory = (categoryId: number, actorId: number) =>
  api.delete(`/shop/categories/${categoryId}`, { params: { actorId } }).then((r) => r.data)

export const getProducts = () => api.get<Product[]>('/shop/products').then((r) => r.data)

export const getAdminProducts = (actorId: number) =>
  api.get<Product[]>('/shop/admin/products', { params: { actorId } }).then((r) => r.data)

export const searchProducts = (params: {
  query?: string
  categoryId?: number
  minPrice?: number
  maxPrice?: number
  sortBy?: string
  sortDir?: string
}) => api.get<Product[]>('/shop/products/search', { params }).then((r) => r.data)

export const createProduct = (actorId: number, data: any) =>
  api.post<Product>('/shop/products', data, { params: { actorId } }).then((r) => r.data)

export const updateProduct = (id: number, actorId: number, data: any) =>
  api.put<Product>(`/shop/products/${id}`, data, { params: { actorId } }).then((r) => r.data)

export const deleteProduct = (id: number, actorId: number) =>
  api.delete(`/shop/products/${id}`, { params: { actorId } }).then((r) => r.data)

export const hardDeleteProduct = (id: number, actorId: number) =>
  api.delete(`/shop/products/${id}/hard`, { params: { actorId } }).then((r) => r.data)

// --- Скидки ---
export const createDiscount = (productId: number, actorId: number, data: { percent: number; validFrom: string; validTo: string }) =>
  api.post(`/shop/products/${productId}/discount`, data, { params: { actorId } }).then((r) => r.data)

export const deleteDiscount = (productId: number, actorId: number) =>
  api.delete(`/shop/products/${productId}/discount`, { params: { actorId } }).then((r) => r.data)

// --- Списание стока ---
export const writeOffStock = (productId: number, actorId: number, data: { quantity: number; reason: string; recipientId?: number; comment?: string }) =>
  api.post(`/shop/products/${productId}/write-off`, data, { params: { actorId } }).then((r) => r.data)

// --- Логи ---
export const getAuditLogs = (actorId: number, page = 0, size = 50) =>
  api.get<Page<any>>('/shop/audit-logs', { params: { actorId, page, size } }).then((r) => r.data)

// --- Покупка ---
export const purchaseProduct = (userId: number, productId: number, quantity = 1, variantId?: number, comment?: string) =>
  api.post<OrderResponse>('/shop/purchase', { userId, productId, quantity, variantId }, { params: { comment } }).then((r) => r.data)

export const purchaseBulk = (items: { userId: number; productId: number; quantity: number; variantId: number | null }[], comment?: string) =>
  api.post<OrderResponse[]>('/shop/purchase-bulk', items, { params: { comment } }).then((r) => r.data)

// --- Заказы ---
export const getUserOrders = (userId: number) =>
  api.get<OrderResponse[]>(`/shop/orders/${userId}`).then((r) => r.data)

export const getPendingOrders = (actorId: number) =>
  api.get<OrderResponse[]>('/shop/orders/pending', { params: { actorId } }).then((r) => r.data)

export const approveOrder = (orderId: number, actorId: number, comment?: string) =>
  api.put<OrderResponse>(`/shop/orders/${orderId}/approve`, null, { params: { actorId, comment } }).then((r) => r.data)

export const rejectOrder = (orderId: number, actorId: number, reason: string) =>
  api.put<OrderResponse>(`/shop/orders/${orderId}/reject`, null, { params: { actorId, reason } }).then((r) => r.data)

export const completeOrder = (orderId: number, actorId: number) =>
  api.put<OrderResponse>(`/shop/orders/${orderId}/complete`, null, { params: { actorId } }).then((r) => r.data)

export const getAllOrders = (actorId: number) =>
  api.get<OrderResponse[]>('/shop/orders/all', { params: { actorId } }).then((r) => r.data)

// --- Избранное ---
export const getFavorites = (userId: number) =>
  api.get<Product[]>('/shop/favorites', { params: { userId } }).then((r) => r.data)

export const addFavorite = (userId: number, productId: number) =>
  api.post(`/shop/favorites/${productId}`, null, { params: { userId } })

export const removeFavorite = (userId: number, productId: number) =>
  api.delete(`/shop/favorites/${productId}`, { params: { userId } })

// --- Отзывы ---
export const getReviews = (productId: number) =>
  api.get<{ id: number; userName: string; rating: number; comment: string; createdAt: string }[]>(
    `/shop/products/${productId}/reviews`
  ).then((r) => r.data)

export const addReview = (productId: number, userId: number, rating: number, comment: string) =>
  api.post(`/shop/products/${productId}/reviews`, { userId, rating, comment }).then((r) => r.data)

export const getProductsByCategory = (categoryId: number) =>
  api.get<Product[]>(`/shop/categories/${categoryId}/products`).then((r) => r.data)

export const restockProduct = (
  productId: number,
  actorId: number,
  amount: number,
  variantId?: number
) =>
  api
    .post(
      `/shop/products/${productId}/restock`,
      { amount, variantId },
      { params: { actorId } }
    )
    .then((r) => r.data)

export const getProductById = (id: number) =>
  api.get<Product>(`/shop/products/${id}`).then((r) => r.data)

export interface ProductMovement {
  id: number
  action: string
  actorName: string
  quantityDelta: number | null
  details: string
  createdAt: string
}

export const getProductMovements = (productId: number, actorId: number) =>
  api
    .get<ProductMovement[]>(`/shop/products/${productId}/movements`, { params: { actorId } })
    .then((r) => r.data)