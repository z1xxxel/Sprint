// src/types/index.ts

export type Role = 'ADMIN' | 'HR' | 'MANAGER' | 'ORGANIZER' | 'SUPPORT' | 'EMPLOYEE'

export interface AuthUser {
  id: number
  name: string
  email: string
  role: Role
  avatarUrl?: string | null
}

// ==========================================
// === ТРАНЗАКЦИИ ===
// ==========================================
export interface RatingTx {
  id: number
  amount: number
  reason: string
  createdAt: string
}

export interface CoinTx {
  id: number
  fromUserId: number | null
  toUserId: number | null
  amount: number
  type: string
  comment: string
  tag: string | null
  isCancelled: boolean
  cancellationReason: string | null
  createdAt: string
}

// ==========================================
// === ПРОФИЛЬ ===
// ==========================================
export interface Profile {
  id: number
  name: string
  email: string
  role: Role
  balance: number
  currentRating: number
  lifetimeRating: number
  level: string
  currentPlace: number
  totalUsers: number
  departmentId: number | null
  departmentName: string
  departmentPlace: number | null
  organizedEventsCount: number
  participatedEventsCount: number
  avatarUrl: string | null
  recentRatingTransactions: RatingTx[]
  recentBalanceTransactions: CoinTx[]
  achievements: AchievementProfileDTO[]
}

// ==========================================
// === ПОЛЬЗОВАТЕЛИ ===
// ==========================================
export interface UserListItem {
  id: number
  name: string
  email: string
  role: Role
  currentRating: number
  lifetimeRating: number
  level: string
  balance: number
  isBlocked: boolean
  departmentId: number | null
  departmentName: string | null
}

// ==========================================
// === МАГАЗИН ===
// ==========================================
export interface Category {
  id: number
  name: string
  description: string | null
  imageUrl: string | null
  sortOrder: number
}

export interface ProductVariant {
  id: number
  size: string
  color: string
  stock: number
}

export interface Product {
  id: number
  name: string
  description: string | null
  basePrice: number
  adjustedPrice: number
  discountPercent: number | null
  finalPrice: number
  isOnDiscount: boolean
  discountValidUntil: string | null
  stock: number
  imageUrl: string | null
  categoryId: number | null
  categoryName: string
  averageRating: number
  reviewCount: number
  hasVariants: boolean
  variants: ProductVariant[]
  isActive: boolean
  images: string[]
}

export interface OrderResponse {
  id: number
  userId: number
  userName: string
  productId: number
  productName: string
  variantId: number | null
  variantSize: string | null
  variantColor: string | null
  quantity: number
  totalPrice: number
  status: string
  adminComment: string | null
  userComment: string | null
  createdAt: string
}

// ==========================================
// === ЧАТЫ ===
// ==========================================
export interface ChatSummary {
  chatId: number
  otherUserId: number
  otherUserName: string
  lastMessageText: string
  lastMessageAt: string
  unreadCount: number
}

export interface ChatMessage {
  id: number
  senderId: number
  senderName: string
  text: string
  attachmentUrl: string | null
  replyToId: number | null
  editedAt: string | null
  createdAt: string
  readAt: string | null
}

export interface ChatDetail {
  chatId: number
  otherUserId: number
  otherUserName: string
  messages: ChatMessage[]
}

// ==========================================
// === СОБЫТИЯ ===
// ==========================================
export type EventStatus = 'NEW' | 'ASSIGNED' | 'COMPLETED' | 'CANCELLED'

export interface EventDto {
  id: number
  organizerId: number
  organizerName: string
  fromTime: string
  toTime: string
  category: string
  nameEvent: string
  description: string | null
  eventPlace: string | null
  commentToAdmin: string | null
  eventStatus: EventStatus
  paidInCoins: boolean
  rewardCoins: number | null
  rewardRating: number | null
  rewardsGranted: boolean
}

export interface ParticipantDto {
  userId: number
  name: string
  email: string
}

