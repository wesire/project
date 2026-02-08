import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requirePermission } from '@/lib/middleware'
import { updateChangeOrderSchema, validateData } from '@/lib/validation'
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
    const user = await requirePermission(request, 'change:read')
    
    const change = await prisma.changeOrder.findUnique({
      where: { id: params.id },
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
            status: true,
            assignedTo: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        budgetLines: {
          select: {
            id: true,
            category: true,
            description: true,
            budgeted: true,
            spent: true,
            committed: true,
          },
        },
      },
    })
    
    if (!change) {
      return NextResponse.json(
        { error: 'Change order not found' },
        { status: 404 }
      )
    }
    
    // Check project access
    await requireProjectPermission(
      user.userId,
      user.role as UserRole,
      change.projectId,
      'change:read'
    )
    
    return NextResponse.json(change)
  } catch (error) {
    console.error('Error fetching change order:', error)
    
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
    const user = await requirePermission(request, 'change:update')
    
    // Check if change order exists
    const existingChange = await prisma.changeOrder.findUnique({
      where: { id: params.id },
      include: {
        tasks: true,
        budgetLines: true,
      },
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
    const validatedData = validateData(updateChangeOrderSchema, body)
    
    // Build update data
    const updateData: Record<string, unknown> = {}
    if (validatedData.changeNumber !== undefined) updateData.changeNumber = validatedData.changeNumber
    if (validatedData.title !== undefined) updateData.title = validatedData.title
    if (validatedData.description !== undefined) updateData.description = validatedData.description
    if (validatedData.requestedBy !== undefined) updateData.requestedBy = validatedData.requestedBy
    if (validatedData.scopeImpact !== undefined) updateData.scopeImpact = validatedData.scopeImpact
    if (validatedData.costImpact !== undefined) updateData.costImpact = validatedData.costImpact
    if (validatedData.timeImpact !== undefined) updateData.timeImpact = validatedData.timeImpact
    
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

    // Handle task linking if taskIds are provided
    if (validatedData.taskIds !== undefined) {
      // Remove old task associations
      await prisma.task.updateMany({
        where: {
          changeOrderId: params.id,
        },
        data: {
          changeOrderId: null,
        },
      })

      // Add new task associations
      if (validatedData.taskIds.length > 0) {
        await prisma.task.updateMany({
          where: {
            id: { in: validatedData.taskIds },
            projectId: existingChange.projectId,
          },
          data: {
            changeOrderId: params.id,
          },
        })
      }
    }

    // Handle budget line linking if budgetLineIds are provided
    if (validatedData.budgetLineIds !== undefined) {
      // Remove old budget line associations
      await prisma.budgetLine.updateMany({
        where: {
          changeOrderId: params.id,
        },
        data: {
          changeOrderId: null,
        },
      })

      // Add new budget line associations
      if (validatedData.budgetLineIds.length > 0) {
        await prisma.budgetLine.updateMany({
          where: {
            id: { in: validatedData.budgetLineIds },
            projectId: existingChange.projectId,
          },
          data: {
            changeOrderId: params.id,
          },
        })
      }
    }

    // Fetch updated change order with all relations
    const updatedChange = await prisma.changeOrder.findUnique({
      where: { id: params.id },
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
        action: 'UPDATE',
        entityType: 'ChangeOrder',
        entityId: change.id,
        changes: {
          before: existingChange,
          after: updatedChange,
        },
      },
    })
    
    return NextResponse.json(updatedChange)
  } catch (error) {
    console.error('Error updating change order:', error)
    
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
    const user = await requirePermission(request, 'change:delete')
    
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
      'change:delete'
    )
    
    // Delete change order
    await prisma.changeOrder.delete({
      where: { id: params.id }
    })
    
    // Create audit log
    await prisma.auditLog.create({
      data: {
        projectId: existingChange.projectId,
        userId: user.userId,
        action: 'DELETE',
        entityType: 'ChangeOrder',
        entityId: params.id,
        changes: {
          deleted: existingChange,
        },
      },
    })
    
    return NextResponse.json({ message: 'Change order deleted successfully' })
  } catch (error) {
    console.error('Error deleting change order:', error)
    
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
