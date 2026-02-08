import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authenticateRequest } from '@/lib/middleware'
import { AuthenticationError } from '@/lib/errors'

export async function GET(request: NextRequest) {
  try {
    const user = await authenticateRequest(request)
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')

    if (!projectId) {
      return NextResponse.json(
        { error: 'projectId is required' },
        { status: 400 }
      )
    }

    // Get all completed sprints for the project
    const sprints = await prisma.sprint.findMany({
      where: {
        projectId,
        status: 'COMPLETED',
      },
      include: {
        tasks: {
          select: {
            id: true,
            status: true,
            estimatedHours: true,
          },
        },
      },
      orderBy: {
        endDate: 'asc',
      },
    })

    // Calculate velocity for each sprint
    const velocityData = sprints.map(sprint => {
      const completedTasks = sprint.tasks.filter(t => t.status === 'DONE')
      const completedPoints = completedTasks.reduce((sum, task) => sum + (task.estimatedHours || 0), 0)
      
      return {
        sprintId: sprint.id,
        sprintName: sprint.name,
        startDate: sprint.startDate,
        endDate: sprint.endDate,
        totalTasks: sprint.tasks.length,
        completedTasks: completedTasks.length,
        completedPoints,
        plannedPoints: sprint.tasks.reduce((sum, task) => sum + (task.estimatedHours || 0), 0),
      }
    })

    // Calculate average velocity
    const avgVelocity = velocityData.length > 0
      ? velocityData.reduce((sum, sprint) => sum + sprint.completedPoints, 0) / velocityData.length
      : 0

    return NextResponse.json({
      projectId,
      sprints: velocityData,
      averageVelocity: avgVelocity,
      totalSprints: velocityData.length,
    })
  } catch (error) {
    console.error('Error fetching velocity data:', error)
    
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
