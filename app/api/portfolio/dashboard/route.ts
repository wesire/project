import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authenticateRequest } from '@/lib/middleware'
import { filterByProjectAccess } from '@/lib/project-permissions'
import { AuthenticationError } from '@/lib/errors'
import { UserRole } from '@/lib/types'

interface PortfolioDashboardMetrics {
  kpis: {
    totalBudget: number
    totalActual: number
    eac: number
    margin: number
    marginPercentage: number
    spi: number
    cpi: number
    percentComplete: number
  }
  ragStatus: {
    red: number
    amber: number
    green: number
  }
  topRisks: Array<{
    id: string
    projectId: string
    projectName: string
    riskNumber: string
    title: string
    category: string
    probability: number
    impact: number
    score: number
    status: string
  }>
  pendingChanges: Array<{
    id: string
    projectId: string
    projectName: string
    changeNumber: string
    title: string
    status: string
    costImpact: number
    timeImpact: number
    submittedDate: string
  }>
  upcomingMilestones: Array<{
    id: string
    projectId: string
    projectName: string
    name: string
    dueDate: string
    status: string
    progress: number
  }>
  varianceData: Array<{
    month: string
    budgetVariance: number
    scheduleVariance: number
  }>
}

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const user = await authenticateRequest(request)
    
    // Filter projects by access
    const where = await filterByProjectAccess(user.userId, user.role as UserRole, {})
    
    // Get all projects with related data
    const projects = await prisma.project.findMany({
      where,
      include: {
        tasks: {
          select: {
            progress: true,
            estimatedHours: true,
            actualHours: true,
          },
        },
        risks: {
          where: {
            status: {
              in: ['OPEN', 'ACCEPTED'],
            },
          },
          orderBy: {
            score: 'desc',
          },
          take: 20, // Get top 20 risks initially
        },
        changes: {
          where: {
            status: {
              in: ['SUBMITTED', 'UNDER_REVIEW'],
            },
          },
          orderBy: {
            submittedDate: 'desc',
          },
        },
        milestones: {
          where: {
            status: {
              in: ['PENDING', 'IN_PROGRESS'],
            },
            dueDate: {
              gte: new Date(),
            },
          },
          orderBy: {
            dueDate: 'asc',
          },
          take: 10,
        },
      },
    })

    // Calculate KPIs
    let totalBudget = 0
    let totalActual = 0
    let totalPlannedValue = 0
    let totalEarnedValue = 0
    let totalTaskProgress = 0
    let totalTasks = 0

    projects.forEach(project => {
      totalBudget += project.budget
      totalActual += project.actualCost

      // Calculate planned value (PV) - assuming linear distribution over project duration
      const projectDuration = project.endDate.getTime() - project.startDate.getTime()
      const elapsed = Date.now() - project.startDate.getTime()
      const plannedProgress = Math.min(100, Math.max(0, (elapsed / projectDuration) * 100))
      const pv = (project.budget * plannedProgress) / 100
      totalPlannedValue += pv

      // Calculate earned value (EV) based on actual task progress
      const projectTasks = project.tasks || []
      const avgProgress = projectTasks.length > 0
        ? projectTasks.reduce((sum, task) => sum + task.progress, 0) / projectTasks.length
        : 0
      const ev = (project.budget * avgProgress) / 100
      totalEarnedValue += ev

      // Track overall progress
      totalTaskProgress += avgProgress * projectTasks.length
      totalTasks += projectTasks.length
    })

    // Calculate derived metrics
    const percentComplete = totalTasks > 0 ? totalTaskProgress / totalTasks : 0
    const spi = totalPlannedValue > 0 ? totalEarnedValue / totalPlannedValue : 1
    const cpi = totalActual > 0 ? totalEarnedValue / totalActual : 1
    const eac = cpi > 0 ? totalBudget / cpi : totalBudget
    const margin = totalBudget - totalActual
    const marginPercentage = totalBudget > 0 ? (margin / totalBudget) * 100 : 0

    // Calculate RAG status based on SPI and CPI
    const ragStatus = {
      red: 0,
      amber: 0,
      green: 0,
    }

    projects.forEach(project => {
      // Simple RAG logic: red if both SPI and CPI < 0.85, amber if either < 0.95, else green
      const projectTasks = project.tasks || []
      const avgProgress = projectTasks.length > 0
        ? projectTasks.reduce((sum, task) => sum + task.progress, 0) / projectTasks.length
        : 0
      
      const projectDuration = project.endDate.getTime() - project.startDate.getTime()
      const elapsed = Date.now() - project.startDate.getTime()
      const plannedProgress = Math.min(100, Math.max(0, (elapsed / projectDuration) * 100))
      
      const projectSPI = plannedProgress > 0 ? avgProgress / plannedProgress : 1
      const projectCPI = project.actualCost > 0 ? (project.budget * avgProgress / 100) / project.actualCost : 1

      if (projectSPI < 0.85 || projectCPI < 0.85) {
        ragStatus.red++
      } else if (projectSPI < 0.95 || projectCPI < 0.95) {
        ragStatus.amber++
      } else {
        ragStatus.green++
      }
    })

    // Get top risks across all projects
    const allRisks = projects.flatMap(project => 
      project.risks.map(risk => ({
        id: risk.id,
        projectId: project.id,
        projectName: project.name,
        riskNumber: risk.riskNumber,
        title: risk.title,
        category: risk.category,
        probability: risk.probability,
        impact: risk.impact,
        score: risk.score,
        status: risk.status,
      }))
    )
    const topRisks = allRisks
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)

    // Get pending changes across all projects
    const pendingChanges = projects.flatMap(project => 
      project.changes.map(change => ({
        id: change.id,
        projectId: project.id,
        projectName: project.name,
        changeNumber: change.changeNumber,
        title: change.title,
        status: change.status,
        costImpact: change.costImpact,
        timeImpact: change.timeImpact,
        submittedDate: change.submittedDate.toISOString(),
      }))
    )
    .slice(0, 10)

    // Get upcoming milestones across all projects
    const upcomingMilestones = projects.flatMap(project => 
      project.milestones.map(milestone => ({
        id: milestone.id,
        projectId: project.id,
        projectName: project.name,
        name: milestone.name,
        dueDate: milestone.dueDate.toISOString(),
        status: milestone.status,
        progress: milestone.progress,
      }))
    )
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 10)

    // Generate variance data for the last 6 months
    // NOTE: This is a simplified calculation based on current portfolio metrics
    // In production, this should be calculated from historical data snapshots
    const varianceData = []
    const now = new Date()
    const currentBudgetVariance = totalBudget - totalActual
    const currentScheduleVariance = totalEarnedValue - totalPlannedValue
    
    for (let i = 5; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthName = month.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      
      // Extrapolate historical trend based on current variance
      // This assumes linear progression - replace with actual historical data when available
      const progressionFactor = (6 - i) / 6
      
      varianceData.push({
        month: monthName,
        budgetVariance: Math.round(currentBudgetVariance * progressionFactor),
        scheduleVariance: Math.round(currentScheduleVariance * progressionFactor),
      })
    }

    const response: PortfolioDashboardMetrics = {
      kpis: {
        totalBudget,
        totalActual,
        eac,
        margin,
        marginPercentage,
        spi,
        cpi,
        percentComplete,
      },
      ragStatus,
      topRisks,
      pendingChanges,
      upcomingMilestones,
      varianceData,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching portfolio dashboard:', error)
    
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
