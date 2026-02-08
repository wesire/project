import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requirePermission } from '@/lib/middleware'
import { requireProjectPermission } from '@/lib/project-permissions'
import { AuthenticationError, AuthorizationError } from '@/lib/errors'
import { UserRole } from '@/lib/types'
import { z } from 'zod'

const createEACHistorySchema = z.object({
  projectId: z.string().cuid(),
})

/**
 * POST /api/cost-control/eac-history
 * Record current EAC snapshot for a project
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requirePermission(request, 'project:update')
    const body = await request.json()
    
    // Validate input
    const { projectId } = createEACHistorySchema.parse(body)

    // Check project access
    await requireProjectPermission(
      user.userId,
      user.role as UserRole,
      projectId,
      'project:update'
    )

    // Get project with related data
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        budgetLines: true,
        changes: {
          where: { status: 'APPROVED' },
        },
        tasks: {
          select: {
            progress: true,
            estimatedHours: true,
            actualHours: true,
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

    // Calculate metrics
    const committedCost = project.budgetLines.reduce(
      (sum, line) => sum + line.committed,
      0
    )

    const approvedVariations = project.changes.reduce(
      (sum, change) => sum + change.costImpact,
      0
    )

    const totalBudget = project.budget + approvedVariations
    const actualCost = project.actualCost
    const eac = actualCost + committedCost

    // Calculate performance indices
    const totalEstimatedHours = project.tasks.reduce(
      (sum, task) => sum + (task.estimatedHours || 0),
      0
    )
    const totalActualHours = project.tasks.reduce(
      (sum, task) => sum + task.actualHours,
      0
    )
    const avgProgress = project.tasks.length > 0
      ? project.tasks.reduce((sum, task) => sum + task.progress, 0) / project.tasks.length
      : 0

    const cpi = actualCost > 0 ? (totalBudget * (avgProgress / 100)) / actualCost : 1
    const spi = totalEstimatedHours > 0 ? totalActualHours / totalEstimatedHours : 1

    const margin = totalBudget - eac
    const marginPercentage = totalBudget > 0 ? (margin / totalBudget) * 100 : 0

    // Create EAC history record
    const eacHistory = await prisma.eACHistory.create({
      data: {
        projectId: project.id,
        budget: project.budget,
        actualCost,
        committedCost,
        eac,
        variance: totalBudget - eac,
        cpi,
        spi,
        margin,
        marginPercentage,
      },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        projectId: project.id,
        userId: user.userId,
        action: 'CREATE',
        entityType: 'EACHistory',
        entityId: eacHistory.id,
        changes: {
          created: eacHistory,
        },
      },
    })

    return NextResponse.json(eacHistory, { status: 201 })
  } catch (error) {
    console.error('Error creating EAC history:', error)

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

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
