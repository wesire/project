import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authenticateRequest } from '@/lib/middleware'
import {
  getPaginationParams,
  getSortParams,
  getSearchParams,
  getFilterParams,
  buildSearchWhere,
  combineWhereClause,
  createPaginatedResponse
} from '@/lib/api-utils'
import { filterByResourceProjectAccess } from '@/lib/project-permissions'
import { AuthenticationError } from '@/lib/errors'
import { UserRole } from '@/lib/types'

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const user = await authenticateRequest(request)
    
    // Get pagination params
    const { skip, take, page, perPage } = getPaginationParams(request)
    
    // Get sorting params
    const allowedSortFields = [
      'poNumber', 'vendor', 'status', 'orderValue', 
      'paidAmount', 'orderDate', 'deliveryDate', 'createdAt', 'updatedAt'
    ]
    const { orderBy } = getSortParams(request, allowedSortFields, { createdAt: 'desc' })
    
    // Get search params
    const allowedSearchFields = ['poNumber', 'vendor', 'description']
    const { search, searchFields } = getSearchParams(request, allowedSearchFields)
    const searchWhere = buildSearchWhere(search, searchFields)
    
    // Get filter params
    const allowedFilterFields = ['projectId', 'status', 'vendor']
    const filterWhere = getFilterParams(request, allowedFilterFields)
    
    // Combine where clauses and apply project access
    const baseWhere = combineWhereClause(searchWhere, filterWhere)
    const where = await filterByResourceProjectAccess(user.userId, user.role as UserRole, baseWhere)
    
    // Get total count
    const total = await prisma.procurement.count({ where })
    
    // Get procurements
    const procurements = await prisma.procurement.findMany({
      where,
      skip,
      take,
      orderBy,
      include: {
        project: {
          select: {
            id: true,
            name: true,
            projectNumber: true,
          },
        },
      },
    })

    return NextResponse.json(createPaginatedResponse(procurements, total, page, perPage))
  } catch (error) {
    console.error('Error fetching procurements:', error)
    
    if (error instanceof AuthenticationError) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      )
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
