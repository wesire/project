import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authenticateRequest, requirePermission } from '@/lib/middleware'
import { createChangeOrderSchema, validateData } from '@/lib/validation'
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
      'changeNumber', 'title', 'status', 'costImpact', 
      'timeImpact', 'submittedDate', 'createdAt', 'updatedAt'
    ]
    const { orderBy } = getSortParams(request, allowedSortFields, { createdAt: 'desc' })
    
    // Get search params
    const allowedSearchFields = ['changeNumber', 'title', 'description', 'requestedBy', 'approvedBy']
    const { search, searchFields } = getSearchParams(request, allowedSearchFields)
    const searchWhere = buildSearchWhere(search, searchFields)
    
    // Get filter params
    const allowedFilterFields = ['projectId', 'status', 'requestedBy', 'approvedBy']
    const filterWhere = getFilterParams(request, allowedFilterFields)
    
    // Combine where clauses and apply project access
    const baseWhere = combineWhereClause(searchWhere, filterWhere)
    const where = await filterByResourceProjectAccess(user.userId, user.role as UserRole, baseWhere)
    
    // Get total count
    const total = await prisma.changeOrder.count({ where })
    
    // Get change orders
    const changes = await prisma.changeOrder.findMany({
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

    return NextResponse.json(createPaginatedResponse(changes, total, page, perPage))
  } catch (error) {
    console.error('Error fetching change orders:', error)
    
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
    // Require change:create permission
    const user = await requirePermission(request, 'change:create')
    
    const body = await request.json()
    
    // Validate request body
    const validatedData = validateData(createChangeOrderSchema, body)
    
    // Check project access
    await requireProjectPermission(
      user.userId,
      user.role as UserRole,
      validatedData.projectId,
      'change:create'
    )

    const change = await prisma.changeOrder.create({
      data: {
        projectId: validatedData.projectId,
        changeNumber: validatedData.changeNumber,
        title: validatedData.title,
        description: validatedData.description,
        requestedBy: validatedData.requestedBy,
        costImpact: validatedData.costImpact,
        timeImpact: validatedData.timeImpact,
        status: 'SUBMITTED',
      },
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
    
    // Create audit log
    await prisma.auditLog.create({
      data: {
        projectId: change.projectId,
        userId: user.userId,
        action: 'CREATE',
        entityType: 'ChangeOrder',
        entityId: change.id,
        changes: {
          created: change,
        },
      },
    })

    return NextResponse.json(change, { status: 201 })
  } catch (error) {
    console.error('Error creating change order:', error)
    
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
