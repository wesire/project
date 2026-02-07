import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authenticateRequest, requirePermission } from '@/lib/middleware'
import { createResourceAllocationSchema, validateData } from '@/lib/validation'
import {
  getPaginationParams,
  getSortParams,
  getSearchParams,
  getFilterParams,
  buildSearchWhere,
  combineWhereClause,
  createPaginatedResponse
} from '@/lib/api-utils'
import { filterByResourceProjectAccess, requireProjectPermission } from '@/lib/project-permissions'
import { AuthenticationError, ValidationError } from '@/lib/errors'
import { UserRole } from '@/lib/types'

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const user = await authenticateRequest(request)
    
    // Get pagination params
    const { skip, take, page, perPage } = getPaginationParams(request)
    
    // Get sorting params
    const allowedSortFields = [
      'resourceType', 'allocatedHours', 'utilization', 
      'startDate', 'endDate', 'createdAt', 'updatedAt'
    ]
    const { orderBy } = getSortParams(request, allowedSortFields, { createdAt: 'desc' })
    
    // Get search params
    const allowedSearchFields = ['resourceType']
    const { search, searchFields } = getSearchParams(request, allowedSearchFields)
    const searchWhere = buildSearchWhere(search, searchFields)
    
    // Get filter params
    const allowedFilterFields = ['projectId', 'userId', 'resourceId', 'resourceType']
    const filterWhere = getFilterParams(request, allowedFilterFields)
    
    // Combine where clauses and apply project access
    const baseWhere = combineWhereClause(searchWhere, filterWhere)
    const where = await filterByResourceProjectAccess(user.userId, user.role as UserRole, baseWhere)
    
    // Get total count
    const total = await prisma.resourceAllocation.count({ where })
    
    // Get allocations
    const allocations = await prisma.resourceAllocation.findMany({
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
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        resource: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
      },
    })

    return NextResponse.json(createPaginatedResponse(allocations, total, page, perPage))
  } catch (error) {
    console.error('Error fetching resource allocations:', error)
    
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

export async function POST(request: NextRequest) {
  try {
    // Require allocation:create permission
    const user = await requirePermission(request, 'allocation:create')
    
    const body = await request.json()
    
    // Validate request body
    const validatedData = validateData(createResourceAllocationSchema, body)
    
    // Check project access
    await requireProjectPermission(
      user.userId,
      user.role as UserRole,
      validatedData.projectId,
      'allocation:create'
    )

    const allocation = await prisma.resourceAllocation.create({
      data: {
        projectId: validatedData.projectId,
        userId: validatedData.userId,
        resourceId: validatedData.resourceId,
        resourceType: validatedData.resourceType,
        allocatedHours: validatedData.allocatedHours,
        utilization: validatedData.utilization,
        startDate: new Date(validatedData.startDate),
        endDate: new Date(validatedData.endDate),
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            projectNumber: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        resource: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
      },
    })
    
    // Create audit log
    await prisma.auditLog.create({
      data: {
        projectId: allocation.projectId,
        userId: user.userId,
        action: 'CREATE',
        entityType: 'ResourceAllocation',
        entityId: allocation.id,
        changes: {
          created: allocation,
        },
      },
    })

    return NextResponse.json(allocation, { status: 201 })
  } catch (error) {
    console.error('Error creating resource allocation:', error)
    
    if (error instanceof AuthenticationError) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      )
    }
    
    if (error instanceof ValidationError || (error as { name?: string }).name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation failed', details: (error as { message?: string }).message },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
