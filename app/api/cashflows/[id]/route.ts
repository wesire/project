import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requirePermission } from '@/lib/middleware'
import { updateCashflowSchema, validateData } from '@/lib/validation'
import { requireProjectPermission } from '@/lib/project-permissions'
import { AuthenticationError, AuthorizationError, ValidationError } from '@/lib/errors'
import { UserRole } from '@/lib/types'


export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await requirePermission(request, 'cashflow:read')
    
    const cashflow = await prisma.cashflow.findUnique({
      where: { id: id },
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
    
    if (!cashflow) {
      return NextResponse.json(
        { error: 'Cashflow not found' },
        { status: 404 }
      )
    }
    
    // Check project access
    await requireProjectPermission(
      user.userId,
      user.role as UserRole,
      cashflow.projectId,
      'cashflow:read'
    )
    
    return NextResponse.json(cashflow)
  } catch (error) {
    console.error('Error fetching cashflow:', error)
    
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await requirePermission(request, 'cashflow:update')
    
    // Check if cashflow exists
    const existingCashflow = await prisma.cashflow.findUnique({
      where: { id: id }
    })
    
    if (!existingCashflow) {
      return NextResponse.json(
        { error: 'Cashflow not found' },
        { status: 404 }
      )
    }
    
    // Check project access
    await requireProjectPermission(
      user.userId,
      user.role as UserRole,
      existingCashflow.projectId,
      'cashflow:update'
    )
    
    const body = await request.json()
    const validatedData = validateData(updateCashflowSchema, body)
    
    // Build update data
    const updateData: Record<string, unknown> = {}
    if (validatedData.date !== undefined) updateData.date = new Date(validatedData.date)
    if (validatedData.type !== undefined) updateData.type = validatedData.type
    if (validatedData.category !== undefined) updateData.category = validatedData.category
    if (validatedData.description !== undefined) updateData.description = validatedData.description
    if (validatedData.forecast !== undefined) updateData.forecast = validatedData.forecast
    if (validatedData.actual !== undefined) updateData.actual = validatedData.actual
    
    // Recalculate variance if forecast or actual changed
    const forecast = validatedData.forecast ?? existingCashflow.forecast
    const actual = validatedData.actual ?? existingCashflow.actual
    updateData.variance = actual !== null ? actual - forecast : 0
    
    const cashflow = await prisma.cashflow.update({
      where: { id: id },
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
        projectId: cashflow.projectId,
        userId: user.userId,
        action: 'UPDATE',
        entityType: 'Cashflow',
        entityId: cashflow.id,
        changes: {
          before: existingCashflow,
          after: cashflow,
        },
      },
    })
    
    return NextResponse.json(cashflow)
  } catch (error) {
    console.error('Error updating cashflow:', error)
    
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await requirePermission(request, 'cashflow:delete')
    
    // Check if cashflow exists
    const existingCashflow = await prisma.cashflow.findUnique({
      where: { id: id }
    })
    
    if (!existingCashflow) {
      return NextResponse.json(
        { error: 'Cashflow not found' },
        { status: 404 }
      )
    }
    
    // Check project access
    await requireProjectPermission(
      user.userId,
      user.role as UserRole,
      existingCashflow.projectId,
      'cashflow:delete'
    )
    
    // Delete cashflow
    await prisma.cashflow.delete({
      where: { id: id }
    })
    
    // Create audit log
    await prisma.auditLog.create({
      data: {
        projectId: existingCashflow.projectId,
        userId: user.userId,
        action: 'DELETE',
        entityType: 'Cashflow',
        entityId: id,
        changes: {
          deleted: existingCashflow,
        },
      },
    })
    
    return NextResponse.json({ message: 'Cashflow deleted successfully' })
  } catch (error) {
    console.error('Error deleting cashflow:', error)
    
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
