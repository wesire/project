/**
 * Project-scoped permission utilities
 */

import { prisma } from './prisma'
import { UserRole } from './types'
import { hasPermission } from './rbac'
import { AuthorizationError } from './errors'

/**
 * Check if user is a member of a project
 */
export async function isProjectMember(
  userId: string,
  projectId: string
): Promise<boolean> {
  const member = await prisma.projectMember.findUnique({
    where: {
      projectId_userId: {
        projectId,
        userId
      }
    }
  })
  
  return !!member
}

/**
 * Check if user has access to a project
 * Admins and PMs have access to all projects
 * Other users must be project members
 */
export async function hasProjectAccess(
  userId: string,
  userRole: UserRole,
  projectId: string
): Promise<boolean> {
  // Admins and PMs have access to all projects
  if (userRole === UserRole.ADMIN || userRole === UserRole.PM) {
    return true
  }
  
  // Check if user is a project member
  return await isProjectMember(userId, projectId)
}

/**
 * Require project access for a user
 * Throws AuthorizationError if user doesn't have access
 */
export async function requireProjectAccess(
  userId: string,
  userRole: UserRole,
  projectId: string,
  action?: string
): Promise<void> {
  const hasAccess = await hasProjectAccess(userId, userRole, projectId)
  
  if (!hasAccess) {
    throw new AuthorizationError(
      action
        ? `You don't have access to ${action} for this project`
        : 'You don\'t have access to this project'
    )
  }
}

/**
 * Check if user can perform an action on project resource
 */
export async function canPerformProjectAction(
  userId: string,
  userRole: UserRole,
  projectId: string,
  permission: string
): Promise<boolean> {
  // Check base permission
  if (!hasPermission(userRole, permission)) {
    return false
  }
  
  // Check project access
  return await hasProjectAccess(userId, userRole, projectId)
}

/**
 * Require project action permission
 */
export async function requireProjectPermission(
  userId: string,
  userRole: UserRole,
  projectId: string,
  permission: string
): Promise<void> {
  // Check base permission first
  if (!hasPermission(userRole, permission)) {
    throw new AuthorizationError(`You don't have permission to: ${permission}`)
  }
  
  // Check project access
  await requireProjectAccess(userId, userRole, projectId, permission)
}

/**
 * Get accessible project IDs for a user
 * Returns all project IDs if user is Admin/PM, otherwise only their projects
 */
export async function getAccessibleProjectIds(
  userId: string,
  userRole: UserRole
): Promise<string[] | null> {
  // Admins and PMs have access to all projects
  if (userRole === UserRole.ADMIN || userRole === UserRole.PM) {
    return null // null means all projects
  }
  
  // Get projects user is a member of
  const memberships = await prisma.projectMember.findMany({
    where: { userId },
    select: { projectId: true }
  })
  
  return memberships.map(m => m.projectId)
}

/**
 * Filter where clause to include only accessible projects
 */
export async function filterByProjectAccess(
  userId: string,
  userRole: UserRole,
  baseWhere: Record<string, unknown> = {}
): Promise<Record<string, unknown>> {
  const accessibleProjectIds = await getAccessibleProjectIds(userId, userRole)
  
  // If null, user has access to all projects
  if (accessibleProjectIds === null) {
    return baseWhere
  }
  
  // If empty array, user has no project access
  if (accessibleProjectIds.length === 0) {
    return { ...baseWhere, id: 'never-match' }
  }
  
  // Add projectId filter
  return {
    ...baseWhere,
    id: { in: accessibleProjectIds }
  }
}

/**
 * Filter where clause for project-scoped resources
 */
export async function filterByResourceProjectAccess(
  userId: string,
  userRole: UserRole,
  baseWhere: Record<string, unknown> = {}
): Promise<Record<string, unknown>> {
  const accessibleProjectIds = await getAccessibleProjectIds(userId, userRole)
  
  // If null, user has access to all projects
  if (accessibleProjectIds === null) {
    return baseWhere
  }
  
  // If empty array, user has no project access
  if (accessibleProjectIds.length === 0) {
    return { ...baseWhere, projectId: 'never-match' }
  }
  
  // Add projectId filter
  return {
    ...baseWhere,
    projectId: { in: accessibleProjectIds }
  }
}
