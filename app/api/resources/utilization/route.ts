import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authenticateRequest } from '@/lib/middleware'
import { AuthenticationError } from '@/lib/errors'
import { startOfDay, endOfDay, differenceInDays } from 'date-fns'

/**
 * Calculate daily hours for an allocation by distributing total hours evenly
 */
function calculateDailyHours(allocation: { allocatedHours: number; startDate: Date; endDate: Date }): number {
  const allocationDays = differenceInDays(allocation.endDate, allocation.startDate) + 1
  return allocation.allocatedHours / allocationDays
}

/**
 * Calculate resource utilization and detect over-allocation
 * GET /api/resources/utilization?resourceId=xxx&startDate=xxx&endDate=xxx
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    await authenticateRequest(request)
    
    const { searchParams } = new URL(request.url)
    const resourceId = searchParams.get('resourceId')
    const startDateParam = searchParams.get('startDate')
    const endDateParam = searchParams.get('endDate')
    
    if (!resourceId || !startDateParam || !endDateParam) {
      return NextResponse.json(
        { error: 'resourceId, startDate, and endDate are required' },
        { status: 400 }
      )
    }
    
    const startDate = new Date(startDateParam)
    const endDate = new Date(endDateParam)
    
    // Get resource details
    const resource = await prisma.resource.findUnique({
      where: { id: resourceId },
      select: {
        id: true,
        name: true,
        type: true,
        maxHoursPerDay: true,
        maxHoursPerWeek: true,
        standardRate: true,
        costPerHour: true,
      },
    })
    
    if (!resource) {
      return NextResponse.json(
        { error: 'Resource not found' },
        { status: 404 }
      )
    }
    
    // Get all allocations for this resource in the date range
    const allocations = await prisma.resourceAllocation.findMany({
      where: {
        resourceId: resourceId,
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
          },
        },
      },
    })
    
    // Get availability calendar for this resource
    const availabilityRecords = await prisma.resourceAvailability.findMany({
      where: {
        resourceId: resourceId,
        date: {
          gte: startOfDay(startDate),
          lte: endOfDay(endDate),
        },
      },
    })
    
    // Build a map of date -> available hours
    const availabilityMap = new Map<string, number>()
    availabilityRecords.forEach(record => {
      const dateKey = startOfDay(record.date).toISOString()
      availabilityMap.set(dateKey, record.isAvailable ? record.availableHours : 0)
    })
    
    // Calculate utilization by day
    const totalDays = differenceInDays(endDate, startDate) + 1
    const dailyUtilization: Array<{
      date: Date
      allocatedHours: number
      availableHours: number
      utilizationPercentage: number
      isOverAllocated: boolean
      allocations: Array<{ projectName: string; hours: number }>
    }> = []
    
    let totalAllocatedHours = 0
    let totalAvailableHours = 0
    let overAllocatedDays = 0
    
    for (let i = 0; i < totalDays; i++) {
      const currentDate = new Date(startDate)
      currentDate.setDate(currentDate.getDate() + i)
      const dateKey = startOfDay(currentDate).toISOString()
      
      // Get available hours for this day (use default if not in calendar)
      const availableHours = availabilityMap.get(dateKey) ?? resource.maxHoursPerDay
      
      // Calculate allocated hours for this day
      const dayAllocations = allocations.filter(allocation => {
        const allocationStart = startOfDay(allocation.startDate)
        const allocationEnd = startOfDay(allocation.endDate)
        const currentDay = startOfDay(currentDate)
        return currentDay >= allocationStart && currentDay <= allocationEnd
      })
      
      const allocatedHours = dayAllocations.reduce((sum, allocation) => {
        return sum + calculateDailyHours(allocation)
      }, 0)
      
      const utilizationPercentage = availableHours > 0 
        ? (allocatedHours / availableHours) * 100 
        : 0
      
      const isOverAllocated = allocatedHours > availableHours
      
      if (isOverAllocated) {
        overAllocatedDays++
      }
      
      totalAllocatedHours += allocatedHours
      totalAvailableHours += availableHours
      
      dailyUtilization.push({
        date: currentDate,
        allocatedHours: Math.round(allocatedHours * 100) / 100,
        availableHours,
        utilizationPercentage: Math.round(utilizationPercentage * 100) / 100,
        isOverAllocated,
        allocations: dayAllocations.map(a => ({
          projectName: a.project.name,
          hours: Math.round(calculateDailyHours(a) * 100) / 100
        }))
      })
    }
    
    // Calculate overall statistics
    const averageUtilization = totalAvailableHours > 0 
      ? (totalAllocatedHours / totalAvailableHours) * 100 
      : 0
    
    const overAllocationPercentage = (overAllocatedDays / totalDays) * 100
    
    // Determine warnings
    const warnings: string[] = []
    if (overAllocatedDays > 0) {
      warnings.push(`Resource is over-allocated on ${overAllocatedDays} day(s) (${Math.round(overAllocationPercentage)}% of period)`)
    }
    if (averageUtilization > 100) {
      warnings.push(`Average utilization (${Math.round(averageUtilization)}%) exceeds capacity`)
    }
    if (averageUtilization < 50 && totalAllocatedHours > 0) {
      warnings.push(`Resource is underutilized (${Math.round(averageUtilization)}% average utilization)`)
    }
    
    return NextResponse.json({
      resource: {
        id: resource.id,
        name: resource.name,
        type: resource.type,
        maxHoursPerDay: resource.maxHoursPerDay,
        maxHoursPerWeek: resource.maxHoursPerWeek,
      },
      period: {
        startDate,
        endDate,
        totalDays,
      },
      summary: {
        totalAllocatedHours: Math.round(totalAllocatedHours * 100) / 100,
        totalAvailableHours: Math.round(totalAvailableHours * 100) / 100,
        averageUtilization: Math.round(averageUtilization * 100) / 100,
        overAllocatedDays,
        overAllocationPercentage: Math.round(overAllocationPercentage * 100) / 100,
      },
      warnings,
      dailyUtilization,
      totalAllocations: allocations.length,
    })
  } catch (error) {
    console.error('Error calculating resource utilization:', error)
    
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
