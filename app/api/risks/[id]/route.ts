import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requirePermission } from '@/lib/middleware'
import { updateRiskSchema, validateData } from '@/lib/validation'
import { requireProjectPermission } from '@/lib/project-permissions'
import { AuthenticationError, AuthorizationError, ValidationError } from '@/lib/errors'
import { UserRole } from '@/lib/types'

interface RouteParams {
  params: {
    id: string
  }
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const user = await requirePermission(request, 'risk:read')
    
    const risk = await prisma.risk.findUnique({
      where: { id: params.id },
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
    
    if (!risk) {
      return NextResponse.json(
        { error: 'Risk not found' },
        { status: 404 }
      )
    }
    
    // Check project access
    await requireProjectPermission(
      user.userId,
      user.role as UserRole,
      risk.projectId,
      'risk:read'
    )
    
    return NextResponse.json(risk)
  } catch (error) {
    console.error('Error fetching risk:', error)
    
    if (error instanceof AuthenticationError) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      )
    }
    
    if (error instanceof AuthorizationError) {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      )
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const user = await requirePermission(request, 'risk:update')
    
    // Check if risk exists
    const existingRisk = await prisma.risk.findUnique({
      where: { id: params.id }
    })
    
    if (!existingRisk) {
      return NextResponse.json(
        { error: 'Risk not found' },
        { status: 404 }
      )
    }
    
    // Check project access
    await requireProjectPermission(
      user.userId,
      user.role as UserRole,
      existingRisk.projectId,
      'risk:update'
    )
    
    const body = await request.json()
    const validatedData = validateData(updateRiskSchema, body)
    
    // Build update data
    const updateData: Record<string, unknown> = {}
    if (validatedData.riskNumber !== undefined) updateData.riskNumber = validatedData.riskNumber
    if (validatedData.title !== undefined) updateData.title = validatedData.title
    if (validatedData.description !== undefined) updateData.description = validatedData.description
    if (validatedData.category !== undefined) updateData.category = validatedData.category
    if (validatedData.probability !== undefined) updateData.probability = validatedData.probability
    if (validatedData.impact !== undefined) updateData.impact = validatedData.impact
    if (validatedData.owner !== undefined) updateData.owner = validatedData.owner
    if (validatedData.mitigation !== undefined) updateData.mitigation = validatedData.mitigation
    if (validatedData.contingency !== undefined) updateData.contingency = validatedData.contingency
    
    // Recalculate score if probability or impact changed
    const probability = validatedData.probability ?? existingRisk.probability
    const impact = validatedData.impact ?? existingRisk.impact
    updateData.score = probability * impact
    
    const risk = await prisma.risk.update({
      where: { id: params.id },
      data: updateData,
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
        action: 'UPDATE',
        entityType: 'Risk',
        entityId: risk.id,
        changes: {
          before: existingRisk,
          after: risk,
        },
      },
    })
    
    return NextResponse.json(risk)
  } catch (error) {
    console.error('Error updating risk:', error)
    
    if (error instanceof AuthenticationError) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      )
    }
    
    if (error instanceof AuthorizationError) {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
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

export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const user = await requirePermission(request, 'risk:delete')
    
    // Check if risk exists
    const existingRisk = await prisma.risk.findUnique({
      where: { id: params.id }
    })
    
    if (!existingRisk) {
      return NextResponse.json(
        { error: 'Risk not found' },
        { status: 404 }
      )
    }
    
    // Check project access
    await requireProjectPermission(
      user.userId,
      user.role as UserRole,
      existingRisk.projectId,
      'risk:delete'
    )
    
    // Delete risk
    await prisma.risk.delete({
      where: { id: params.id }
    })
    
    // Create audit log
    await prisma.auditLog.create({
      data: {
        projectId: existingRisk.projectId,
        userId: user.userId,
        action: 'DELETE',
        entityType: 'Risk',
        entityId: params.id,
        changes: {
          deleted: existingRisk,
        },
      },
    })
    
    return NextResponse.json({ message: 'Risk deleted successfully' })
  } catch (error) {
    console.error('Error deleting risk:', error)
    
    if (error instanceof AuthenticationError) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      )
    }
    
    if (error instanceof AuthorizationError) {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      )
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
