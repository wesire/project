import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authenticateRequest, requirePermission } from '@/lib/middleware'
import { createResourceSchema, validateData } from '@/lib/validation'
import {
  getPaginationParams,
  getSortParams,
  getSearchParams,
  getFilterParams,
  buildSearchWhere,
  combineWhereClause,
  createPaginatedResponse
} from '@/lib/api-utils'
import { AuthenticationError, ValidationError } from '@/lib/errors'

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const user = await authenticateRequest(request)
    
    // Get pagination params
    const { skip, take, page, perPage } = getPaginationParams(request)
    
    // Get sorting params
    const allowedSortFields = [
      'name', 'type', 'costPerHour', 'availability', 'createdAt', 'updatedAt'
    ]
    const { orderBy } = getSortParams(request, allowedSortFields, { createdAt: 'desc' })
    
    // Get search params
    const allowedSearchFields = ['name', 'description', 'availability']
    const { search, searchFields } = getSearchParams(request, allowedSearchFields)
    const searchWhere = buildSearchWhere(search, searchFields)
    
    // Get filter params
    const allowedFilterFields = ['type', 'availability']
    const filterWhere = getFilterParams(request, allowedFilterFields)
    
    // Combine where clauses (no project access filtering)
    const where = combineWhereClause(searchWhere, filterWhere)
    
    // Get total count
    const total = await prisma.resource.count({ where })
    
    // Get resources
    const resources = await prisma.resource.findMany({
      where,
      skip,
      take,
      orderBy,
      include: {
        _count: {
          select: {
            allocations: true,
          },
        },
      },
    })

    return NextResponse.json(createPaginatedResponse(resources, total, page, perPage))
  } catch (error) {
    console.error('Error fetching resources:', error)
    
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
    // Require resource:create permission
    const user = await requirePermission(request, 'resource:create')
    
    const body = await request.json()
    
    // Validate request body
    const validatedData = validateData(createResourceSchema, body)

    const resource = await prisma.resource.create({
      data: {
        name: validatedData.name,
        type: validatedData.type,
        description: validatedData.description,
        costPerHour: validatedData.costPerHour,
        availability: validatedData.availability,
        skills: validatedData.skills || [],
      },
      include: {
        _count: {
          select: {
            allocations: true,
          },
        },
      },
    })
    
    // Create audit log (no projectId for resources)
    await prisma.auditLog.create({
      data: {
        userId: user.userId,
        action: 'CREATE',
        entityType: 'Resource',
        entityId: resource.id,
        changes: {
          created: resource,
        },
      },
    })

    return NextResponse.json(resource, { status: 201 })
  } catch (error) {
    console.error('Error creating resource:', error)
    
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
