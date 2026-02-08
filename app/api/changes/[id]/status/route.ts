import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requirePermission } from '@/lib/middleware'
import { updateChangeOrderStatusSchema, validateData } from '@/lib/validation'
import { requireProjectPermission } from '@/lib/project-permissions'
import { AuthenticationError, AuthorizationError, ValidationError } from '@/lib/errors'
import { UserRole } from '@/lib/types'

interface RouteParams {
  params: {
    id: string
  }
}

/**
 * Update change order status (workflow transitions)
 * POST /api/changes/[id]/status
 */
export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const user = await requirePermission(request, 'change:update')
    
    // Check if change order exists
    const existingChange = await prisma.changeOrder.findUnique({
      where: { id: params.id }
    })
    
    if (!existingChange) {
      return NextResponse.json(
        { error: 'Change order not found' },
        { status: 404 }
      )
    }
    
    // Check project access
    await requireProjectPermission(
      user.userId,
      user.role as UserRole,
      existingChange.projectId,
      'change:update'
    )
    
    const body = await request.json()
    const validatedData = validateData(updateChangeOrderStatusSchema, body)
    
    // Validate workflow transitions
    const currentStatus = existingChange.status
    const newStatus = validatedData.status
    
    // Define valid transitions
    const validTransitions: Record<string, string[]> = {
      DRAFT: ['SUBMITTED'],
      SUBMITTED: ['UNDER_REVIEW', 'DRAFT'],
      UNDER_REVIEW: ['APPROVED', 'REJECTED', 'SUBMITTED'],
      APPROVED: ['IMPLEMENTED'],
      REJECTED: ['DRAFT'],
      IMPLEMENTED: [], // Terminal state
    }
    
    if (!validTransitions[currentStatus]?.includes(newStatus)) {
      return NextResponse.json(
        { 
          error: 'Invalid status transition',
          details: `Cannot transition from ${currentStatus} to ${newStatus}`,
          allowedTransitions: validTransitions[currentStatus] || [],
        },
        { status: 400 }
      )
    }
    
    // Build update data based on status
    const updateData: Record<string, unknown> = {
      status: newStatus,
    }
    
    // Set timestamps based on status
    if (newStatus === 'SUBMITTED' && !existingChange.submittedDate) {
      updateData.submittedDate = validatedData.submittedDate || new Date()
    }
    
    if (newStatus === 'APPROVED') {
      updateData.approvedDate = validatedData.approvedDate || new Date()
      if (validatedData.approvedBy) {
        updateData.approvedBy = validatedData.approvedBy
      }
    }
    
    if (newStatus === 'IMPLEMENTED') {
      updateData.implementedDate = validatedData.implementedDate || new Date()
      // Ensure approval data is set
      if (!existingChange.approvedDate) {
        updateData.approvedDate = new Date()
      }
    }
    
    // Clear approval data if moving back to earlier states
    if (newStatus === 'DRAFT' || newStatus === 'SUBMITTED') {
      updateData.approvedDate = null
      updateData.approvedBy = null
      updateData.implementedDate = null
    }
    
    const change = await prisma.changeOrder.update({
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
        tasks: {
          select: {
            id: true,
            taskNumber: true,
            title: true,
          },
        },
        budgetLines: {
          select: {
            id: true,
            category: true,
            description: true,
          },
        },
      },
    })
    
    // Create audit log
    await prisma.auditLog.create({
      data: {
        projectId: change.projectId,
        userId: user.userId,
        action: 'STATUS_UPDATE',
        entityType: 'ChangeOrder',
        entityId: change.id,
        changes: {
          statusTransition: {
            from: currentStatus,
            to: newStatus,
          },
          before: existingChange,
          after: change,
        },
      },
    })
    
    return NextResponse.json(change)
  } catch (error) {
    console.error('Error updating change order status:', error)
    
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
