import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requirePermission } from '@/lib/middleware'
import { updateSprintSchema, validateData } from '@/lib/validation'
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
    const user = await requirePermission(request, 'sprint:read')
    
    const sprint = await prisma.sprint.findUnique({
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
          include: {
            assignedTo: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    })
    
    if (!sprint) {
      return NextResponse.json(
        { error: 'Sprint not found' },
        { status: 404 }
      )
    }
    
    // Check project access
    await requireProjectPermission(
      user.userId,
      user.role as UserRole,
      sprint.projectId,
      'sprint:read'
    )
    
    return NextResponse.json(sprint)
  } catch (error) {
    console.error('Error fetching sprint:', error)
    
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
    const user = await requirePermission(request, 'sprint:update')
    
    // Check if sprint exists
    const existingSprint = await prisma.sprint.findUnique({
      where: { id: params.id }
    })
    
    if (!existingSprint) {
      return NextResponse.json(
        { error: 'Sprint not found' },
        { status: 404 }
      )
    }
    
    // Check project access
    await requireProjectPermission(
      user.userId,
      user.role as UserRole,
      existingSprint.projectId,
      'sprint:update'
    )
    
    const body = await request.json()
    const validatedData = validateData(updateSprintSchema, body)
    
    // Build update data
    const updateData: Record<string, unknown> = {}
    if (validatedData.name !== undefined) updateData.name = validatedData.name
    if (validatedData.goal !== undefined) updateData.goal = validatedData.goal
    if (validatedData.startDate !== undefined) updateData.startDate = new Date(validatedData.startDate)
    if (validatedData.endDate !== undefined) updateData.endDate = new Date(validatedData.endDate)
    
    const sprint = await prisma.sprint.update({
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
        action: 'UPDATE',
        entityType: 'Sprint',
        entityId: sprint.id,
        changes: {
          before: existingSprint,
          after: sprint,
        },
      },
    })
    
    return NextResponse.json(sprint)
  } catch (error) {
    console.error('Error updating sprint:', error)
    
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
    const user = await requirePermission(request, 'sprint:delete')
    
    // Check if sprint exists
    const existingSprint = await prisma.sprint.findUnique({
      where: { id: params.id }
    })
    
    if (!existingSprint) {
      return NextResponse.json(
        { error: 'Sprint not found' },
        { status: 404 }
      )
    }
    
    // Check project access
    await requireProjectPermission(
      user.userId,
      user.role as UserRole,
      existingSprint.projectId,
      'sprint:delete'
    )
    
    // Delete sprint
    await prisma.sprint.delete({
      where: { id: params.id }
    })
    
    // Create audit log
    await prisma.auditLog.create({
      data: {
        projectId: existingSprint.projectId,
        userId: user.userId,
        action: 'DELETE',
        entityType: 'Sprint',
        entityId: params.id,
        changes: {
          deleted: existingSprint,
        },
      },
    })
    
    return NextResponse.json({ message: 'Sprint deleted successfully' })
  } catch (error) {
    console.error('Error deleting sprint:', error)
    
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
