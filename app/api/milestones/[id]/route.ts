import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requirePermission } from '@/lib/middleware'
import { updateMilestoneSchema, validateData } from '@/lib/validation'
import { requireProjectPermission } from '@/lib/project-permissions'
import { AuthenticationError, ValidationError, NotFoundError } from '@/lib/errors'
import { UserRole } from '@/lib/types'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requirePermission(request, 'milestone:read')
    const { id } = await params

    const milestone = await prisma.milestone.findUnique({
      where: { id },
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
            progress: true,
          },
        },
      },
    })

    if (!milestone) {
      return NextResponse.json(
        { error: 'Milestone not found' },
        { status: 404 }
      )
    }

    // Check project access
    await requireProjectPermission(
      user.userId,
      user.role as UserRole,
      milestone.projectId,
      'milestone:read'
    )

    return NextResponse.json(milestone)
  } catch (error) {
    console.error('Error fetching milestone:', error)
    
    if (error instanceof AuthenticationError) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      )
    }
    
    if (error instanceof NotFoundError) {
      return NextResponse.json(
        { error: error.message },
        { status: 404 }
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requirePermission(request, 'milestone:update')
    const { id } = await params
    const body = await request.json()

    // Validate request body
    const validatedData = validateData(updateMilestoneSchema, body)

    // Get existing milestone
    const existing = await prisma.milestone.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Milestone not found' },
        { status: 404 }
      )
    }

    // Check project access
    await requireProjectPermission(
      user.userId,
      user.role as UserRole,
      existing.projectId,
      'milestone:update'
    )

    const milestone = await prisma.milestone.update({
      where: { id },
      data: {
        name: validatedData.name,
        description: validatedData.description,
        dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : undefined,
        baselineDueDate: validatedData.baselineDueDate ? new Date(validatedData.baselineDueDate) : undefined,
        status: validatedData.status,
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
        action: 'UPDATE',
        entityType: 'Milestone',
        entityId: milestone.id,
        changes: {
          before: existing,
          after: milestone,
        },
      },
    })

    return NextResponse.json(milestone)
  } catch (error) {
    console.error('Error updating milestone:', error)
    
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requirePermission(request, 'milestone:delete')
    const { id } = await params

    const milestone = await prisma.milestone.findUnique({
      where: { id },
    })

    if (!milestone) {
      return NextResponse.json(
        { error: 'Milestone not found' },
        { status: 404 }
      )
    }

    // Check project access
    await requireProjectPermission(
      user.userId,
      user.role as UserRole,
      milestone.projectId,
      'milestone:delete'
    )

    await prisma.milestone.delete({
      where: { id },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        projectId: milestone.projectId,
        userId: user.userId,
        action: 'DELETE',
        entityType: 'Milestone',
        entityId: milestone.id,
        changes: {
          deleted: milestone,
        },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting milestone:', error)
    
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
