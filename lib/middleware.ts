/**
 * API middleware utilities for authentication and authorization
 */

import { NextRequest } from 'next/server'
import { verifyToken, TokenPayload } from './auth'
import { UserRole } from './types'
import { AuthenticationError, AuthorizationError } from './errors'
import { hasRole, hasPermission } from './rbac'

/**
 * Extract and verify JWT token from request
 */
export async function authenticateRequest(request: NextRequest): Promise<TokenPayload> {
  const authHeader = request.headers.get('authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AuthenticationError('No authentication token provided')
  }
  
  const token = authHeader.substring(7)
  const payload = verifyToken(token)
  
  if (!payload) {
    throw new AuthenticationError('Invalid or expired token')
  }
  
  return payload
}

/**
 * Require specific role for API endpoint
 */
export async function requireRole(
  request: NextRequest,
  requiredRole: UserRole
): Promise<TokenPayload> {
  const user = await authenticateRequest(request)
  
  if (!hasRole(user.role as UserRole, requiredRole)) {
    throw new AuthorizationError(
      `This action requires ${requiredRole} role or higher`
    )
  }
  
  return user
}

/**
 * Require any of the specified roles
 */
export async function requireAnyRole(
  request: NextRequest,
  requiredRoles: UserRole[]
): Promise<TokenPayload> {
  const user = await authenticateRequest(request)
  
  const hasRequiredRole = requiredRoles.some(role => 
    hasRole(user.role as UserRole, role)
  )
  
  if (!hasRequiredRole) {
    throw new AuthorizationError(
      `This action requires one of: ${requiredRoles.join(', ')}`
    )
  }
  
  return user
}

/**
 * Require specific permission
 */
export async function requirePermission(
  request: NextRequest,
  permission: string
): Promise<TokenPayload> {
  const user = await authenticateRequest(request)
  
  if (!hasPermission(user.role as UserRole, permission)) {
    throw new AuthorizationError(
      `You do not have permission to: ${permission}`
    )
  }
  
  return user
}

/**
 * Optional authentication (for endpoints that work for both authenticated and unauthenticated users)
 */
export async function optionalAuth(request: NextRequest): Promise<TokenPayload | null> {
  try {
    return await authenticateRequest(request)
  } catch {
    return null
  }
}
