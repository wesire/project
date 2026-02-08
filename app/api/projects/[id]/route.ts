import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requirePermission } from '@/lib/middleware'
import { updateProjectSchema, validateData } from '@/lib/validation'
import { requireProjectAccess } from '@/lib/project-permissions'
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
    const user = await requirePermission(request, 'project:read')
    
    // Check project access
    await requireProjectAccess(user.userId, user.role as UserRole, params.id, 'view project details')
    
    const project = await prisma.project.findUnique({
      where: { id: params.id },
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
            sprints: true,
            resources: true,
            cashflows: true,
            issues: true,
          },
        },
      },
    })
    
    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(project)
  } catch (error) {
    console.error('Error fetching project:', error)
    
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
    const user = await requirePermission(request, 'project:update')
    
    // Check project access
    await requireProjectAccess(user.userId, user.role as UserRole, params.id, 'update project')
    
    // Check if project exists
    const existingProject = await prisma.project.findUnique({
      where: { id: params.id }
    })
    
    if (!existingProject) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }
    
    const body = await request.json()
    const validatedData = validateData(updateProjectSchema, body)
    
    // Build update data
    const updateData: Record<string, unknown> = {}
    if (validatedData.projectNumber !== undefined) updateData.projectNumber = validatedData.projectNumber
    if (validatedData.name !== undefined) updateData.name = validatedData.name
    if (validatedData.description !== undefined) updateData.description = validatedData.description
    if (validatedData.status !== undefined) updateData.status = validatedData.status
    if (validatedData.startDate !== undefined) updateData.startDate = new Date(validatedData.startDate)
    if (validatedData.endDate !== undefined) updateData.endDate = new Date(validatedData.endDate)
    if (validatedData.budget !== undefined) updateData.budget = validatedData.budget
    if (validatedData.currency !== undefined) updateData.currency = validatedData.currency
    if (validatedData.location !== undefined) updateData.location = validatedData.location
    if (validatedData.client !== undefined) updateData.client = validatedData.client
    
    const project = await prisma.project.update({
      where: { id: params.id },
      data: updateData,
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
        action: 'UPDATE',
        entityType: 'Project',
        entityId: project.id,
        changes: {
          before: existingProject,
          after: project,
        },
      },
    })
    
    return NextResponse.json(project)
  } catch (error) {
    console.error('Error updating project:', error)
    
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
    const user = await requirePermission(request, 'project:delete')
    
    // Check project access
    await requireProjectAccess(user.userId, user.role as UserRole, params.id, 'delete project')
    
    // Check if project exists
    const existingProject = await prisma.project.findUnique({
      where: { id: params.id }
    })
    
    if (!existingProject) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }
    
    // Delete project (cascade will handle related records)
    await prisma.project.delete({
      where: { id: params.id }
    })
    
    // Create audit log (not tied to project since it's deleted)
    await prisma.auditLog.create({
      data: {
        userId: user.userId,
        action: 'DELETE',
        entityType: 'Project',
        entityId: params.id,
        changes: {
          deleted: existingProject,
        },
      },
    })
    
    return NextResponse.json({ message: 'Project deleted successfully' })
  } catch (error) {
    console.error('Error deleting project:', error)
    
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
