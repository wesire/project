/**
 * Error handler utilities for API routes
 */

import { NextResponse } from 'next/server'
import { AppError } from './custom-errors'
import { ApiResponse } from '../types'

/**
 * Format error response for API
 */
export function formatErrorResponse(error: unknown): ApiResponse {
  if (error instanceof AppError) {
    return {
      success: false,
      error: {
        code: error.code,
        message: error.message,
        details: error.details
      }
    }
  }

  // Handle Prisma errors
  if (error && typeof error === 'object' && 'code' in error) {
    const prismaError = error as any
    if (prismaError.code === 'P2002') {
      return {
        success: false,
        error: {
          code: 'UNIQUE_CONSTRAINT',
          message: 'A record with this value already exists',
          details: prismaError.meta
        }
      }
    }
    if (prismaError.code === 'P2025') {
      return {
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Record not found',
          details: prismaError.meta
        }
      }
    }
  }

  // Handle generic errors
  const message = error instanceof Error ? error.message : 'An unexpected error occurred'
  return {
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message
    }
  }
}

/**
 * Get HTTP status code from error
 */
export function getErrorStatusCode(error: unknown): number {
  if (error instanceof AppError) {
    return error.statusCode
  }
  return 500
}

/**
 * Handle API error and return NextResponse
 */
export function handleApiError(error: unknown): NextResponse {
  const statusCode = getErrorStatusCode(error)
  const response = formatErrorResponse(error)
  
  // Log error for monitoring (in production, send to logging service)
  if (process.env.NODE_ENV === 'development') {
    console.error('[API Error]', error)
  }
  
  return NextResponse.json(response, { status: statusCode })
}

/**
 * Log error for monitoring
 */
export function logError(error: unknown, context?: Record<string, any>): void {
  const timestamp = new Date().toISOString()
  const errorInfo = {
    timestamp,
    error: error instanceof Error ? {
      name: error.name,
      message: error.message,
      stack: error.stack
    } : error,
    context
  }

  // In production, send to logging service (e.g., Sentry, LogRocket, CloudWatch)
  if (process.env.NODE_ENV === 'production') {
    // Example: Sentry.captureException(error, { extra: context })
    console.error('[ERROR]', JSON.stringify(errorInfo))
  } else {
    console.error('[ERROR]', errorInfo)
  }
}
