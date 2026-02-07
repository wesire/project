/**
 * RBAC (Role-Based Access Control) utilities
 */

import { UserRole } from '../types'

/**
 * Role hierarchy (higher roles include permissions of lower roles)
 */
const roleHierarchy: Record<UserRole, number> = {
  [UserRole.ADMIN]: 5,
  [UserRole.PM]: 4,
  [UserRole.QS]: 3,
  [UserRole.SITE]: 2,
  [UserRole.VIEWER]: 1
}

/**
 * Check if user has required role
 */
export function hasRole(userRole: UserRole, requiredRole: UserRole): boolean {
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole]
}

/**
 * Check if user has any of the required roles
 */
export function hasAnyRole(userRole: UserRole, requiredRoles: UserRole[]): boolean {
  return requiredRoles.some(role => hasRole(userRole, role))
}

/**
 * Permission definitions for each role
 */
export const rolePermissions: Record<UserRole, string[]> = {
  [UserRole.ADMIN]: [
    'user:create',
    'user:read',
    'user:update',
    'user:delete',
    'project:create',
    'project:read',
    'project:update',
    'project:delete',
    'risk:create',
    'risk:read',
    'risk:update',
    'risk:delete',
    'task:create',
    'task:read',
    'task:update',
    'task:delete',
    'settings:manage'
  ],
  [UserRole.PM]: [
    'project:create',
    'project:read',
    'project:update',
    'risk:create',
    'risk:read',
    'risk:update',
    'task:create',
    'task:read',
    'task:update',
    'task:delete',
    'resource:allocate'
  ],
  [UserRole.QS]: [
    'project:read',
    'risk:read',
    'task:read',
    'cashflow:create',
    'cashflow:read',
    'cashflow:update',
    'procurement:create',
    'procurement:read',
    'procurement:update'
  ],
  [UserRole.SITE]: [
    'project:read',
    'task:read',
    'task:update',
    'issue:create',
    'issue:read',
    'issue:update',
    'rfi:create',
    'rfi:read'
  ],
  [UserRole.VIEWER]: [
    'project:read',
    'risk:read',
    'task:read',
    'issue:read',
    'rfi:read'
  ]
}

/**
 * Check if user has specific permission
 */
export function hasPermission(userRole: UserRole, permission: string): boolean {
  const permissions = rolePermissions[userRole] || []
  
  // Admin has all permissions
  if (userRole === UserRole.ADMIN) {
    return true
  }
  
  return permissions.includes(permission)
}

/**
 * Get role display name
 */
export function getRoleDisplayName(role: UserRole): string {
  const displayNames: Record<UserRole, string> = {
    [UserRole.ADMIN]: 'Administrator',
    [UserRole.PM]: 'Project Manager',
    [UserRole.QS]: 'Quantity Surveyor',
    [UserRole.SITE]: 'Site Engineer',
    [UserRole.VIEWER]: 'Viewer'
  }
  return displayNames[role] || role
}
