import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authenticateRequest, requirePermission } from '@/lib/middleware'
import { createCashflowSchema, validateData } from '@/lib/validation'
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
      'date', 'type', 'category', 'forecast', 'actual', 
      'variance', 'createdAt', 'updatedAt'
    ]
    const { orderBy } = getSortParams(request, allowedSortFields, { date: 'desc' })
    
    // Get search params
    const allowedSearchFields = ['category', 'description']
    const { search, searchFields } = getSearchParams(request, allowedSearchFields)
    const searchWhere = buildSearchWhere(search, searchFields)
    
    // Get filter params
    const allowedFilterFields = ['projectId', 'type', 'category']
    const filterWhere = getFilterParams(request, allowedFilterFields)
    
    // Combine where clauses and apply project access
    const baseWhere = combineWhereClause(searchWhere, filterWhere)
    const where = await filterByResourceProjectAccess(user.userId, user.role as UserRole, baseWhere)
    
    // Get total count
    const total = await prisma.cashflow.count({ where })
    
    // Get cashflows
    const cashflows = await prisma.cashflow.findMany({
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

    return NextResponse.json(createPaginatedResponse(cashflows, total, page, perPage))
  } catch (error) {
    console.error('Error fetching cashflows:', error)
    
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
    // Require cashflow:create permission
    const user = await requirePermission(request, 'cashflow:create')
    
    const body = await request.json()
    
    // Validate request body
    const validatedData = validateData(createCashflowSchema, body)
    
    // Check project access
    await requireProjectPermission(
      user.userId,
      user.role as UserRole,
      validatedData.projectId,
      'cashflow:create'
    )

    // Calculate variance if actual is provided
    const variance = validatedData.actual !== undefined 
      ? validatedData.actual - validatedData.forecast 
      : 0

    const cashflow = await prisma.cashflow.create({
      data: {
        projectId: validatedData.projectId,
        date: new Date(validatedData.date),
        type: validatedData.type,
        category: validatedData.category,
        description: validatedData.description,
        forecast: validatedData.forecast,
        actual: validatedData.actual,
        variance: variance,
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
        projectId: cashflow.projectId,
        userId: user.userId,
        action: 'CREATE',
        entityType: 'Cashflow',
        entityId: cashflow.id,
        changes: {
          created: cashflow,
        },
      },
    })

    return NextResponse.json(cashflow, { status: 201 })
  } catch (error) {
    console.error('Error creating cashflow:', error)
    
    if (error instanceof AuthenticationError) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      )
    }
    
    if (error instanceof ValidationError || (error as any).name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation failed', details: (error as any).message },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
