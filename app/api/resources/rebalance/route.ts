import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authenticateRequest } from '@/lib/middleware'
import { AuthenticationError } from '@/lib/errors'
import { startOfDay, differenceInDays, addDays } from 'date-fns'

interface RebalanceSuggestion {
  type: 'move_task' | 'adjust_allocation' | 'redistribute_hours'
  priority: 'high' | 'medium' | 'low'
  description: string
  action: {
    taskId?: string
    taskTitle?: string
    allocationId?: string
    fromDate?: Date
    toDate?: Date
    fromResource?: string
    toResource?: string
    reason: string
    estimatedImpact: string
  }
}

/**
 * Analyze resource allocations and suggest rebalancing by moving non-critical tasks
 * GET /api/resources/rebalance?projectId=xxx&startDate=xxx&endDate=xxx
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    await authenticateRequest(request)
    
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')
    const startDateParam = searchParams.get('startDate')
    const endDateParam = searchParams.get('endDate')
    
    if (!projectId || !startDateParam || !endDateParam) {
      return NextResponse.json(
        { error: 'projectId, startDate, and endDate are required' },
        { status: 400 }
      )
    }
    
    const startDate = new Date(startDateParam)
    const endDate = new Date(endDateParam)
    
    // Get all resources and their allocations for the project
    const allocations = await prisma.resourceAllocation.findMany({
      where: {
        projectId: projectId,
        OR: [
          {
            AND: [
              { startDate: { lte: endDate } },
              { endDate: { gte: startDate } }
            ]
          }
        ]
      },
      include: {
        resource: {
          select: {
            id: true,
            name: true,
            type: true,
            maxHoursPerDay: true,
            maxHoursPerWeek: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })
    
    // Get all tasks for the project
    const tasks = await prisma.task.findMany({
      where: {
        projectId: projectId,
        status: {
          notIn: ['DONE', 'CANCELLED']
        },
        startDate: { not: null },
        endDate: { not: null },
      },
      select: {
        id: true,
        taskNumber: true,
        title: true,
        status: true,
        priority: true,
        isCriticalPath: true,
        startDate: true,
        endDate: true,
        estimatedHours: true,
        assignedToId: true,
        assignedTo: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })
    
    // Get availability records
    const availabilityRecords = await prisma.resourceAvailability.findMany({
      where: {
        date: {
          gte: startOfDay(startDate),
          lte: startOfDay(endDate),
        },
      },
    })
    
    const availabilityMap = new Map<string, Map<string, number>>()
    availabilityRecords.forEach(record => {
      const dateKey = startOfDay(record.date).toISOString()
      if (!availabilityMap.has(record.resourceId)) {
        availabilityMap.set(record.resourceId, new Map())
      }
      availabilityMap.get(record.resourceId)!.set(dateKey, record.isAvailable ? record.availableHours : 0)
    })
    
    // Calculate utilization for each resource
    interface ResourceUtilization {
      resource: {
        id?: string
        name?: string
        type?: string
        maxHoursPerDay: number
        maxHoursPerWeek?: number
      }
      allocatedHours: number
      availableHours: number
      utilizationPercentage: number
      overAllocatedDays: number
      allocations: typeof allocations
    }
    
    const resourceUtilization = new Map<string, ResourceUtilization>()
    
    const totalDays = differenceInDays(endDate, startDate) + 1
    
    // Group allocations by resource
    const allocationsByResource = new Map<string, typeof allocations>()
    allocations.forEach(allocation => {
      const resourceId = allocation.resourceId || allocation.userId
      if (!allocationsByResource.has(resourceId)) {
        allocationsByResource.set(resourceId, [])
      }
      allocationsByResource.get(resourceId)!.push(allocation)
    })
    
    // Calculate utilization for each resource
    allocationsByResource.forEach((resAllocations, resourceId) => {
      let totalAllocated = 0
      let totalAvailable = 0
      let overAllocatedDays = 0
      
      const resource = resAllocations[0]?.resource || { maxHoursPerDay: 8 }
      
      for (let i = 0; i < totalDays; i++) {
        const currentDate = new Date(startDate)
        currentDate.setDate(currentDate.getDate() + i)
        const dateKey = startOfDay(currentDate).toISOString()
        
        const availableHours = availabilityMap.get(resourceId)?.get(dateKey) ?? resource.maxHoursPerDay
        
        const dayAllocations = resAllocations.filter(allocation => {
          const allocationStart = startOfDay(allocation.startDate)
          const allocationEnd = startOfDay(allocation.endDate)
          const currentDay = startOfDay(currentDate)
          return currentDay >= allocationStart && currentDay <= allocationEnd
        })
        
        const allocatedHours = dayAllocations.reduce((sum, allocation) => {
          const allocationDays = differenceInDays(allocation.endDate, allocation.startDate) + 1
          return sum + (allocation.allocatedHours / allocationDays)
        }, 0)
        
        totalAllocated += allocatedHours
        totalAvailable += availableHours
        
        if (allocatedHours > availableHours) {
          overAllocatedDays++
        }
      }
      
      const utilizationPercentage = totalAvailable > 0 ? (totalAllocated / totalAvailable) * 100 : 0
      
      resourceUtilization.set(resourceId, {
        resource,
        allocatedHours: totalAllocated,
        availableHours: totalAvailable,
        utilizationPercentage,
        overAllocatedDays,
        allocations: resAllocations,
      })
    })
    
    // Generate rebalance suggestions
    const suggestions: RebalanceSuggestion[] = []
    
    // Find over-allocated resources
    const overAllocatedResources = Array.from(resourceUtilization.entries())
      .filter(([, util]) => util.overAllocatedDays > 0 || util.utilizationPercentage > 100)
      .sort((a, b) => b[1].overAllocatedDays - a[1].overAllocatedDays)
    
    // Find under-utilized resources
    const underUtilizedResources = Array.from(resourceUtilization.entries())
      .filter(([, util]) => util.utilizationPercentage < 70 && util.allocatedHours > 0)
      .sort((a, b) => a[1].utilizationPercentage - b[1].utilizationPercentage)
    
    // Suggest moving non-critical tasks from over-allocated resources
    overAllocatedResources.forEach(([resourceId, util]) => {
      // Find non-critical tasks assigned to this over-allocated resource
      const nonCriticalTasks = tasks.filter(task => 
        task.assignedToId === resourceId && 
        !task.isCriticalPath &&
        task.priority !== 'CRITICAL'
      ).sort((a, b) => {
        // Sort by priority (LOW first, then MEDIUM)
        const priorityOrder = { LOW: 0, MEDIUM: 1, HIGH: 2, CRITICAL: 3 }
        return priorityOrder[a.priority] - priorityOrder[b.priority]
      })
      
      nonCriticalTasks.forEach(task => {
        // Suggest moving to under-utilized resource of same type
        const suitableResources = underUtilizedResources
          .filter(([, underUtil]) => 
            underUtil.resource.type === util.resource.type &&
            underUtil.utilizationPercentage < 80
          )
        
        if (suitableResources.length > 0) {
          const [, targetUtil] = suitableResources[0]
          
          suggestions.push({
            type: 'move_task',
            priority: util.overAllocatedDays > 3 ? 'high' : 'medium',
            description: `Move non-critical task "${task.title}" from over-allocated resource to under-utilized resource`,
            action: {
              taskId: task.id,
              taskTitle: task.title,
              fromResource: util.resource.name,
              toResource: targetUtil.resource.name,
              reason: `Source resource is over-allocated (${Math.round(util.utilizationPercentage)}% utilization, ${util.overAllocatedDays} over-allocated days). Target resource is under-utilized (${Math.round(targetUtil.utilizationPercentage)}% utilization).`,
              estimatedImpact: `This could reduce source utilization by ~${Math.round((task.estimatedHours || 0) / util.availableHours * 100)}%`,
            },
          })
        } else {
          // Suggest delaying the task
          const suggestedDelay = Math.ceil(util.overAllocatedDays / 2)
          suggestions.push({
            type: 'move_task',
            priority: 'medium',
            description: `Delay non-critical task "${task.title}" by ${suggestedDelay} day(s)`,
            action: {
              taskId: task.id,
              taskTitle: task.title,
              fromDate: task.startDate!,
              toDate: addDays(task.startDate!, suggestedDelay),
              reason: `Resource is over-allocated (${Math.round(util.utilizationPercentage)}% utilization, ${util.overAllocatedDays} over-allocated days). No suitable alternative resources available.`,
              estimatedImpact: `This would shift ${task.estimatedHours || 0} hours to a less congested period`,
            },
          })
        }
      })
      
      // If no non-critical tasks, suggest redistributing hours
      if (nonCriticalTasks.length === 0 && util.overAllocatedDays > 0) {
        suggestions.push({
          type: 'redistribute_hours',
          priority: 'high',
          description: `Redistribute allocation hours for over-allocated resource "${util.resource.name}"`,
          action: {
            fromResource: util.resource.name,
            reason: `All tasks are critical. Resource is over-allocated by ${Math.round(util.utilizationPercentage - 100)}% with ${util.overAllocatedDays} over-allocated days.`,
            estimatedImpact: 'Consider extending the project timeline or adding additional resources of the same type',
          },
        })
      }
    })
    
    // Suggest utilizing idle resources
    if (underUtilizedResources.length > 0 && suggestions.length === 0) {
      underUtilizedResources.slice(0, 3).forEach(([, util]) => {
        suggestions.push({
          type: 'adjust_allocation',
          priority: 'low',
          description: `Resource "${util.resource.name}" is under-utilized`,
          action: {
            fromResource: util.resource.name,
            reason: `Resource has ${Math.round(100 - util.utilizationPercentage)}% idle capacity (${Math.round(util.availableHours - util.allocatedHours)} hours available)`,
            estimatedImpact: 'Consider assigning additional tasks or adjusting resource allocation',
          },
        })
      })
    }
    
    return NextResponse.json({
      project: {
        id: projectId,
      },
      period: {
        startDate,
        endDate,
        totalDays,
      },
      analysis: {
        totalResources: resourceUtilization.size,
        overAllocatedResources: overAllocatedResources.length,
        underUtilizedResources: underUtilizedResources.length,
        totalTasks: tasks.length,
        criticalPathTasks: tasks.filter(t => t.isCriticalPath).length,
        nonCriticalTasks: tasks.filter(t => !t.isCriticalPath).length,
      },
      suggestions,
      resourceSummary: Array.from(resourceUtilization.entries()).map(([id, util]) => ({
        resourceId: id,
        resourceName: util.resource.name,
        resourceType: util.resource.type,
        utilizationPercentage: Math.round(util.utilizationPercentage * 100) / 100,
        allocatedHours: Math.round(util.allocatedHours * 100) / 100,
        availableHours: Math.round(util.availableHours * 100) / 100,
        overAllocatedDays: util.overAllocatedDays,
        status: util.overAllocatedDays > 0 ? 'over-allocated' : 
                util.utilizationPercentage > 90 ? 'fully-utilized' :
                util.utilizationPercentage > 70 ? 'well-utilized' : 'under-utilized',
      })),
    })
  } catch (error) {
    console.error('Error generating rebalance suggestions:', error)
    
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
