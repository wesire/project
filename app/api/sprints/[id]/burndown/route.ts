import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authenticateRequest } from '@/lib/middleware'
import { requireProjectPermission } from '@/lib/project-permissions'
import { AuthenticationError } from '@/lib/errors'
import { UserRole } from '@/lib/types'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await authenticateRequest(request)
    const { id } = await params

    // Get sprint
    const sprint = await prisma.sprint.findUnique({
      where: { id },
      include: {
        tasks: {
          select: {
            id: true,
            status: true,
            estimatedHours: true,
            actualHours: true,
            progress: true,
            updatedAt: true,
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

    // Calculate burndown data
    const totalHours = sprint.tasks.reduce((sum, task) => sum + (task.estimatedHours || 0), 0)
    const completedHours = sprint.tasks
      .filter(task => task.status === 'DONE')
      .reduce((sum, task) => sum + (task.estimatedHours || 0), 0)
    const remainingHours = totalHours - completedHours

    // Calculate daily burndown
    const startDate = new Date(sprint.startDate)
    const endDate = new Date(sprint.endDate)
    const today = new Date()
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    const elapsedDays = Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    
    // Ideal burndown line
    const idealBurndown = []
    for (let day = 0; day <= totalDays; day++) {
      const date = new Date(startDate)
      date.setDate(date.getDate() + day)
      idealBurndown.push({
        date: date.toISOString().split('T')[0],
        remaining: totalHours - (totalHours * day / totalDays),
      })
    }

    // Actual burndown (simplified - using current progress)
    const actualBurndown = [
      { date: startDate.toISOString().split('T')[0], remaining: totalHours },
      { date: today.toISOString().split('T')[0], remaining: remainingHours },
    ]

    return NextResponse.json({
      sprintId: sprint.id,
      sprintName: sprint.name,
      startDate: sprint.startDate,
      endDate: sprint.endDate,
      totalHours,
      completedHours,
      remainingHours,
      totalDays,
      elapsedDays,
      idealBurndown,
      actualBurndown,
      tasks: {
        total: sprint.tasks.length,
        done: sprint.tasks.filter(t => t.status === 'DONE').length,
        inProgress: sprint.tasks.filter(t => t.status === 'IN_PROGRESS').length,
        todo: sprint.tasks.filter(t => t.status === 'TODO' || t.status === 'BACKLOG').length,
        blocked: sprint.tasks.filter(t => t.status === 'BLOCKED').length,
      },
    })
  } catch (error) {
    console.error('Error fetching burndown data:', error)
    
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
