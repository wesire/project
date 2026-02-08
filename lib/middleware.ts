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
 * Accepts Bearer token OR auth cookie (token/jwt)
 */
export async function authenticateRequest(request: NextRequest): Promise<TokenPayload> {
  // Try Bearer token first
  const authHeader = request.headers.get('authorization')
  let token: string | undefined
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7)
  }
  
  // If no Bearer token, try cookies
  if (!token) {
    const cookieToken = request.cookies.get('token')?.value || request.cookies.get('jwt')?.value
    if (cookieToken) {
      token = cookieToken
    }
  }
  
  // Return 401 only if both methods are missing
  if (!token) {
    throw new AuthenticationError('No authentication token provided')
  }
  
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
