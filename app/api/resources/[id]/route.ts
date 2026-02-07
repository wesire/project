import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requirePermission } from '@/lib/middleware'
import { updateResourceSchema, validateData } from '@/lib/validation'
import { AuthenticationError, AuthorizationError, ValidationError } from '@/lib/errors'

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
    const user = await requirePermission(request, 'resource:read')
    
    const resource = await prisma.resource.findUnique({
      where: { id: params.id },
      include: {
        allocations: {
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
          },
        },
      },
    })
    
    if (!resource) {
      return NextResponse.json(
        { error: 'Resource not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(resource)
  } catch (error) {
    console.error('Error fetching resource:', error)
    
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
    const user = await requirePermission(request, 'resource:update')
    
    // Check if resource exists
    const existingResource = await prisma.resource.findUnique({
      where: { id: params.id }
    })
    
    if (!existingResource) {
      return NextResponse.json(
        { error: 'Resource not found' },
        { status: 404 }
      )
    }
    
    const body = await request.json()
    const validatedData = validateData(updateResourceSchema, body)
    
    // Build update data
    const updateData: any = {}
    if (validatedData.name !== undefined) updateData.name = validatedData.name
    if (validatedData.type !== undefined) updateData.type = validatedData.type
    if (validatedData.description !== undefined) updateData.description = validatedData.description
    if (validatedData.costPerHour !== undefined) updateData.costPerHour = validatedData.costPerHour
    if (validatedData.availability !== undefined) updateData.availability = validatedData.availability
    if (validatedData.skills !== undefined) updateData.skills = validatedData.skills
    
    const resource = await prisma.resource.update({
      where: { id: params.id },
      data: updateData,
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
        action: 'UPDATE',
        entityType: 'Resource',
        entityId: resource.id,
        changes: {
          before: existingResource,
          after: resource,
        },
      },
    })
    
    return NextResponse.json(resource)
  } catch (error) {
    console.error('Error updating resource:', error)
    
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
    const user = await requirePermission(request, 'resource:delete')
    
    // Check if resource exists
    const existingResource = await prisma.resource.findUnique({
      where: { id: params.id }
    })
    
    if (!existingResource) {
      return NextResponse.json(
        { error: 'Resource not found' },
        { status: 404 }
      )
    }
    
    // Delete resource
    await prisma.resource.delete({
      where: { id: params.id }
    })
    
    // Create audit log (no projectId for resources)
    await prisma.auditLog.create({
      data: {
        userId: user.userId,
        action: 'DELETE',
        entityType: 'Resource',
        entityId: params.id,
        changes: {
          deleted: existingResource,
        },
      },
    })
    
    return NextResponse.json({ message: 'Resource deleted successfully' })
  } catch (error) {
    console.error('Error deleting resource:', error)
    
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
