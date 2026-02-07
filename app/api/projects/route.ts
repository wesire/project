import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authenticateRequest, requirePermission } from '@/lib/middleware'
import { createProjectSchema, validateData } from '@/lib/validation'
import {
  getPaginationParams,
  getSortParams,
  getSearchParams,
  getFilterParams,
  buildSearchWhere,
  combineWhereClause,
  createPaginatedResponse
} from '@/lib/api-utils'
import { filterByProjectAccess } from '@/lib/project-permissions'
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
      'projectNumber', 'name', 'status', 'startDate', 
      'endDate', 'budget', 'createdAt', 'updatedAt'
    ]
    const { orderBy } = getSortParams(request, allowedSortFields)
    
    // Get search params
    const allowedSearchFields = ['projectNumber', 'name', 'description', 'client', 'location']
    const { search, searchFields } = getSearchParams(request, allowedSearchFields)
    const searchWhere = buildSearchWhere(search, searchFields)
    
    // Get filter params
    const allowedFilterFields = ['status', 'currency', 'client', 'location']
    const filterWhere = getFilterParams(request, allowedFilterFields)
    
    // Combine where clauses and apply project access
    const baseWhere = combineWhereClause(searchWhere, filterWhere)
    const where = await filterByProjectAccess(user.userId, user.role as UserRole, baseWhere)
    
    // Get total count
    const total = await prisma.project.count({ where })
    
    // Get projects
    const projects = await prisma.project.findMany({
      where,
      skip,
      take,
      orderBy,
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
          },
        },
        _count: {
          select: {
            risks: true,
            changes: true,
            tasks: true,
            issues: true,
          },
        },
      },
    })

    return NextResponse.json(createPaginatedResponse(projects, total, page, perPage))
  } catch (error) {
    console.error('Error fetching projects:', error)
    
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
    // Require project:create permission
    const user = await requirePermission(request, 'project:create')
    
    const body = await request.json()
    
    // Validate request body
    const validatedData = validateData(createProjectSchema, body)
    
    const project = await prisma.project.create({
      data: {
        projectNumber: validatedData.projectNumber,
        name: validatedData.name,
        description: validatedData.description,
        status: validatedData.status || 'PLANNING',
        startDate: new Date(validatedData.startDate),
        endDate: new Date(validatedData.endDate),
        budget: validatedData.budget,
        currency: validatedData.currency || 'GBP',
        location: validatedData.location,
        client: validatedData.client,
        createdById: user.userId,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        projectId: project.id,
        userId: user.userId,
        action: 'CREATE',
        entityType: 'Project',
        entityId: project.id,
        changes: {
          created: project,
        },
      },
    })

    return NextResponse.json(project, { status: 201 })
  } catch (error) {
    console.error('Error creating project:', error)
    
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
