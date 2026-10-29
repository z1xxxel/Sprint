import type { Role } from '../types'

export type Permission =
  | 'EVENT_CREATE'
  | 'EVENT_EDIT_ANY'
  | 'EVENT_APPROVE'
  | 'EVENT_VIEW_ANY'
  | 'COIN_TRANSFER'
  | 'COIN_GRANT_SUBORDINATE'
  | 'COIN_GRANT_ANY'
  | 'CATALOG_VIEW'
  | 'CATALOG_MANAGE'
  | 'USER_MANAGE'
  | 'ROLE_ASSIGN'
  | 'ORDER_MANAGE'
  | 'TICKET_MANAGE'
  | 'TICKET_CREATE'
  | 'QUEST_MANAGE'
  | 'QUEST_PARTICIPATE'
  | 'NEWS_MANAGE'

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  EMPLOYEE: ['EVENT_CREATE', 'COIN_TRANSFER', 'TICKET_CREATE', 'CATALOG_VIEW'],
  ORGANIZER: [
    'EVENT_CREATE',
    'EVENT_EDIT_ANY',
    'COIN_TRANSFER',
    'CATALOG_VIEW',
  ],
  MANAGER: [
    'EVENT_CREATE',
    'COIN_TRANSFER',
    'COIN_GRANT_SUBORDINATE',
    'CATALOG_VIEW',
    'CATALOG_MANAGE',
    'ORDER_MANAGE',
    'QUEST_MANAGE',
    'QUEST_PARTICIPATE',
  ],
  SUPPORT: [
    'TICKET_MANAGE',
    'TICKET_CREATE',
    'COIN_TRANSFER',
    'CATALOG_VIEW',
    'QUEST_MANAGE',
    'QUEST_PARTICIPATE',
  ],
  HR: [
    'EVENT_APPROVE',
    'EVENT_EDIT_ANY',
    'EVENT_VIEW_ANY',
    'COIN_TRANSFER',
    'USER_MANAGE',
    'ORDER_MANAGE',
    'CATALOG_MANAGE',
    'CATALOG_VIEW',
    'QUEST_MANAGE',
    'QUEST_PARTICIPATE',
    'TICKET_CREATE',
    'NEWS_MANAGE',
  ],
  ADMIN: [
    'EVENT_CREATE',
    'EVENT_EDIT_ANY',
    'EVENT_APPROVE',
    'EVENT_VIEW_ANY',
    'COIN_TRANSFER',
    'COIN_GRANT_SUBORDINATE',
    'COIN_GRANT_ANY',
    'CATALOG_VIEW',
    'CATALOG_MANAGE',
    'USER_MANAGE',
    'ROLE_ASSIGN',
    'ORDER_MANAGE',
    'TICKET_MANAGE',
    'TICKET_CREATE',
    'QUEST_MANAGE',
    'QUEST_PARTICIPATE',
    'NEWS_MANAGE',
  ],
}

export function hasPermission(role: Role | undefined, perm: Permission): boolean {
  if (!role) return false
  return ROLE_PERMISSIONS[role]?.includes(perm) ?? false
}

export function hasAnyPermission(role: Role | undefined, perms: Permission[]): boolean {
  return perms.some((p) => hasPermission(role, p))
}

export const can = {
  manageCatalog: (role?: Role) => hasPermission(role, 'CATALOG_MANAGE'),
  manageOrders: (role?: Role) => hasPermission(role, 'ORDER_MANAGE'),
  manageQuests: (role?: Role) => hasPermission(role, 'QUEST_MANAGE'),
  approveEvents: (role?: Role) => hasPermission(role, 'EVENT_APPROVE'),
  manageUsers: (role?: Role) => hasPermission(role, 'USER_MANAGE'),
  assignRoles: (role?: Role) => hasPermission(role, 'ROLE_ASSIGN'),
  manageNews: (role?: Role) => hasPermission(role, 'NEWS_MANAGE'),
  manageTickets: (role?: Role) => hasPermission(role, 'TICKET_MANAGE'),
  grantCoins: (role?: Role) =>
    hasAnyPermission(role, ['COIN_GRANT_SUBORDINATE', 'COIN_GRANT_ANY']),
}