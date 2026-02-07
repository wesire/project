import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authenticateRequest, requirePermission } from '@/lib/middleware'
import { createSprintSchema, validateData } from '@/lib/validation'
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
      'name', 'status', 'startDate', 'endDate', 'createdAt', 'updatedAt'
    ]
    const { orderBy } = getSortParams(request, allowedSortFields, { startDate: 'desc' })
    
    // Get search params
    const allowedSearchFields = ['name', 'goal']
    const { search, searchFields } = getSearchParams(request, allowedSearchFields)
    const searchWhere = buildSearchWhere(search, searchFields)
    
    // Get filter params
    const allowedFilterFields = ['projectId', 'status']
    const filterWhere = getFilterParams(request, allowedFilterFields)
    
    // Combine where clauses and apply project access
    const baseWhere = combineWhereClause(searchWhere, filterWhere)
    const where = await filterByResourceProjectAccess(user.userId, user.role as UserRole, baseWhere)
    
    // Get total count
    const total = await prisma.sprint.count({ where })
    
    // Get sprints
    const sprints = await prisma.sprint.findMany({
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
        _count: {
          select: {
            tasks: true,
          },
        },
      },
    })

    return NextResponse.json(createPaginatedResponse(sprints, total, page, perPage))
  } catch (error) {
    console.error('Error fetching sprints:', error)
    
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
    // Require sprint:create permission
    const user = await requirePermission(request, 'sprint:create')
    
    const body = await request.json()
    
    // Validate request body
    const validatedData = validateData(createSprintSchema, body)
    
    // Check project access
    await requireProjectPermission(
      user.userId,
      user.role as UserRole,
      validatedData.projectId,
      'sprint:create'
    )

    const sprint = await prisma.sprint.create({
      data: {
        projectId: validatedData.projectId,
        name: validatedData.name,
        goal: validatedData.goal,
        startDate: new Date(validatedData.startDate),
        endDate: new Date(validatedData.endDate),
        status: 'PLANNED',
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            projectNumber: true,
          },
        },
        _count: {
          select: {
            tasks: true,
          },
        },
      },
    })
    
    // Create audit log
    await prisma.auditLog.create({
      data: {
        projectId: sprint.projectId,
        userId: user.userId,
        action: 'CREATE',
        entityType: 'Sprint',
        entityId: sprint.id,
        changes: {
          created: sprint,
        },
      },
    })

    return NextResponse.json(sprint, { status: 201 })
  } catch (error) {
    console.error('Error creating sprint:', error)
    
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