// ==========================================
// === КВЕСТЫ ===
// ==========================================
export interface QuestListItem {
  questId: number
  title: string
  description: string | null
  rewardCoins: number
  rewardRating: number | null
  deadline: string | null
  isMandatory: boolean
  penaltyCoins: number | null
  penaltyRating: number | null
  myStatus: 'IN_PROGRESS' | 'PENDING_REVIEW' | 'COMPLETED' | 'REJECTED' | 'CANCELLED' | null
  adminComment: string | null
  isRepeatable: boolean        // <-- ДОБАВЛЕНО
  cooldownHours: number | null // <-- ДОБАВЛЕНО
  nextAvailableAt: string | null // <-- ДОБАВЛЕНО
}

// ==========================================
// === СЕЗОНЫ ===
// ==========================================
export interface LeaderboardEntry {
  place: number
  userId: number
  userName: string
  currentRating: number
  lifetimeRating: number
}

export interface SeasonResult {
  place: number
  userName: string
  finalRating: number
  rewardCoins: number
}

export interface DepartmentLeaderboardEntry {
  place: number
  departmentId: number
  departmentName: string
  totalRating: number
  memberCount: number
}

export interface DepartmentTopMember {
  placeInDepartment: number
  userName: string
  finalRating: number
  rewardCoins: number
}

export interface DepartmentResult {
  place: number
  departmentName: string
  totalRating: number
  memberCount: number
  rewardCoinsPerMember: number
  topMembers: DepartmentTopMember[]
}

export interface SeasonInfo {
  id: number
  name: string
  startDate: string
  endDate: string
  isActive: boolean
  currentLeaderboard: LeaderboardEntry[]
  previousSeasonResults: SeasonResult[]
  myDepartmentName: string
  myDepartmentPlace: number | null
  myDepartmentLeaderboard: LeaderboardEntry[]
  previousDepartmentResults: DepartmentResult[]
}

// ==========================================
// === ДОСТИЖЕНИЯ ===
// ==========================================
export type AchievementType = 'AUTOMATIC' | 'MANUAL'

export interface AchievementLevel {
  level: number
  title: string
  condition: string | null
  requiredProgress: number | null
  rewardCoins: number
  isEarned: boolean
  earnedAt: string | null
}

export interface AchievementProfileDTO {
  groupCode: string
  name: string
  description: string
  iconUrl: string
  isEarned: boolean
  levels: AchievementLevel[]
}

// ==========================================
// === АДМИН ===
// ==========================================
export type TicketStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'

export type QuestProgressStatus =
  | 'IN_PROGRESS'
  | 'PENDING_REVIEW'
  | 'COMPLETED'
  | 'REJECTED'
  | 'CANCELLED'

export interface AdminDashboard {
  totalUsers: number
  totalProducts: number
  totalCoinsInSystem: number
  pendingOrders: number
  pendingEvents: number
  pendingTickets: number
  pendingQuests: number
}

export interface SystemSetting {
  settingKey: string
  settingValue: string
  label?: string | null
  description?: string | null
  category?: string | null
}

export interface Treasury {
  id: number
  balance: number
  lastFundedAt: string | null
}

export interface AdminQuest {
  userQuestId: number
  questTitle: string
  userName: string
  status: QuestProgressStatus
  startedAt: string
  submittedAt: string | null
  completedAt: string | null
  adminComment: string | null
}

export interface Page<T> {
  content: T[]
  totalElements: number
  totalPages: number
  number: number
  size: number
  first: boolean
  last: boolean
}

export interface AdminTransaction {
  id: number
  fromUserId: number | null
  toUserId: number | null
  amount: number
  type: string
  comment: string | null
  tag: string | null
  isCancelled: boolean
  cancellationReason: string | null
  createdAt: string
}

export interface Department {
  id: number
  name: string
  description: string | null
}

// ==========================================
// === ЛОГИ КВЕСТОВ (админ) ===
// ==========================================
export interface AdminQuestLog {
  userQuestId: number
  questId: number
  questTitle: string
  userId: number
  userName: string
  status: 'IN_PROGRESS' | 'PENDING_REVIEW' | 'COMPLETED' | 'REJECTED' | 'CANCELLED'
  rewardCoins: number
  rewardRating: number | null
  penaltyCoins: number | null
  penaltyRating: number | null
  startedAt: string
  submittedAt: string | null
  completedAt: string | null
  adminComment: string | null
  creatorName: string | null
  questCreatedAt: string
}