import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authenticateRequest, requirePermission } from '@/lib/middleware'
import { createRiskSchema, validateData } from '@/lib/validation'
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
      'riskNumber', 'title', 'category', 'probability', 
      'impact', 'score', 'status', 'createdAt', 'updatedAt'
    ]
    const { orderBy } = getSortParams(request, allowedSortFields, { score: 'desc' })
    
    // Get search params
    const allowedSearchFields = ['riskNumber', 'title', 'description', 'category', 'owner', 'mitigation']
    const { search, searchFields } = getSearchParams(request, allowedSearchFields)
    const searchWhere = buildSearchWhere(search, searchFields)
    
    // Get filter params
    const allowedFilterFields = ['projectId', 'status', 'category', 'owner']
    const filterWhere = getFilterParams(request, allowedFilterFields)
    
    // Combine where clauses and apply project access
    const baseWhere = combineWhereClause(searchWhere, filterWhere)
    const where = await filterByResourceProjectAccess(user.userId, user.role as UserRole, baseWhere)
    
    // Get total count
    const total = await prisma.risk.count({ where })
    
    // Get risks
    const risks = await prisma.risk.findMany({
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

    return NextResponse.json(createPaginatedResponse(risks, total, page, perPage))
  } catch (error) {
    console.error('Error fetching risks:', error)
    
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
    // Require risk:create permission
    const user = await requirePermission(request, 'risk:create')
    
    const body = await request.json()
    
    // Validate request body
    const validatedData = validateData(createRiskSchema, body)
    
    // Check project access
    await requireProjectPermission(
      user.userId,
      user.role as UserRole,
      validatedData.projectId,
      'risk:create'
    )
    
    const score = validatedData.probability * validatedData.impact

    const risk = await prisma.risk.create({
      data: {
        projectId: validatedData.projectId,
        riskNumber: validatedData.riskNumber,
        title: validatedData.title,
        description: validatedData.description,
        category: validatedData.category,
        probability: validatedData.probability,
        impact: validatedData.impact,
        score: score,
        status: 'OPEN',
        owner: validatedData.owner,
        mitigation: validatedData.mitigation,
        contingency: validatedData.contingency,
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
        projectId: risk.projectId,
        userId: user.userId,
        action: 'CREATE',
        entityType: 'Risk',
        entityId: risk.id,
        changes: {
          created: risk,
        },
      },
    })

    return NextResponse.json(risk, { status: 201 })
  } catch (error) {
    console.error('Error creating risk:', error)
    
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
