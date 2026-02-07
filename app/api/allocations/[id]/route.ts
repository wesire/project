import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requirePermission } from '@/lib/middleware'
import { updateResourceAllocationSchema, validateData } from '@/lib/validation'
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
    const user = await requirePermission(request, 'allocation:read')
    
    const allocation = await prisma.resourceAllocation.findUnique({
      where: { id: params.id },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            projectNumber: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        resource: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
      },
    })
    
    if (!allocation) {
      return NextResponse.json(
        { error: 'Resource allocation not found' },
        { status: 404 }
      )
    }
    
    // Check project access
    await requireProjectPermission(
      user.userId,
      user.role as UserRole,
      allocation.projectId,
      'allocation:read'
    )
    
    return NextResponse.json(allocation)
  } catch (error) {
    console.error('Error fetching resource allocation:', error)
    
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
    const user = await requirePermission(request, 'allocation:update')
    
    // Check if allocation exists
    const existingAllocation = await prisma.resourceAllocation.findUnique({
      where: { id: params.id }
    })
    
    if (!existingAllocation) {
      return NextResponse.json(
        { error: 'Resource allocation not found' },
        { status: 404 }
      )
    }
    
    // Check project access
    await requireProjectPermission(
      user.userId,
      user.role as UserRole,
      existingAllocation.projectId,
      'allocation:update'
    )
    
    const body = await request.json()
    const validatedData = validateData(updateResourceAllocationSchema, body)
    
    // Build update data
    const updateData: any = {}
    if (validatedData.userId !== undefined) updateData.userId = validatedData.userId
    if (validatedData.resourceId !== undefined) updateData.resourceId = validatedData.resourceId
    if (validatedData.resourceType !== undefined) updateData.resourceType = validatedData.resourceType
    if (validatedData.allocatedHours !== undefined) updateData.allocatedHours = validatedData.allocatedHours
    if (validatedData.utilization !== undefined) updateData.utilization = validatedData.utilization
    if (validatedData.startDate !== undefined) updateData.startDate = new Date(validatedData.startDate)
    if (validatedData.endDate !== undefined) updateData.endDate = new Date(validatedData.endDate)
    
    const allocation = await prisma.resourceAllocation.update({
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
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
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
        projectId: allocation.projectId,
        userId: user.userId,
        action: 'UPDATE',
        entityType: 'ResourceAllocation',
        entityId: allocation.id,
        changes: {
          before: existingAllocation,
          after: allocation,
        },
      },
    })
    
    return NextResponse.json(allocation)
  } catch (error) {
    console.error('Error updating resource allocation:', error)
    
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

export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const user = await requirePermission(request, 'allocation:delete')
    
    // Check if allocation exists
    const existingAllocation = await prisma.resourceAllocation.findUnique({
      where: { id: params.id }
    })
    
    if (!existingAllocation) {
      return NextResponse.json(
        { error: 'Resource allocation not found' },
        { status: 404 }
      )
    }
    
    // Check project access
    await requireProjectPermission(
      user.userId,
      user.role as UserRole,
      existingAllocation.projectId,
      'allocation:delete'
    )
    
    // Delete allocation
    await prisma.resourceAllocation.delete({
      where: { id: params.id }
    })
    
    // Create audit log
    await prisma.auditLog.create({
      data: {
        projectId: existingAllocation.projectId,
        userId: user.userId,
        action: 'DELETE',
        entityType: 'ResourceAllocation',
        entityId: params.id,
        changes: {
          deleted: existingAllocation,
        },
      },
    })
    
    return NextResponse.json({ message: 'Resource allocation deleted successfully' })
  } catch (error) {
    console.error('Error deleting resource allocation:', error)
    
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
