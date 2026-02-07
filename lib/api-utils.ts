/**
 * API utility functions for pagination, filtering, sorting, and search
 */

import { NextRequest } from 'next/server'

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page: number
  perPage: number
  skip: number
  take: number
}

/**
 * Sorting parameters
 */
export interface SortParams {
  orderBy: Record<string, 'asc' | 'desc'>
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  page: number
  perPage: number
  total: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

/**
 * Paginated response structure
 */
export interface PaginatedResponse<T> {
  data: T[]
  pagination: PaginationMeta
}

/**
 * Extract pagination parameters from request
 */
export function getPaginationParams(request: NextRequest): PaginationParams {
  const { searchParams } = new URL(request.url)
  
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
  const perPage = Math.min(100, Math.max(1, parseInt(searchParams.get('perPage') || '30', 10)))
  
  const skip = (page - 1) * perPage
  const take = perPage
  
  return { page, perPage, skip, take }
}

/**
 * Extract sorting parameters from request
 * Format: ?sortBy=fieldName&sortOrder=asc|desc
 * Multiple sorts: ?sortBy=field1,field2&sortOrder=asc,desc
 */
export function getSortParams(
  request: NextRequest,
  allowedFields: string[],
  defaultSort: Record<string, 'asc' | 'desc'> = { createdAt: 'desc' }
): SortParams {
  const { searchParams } = new URL(request.url)
  
  const sortBy = searchParams.get('sortBy')
  const sortOrder = searchParams.get('sortOrder')
  
  if (!sortBy) {
    return { orderBy: defaultSort }
  }
  
  const fields = sortBy.split(',')
  const orders = (sortOrder || 'asc').split(',')
  
  const orderBy: Record<string, 'asc' | 'desc'> = {}
  
  fields.forEach((field, index) => {
    const trimmedField = field.trim()
    if (allowedFields.includes(trimmedField)) {
      const order = orders[index]?.trim() || 'asc'
      orderBy[trimmedField] = order === 'desc' ? 'desc' : 'asc'
    }
  })
  
  return { orderBy: Object.keys(orderBy).length > 0 ? orderBy : defaultSort }
}

/**
 * Extract search parameters from request
 * Format: ?search=query&searchFields=field1,field2
 */
export function getSearchParams(
  request: NextRequest,
  allowedFields: string[]
): { search: string | null; searchFields: string[] } {
  const { searchParams } = new URL(request.url)
  
  const search = searchParams.get('search')
  const searchFieldsParam = searchParams.get('searchFields')
  
  if (!search) {
    return { search: null, searchFields: [] }
  }
  
  const searchFields = searchFieldsParam
    ? searchFieldsParam.split(',').map(f => f.trim()).filter(f => allowedFields.includes(f))
    : allowedFields
  
  return { search, searchFields }
}

/**
 * Build search where clause for Prisma
 */
export function buildSearchWhere(
  search: string | null,
  searchFields: string[]
): Record<string, unknown> {
  if (!search || searchFields.length === 0) {
    return {}
  }
  
  return {
    OR: searchFields.map(field => ({
      [field]: {
        contains: search,
        mode: 'insensitive'
      }
    }))
  }
}

/**
 * Extract filter parameters from request
 * Supports filtering by exact match or range
 * Format: ?status=ACTIVE&priority=HIGH&startDate_gte=2024-01-01
 */
export function getFilterParams(
  request: NextRequest,
  allowedFields: string[]
): Record<string, string | number | boolean | Record<string, string | number>> {
  const { searchParams } = new URL(request.url)
  const filters: Record<string, string | number | boolean | Record<string, string | number>> = {}
  
  // Reserved query parameters that are not filters
  const reservedParams = ['page', 'perPage', 'sortBy', 'sortOrder', 'search', 'searchFields']
  
  searchParams.forEach((value, key) => {
    if (reservedParams.includes(key)) {
      return
    }
    
    // Handle range operators (field_gte, field_lte, field_gt, field_lt)
    const rangeMatch = key.match(/^(.+)_(gte|lte|gt|lt)$/)
    if (rangeMatch) {
      const [, field, operator] = rangeMatch
      if (allowedFields.includes(field)) {
        // Ensure field is an object for range operators
        const fieldFilter = filters[field]
        if (typeof fieldFilter !== 'object' || fieldFilter === null || Array.isArray(fieldFilter)) {
          filters[field] = {}
        }
        (filters[field] as Record<string, string | number>)[operator] = isNaN(Number(value)) ? value : Number(value)
      }
      return
    }
    
    // Handle exact match
    if (allowedFields.includes(key)) {
      // Try to parse as number or boolean
      if (value === 'true' || value === 'false') {
        filters[key] = value === 'true'
      } else if (!isNaN(Number(value)) && value !== '') {
        filters[key] = Number(value)
      } else {
        filters[key] = value
      }
    }
  })
  
  return filters
}

/**
 * Create pagination metadata
 */
export function createPaginationMeta(
  total: number,
  page: number,
  perPage: number
): PaginationMeta {
  const totalPages = Math.ceil(total / perPage)
  
  return {
    page,
    perPage,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1
  }
}

/**
 * Create paginated response
 */
export function createPaginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  perPage: number
): PaginatedResponse<T> {
  return {
    data,
    pagination: createPaginationMeta(total, page, perPage)
  }
}

/**
 * Combine where clauses
 */
export function combineWhereClause(...clauses: Record<string, unknown>[]): Record<string, unknown> {
  const nonEmptyClauses = clauses.filter(c => c && Object.keys(c).length > 0)
  
  if (nonEmptyClauses.length === 0) {
    return {}
  }
  
  if (nonEmptyClauses.length === 1) {
    return nonEmptyClauses[0]
  }
  
  return {
    AND: nonEmptyClauses
  }
}
