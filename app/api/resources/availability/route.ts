import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authenticateRequest, requirePermission } from '@/lib/middleware'
import { createResourceAvailabilitySchema, validateData } from '@/lib/validation'
import {
  getPaginationParams,
  getSortParams,
  getFilterParams,
  combineWhereClause,
  createPaginatedResponse
} from '@/lib/api-utils'
import { AuthenticationError, ValidationError } from '@/lib/errors'

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    await authenticateRequest(request)
    
    // Get pagination params
    const { skip, take, page, perPage } = getPaginationParams(request)
    
    // Get sorting params
    const allowedSortFields = ['date', 'isAvailable', 'availableHours', 'createdAt']
    const { orderBy } = getSortParams(request, allowedSortFields, { date: 'asc' })
    
    // Get filter params
    const allowedFilterFields = ['resourceId', 'isAvailable']
    const filterWhere = getFilterParams(request, allowedFilterFields)
    
    // Date range filtering
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    
    let dateFilter = {}
    if (startDate || endDate) {
      dateFilter = {
        date: {
          ...(startDate && { gte: new Date(startDate) }),
          ...(endDate && { lte: new Date(endDate) })
        }
      }
    }
    
    const where = combineWhereClause(filterWhere, dateFilter)
    
    // Get total count
    const total = await prisma.resourceAvailability.count({ where })
    
    // Get availability records
    const availabilities = await prisma.resourceAvailability.findMany({
      where,
      skip,
      take,
      orderBy,
      include: {
        resource: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
      },
    })

    return NextResponse.json(createPaginatedResponse(availabilities, total, page, perPage))
  } catch (error) {
    console.error('Error fetching resource availability:', error)
    
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
    // Require resource:create permission (PM or ADMIN)
    const user = await requirePermission(request, 'resource:create')
    
    const body = await request.json()
    
    // Validate request body
    const validatedData = validateData(createResourceAvailabilitySchema, body)

    const availability = await prisma.resourceAvailability.create({
      data: {
        resourceId: validatedData.resourceId,
        date: new Date(validatedData.date),
        isAvailable: validatedData.isAvailable,
        availableHours: validatedData.availableHours,
        reason: validatedData.reason,
        notes: validatedData.notes,
      },
      include: {
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
        userId: user.userId,
        action: 'CREATE',
        entityType: 'ResourceAvailability',
        entityId: availability.id,
        changes: {
          created: availability,
        },
      },
    })

    return NextResponse.json(availability, { status: 201 })
  } catch (error) {
    console.error('Error creating resource availability:', error)
    
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
