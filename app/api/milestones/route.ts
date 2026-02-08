import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authenticateRequest, requirePermission } from '@/lib/middleware'
import { createMilestoneSchema, validateData } from '@/lib/validation'
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
      'name', 'dueDate', 'baselineDueDate', 'status', 
      'progress', 'createdAt', 'updatedAt'
    ]
    const { orderBy } = getSortParams(request, allowedSortFields, { dueDate: 'asc' })
    
    // Get search params
    const allowedSearchFields = ['name', 'description']
    const { search, searchFields } = getSearchParams(request, allowedSearchFields)
    const searchWhere = buildSearchWhere(search, searchFields)
    
    // Get filter params
    const allowedFilterFields = ['projectId', 'status', 'owner']
    const filterWhere = getFilterParams(request, allowedFilterFields)
    
    // Combine where clauses and apply project access
    const baseWhere = combineWhereClause(searchWhere, filterWhere)
    const where = await filterByResourceProjectAccess(user.userId, user.role as UserRole, baseWhere)
    
    // Get total count
    const total = await prisma.milestone.count({ where })
    
    // Get milestones
    const milestones = await prisma.milestone.findMany({
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

    return NextResponse.json(createPaginatedResponse(milestones, total, page, perPage))
  } catch (error) {
    console.error('Error fetching milestones:', error)
    
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
    // Require milestone:create permission
    const user = await requirePermission(request, 'milestone:create')
    
    const body = await request.json()
    
    // Validate request body
    const validatedData = validateData(createMilestoneSchema, body)
    
    // Check project access
    await requireProjectPermission(
      user.userId,
      user.role as UserRole,
      validatedData.projectId,
      'milestone:create'
    )

    const milestone = await prisma.milestone.create({
      data: {
        projectId: validatedData.projectId,
        name: validatedData.name,
        description: validatedData.description,
        dueDate: new Date(validatedData.dueDate),
        baselineDueDate: validatedData.baselineDueDate ? new Date(validatedData.baselineDueDate) : null,
        status: validatedData.status || 'PENDING',
        owner: validatedData.owner,
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
        projectId: milestone.projectId,
        userId: user.userId,
        action: 'CREATE',
        entityType: 'Milestone',
        entityId: milestone.id,
        changes: {
          created: milestone,
        },
      },
    })

    return NextResponse.json(milestone, { status: 201 })
  } catch (error) {
    console.error('Error creating milestone:', error)
    
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
